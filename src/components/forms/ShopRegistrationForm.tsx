
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Upload, X, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import DocumentUpload from "@/components/DocumentUpload";

const ShopRegistrationForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    phone: "",
    email: "",
    website: "",
    industry_id: ""
  });
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string | null>(null);
  const [documents, setDocuments] = useState<Record<string, File>>({});
  const [documentProgress, setDocumentProgress] = useState(0);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch industries
  const { data: industries = [] } = useQuery({
    queryKey: ['industries'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('industries')
        .select('*')
        .eq('status', 'active');
      if (error) throw error;
      return data;
    }
  });

  // Fetch document requirements
  const { data: documentRequirements = [] } = useQuery({
    queryKey: ['document-requirements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shop_document_requirements')
        .select('*')
        .eq('country_code', 'ZW')
        .order('document_name');
      if (error) throw error;
      return data;
    }
  });

  const registerShopMutation = useMutation({
    mutationFn: async (shopData: typeof formData & { icon_url?: string; documents: Record<string, string> }) => {
      const { data, error } = await supabase
        .from('shops')
        .insert({
          ...shopData,
          status: 'pending',
          document_verification_status: 'pending'
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Shop registered successfully! Your application is pending admin approval."
      });
      // Reset form
      setFormData({
        name: "",
        description: "",
        address: "",
        phone: "",
        email: "",
        website: "",
        industry_id: ""
      });
      setIconFile(null);
      setIconPreview(null);
      setDocuments({});
      setDocumentProgress(0);
      queryClient.invalidateQueries({ queryKey: ['shops'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to register shop. Please try again.",
        variant: "destructive"
      });
      console.error("Error registering shop:", error);
    }
  });

  const uploadDocumentsToStorage = async (): Promise<Record<string, string>> => {
    const documentUrls: Record<string, string> = {};
    
    for (const [docType, file] of Object.entries(documents)) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${docType}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('shop-icons')
        .upload(`documents/${fileName}`, file);
        
      if (uploadError) {
        throw new Error(`Failed to upload ${docType}: ${uploadError.message}`);
      }
      
      const { data: { publicUrl } } = supabase.storage
        .from('shop-icons')
        .getPublicUrl(`documents/${fileName}`);
        
      documentUrls[docType] = publicUrl;
    }
    
    return documentUrls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if all required documents are uploaded
    const requiredDocs = documentRequirements.filter(req => req.is_required);
    const missingDocs = requiredDocs.filter(req => !documents[req.document_type]);
    
    if (missingDocs.length > 0) {
      toast({
        title: "Missing Documents",
        description: `Please upload all required documents: ${missingDocs.map(doc => doc.document_name).join(', ')}`,
        variant: "destructive"
      });
      return;
    }
    
    let iconUrl = "";
    let documentUrls: Record<string, string> = {};
    
    try {
      // Upload icon if selected
      if (iconFile) {
        const fileExt = iconFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('shop-icons')
          .upload(fileName, iconFile);
          
        if (uploadError) {
          throw new Error("Failed to upload icon");
        }
        
        const { data: { publicUrl } } = supabase.storage
          .from('shop-icons')
          .getPublicUrl(fileName);
          
        iconUrl = publicUrl;
      }
      
      // Upload documents
      documentUrls = await uploadDocumentsToStorage();
      
      registerShopMutation.mutate({
        ...formData,
        ...(iconUrl && { icon_url: iconUrl }),
        documents: documentUrls
      });
    } catch (error) {
      toast({
        title: "Upload Error",
        description: error instanceof Error ? error.message : "Failed to upload files",
        variant: "destructive"
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIconFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setIconPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeIcon = () => {
    setIconFile(null);
    setIconPreview(null);
  };

  const isFormValid = documentProgress === 100 && formData.name && formData.industry_id;

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader className="text-center bg-nust-blue text-white">
        <CardTitle className="text-2xl">Register New Shop - Zimbabwe</CardTitle>
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm">Document Verification Progress</span>
            <span className="text-sm font-semibold">{Math.round(documentProgress)}%</span>
          </div>
          <Progress value={documentProgress} className="w-full bg-blue-200" />
          {documentProgress === 100 && (
            <div className="flex items-center justify-center gap-2 mt-2 text-green-200">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm">All required documents uploaded</span>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-6 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Shop Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  required
                  placeholder="Enter shop name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="industry">Industry *</Label>
                <Select value={formData.industry_id} onValueChange={(value) => handleInputChange("industry_id", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {industries.map((industry) => (
                      <SelectItem key={industry.id} value={industry.id}>
                        {industry.name} ({industry.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Shop Icon Upload */}
            <div className="space-y-2">
              <Label htmlFor="icon">Shop Icon</Label>
              <div className="flex items-center gap-4">
                {iconPreview ? (
                  <div className="relative">
                    <img 
                      src={iconPreview} 
                      alt="Shop icon preview" 
                      className="w-16 h-16 object-cover rounded-lg border"
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0"
                      onClick={removeIcon}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                    <Upload className="w-6 h-6 text-gray-400" />
                  </div>
                )}
                <div className="flex-1">
                  <Input
                    id="icon"
                    type="file"
                    accept="image/*"
                    onChange={handleIconChange}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Upload a logo or icon for your shop (optional)
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Enter shop description"
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                placeholder="Enter shop address"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="Enter phone number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="Enter email address"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={formData.website}
                onChange={(e) => handleInputChange("website", e.target.value)}
                placeholder="Enter website URL"
              />
            </div>
          </div>

          {/* Document Upload Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Required Documents</h3>
            <DocumentUpload
              requirements={documentRequirements}
              onDocumentsChange={setDocuments}
              onProgressChange={setDocumentProgress}
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button 
              type="submit" 
              className={`flex-1 ${isFormValid ? 'bg-nust-blue hover:bg-nust-blue-dark' : 'bg-gray-400'}`}
              disabled={registerShopMutation.isPending || !isFormValid}
            >
              {registerShopMutation.isPending ? "Registering..." : "Register Shop"}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              className="flex-1"
              onClick={() => {
                setFormData({
                  name: "",
                  description: "",
                  address: "",
                  phone: "",
                  email: "",
                  website: "",
                  industry_id: ""
                });
                setIconFile(null);
                setIconPreview(null);
                setDocuments({});
                setDocumentProgress(0);
              }}
            >
              Clear Form
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ShopRegistrationForm;
