
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Upload, CheckCircle, X, FileText, AlertCircle, ArrowRight, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface StepByStepDocumentUploadProps {
  onDocumentsChange: (documents: Record<string, File>) => void;
  onProgressChange: (progress: number) => void;
}

const documentSteps = [
  {
    id: 1,
    type: "tax_clearance",
    name: "Tax Clearance Certificate",
    description: "Upload your current tax clearance certificate from ZIMRA",
    required: true
  },
  {
    id: 2,
    type: "business_license",
    name: "Business License",
    description: "Upload your valid business operating license",
    required: true
  },
  {
    id: 3,
    type: "trading_license",
    name: "Trading License",
    description: "Upload your municipal trading license",
    required: true
  },
  {
    id: 4,
    type: "vat_certificate",
    name: "VAT Registration Certificate",
    description: "Upload your VAT registration certificate",
    required: true
  },
  {
    id: 5,
    type: "fire_certificate",
    name: "Fire Safety Certificate",
    description: "Upload your fire department safety clearance certificate",
    required: true
  },
  {
    id: 6,
    type: "company_registration",
    name: "Company Registration Certificate",
    description: "Upload your certificate of incorporation",
    required: true
  }
];

const StepByStepDocumentUpload = ({ onDocumentsChange, onProgressChange }: StepByStepDocumentUploadProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedDocs, setUploadedDocs] = useState<Record<string, File>>({});
  const [docPreviews, setDocPreviews] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const currentDocument = documentSteps.find(step => step.id === currentStep);
  const totalSteps = documentSteps.length;
  const completedSteps = Object.keys(uploadedDocs).length;
  const progress = (completedSteps / totalSteps) * 100;

  // Update progress whenever documents change
  React.useEffect(() => {
    onProgressChange(progress);
  }, [progress, onProgressChange]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    if (!file || !currentDocument) {
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload image files (JPEG, PNG, WebP) or PDF documents.",
        variant: "destructive"
      });
      event.target.value = '';
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload files smaller than 10MB.",
        variant: "destructive"
      });
      event.target.value = '';
      return;
    }

    // Update uploaded documents
    const newDocs = { ...uploadedDocs, [currentDocument.type]: file };
    setUploadedDocs(newDocs);
    onDocumentsChange(newDocs);

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setDocPreviews(prev => ({
          ...prev,
          [currentDocument.type]: result
        }));
      };
      reader.readAsDataURL(file);
    }

    toast({
      title: "Document uploaded",
      description: `${currentDocument.name} has been uploaded successfully.`,
    });
  };

  const removeDocument = (docType: string) => {
    const newDocs = { ...uploadedDocs };
    delete newDocs[docType];
    setUploadedDocs(newDocs);
    
    const newPreviews = { ...docPreviews };
    delete newPreviews[docType];
    setDocPreviews(newPreviews);
    
    onDocumentsChange(newDocs);
    
    toast({
      title: "Document removed",
      description: "Document has been removed.",
    });
  };

  const canProceedToNext = () => {
    return currentDocument && uploadedDocs[currentDocument.type];
  };

  const handleNext = () => {
    if (currentStep < totalSteps && canProceedToNext()) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isStepCompleted = (stepId: number) => {
    const step = documentSteps.find(s => s.id === stepId);
    return step && uploadedDocs[step.type];
  };

  if (!currentDocument) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Document Upload Progress</h3>
          <span className="text-sm font-medium text-muted-foreground">
            {completedSteps} of {totalSteps} documents uploaded
          </span>
        </div>
        <Progress value={progress} className="w-full h-3" />
        
        {/* Step indicators */}
        <div className="flex justify-between text-xs">
          {documentSteps.map((step) => (
            <div
              key={step.id}
              className={`flex flex-col items-center ${
                step.id === currentStep ? 'text-blue-600 font-medium' : 
                isStepCompleted(step.id) ? 'text-green-600' : 'text-gray-400'
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
                step.id === currentStep ? 'bg-blue-100 border-2 border-blue-600' :
                isStepCompleted(step.id) ? 'bg-green-100 border-2 border-green-600' :
                'bg-gray-100 border-2 border-gray-300'
              }`}>
                {isStepCompleted(step.id) ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <span className="text-xs font-medium">{step.id}</span>
                )}
              </div>
              <span className="text-center max-w-16 leading-tight">
                {step.name.split(' ')[0]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Current Step */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-bold">
                Step {currentStep}
              </span>
              {currentDocument.name}
              {currentDocument.required && (
                <span className="text-red-500 text-sm font-bold">*</span>
              )}
            </CardTitle>
            {uploadedDocs[currentDocument.type] && (
              <CheckCircle className="w-6 h-6 text-green-500" />
            )}
          </div>
          <p className="text-muted-foreground">{currentDocument.description}</p>
          {currentDocument.required && (
            <p className="text-xs text-red-600 font-medium">This document is required for registration</p>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          {uploadedDocs[currentDocument.type] ? (
            <div className="space-y-4">
              {/* Document Preview */}
              <div className="relative">
                {docPreviews[currentDocument.type] ? (
                  <img 
                    src={docPreviews[currentDocument.type]} 
                    alt={`${currentDocument.name} preview`}
                    className="w-full h-64 object-contain rounded-lg border-2 border-gray-200 bg-gray-50"
                  />
                ) : (
                  <div className="w-full h-64 bg-gray-50 rounded-lg border-2 border-gray-200 flex items-center justify-center">
                    <div className="text-center">
                      <FileText className="w-16 h-16 text-gray-400 mx-auto mb-3" />
                      <p className="text-lg font-medium text-gray-600">PDF Document</p>
                      <p className="text-sm text-gray-500 mt-1">{uploadedDocs[currentDocument.type].name}</p>
                    </div>
                  </div>
                )}
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => removeDocument(currentDocument.type)}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* File Info */}
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border-2 border-green-200">
                <div className="flex-1">
                  <p className="font-medium text-green-800">
                    {uploadedDocs[currentDocument.type].name}
                  </p>
                  <p className="text-sm text-green-600 mt-1">
                    Size: {(uploadedDocs[currentDocument.type].size / 1024 / 1024).toFixed(2)} MB • 
                    Type: {uploadedDocs[currentDocument.type].type.includes('pdf') ? 'PDF Document' : 'Image File'}
                  </p>
                </div>
                <CheckCircle className="w-6 h-6 text-green-600 ml-3" />
              </div>

              {/* Replace Document */}
              <div className="flex justify-center">
                <Label htmlFor={`replace-${currentDocument.type}`} className="cursor-pointer">
                  <Button variant="outline" size="sm" className="flex items-center gap-2" asChild>
                    <span>
                      <Upload className="w-4 h-4" />
                      Replace Document
                    </span>
                  </Button>
                </Label>
                <Input
                  id={`replace-${currentDocument.type}`}
                  type="file"
                  accept="image/jpeg,image/png,image/jpg,image/webp,application/pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 hover:bg-blue-50 transition-colors">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Upload className="w-8 h-8 text-blue-600" />
                </div>
                <Label htmlFor={`doc-${currentDocument.type}`} className="cursor-pointer">
                  <Button size="lg" className="mb-3 bg-blue-600 hover:bg-blue-700" asChild>
                    <span className="flex items-center gap-2">
                      <Upload className="w-5 h-5" />
                      Upload {currentDocument.name}
                    </span>
                  </Button>
                </Label>
                <p className="text-sm text-gray-600 mb-2">
                  Click to browse and select your document
                </p>
                <div className="text-xs text-gray-500 space-y-1">
                  <p>Supported formats: Images (JPEG, PNG, WebP) or PDF</p>
                  <p>Maximum file size: 10MB</p>
                  <p>Ensure document is clear and readable</p>
                </div>
              </div>
              <Input
                id={`doc-${currentDocument.type}`}
                type="file"
                accept="image/jpeg,image/png,image/jpg,image/webp,application/pdf"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between items-center pt-4">
        <Button
          onClick={handlePrevious}
          disabled={currentStep === 1}
          variant="outline"
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Previous
        </Button>

        <div className="text-sm text-muted-foreground">
          Step {currentStep} of {totalSteps}
        </div>

        <Button
          onClick={handleNext}
          disabled={currentStep === totalSteps || !canProceedToNext()}
          className="flex items-center gap-2"
        >
          Next
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Completion Status */}
      {completedSteps === totalSteps && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-sm font-medium text-green-800">
                All documents uploaded successfully!
              </p>
              <p className="text-xs text-green-700">
                You can now proceed with your shop registration.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StepByStepDocumentUpload;
