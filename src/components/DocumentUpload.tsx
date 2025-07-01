
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, CheckCircle, X, FileImage } from "lucide-react";
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

  const handleFileUpload = (docType: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    if (!file) {
      return;
    }

    console.log(`Attempting to upload file for ${docType}:`, file.name, file.type, file.size);

    // Validate file type - only images allowed
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload image files only (JPEG, PNG, WebP).",
        variant: "destructive"
      });
      // Reset the input
      event.target.value = '';
      return;
    }

    // Validate file size (10MB max for images)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload images smaller than 10MB.",
        variant: "destructive"
      });
      // Reset the input
      event.target.value = '';
      return;
    }

    // Update uploaded documents
    const newDocs = { ...uploadedDocs, [docType]: file };
    setUploadedDocs(newDocs);

    // Create preview URL for images
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setDocPreviews(prev => ({
        ...prev,
        [docType]: result
      }));
      console.log(`Preview created for ${docType}`);
    };
    reader.onerror = (e) => {
      console.error(`Error reading file for ${docType}:`, e);
      toast({
        title: "File read error",
        description: "There was an error reading the file. Please try again.",
        variant: "destructive"
      });
    };
    reader.readAsDataURL(file);

    // Update parent component
    onDocumentsChange(newDocs);
    calculateProgress(newDocs);
    
    toast({
      title: "Document uploaded",
      description: `${file.name} has been uploaded successfully.`,
    });

    console.log(`Successfully uploaded ${file.name} for ${docType}`);
  };

  const calculateProgress = (docs: Record<string, File>) => {
    const requiredDocs = requirements.filter(req => req.is_required);
    const uploadedRequiredDocs = requiredDocs.filter(req => docs[req.document_type]);
    const progress = requiredDocs.length > 0 ? (uploadedRequiredDocs.length / requiredDocs.length) * 100 : 0;
    onProgressChange(progress);
    console.log(`Progress updated: ${progress}% (${uploadedRequiredDocs.length}/${requiredDocs.length})`);
  };

  const removeDocument = (docType: string) => {
    const newDocs = { ...uploadedDocs };
    delete newDocs[docType];
    setUploadedDocs(newDocs);
    
    const newPreviews = { ...docPreviews };
    delete newPreviews[docType];
    setDocPreviews(newPreviews);
    
    onDocumentsChange(newDocs);
    calculateProgress(newDocs);
    
    toast({
      title: "Document removed",
      description: "Document has been removed from your application.",
    });

    console.log(`Document removed for ${docType}`);
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold mb-2">Required Document Images for Zimbabwe</h3>
        <p className="text-sm text-muted-foreground">
          Please upload clear images of all required documents to complete your shop registration
        </p>
      </div>

      {requirements.map((requirement) => (
        <Card key={requirement.id} className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <FileImage className="w-4 h-4" />
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
              <div className="space-y-3">
                {/* Image Preview */}
                <div className="relative">
                  <img 
                    src={docPreviews[requirement.document_type]} 
                    alt={`${requirement.document_name} preview`}
                    className="w-full h-48 object-cover rounded-lg border shadow-sm"
                  />
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => removeDocument(requirement.document_type)}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full p-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                
                {/* File Info */}
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                  <div>
                    <p className="text-sm font-medium text-green-700">
                      {uploadedDocs[requirement.document_type].name}
                    </p>
                    <p className="text-xs text-green-600">
                      {(uploadedDocs[requirement.document_type].size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                <Label htmlFor={`doc-${requirement.document_type}`} className="cursor-pointer">
                  <span className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                    Click to upload image of {requirement.document_name}
                  </span>
                  <p className="text-xs text-gray-500 mt-2">
                    Supported formats: JPEG, PNG, WebP (max 10MB)
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Take a clear photo or scan of your document
                  </p>
                </Label>
                <Input
                  id={`doc-${requirement.document_type}`}
                  type="file"
                  accept="image/jpeg,image/png,image/jpg,image/webp"
                  onChange={(e) => handleFileUpload(requirement.document_type, e)}
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
