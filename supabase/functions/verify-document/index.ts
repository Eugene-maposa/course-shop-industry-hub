import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

const AI_GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: { user }, error: authError } = await createClient(
      supabaseUrl,
      Deno.env.get("SUPABASE_ANON_KEY")!
    ).auth.getUser(authHeader.replace("Bearer ", ""));

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { document_url, document_type, shop_id } = await req.json();

    if (!document_url || !document_type) {
      return new Response(JSON.stringify({ error: "document_url and document_type are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build the AI prompt based on document type
    let prompt = "";
    if (document_type === "national_id_front" || document_type === "national_id_back") {
      prompt = `You are a document verification expert specializing in Zimbabwe National Identity Cards (National ID / ID card).

Analyze this image of what is claimed to be the ${document_type === "national_id_front" ? "FRONT" : "BACK"} of a Zimbabwe National Identity Card.

Check for the following:
1. Does this appear to be a genuine Zimbabwe National ID card?
2. Is the document clearly visible and readable?
3. Does it have the expected format, layout, and security features of a Zimbabwe National ID?
4. Are there signs of tampering, digital manipulation, or forgery?
5. ${document_type === "national_id_front" ? "Does it show a photo, name, ID number, and date of birth?" : "Does it show the expected back-side features like address and other details?"}

Respond in this exact JSON format:
{
  "is_authentic": true/false,
  "confidence_score": 0-100,
  "document_detected": true/false,
  "issues": ["list of any issues found"],
  "analysis": "Brief analysis summary"
}`;
    } else {
      const docNames: Record<string, string> = {
        tax_clearance: "Zimbabwe Tax Clearance Certificate from ZIMRA",
        business_license: "Zimbabwe Business Operating License",
        trading_license: "Zimbabwe Municipal Trading License",
        vat_certificate: "Zimbabwe VAT Registration Certificate",
        fire_certificate: "Fire Safety Certificate",
        company_registration: "Zimbabwe Certificate of Incorporation / Company Registration",
      };

      const docName = docNames[document_type] || document_type;
      prompt = `You are a document verification expert specializing in Zimbabwe business registration documents.

Analyze this image of what is claimed to be a "${docName}".

Check for the following:
1. Does this appear to be a genuine ${docName}?
2. Is the document clearly visible and readable?
3. Does it have the expected format, layout, stamps, signatures, and official markings?
4. Are there signs of tampering, digital manipulation, or forgery?
5. Does it contain the expected fields and information for this type of document?

Respond in this exact JSON format:
{
  "is_authentic": true/false,
  "confidence_score": 0-100,
  "document_detected": true/false,
  "issues": ["list of any issues found"],
  "analysis": "Brief analysis summary"
}`;
    }

    // Call AI Gateway with the document image
    const aiResponse = await fetch(AI_GATEWAY_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              { type: "image_url", image_url: { url: document_url } },
            ],
          },
        ],
        temperature: 0.1,
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("AI Gateway error:", aiResponse.status, errText);
      throw new Error(`AI Gateway returned ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content || "";

    // Parse the JSON from AI response
    let analysis;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    } catch {
      analysis = {
        is_authentic: false,
        confidence_score: 0,
        document_detected: false,
        issues: ["Failed to parse AI analysis"],
        analysis: content,
      };
    }

    if (!analysis) {
      analysis = {
        is_authentic: false,
        confidence_score: 0,
        document_detected: false,
        issues: ["No analysis returned"],
        analysis: "The AI could not analyze this document.",
      };
    }

    // Determine verification status
    let verificationStatus = "pending";
    if (analysis.confidence_score >= 70 && analysis.is_authentic && analysis.document_detected) {
      verificationStatus = "verified";
    } else if (analysis.confidence_score < 40 || !analysis.document_detected) {
      verificationStatus = "rejected";
    } else {
      verificationStatus = "suspicious";
    }

    // Store verification result
    const { data: verification, error: insertError } = await supabase
      .from("document_verifications")
      .insert({
        user_id: user.id,
        shop_id: shop_id || null,
        document_url,
        document_type,
        verification_status: verificationStatus,
        ai_confidence_score: analysis.confidence_score,
        ai_analysis: JSON.stringify(analysis),
        verified_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      throw new Error("Failed to store verification result");
    }

    // If it's a national ID, update the user profile verification status
    if (document_type === "national_id_front" || document_type === "national_id_back") {
      // Check if both sides are now verified
      const { data: allIdVerifications } = await supabase
        .from("document_verifications")
        .select("document_type, verification_status")
        .eq("user_id", user.id)
        .in("document_type", ["national_id_front", "national_id_back"])
        .order("created_at", { ascending: false });

      const frontVerified = allIdVerifications?.find(
        (v) => v.document_type === "national_id_front" && v.verification_status === "verified"
      );
      const backVerified = allIdVerifications?.find(
        (v) => v.document_type === "national_id_back" && v.verification_status === "verified"
      );

      let idStatus = "pending";
      if (frontVerified && backVerified) {
        idStatus = "verified";
      } else if (verificationStatus === "rejected") {
        idStatus = "rejected";
      }

      await supabase
        .from("user_profiles")
        .update({ id_verification_status: idStatus })
        .eq("user_id", user.id);
    }

    return new Response(
      JSON.stringify({
        verification_id: verification.id,
        status: verificationStatus,
        confidence_score: analysis.confidence_score,
        is_authentic: analysis.is_authentic,
        document_detected: analysis.document_detected,
        issues: analysis.issues || [],
        analysis: analysis.analysis,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Verification error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
