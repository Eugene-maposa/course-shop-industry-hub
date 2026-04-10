import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Upload, CheckCircle, X, FileText, AlertCircle, ArrowRight, ArrowLeft, ShieldCheck, ShieldAlert, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface StepByStepDocumentUploadProps {
  onDocumentsChange: (documents: Record<string, File>) => void;
  onProgressChange: (progress: number) => void;
}

const documentSteps = [
  {
    id: 1,
    type: "national_id_front",
    name: "National ID (Front)",
    description: "Upload a clear photo of the FRONT of your Zimbabwe National Identity Card",
    required: true,
    isIdCard: true,
  },
  {
    id: 2,
    type: "national_id_back",
    name: "National ID (Back)",
    description: "Upload a clear photo of the BACK of your Zimbabwe National Identity Card",
    required: true,
    isIdCard: true,
  },
  {
    id: 3,
    type: "tax_clearance",
    name: "Tax Clearance Certificate",
    description: "Upload your current tax clearance certificate from ZIMRA",
    required: true,
    isIdCard: false,
  },
  {
    id: 4,
    type: "business_license",
    name: "Business License",
    description: "Upload your valid business operating license",
    required: true,
    isIdCard: false,
  },
  {
    id: 5,
    type: "trading_license",
    name: "Trading License",
    description: "Upload your municipal trading license",
    required: true,
    isIdCard: false,
  },
  {
    id: 6,
    type: "vat_certificate",
    name: "VAT Registration Certificate",
    description: "Upload your VAT registration certificate",
    required: true,
    isIdCard: false,
  },
  {
    id: 7,
    type: "fire_certificate",
    name: "Fire Safety Certificate",
    description: "Upload your fire department safety clearance certificate",
    required: true,
    isIdCard: false,
  },
  {
    id: 8,
    type: "company_registration",
    name: "Company Registration Certificate",
    description: "Upload your certificate of incorporation",
    required: true,
    isIdCard: false,
  },
];

interface VerificationResult {
  status: string;
  confidence_score: number;
  is_authentic: boolean;
  issues: string[];
  analysis: string;
}

