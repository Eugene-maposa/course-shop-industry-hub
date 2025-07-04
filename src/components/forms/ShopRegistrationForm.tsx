import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Upload, X, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import StepByStepDocumentUpload from "@/components/StepByStepDocumentUpload";

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch industries
  const { data: industries = [], isLoading: industriesLoading } = useQuery({
    queryKey: ['industries'],
    queryFn: async () => {
      console.log('Fetching industries...');
      const { data, error } = await supabase
        .from('industries')
        .select('*')
        .eq('status', 'active')
        .order('name');
      if (error) {
        console.error('Error fetching industries:', error);
        throw error;
      }
      console.log('Industries fetched:', data);
      return data || [];
    }
  });

  // Fetch document requirements for Zimbabwe
  const { data: documentRequirements = [], isLoading: documentsLoading } = useQuery({
    queryKey: ['document-requirements', 'ZW'],
    queryFn: async () => {
      console.log('Fetching Zimbabwe document requirements...');
      const { data, error } = await supabase
        .from('shop_document_requirements')
        .select('*')
        .eq('country_code', 'ZW')
        .order('is_required', { ascending: false })
        .order('document_name');
      if (error) {
        console.error('Error fetching document requirements:', error);
        throw error;
      }
      console.log('Document requirements fetched:', data);
      return data || [];
    }
  });

  const registerShopMutation = useMutation({
    mutationFn: async (shopData: typeof formData & { icon_url?: string; documents?: Record<string, string> }) => {
      console.log('Registering shop with data:', shopData);
      const { data, error } = await supabase
        .from('shops')
        .insert({
          ...shopData,
          status: 'pending',
          registration_date: new Date().toISOString().split('T')[0],
          document_verification_status: 'pending'
        })
        .select()
        .single();
      if (error) {
        console.error('Shop registration error:', error);
        throw error;
      }
      console.log('Shop registered successfully:', data);
      return data;
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: "Shop registered successfully! Your application and documents are pending admin approval."
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
      setIsSubmitting(false);
      queryClient.invalidateQueries({ queryKey: ['shops'] });
    },
    onError: (error) => {
      console.error("Shop registration error:", error);
      toast({
        title: "Error",
        description: "Failed to register shop. Please try again.",
        variant: "destructive"
      });
      setIsSubmitting(false);
    }
  });

  const uploadDocumentsToStorage = async (documents: Record<string, File>) => {
    const documentUrls: Record<string, string> = {};
    
    for (const [docType, file] of Object.entries(documents)) {
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${docType}_${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('shop-icons')
          .upload(`documents/${fileName}`, file, {
            cacheControl: '3600',
            upsert: false
          });
          
        if (uploadError) {
          console.error(`Document upload error for ${docType}:`, uploadError);
          throw new Error(`Failed to upload ${docType}`);
        }
        
        const { data: { publicUrl } } = supabase.storage
          .from('shop-icons')
          .getPublicUrl(`documents/${fileName}`);
          
        documentUrls[docType] = publicUrl;
        console.log(`Document uploaded successfully for ${docType}:`, publicUrl);
      } catch (error) {
        console.error(`Error uploading document ${docType}:`, error);
        throw error;
      }
    }
    
    return documentUrls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    console.log('Form submission started');
    console.log('Current form data:', formData);
    console.log('Documents:', Object.keys(documents));
    
    // Validate required fields
    if (!formData.name.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter a shop name.",
        variant: "destructive"
      });
      return;
    }
    
    if (!formData.industry_id) {
      toast({
        title: "Missing Information",
        description: "Please select an industry.",
        variant: "destructive"
      });
      return;
    }

    // Check if all required documents are uploaded
    const requiredDocs = documentRequirements.filter(req => req.is_required);
    const missingDocs = requiredDocs.filter(req => !documents[req.document_type]);
    
    if (missingDocs.length > 0) {
      const missingDocNames = missingDocs.map(doc => doc.document_name).join(', ');
      toast({
        title: "Missing Required Documents",
        description: `Please upload all required documents: ${missingDocNames}`,
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      let iconUrl = "";
      let documentUrls: Record<string, string> = {};
      
      // Upload icon if selected
      if (iconFile) {
        console.log('Uploading shop icon...');
        const fileExt = iconFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('shop-icons')
          .upload(fileName, iconFile, {
            cacheControl: '3600',
            upsert: false
          });
          
        if (uploadError) {
          console.error('Icon upload error:', uploadError);
          throw new Error("Failed to upload icon");
        }
        
        const { data: { publicUrl } } = supabase.storage
          .from('shop-icons')
          .getPublicUrl(fileName);
          
        iconUrl = publicUrl;
        console.log('Icon uploaded successfully:', iconUrl);
      }

      // Upload documents
      if (Object.keys(documents).length > 0) {
        console.log('Uploading documents...');
        documentUrls = await uploadDocumentsToStorage(documents);
        console.log('All documents uploaded successfully');
      }
      
      // Register shop
      await registerShopMutation.mutateAsync({
        ...formData,
        ...(iconUrl && { icon_url: iconUrl }),
        ...(Object.keys(documentUrls).length > 0 && { documents: documentUrls })
      });
      
    } catch (error) {
      console.error('Registration process error:', error);
      toast({
        title: "Upload Error",
        description: error instanceof Error ? error.message : "Failed to upload files",
        variant: "destructive"
      });
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Please upload an image file (JPEG, PNG, WebP).",
          variant: "destructive"
        });
        e.target.value = '';
        return;
      }
      
      // Validate file size (5MB max for icons)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload an image smaller than 5MB.",
          variant: "destructive"
        });
        e.target.value = '';
        return;
      }
      
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

  const handleDocumentsChange = (newDocuments: Record<string, File>) => {
    setDocuments(newDocuments);
  };

  const handleProgressChange = (progress: number) => {
    setDocumentProgress(progress);
  };

  const clearForm = () => {
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
  };

  const isFormValid = formData.name.trim() && formData.industry_id && documentProgress === 100;

  if (industriesLoading || documentsLoading) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-lg">Loading registration form...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader className="text-center bg-nust-blue text-white">
        <CardTitle className="text-2xl">Register New Shop - Zimbabwe</CardTitle>
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
                    Upload a logo or icon for your shop (optional, max 5MB)
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

          {/* Step-by-Step Document Upload */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Required Documents Upload</h3>
            
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-800 mb-1">
                    Zimbabwe Business Registration Requirements
                  </p>
                  <p className="text-xs text-amber-700">
                    Please upload all required business documents step by step. These documents will be verified by our team to ensure your shop meets regulatory requirements.
                  </p>
                </div>
              </div>
            </div>

            <StepByStepDocumentUpload 
              onDocumentsChange={handleDocumentsChange}
              onProgressChange={handleProgressChange}
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button 
              type="submit" 
              className={`flex-1 ${isFormValid ? 'bg-nust-blue hover:bg-nust-blue-dark' : 'bg-gray-400'}`}
              disabled={isSubmitting || !isFormValid}
            >
              {isSubmitting ? "Registering..." : "Register Shop"}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              className="flex-1"
              onClick={clearForm}
              disabled={isSubmitting}
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
