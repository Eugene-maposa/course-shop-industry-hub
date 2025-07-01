
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, CheckCircle, X, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DocumentRequirement {
  id: string;
  document_type: string;
  document_name: string;
  is_required: boolean;
  description: string;
}

interface DocumentUploadProps {
  requirements: DocumentRequirement[];
  onDocumentsChange: (documents: Record<string, File>) => void;
  onProgressChange: (progress: number) => void;
}

const DocumentUpload = ({ requirements, onDocumentsChange, onProgressChange }: DocumentUploadProps) => {
  const [uploadedDocs, setUploadedDocs] = useState<Record<string, File>>({});
  const [docPreviews, setDocPreviews] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const handleFileUpload = (docType: string, file: File | null) => {
    if (!file) {
      const newDocs = { ...uploadedDocs };
      delete newDocs[docType];
      setUploadedDocs(newDocs);
      
      const newPreviews = { ...docPreviews };
      delete newPreviews[docType];
      setDocPreviews(newPreviews);
      
      onDocumentsChange(newDocs);
      calculateProgress(newDocs);
      return;
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload PDF, JPEG, or PNG files only.",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload files smaller than 5MB.",
        variant: "destructive"
      });
      return;
    }

    const newDocs = { ...uploadedDocs, [docType]: file };
    setUploadedDocs(newDocs);

    // Create preview URL for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setDocPreviews(prev => ({
          ...prev,
          [docType]: e.target?.result as string
        }));
      };
      reader.readAsDataURL(file);
    }

    onDocumentsChange(newDocs);
    calculateProgress(newDocs);
  };

  const calculateProgress = (docs: Record<string, File>) => {
    const requiredDocs = requirements.filter(req => req.is_required);
    const uploadedRequiredDocs = requiredDocs.filter(req => docs[req.document_type]);
    const progress = requiredDocs.length > 0 ? (uploadedRequiredDocs.length / requiredDocs.length) * 100 : 0;
    onProgressChange(progress);
  };

  const removeDocument = (docType: string) => {
    handleFileUpload(docType, null);
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold mb-2">Required Documents for Zimbabwe</h3>
        <p className="text-sm text-muted-foreground">
          Please upload all required documents to complete your shop registration
        </p>
      </div>

      {requirements.map((requirement) => (
        <Card key={requirement.id} className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <FileText className="w-4 h-4" />
                {requirement.document_name}
                {requirement.is_required && (
                  <span className="text-red-500 text-xs">*</span>
                )}
              </CardTitle>
              {uploadedDocs[requirement.document_type] && (
                <CheckCircle className="w-5 h-5 text-green-500" />
              )}
            </div>
            <p className="text-xs text-muted-foreground">{requirement.description}</p>
          </CardHeader>
          
          <CardContent className="pt-0">
            {uploadedDocs[requirement.document_type] ? (
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-3">
                  {docPreviews[requirement.document_type] && (
                    <img 
                      src={docPreviews[requirement.document_type]} 
                      alt="Preview" 
                      className="w-12 h-12 object-cover rounded border"
                    />
                  )}
                  <div>
                    <p className="text-sm font-medium text-green-700">
                      {uploadedDocs[requirement.document_type].name}
                    </p>
                    <p className="text-xs text-green-600">
                      {(uploadedDocs[requirement.document_type].size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeDocument(requirement.document_type)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <Label htmlFor={`doc-${requirement.document_type}`} className="cursor-pointer">
                  <span className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                    Click to upload {requirement.document_name}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">PDF, JPEG, PNG (max 5MB)</p>
                </Label>
                <Input
                  id={`doc-${requirement.document_type}`}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileUpload(requirement.document_type, e.target.files?.[0] || null)}
                  className="hidden"
                />
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DocumentUpload;