const StepByStepDocumentUpload = ({ onDocumentsChange, onProgressChange }: StepByStepDocumentUploadProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedDocs, setUploadedDocs] = useState<Record<string, File>>({});
  const [docPreviews, setDocPreviews] = useState<Record<string, string>>({});
  const [verificationResults, setVerificationResults] = useState<Record<string, VerificationResult>>({});
  const [verifyingDoc, setVerifyingDoc] = useState<string | null>(null);
  const { toast } = useToast();

  const currentDocument = documentSteps.find(step => step.id === currentStep);
  const totalSteps = documentSteps.length;
  const completedSteps = Object.keys(uploadedDocs).length;
  const progress = (completedSteps / totalSteps) * 100;

  React.useEffect(() => {
    onProgressChange(progress);
  }, [progress, onProgressChange]);

  const verifyDocument = async (file: File, docType: string) => {
    setVerifyingDoc(docType);
    try {
      // Upload to storage first for AI to access
      const fileExt = file.name.split('.').pop();
      const fileName = `verify_${docType}_${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('shop-documents')
        .upload(`verification/${fileName}`, file, { cacheControl: '3600', upsert: true });

      if (uploadError) {
        console.error("Upload for verification failed:", uploadError);
        toast({ title: "Upload failed", description: "Could not upload document for verification.", variant: "destructive" });
        setVerifyingDoc(null);
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('shop-documents')
        .getPublicUrl(`verification/${fileName}`);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({ title: "Not authenticated", description: "Please sign in to verify documents.", variant: "destructive" });
        setVerifyingDoc(null);
        return;
      }

      const { data, error } = await supabase.functions.invoke('verify-document', {
        body: { document_url: publicUrl, document_type: docType },
      });

      if (error) {
        console.error("Verification error:", error);
        toast({ title: "Verification failed", description: "AI verification could not complete. Document saved for manual review.", variant: "destructive" });
        setVerificationResults(prev => ({
          ...prev,
          [docType]: {
            status: "pending",
            confidence_score: 0,
            is_authentic: false,
            issues: ["AI verification unavailable - pending manual review"],
            analysis: "Document will be reviewed manually by an admin.",
          },
        }));
      } else {
        setVerificationResults(prev => ({ ...prev, [docType]: data }));

        if (data.status === "verified") {
          toast({ title: "✅ Document Verified", description: `${documentSteps.find(s => s.type === docType)?.name} passed AI verification with ${data.confidence_score}% confidence.` });
        } else if (data.status === "rejected") {
          toast({ title: "❌ Document Rejected", description: `This document could not be verified. Issues: ${data.issues?.join(", ") || "Unknown"}`, variant: "destructive" });
        } else {
          toast({ title: "⚠️ Needs Review", description: `Document flagged for manual review. Confidence: ${data.confidence_score}%`, variant: "destructive" });
        }
      }
    } catch (err) {
      console.error("Verification error:", err);
      toast({ title: "Error", description: "Document verification failed.", variant: "destructive" });
    } finally {
      setVerifyingDoc(null);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !currentDocument) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast({ title: "Invalid file type", description: "Please upload image files (JPEG, PNG, WebP) or PDF documents.", variant: "destructive" });
      event.target.value = '';
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "File too large", description: "Please upload files smaller than 10MB.", variant: "destructive" });
      event.target.value = '';
      return;
    }

    const newDocs = { ...uploadedDocs, [currentDocument.type]: file };
    setUploadedDocs(newDocs);
    onDocumentsChange(newDocs);

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setDocPreviews(prev => ({ ...prev, [currentDocument.type]: e.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }

    toast({ title: "Document uploaded", description: `${currentDocument.name} uploaded. Starting AI verification...` });

    // Automatically verify the document
    await verifyDocument(file, currentDocument.type);
  };

  const removeDocument = (docType: string) => {
    const newDocs = { ...uploadedDocs };
    delete newDocs[docType];
    setUploadedDocs(newDocs);

    const newPreviews = { ...docPreviews };
    delete newPreviews[docType];
    setDocPreviews(newPreviews);

    const newResults = { ...verificationResults };
    delete newResults[docType];
    setVerificationResults(newResults);

    onDocumentsChange(newDocs);
    toast({ title: "Document removed", description: "Document has been removed." });
  };

  const canProceedToNext = () => currentDocument && uploadedDocs[currentDocument.type];

  const handleNext = () => {
    if (currentStep < totalSteps && canProceedToNext()) setCurrentStep(currentStep + 1);
  };

  const handlePrevious = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const isStepCompleted = (stepId: number) => {
    const step = documentSteps.find(s => s.id === stepId);
    return step && uploadedDocs[step.type];
  };

  const getVerificationBadge = (docType: string) => {
    const result = verificationResults[docType];
    if (verifyingDoc === docType) {
      return <Badge variant="secondary" className="gap-1"><Loader2 className="w-3 h-3 animate-spin" />Verifying...</Badge>;
    }
    if (!result) return null;
    if (result.status === "verified") {
      return <Badge className="bg-green-500/10 text-green-700 border-green-200 gap-1"><ShieldCheck className="w-3 h-3" />Verified ({result.confidence_score}%)</Badge>;
    }
    if (result.status === "rejected") {
      return <Badge variant="destructive" className="gap-1"><ShieldAlert className="w-3 h-3" />Rejected</Badge>;
    }
    return <Badge variant="secondary" className="bg-amber-500/10 text-amber-700 border-amber-200 gap-1"><AlertCircle className="w-3 h-3" />Needs Review</Badge>;
  };

  if (!currentDocument) return null;

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Document Upload & Verification</h3>
          <span className="text-sm font-medium text-muted-foreground">
            {completedSteps} of {totalSteps} documents
          </span>
        </div>
        <Progress value={progress} className="w-full h-3" />

        {/* Step indicators */}
        <div className="grid grid-cols-4 md:grid-cols-8 gap-1 text-xs">
          {documentSteps.map((step) => (
            <div
              key={step.id}
              className={`flex flex-col items-center cursor-pointer ${
                step.id === currentStep ? 'text-primary font-medium' :
                isStepCompleted(step.id) ? 'text-green-600' : 'text-muted-foreground'
              }`}
              onClick={() => setCurrentStep(step.id)}
            >
              <div className={`w-7 h-7 rounded-full flex items-center justify-center mb-0.5 ${
                step.id === currentStep ? 'bg-primary/10 border-2 border-primary' :
                isStepCompleted(step.id) ? 'bg-green-100 border-2 border-green-600' :
                'bg-muted border-2 border-muted-foreground/30'
              }`}>
                {isStepCompleted(step.id) ? (
                  <CheckCircle className="w-3.5 h-3.5" />
                ) : (
                  <span className="text-[10px] font-medium">{step.id}</span>
                )}
              </div>
              <span className="text-center max-w-14 leading-tight text-[10px]">
                {step.name.split(' ').slice(0, 2).join(' ')}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ID Card Notice */}
      {currentDocument.isIdCard && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-medium text-blue-800">Identity Verification Required</p>
              <p className="text-[10px] text-blue-700">Your national ID card will be scanned by AI to verify authenticity. Ensure the image is clear, well-lit, and shows the entire card.</p>
            </div>
          </div>
        </div>
      )}

      {/* Current Step */}
      <Card className="border-l-4 border-l-primary">
        <CardHeader className="py-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs font-bold">
                {currentStep}/{totalSteps}
              </span>
              {currentDocument.name}
              {currentDocument.required && <span className="text-destructive text-sm font-bold">*</span>}
            </CardTitle>
            <div className="flex items-center gap-2">
              {getVerificationBadge(currentDocument.type)}
              {uploadedDocs[currentDocument.type] && !verificationResults[currentDocument.type] && verifyingDoc !== currentDocument.type && (
                <CheckCircle className="w-5 h-5 text-green-500" />
              )}
            </div>
          </div>
          <p className="text-xs text-muted-foreground">{currentDocument.description}</p>
        </CardHeader>

        <CardContent className="space-y-3 pt-0">
          {uploadedDocs[currentDocument.type] ? (
            <div className="space-y-3">
              <div className="relative">
                {docPreviews[currentDocument.type] ? (
                  <img
                    src={docPreviews[currentDocument.type]}
                    alt={`${currentDocument.name} preview`}
                    className="w-full h-48 object-contain rounded-lg border bg-muted/30"
                  />
                ) : (
                  <div className="w-full h-48 bg-muted/30 rounded-lg border flex items-center justify-center">
                    <div className="text-center">
                      <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm font-medium text-muted-foreground">PDF Document</p>
                      <p className="text-xs text-muted-foreground">{uploadedDocs[currentDocument.type].name}</p>
                    </div>
                  </div>
                )}
                <Button size="sm" variant="destructive" onClick={() => removeDocument(currentDocument.type)}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full p-0" disabled={verifyingDoc === currentDocument.type}>
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>

              {/* Verification Result Details */}
              {verificationResults[currentDocument.type] && (
                <div className={`rounded-lg p-3 border text-xs ${
                  verificationResults[currentDocument.type].status === 'verified'
                    ? 'bg-green-50 border-green-200'
                    : verificationResults[currentDocument.type].status === 'rejected'
                    ? 'bg-red-50 border-red-200'
                    : 'bg-amber-50 border-amber-200'
                }`}>
                  <p className="font-medium mb-1">AI Analysis:</p>
                  <p className="text-muted-foreground">{verificationResults[currentDocument.type].analysis}</p>
                  {verificationResults[currentDocument.type].issues?.length > 0 && (
                    <div className="mt-1.5">
                      <p className="font-medium text-destructive">Issues found:</p>
                      <ul className="list-disc list-inside text-destructive/80">
                        {verificationResults[currentDocument.type].issues.map((issue, i) => (
                          <li key={i}>{issue}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* File Info */}
              <div className="flex items-center justify-between p-2.5 bg-muted/50 rounded-lg border">
                <div className="flex-1">
                  <p className="font-medium text-xs">{uploadedDocs[currentDocument.type].name}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {(uploadedDocs[currentDocument.type].size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>

              <div className="flex justify-center">
                <Label htmlFor={`replace-${currentDocument.type}`} className="cursor-pointer">
                  <Button variant="outline" size="sm" className="flex items-center gap-2 text-xs" asChild disabled={verifyingDoc === currentDocument.type}>
                    <span><Upload className="w-3.5 h-3.5" />Replace & Re-verify</span>
                  </Button>
                </Label>
                <Input id={`replace-${currentDocument.type}`} type="file" accept="image/jpeg,image/png,image/jpg,image/webp,application/pdf" onChange={handleFileUpload} className="hidden" />
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-muted-foreground/20 rounded-lg p-6 text-center hover:border-primary/40 hover:bg-primary/5 transition-colors">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                  {currentDocument.isIdCard ? <ShieldCheck className="w-6 h-6 text-primary" /> : <Upload className="w-6 h-6 text-primary" />}
                </div>
                <Label htmlFor={`doc-${currentDocument.type}`} className="cursor-pointer">
                  <Button size="sm" className="mb-2" asChild>
                    <span className="flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      Upload {currentDocument.name}
                    </span>
                  </Button>
                </Label>
                <div className="text-[10px] text-muted-foreground space-y-0.5">
                  <p>Formats: JPEG, PNG, WebP, PDF • Max: 10MB</p>
                  <p className="font-medium text-primary">AI verification will scan automatically</p>
                </div>
              </div>
              <Input id={`doc-${currentDocument.type}`} type="file" accept="image/jpeg,image/png,image/jpg,image/webp,application/pdf" onChange={handleFileUpload} className="hidden" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <Button onClick={handlePrevious} disabled={currentStep === 1} variant="outline" size="sm" className="flex items-center gap-1.5 text-xs">
          <ArrowLeft className="w-3.5 h-3.5" />Previous
        </Button>
        <div className="text-xs text-muted-foreground">{currentStep} of {totalSteps}</div>
        <Button onClick={handleNext} disabled={currentStep === totalSteps || !canProceedToNext()} size="sm" className="flex items-center gap-1.5 text-xs">
          Next<ArrowRight className="w-3.5 h-3.5" />
        </Button>
      </div>

      {completedSteps === totalSteps && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <div>
              <p className="text-xs font-medium text-green-800">All documents uploaded!</p>
              <p className="text-[10px] text-green-700">
                {Object.values(verificationResults).filter(r => r.status === 'verified').length} of {totalSteps} documents passed AI verification.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StepByStepDocumentUpload;
