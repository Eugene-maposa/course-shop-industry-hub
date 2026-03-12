import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, CheckCircle, Info } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ProductImageUpload from "@/components/ProductImageUpload";

interface ProductRegistrationFormProps {
  productId?: string;
  initialData?: {
    name: string;
    description?: string;
    price?: number;
    sku?: string;
    product_type_id?: string;
    shop_id?: string;
    main_image_url?: string;
    gallery_images?: any;
  };
  onSuccess?: () => void;
}

const ProductRegistrationForm = ({ productId, initialData, onSuccess }: ProductRegistrationFormProps = {}) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    price: initialData?.price?.toString() || "",
    sku: initialData?.sku || "",
    product_type_id: initialData?.product_type_id || "",
    shop_id: initialData?.shop_id || ""
  });

  const [mainImage, setMainImage] = useState<string | null>(initialData?.main_image_url || null);
  const [galleryImages, setGalleryImages] = useState<string[]>(
    Array.isArray(initialData?.gallery_images) ? initialData.gallery_images : []
  );

  const [validationStatus, setValidationStatus] = useState<{
    isChecked: boolean;
    isLegal: boolean;
    violations: string[];
  }>({ isChecked: false, isLegal: true, violations: [] });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: productTypes = [], isLoading: isLoadingTypes } = useQuery({
    queryKey: ['productTypes'],
    queryFn: async () => {
      const { data, error } = await supabase.from('product_types').select('*').eq('status', 'active');
      if (error) throw error;
      return data || [];
    }
  });

  const { data: shops = [], isLoading: isLoadingShops } = useQuery({
    queryKey: ['shops'],
    queryFn: async () => {
      const { data, error } = await supabase.from('shops').select('*').eq('status', 'active');
      if (error) throw error;
      return data || [];
    }
  });

  const checkProductLegality = async (name: string, description: string) => {
    try {
      const { data, error } = await supabase.rpc('check_product_legality', {
        product_name: name,
        product_description: description || ''
      });
      if (error) throw error;
      if (data && data.length > 0) {
        const result = data[0];
        setValidationStatus({ isChecked: true, isLegal: result.is_legal, violations: result.violations || [] });
        return result;
      }
      return { is_legal: true, violations: [] };
    } catch (error) {
      setValidationStatus({ isChecked: true, isLegal: true, violations: [] });
      return { is_legal: true, violations: [] };
    }
  };

  const registerProductMutation = useMutation({
    mutationFn: async (productData: typeof formData) => {
      const cleanedData = {
        ...productData,
        price: productData.price ? parseFloat(productData.price) : null,
        product_type_id: productData.product_type_id || null,
        shop_id: productData.shop_id || null,
        sku: productData.sku || null,
        main_image_url: mainImage,
        gallery_images: galleryImages
      };
      
      if (productId) {
        const { data, error } = await supabase.from('products').update(cleanedData).eq('id', productId).select().single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase.from('products').insert(cleanedData).select().single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      toast({ title: "Success", description: productId ? "Product updated successfully!" : "Product registered successfully!" });
      if (onSuccess) {
        onSuccess();
      } else {
        setFormData({ name: "", description: "", price: "", sku: "", product_type_id: "", shop_id: "" });
        setMainImage(null);
        setGalleryImages([]);
      }
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (error) => {
      toast({ title: "Error", description: "Failed to register product. Please try again.", variant: "destructive" });
      console.error("Error registering product:", error);
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) { toast({ title: "Validation Error", description: "Product name is required.", variant: "destructive" }); return; }
    if (!formData.product_type_id) { toast({ title: "Validation Error", description: "Product type is required.", variant: "destructive" }); return; }
    if (!formData.shop_id) { toast({ title: "Validation Error", description: "Shop is required.", variant: "destructive" }); return; }
    const legalityCheck = await checkProductLegality(formData.name, formData.description);
    if (!legalityCheck.is_legal) {
      toast({ title: "Product Registration Blocked", description: `Prohibited content: ${legalityCheck.violations.join(', ')}`, variant: "destructive" });
      return;
    }
    registerProductMutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field === 'name' || field === 'description') {
      setValidationStatus({ isChecked: false, isLegal: true, violations: [] });
    }
  };

  const handleSelectChange = (field: string) => (value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="text-center bg-primary text-primary-foreground py-4">
        <CardTitle className="text-lg">{productId ? 'Edit Product' : 'Register New Product'}</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs">Product Name *</Label>
              <Input id="name" value={formData.name} onChange={(e) => handleInputChange("name", e.target.value)} required placeholder="Enter product name" className="h-9 text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sku" className="text-xs">P Number</Label>
              <Input id="sku" value={formData.sku} onChange={(e) => handleInputChange("sku", e.target.value)} placeholder="Enter product number" className="h-9 text-sm" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-xs">Description</Label>
            <Textarea id="description" value={formData.description} onChange={(e) => handleInputChange("description", e.target.value)} placeholder="Enter product description" rows={3} className="text-sm min-h-[70px]" />
          </div>

          {/* Product Validation Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium">Product Legality Check</Label>
              <Button type="button" variant="outline" size="sm" className="h-7 text-xs" onClick={async () => { if (formData.name.trim()) await checkProductLegality(formData.name, formData.description); }} disabled={!formData.name.trim()}>
                <Info className="w-3.5 h-3.5 mr-1" />
                Check Product
              </Button>
            </div>
            {validationStatus.isChecked && (
              <Alert className={`py-2 ${validationStatus.isLegal ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
                <div className="flex items-center">
                  {validationStatus.isLegal ? <CheckCircle className="h-3.5 w-3.5 text-green-600" /> : <AlertTriangle className="h-3.5 w-3.5 text-red-600" />}
                  <AlertDescription className="ml-2 text-xs">
                    {validationStatus.isLegal ? (
                      <span className="text-green-700">✅ This product is legal for registration in Zimbabwe</span>
                    ) : (
                      <div className="text-red-700">
                        <div className="font-medium mb-0.5">❌ Prohibited content:</div>
                        <ul className="list-disc list-inside text-xs">
                          {validationStatus.violations.map((v, i) => <li key={i}>{v}</li>)}
                        </ul>
                      </div>
                    )}
                  </AlertDescription>
                </div>
              </Alert>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="product_type" className="text-xs">Product Type *</Label>
              <Select value={formData.product_type_id} onValueChange={handleSelectChange("product_type_id")}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder={isLoadingTypes ? "Loading..." : "Select product type"} />
                </SelectTrigger>
                <SelectContent>
                  {productTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>{type.name} ({type.code})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="shop" className="text-xs">Shop *</Label>
              <Select value={formData.shop_id} onValueChange={handleSelectChange("shop_id")}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder={isLoadingShops ? "Loading..." : "Select shop"} />
                </SelectTrigger>
                <SelectContent>
                  {shops.map((shop) => (
                    <SelectItem key={shop.id} value={shop.id}>{shop.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="price" className="text-xs">Price</Label>
            <Input id="price" type="number" step="0.01" value={formData.price} onChange={(e) => handleInputChange("price", e.target.value)} placeholder="Enter price" className="h-9 text-sm" />
          </div>

          <div className="col-span-full">
            <ProductImageUpload mainImage={mainImage} galleryImages={galleryImages} onMainImageChange={setMainImage} onGalleryImagesChange={setGalleryImages} />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" className="flex-1 h-9 text-sm" disabled={registerProductMutation.isPending || (validationStatus.isChecked && !validationStatus.isLegal)}>
              {registerProductMutation.isPending ? (productId ? "Updating..." : "Registering...") : (productId ? "Update Product" : "Register Product")}
            </Button>
            <Button type="button" variant="outline" className="flex-1 h-9 text-sm" onClick={() => {
              setFormData({ name: "", description: "", price: "", sku: "", product_type_id: "", shop_id: "" });
              setMainImage(null);
              setGalleryImages([]);
              setValidationStatus({ isChecked: false, isLegal: true, violations: [] });
            }}>
              Clear Form
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProductRegistrationForm;
