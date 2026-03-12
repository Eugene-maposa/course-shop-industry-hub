import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Upload, X, AlertCircle, Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import StepByStepDocumentUpload from "@/components/StepByStepDocumentUpload";
import LocationPicker from "@/components/LocationPicker";

interface ShopRegistrationFormProps {
  shopId?: string;
  initialData?: {
    name: string;
    description?: string;
    address?: string;
    phone?: string;
    email?: string;
    website?: string;
    industry_id?: string;
    icon_url?: string;
    documents?: any;
    latitude?: number;
    longitude?: number;
  };
  onSuccess?: () => void;
}

const ShopRegistrationForm = ({ shopId, initialData, onSuccess }: ShopRegistrationFormProps = {}) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    address: initialData?.address || "",
    phone: initialData?.phone || "",
    email: initialData?.email || "",
    website: initialData?.website || "",
    industry_id: initialData?.industry_id || "",
    latitude: initialData?.latitude?.toString() || "",
    longitude: initialData?.longitude?.toString() || "",
  });
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string | null>(initialData?.icon_url || null);
  const [documents, setDocuments] = useState<Record<string, File>>({});
  const [documentProgress, setDocumentProgress] = useState(shopId ? 100 : 0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [industryOpen, setIndustryOpen] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: industries = [], isLoading: industriesLoading } = useQuery({
    queryKey: ['industries'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('industries')
        .select('*')
        .eq('status', 'active')
        .order('name');
      if (error) throw error;
      return data || [];
    }
  });

  const { data: documentRequirements = [], isLoading: documentsLoading } = useQuery({
    queryKey: ['document-requirements', 'ZW'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shop_document_requirements')
        .select('*')
        .eq('country_code', 'ZW')
        .order('is_required', { ascending: false })
        .order('document_name');
      if (error) throw error;
      return data || [];
    }
  });

  const selectedIndustryName = useMemo(() => {
    const found = industries.find(i => i.id === formData.industry_id);
    return found ? `${found.name} (${found.code})` : "";
  }, [formData.industry_id, industries]);

  const registerShopMutation = useMutation({
    mutationFn: async (shopData: typeof formData & { icon_url?: string; documents?: Record<string, string> }) => {
      const { latitude, longitude, ...rest } = shopData;
      const dbData = {
        ...rest,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
      };
      
      if (shopId) {
        const { data, error } = await supabase
          .from('shops')
          .update(dbData)
          .eq('id', shopId)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');
        
        const { data, error } = await supabase
          .from('shops')
          .insert({
            ...dbData,
            user_id: user.id,
            status: 'pending' as const,
            registration_date: new Date().toISOString().split('T')[0],
            document_verification_status: 'pending'
          })
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: async (data) => {
      if (Object.keys(documents).length > 0) {
        await handleDocumentUploadComplete(data.id);
      }
      toast({
        title: "Success",
        description: shopId 
          ? "Shop updated successfully!" 
          : "Shop registered successfully! Your application and documents are pending admin approval."
      });
      if (onSuccess) {
        onSuccess();
      } else {
        setFormData({ name: "", description: "", address: "", phone: "", email: "", website: "", industry_id: "", latitude: "", longitude: "" });
        setIconFile(null);
        setIconPreview(null);
        setDocuments({});
        setDocumentProgress(0);
      }
      setIsSubmitting(false);
      queryClient.invalidateQueries({ queryKey: ['shops'] });
    },
    onError: (error) => {
      console.error("Shop registration error:", error);
      toast({ title: "Error", description: "Failed to register shop. Please try again.", variant: "destructive" });
      setIsSubmitting(false);
    }
  });

  const uploadDocumentsToStorage = async (documents: Record<string, File>) => {
    const documentUrls: Record<string, string> = {};
    for (const [docType, file] of Object.entries(documents)) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${docType}_${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('shop-documents')
        .upload(`temp/${fileName}`, file, { cacheControl: '3600', upsert: false });
      if (uploadError) throw new Error(`Failed to upload ${docType}`);
      const { data: { publicUrl } } = supabase.storage.from('shop-documents').getPublicUrl(`temp/${fileName}`);
      documentUrls[docType] = publicUrl;
    }
    return documentUrls;
  };

  const handleDocumentUploadComplete = async (shopId: string) => {
    try {
      const { data: notifications } = await supabase
        .from('notifications')
        .select('id')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .eq('type', 'document_review_needed')
        .eq('read', false);
      if (notifications && notifications.length > 0) {
        await supabase.from('notifications').update({ read: true }).in('id', notifications.map(n => n.id));
      }
      const { data: adminUsers } = await supabase.from('admin_users').select('user_id').eq('is_active', true);
      if (adminUsers && adminUsers.length > 0) {
        await supabase.from('notifications').insert(
          adminUsers.map(admin => ({
            user_id: admin.user_id,
            title: 'Shop Documents Updated',
            message: 'New shop registration documents have been uploaded and are ready for review.',
            type: 'document_update',
            related_entity_type: 'shop',
            related_entity_id: shopId
          }))
        );
        for (const admin of adminUsers) {
          try {
            await supabase.functions.invoke('send-notification-email', {
              body: { user_id: admin.user_id, title: 'Shop Documents Updated', message: 'A shop owner has uploaded new registration documents that require your review and approval.', type: 'document_update' }
            });
          } catch (e) { console.warn('Failed to send email to admin:', e); }
        }
      }
    } catch (error) { console.error('Error handling document upload completion:', error); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!formData.name.trim()) {
      toast({ title: "Missing Information", description: "Please enter a shop name.", variant: "destructive" });
      return;
    }
    if (!formData.industry_id) {
      toast({ title: "Missing Information", description: "Please select an industry.", variant: "destructive" });
      return;
    }
    if (!shopId) {
      const requiredDocs = documentRequirements.filter(req => req.is_required);
      const missingDocs = requiredDocs.filter(req => !documents[req.document_type]);
      if (missingDocs.length > 0) {
        toast({ title: "Missing Required Documents", description: `Please upload: ${missingDocs.map(d => d.document_name).join(', ')}`, variant: "destructive" });
        return;
      }
    }
    setIsSubmitting(true);
    try {
      let iconUrl = "";
      let documentUrls: Record<string, string> = {};
      if (iconFile) {
        const fileExt = iconFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('shop-icons').upload(fileName, iconFile, { cacheControl: '3600', upsert: false });
        if (uploadError) throw new Error("Failed to upload icon");
        const { data: { publicUrl } } = supabase.storage.from('shop-icons').getPublicUrl(fileName);
        iconUrl = publicUrl;
      }
      if (Object.keys(documents).length > 0) {
        documentUrls = await uploadDocumentsToStorage(documents);
      }
      await registerShopMutation.mutateAsync({
        ...formData,
        ...(iconUrl && { icon_url: iconUrl }),
        ...(Object.keys(documentUrls).length > 0 && { documents: documentUrls })
      });
    } catch (error) {
      toast({ title: "Upload Error", description: error instanceof Error ? error.message : "Failed to upload files", variant: "destructive" });
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast({ title: "Invalid file type", description: "Please upload an image file (JPEG, PNG, WebP).", variant: "destructive" });
        e.target.value = '';
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast({ title: "File too large", description: "Please upload an image smaller than 5MB.", variant: "destructive" });
        e.target.value = '';
        return;
      }
      setIconFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setIconPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removeIcon = () => { setIconFile(null); setIconPreview(null); };
  const handleDocumentsChange = (newDocuments: Record<string, File>) => setDocuments(newDocuments);
  const handleProgressChange = (progress: number) => setDocumentProgress(progress);

  const clearForm = () => {
    setFormData({ name: "", description: "", address: "", phone: "", email: "", website: "", industry_id: "", latitude: "", longitude: "" });
    setIconFile(null);
    setIconPreview(null);
    setDocuments({});
    setDocumentProgress(0);
  };

  const isFormValid = formData.name.trim() && formData.industry_id && (shopId || documentProgress === 100);

  if (industriesLoading || documentsLoading) {
    return (
      <Card className="max-w-3xl mx-auto">
        <CardContent className="p-4">
          <div className="text-center text-sm">Loading registration form...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader className="text-center bg-primary text-primary-foreground py-4">
        <CardTitle className="text-lg">{shopId ? 'Edit Shop' : 'Register New Shop - Zimbabwe'}</CardTitle>
      </CardHeader>
      
      <CardContent className="p-4 space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Information */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold border-b pb-1.5">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs">Shop Name *</Label>
                <Input id="name" value={formData.name} onChange={(e) => handleInputChange("name", e.target.value)} required placeholder="Enter shop name" className="h-9 text-sm" />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="industry" className="text-xs">Industry *</Label>
                <Popover open={industryOpen} onOpenChange={setIndustryOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={industryOpen}
                      className="w-full h-9 justify-between text-sm font-normal"
                    >
                      <span className="truncate">
                        {selectedIndustryName || "Search & select industry..."}
                      </span>
                      <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search industry..." className="h-9 text-sm" />
                      <CommandList>
                        <CommandEmpty>No industry found.</CommandEmpty>
                        <CommandGroup className="max-h-60 overflow-auto">
                          {industries.map((industry) => (
                            <CommandItem
                              key={industry.id}
                              value={`${industry.name} ${industry.code}`}
                              onSelect={() => {
                                handleInputChange("industry_id", industry.id);
                                setIndustryOpen(false);
                              }}
                              className="text-sm"
                            >
                              <Check className={cn("mr-2 h-3.5 w-3.5", formData.industry_id === industry.id ? "opacity-100" : "opacity-0")} />
                              {industry.name} ({industry.code})
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Shop Icon Upload */}
            <div className="space-y-1.5">
              <Label htmlFor="icon" className="text-xs">Shop Icon</Label>
              <div className="flex items-center gap-3">
                {iconPreview ? (
                  <div className="relative">
                    <img src={iconPreview} alt="Shop icon preview" className="w-12 h-12 object-cover rounded-lg border" />
                    <Button type="button" size="sm" variant="destructive" className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full p-0" onClick={removeIcon}>
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ) : (
                  <div className="w-12 h-12 border-2 border-dashed border-muted-foreground/30 rounded-lg flex items-center justify-center">
                    <Upload className="w-4 h-4 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1">
                  <Input id="icon" type="file" accept="image/*" onChange={handleIconChange} className="h-9 text-xs file:mr-3 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" />
                  <p className="text-[10px] text-muted-foreground mt-0.5">Optional, max 5MB</p>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description" className="text-xs">Description</Label>
              <Textarea id="description" value={formData.description} onChange={(e) => handleInputChange("description", e.target.value)} placeholder="Enter shop description" rows={3} className="text-sm min-h-[70px]" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="address" className="text-xs">Address</Label>
              <Textarea id="address" value={formData.address} onChange={(e) => handleInputChange("address", e.target.value)} placeholder="Enter shop address" rows={2} className="text-sm min-h-[56px]" />
            </div>

            <LocationPicker
              latitude={formData.latitude}
              longitude={formData.longitude}
              onLocationChange={(lat, lng) => {
                setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }));
              }}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-xs">Phone Number</Label>
                <Input id="phone" value={formData.phone} onChange={(e) => handleInputChange("phone", e.target.value)} placeholder="Enter phone number" className="h-9 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs">Email</Label>
                <Input id="email" type="email" value={formData.email} onChange={(e) => handleInputChange("email", e.target.value)} placeholder="Enter email address" className="h-9 text-sm" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="website" className="text-xs">Website</Label>
              <Input id="website" value={formData.website} onChange={(e) => handleInputChange("website", e.target.value)} placeholder="Enter website URL" className="h-9 text-sm" />
            </div>
          </div>

          {/* Step-by-Step Document Upload */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold border-b pb-1.5">Required Documents Upload</h3>
            
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-medium text-amber-800 mb-0.5">Zimbabwe Business Registration Requirements</p>
                  <p className="text-[10px] text-amber-700">Upload all required business documents step by step for verification.</p>
                </div>
              </div>
            </div>

            <StepByStepDocumentUpload 
              onDocumentsChange={handleDocumentsChange}
              onProgressChange={handleProgressChange}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button 
              type="submit" 
              className="flex-1 h-9 text-sm"
              disabled={isSubmitting || !isFormValid}
            >
              {isSubmitting ? (shopId ? "Updating..." : "Registering...") : (shopId ? "Update Shop" : "Register Shop")}
            </Button>
            <Button type="button" variant="outline" className="flex-1 h-9 text-sm" onClick={clearForm} disabled={isSubmitting}>
              Clear Form
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ShopRegistrationForm;
