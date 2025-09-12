import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface NotificationEmailRequest {
  userId: string;
  type: string;
  title: string;
  message: string;
  userEmail?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { userId, type, title, message, userEmail }: NotificationEmailRequest = await req.json();

    // Get user email if not provided
    let recipientEmail = userEmail;
    if (!recipientEmail) {
      const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);
      if (userError || !userData.user) {
        console.error("Error fetching user:", userError);
        return new Response(
          JSON.stringify({ error: "User not found" }),
          { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
      recipientEmail = userData.user.email;
    }

    if (!recipientEmail) {
      return new Response(
        JSON.stringify({ error: "No email address found" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Generate email content based on type
    const getEmailContent = (type: string, title: string, message: string) => {
      const baseStyles = `
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; }
          .content { background: white; padding: 30px; border: 1px solid #e1e5e9; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
        </style>
      `;

      const actionUrl = `${Deno.env.get("SUPABASE_URL")?.replace('/rest/v1', '')}/`;

      return `
        <!DOCTYPE html>
        <html>
        <head>
          ${baseStyles}
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 24px;">${title}</h1>
            </div>
            <div class="content">
              <p style="font-size: 16px; line-height: 1.5; color: #374151;">${message}</p>
              <a href="${actionUrl}" class="button">View Dashboard</a>
              <div class="footer">
                <p>This is an automated notification from your marketplace system.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;
    };

    const emailResponse = await resend.emails.send({
      from: "Marketplace <onboarding@resend.dev>",
      to: [recipientEmail],
      subject: title,
      html: getEmailContent(type, title, message),
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-notification-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);