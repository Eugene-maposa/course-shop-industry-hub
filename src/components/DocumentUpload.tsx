
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, CheckCircle, X, FileImage, AlertCircle, FileText, Plus } from "lucide-react";
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

  // Calculate progress whenever uploaded docs change
  useEffect(() => {
    const requiredDocs = requirements.filter(req => req.is_required);
    const uploadedRequiredDocs = requiredDocs.filter(req => uploadedDocs[req.document_type]);
    const progress = requiredDocs.length > 0 ? (uploadedRequiredDocs.length / requiredDocs.length) * 100 : 0;
    onProgressChange(progress);
    console.log(`Progress updated: ${progress}% (${uploadedRequiredDocs.length}/${requiredDocs.length})`);
  }, [uploadedDocs, requirements, onProgressChange]);

  const handleFileUpload = (docType: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    if (!file) {
      return;
    }

    console.log(`Attempting to upload file for ${docType}:`, file.name, file.type, file.size);

    // Validate file type - allow images and PDFs
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
    const newDocs = { ...uploadedDocs, [docType]: file };
    setUploadedDocs(newDocs);
    onDocumentsChange(newDocs);

    // Create preview URL for images only
    if (file.type.startsWith('image/')) {
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
    }
    
    toast({
      title: "Document uploaded",
      description: `${file.name} has been uploaded successfully.`,
    });

    console.log(`Successfully uploaded ${file.name} for ${docType}`);
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
      description: "Document has been removed from your application.",
    });

    console.log(`Document removed for ${docType}`);
  };

  if (!requirements || requirements.length === 0) {
    return (
      <div className="text-center p-8 bg-gray-50 rounded-lg">
        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">No document requirements found for Zimbabwe.</p>
        <p className="text-sm text-gray-500 mt-2">Please contact support if this is unexpected.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h4 className="font-semibold text-blue-800 mb-2">Document Upload Instructions</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Upload clear, readable images or PDF documents</li>
          <li>• Accepted formats: JPEG, PNG, WebP images or PDF files</li>
          <li>• Maximum file size: 10MB per document</li>
          <li>• Required documents are marked with a red asterisk (*)</li>
          <li>• Ensure all document text is clearly visible</li>
        </ul>
      </div>

      <div className="grid gap-6">
        {requirements.map((requirement) => (
          <Card key={requirement.id} className={`border-l-4 ${requirement.is_required ? 'border-l-red-500' : 'border-l-blue-500'}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-medium flex items-center gap-2">
                  {uploadedDocs[requirement.document_type]?.type.startsWith('image/') ? (
                    <FileImage className="w-5 h-5 text-blue-600" />
                  ) : uploadedDocs[requirement.document_type] ? (
                    <FileText className="w-5 h-5 text-blue-600" />
                  ) : (
                    <Upload className="w-5 h-5 text-gray-400" />
                  )}
                  {requirement.document_name}
                  {requirement.is_required && (
                    <span className="text-red-500 text-sm font-bold">*</span>
                  )}
                </CardTitle>
                {uploadedDocs[requirement.document_type] && (
                  <CheckCircle className="w-6 h-6 text-green-500" />
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-1">{requirement.description}</p>
              {requirement.is_required && (
                <p className="text-xs text-red-600 font-medium">This document is required for shop registration</p>
              )}
            </CardHeader>
            
            <CardContent className="pt-0">
              {uploadedDocs[requirement.document_type] ? (
                <div className="space-y-4">
                  {/* Document Preview */}
                  <div className="relative">
                    {docPreviews[requirement.document_type] ? (
                      <img 
                        src={docPreviews[requirement.document_type]} 
                        alt={`${requirement.document_name} preview`}
                        className="w-full h-64 object-contain rounded-lg border-2 border-gray-200 bg-gray-50"
                      />
                    ) : (
                      <div className="w-full h-64 bg-gray-50 rounded-lg border-2 border-gray-200 flex items-center justify-center">
                        <div className="text-center">
                          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-3" />
                          <p className="text-lg font-medium text-gray-600">PDF Document</p>
                          <p className="text-sm text-gray-500 mt-1">{uploadedDocs[requirement.document_type].name}</p>
                        </div>
                      </div>
                    )}
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => removeDocument(requirement.document_type)}
                      className="absolute top-2 right-2 w-8 h-8 rounded-full p-0 shadow-lg"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  {/* File Info */}
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border-2 border-green-200">
                    <div className="flex-1">
                      <p className="font-medium text-green-800">
                        {uploadedDocs[requirement.document_type].name}
                      </p>
                      <p className="text-sm text-green-600 mt-1">
                        Size: {(uploadedDocs[requirement.document_type].size / 1024 / 1024).toFixed(2)} MB • 
                        Type: {uploadedDocs[requirement.document_type].type.includes('pdf') ? 'PDF Document' : 'Image File'}
                      </p>
                    </div>
                    <CheckCircle className="w-6 h-6 text-green-600 ml-3" />
                  </div>

                  {/* Replace Document Button */}
                  <div className="flex justify-center">
                    <Label htmlFor={`replace-${requirement.document_type}`} className="cursor-pointer">
                      <Button variant="outline" size="sm" className="flex items-center gap-2" asChild>
                        <span>
                          <Upload className="w-4 h-4" />
                          Replace Document
                        </span>
                      </Button>
                    </Label>
                    <Input
                      id={`replace-${requirement.document_type}`}
                      type="file"
                      accept="image/jpeg,image/png,image/jpg,image/webp,application/pdf"
                      onChange={(e) => handleFileUpload(requirement.document_type, e)}
                      className="hidden"
                    />
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 hover:bg-blue-50 transition-colors">
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <Plus className="w-8 h-8 text-gray-400" />
                    </div>
                    <Label htmlFor={`doc-${requirement.document_type}`} className="cursor-pointer">
                      <Button variant="outline" size="lg" className="mb-3" asChild>
                        <span className="flex items-center gap-2">
                          <Upload className="w-5 h-5" />
                          Upload {requirement.document_name}
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
                    id={`doc-${requirement.document_type}`}
                    type="file"
                    accept="image/jpeg,image/png,image/jpg,image/webp,application/pdf"
                    onChange={(e) => handleFileUpload(requirement.document_type, e)}
                    className="hidden"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DocumentUpload;
