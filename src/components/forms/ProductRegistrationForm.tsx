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
  }>({
    isChecked: false,
    isLegal: true,
    violations: []
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch product types
  const { data: productTypes = [], isLoading: isLoadingTypes } = useQuery({
    queryKey: ['productTypes'],
    queryFn: async () => {
      console.log("Fetching product types...");
      const { data, error } = await supabase
        .from('product_types')
        .select('*')
        .eq('status', 'active');
      if (error) {
        console.error("Error fetching product types:", error);
        throw error;
      }
      console.log("Product types fetched:", data);
      return data || [];
    }
  });

  // Fetch shops
  const { data: shops = [], isLoading: isLoadingShops } = useQuery({
    queryKey: ['shops'],
    queryFn: async () => {
      console.log("Fetching shops...");
      const { data, error } = await supabase
        .from('shops')
        .select('*')
        .eq('status', 'active');
      if (error) {
        console.error("Error fetching shops:", error);
        throw error;
      }
      console.log("Shops fetched:", data);
      return data || [];
    }
  });

  // Add product legality check function
  const checkProductLegality = async (name: string, description: string) => {
    console.log("Checking product legality for:", name, description);
    
    try {
      const { data, error } = await supabase.rpc('check_product_legality', {
        product_name: name,
        product_description: description || ''
      });

      if (error) {
        console.error("Error checking product legality:", error);
        throw error;
      }

      console.log("Legality check result:", data);
      
      if (data && data.length > 0) {
        const result = data[0];
        setValidationStatus({
          isChecked: true,
          isLegal: result.is_legal,
          violations: result.violations || []
        });
        
        return result;
      }
      
      return { is_legal: true, violations: [] };
    } catch (error) {
      console.error("Failed to check product legality:", error);
      setValidationStatus({
        isChecked: true,
        isLegal: true,
        violations: []
      });
      return { is_legal: true, violations: [] };
    }
  };

  const registerProductMutation = useMutation({
    mutationFn: async (productData: typeof formData) => {
      console.log("Submitting product data:", productData);
      
      // Convert empty strings to null for UUID fields
      const cleanedData = {
        ...productData,
        price: productData.price ? parseFloat(productData.price) : null,
        product_type_id: productData.product_type_id || null,
        shop_id: productData.shop_id || null,
        sku: productData.sku || null,
        main_image_url: mainImage,
        gallery_images: galleryImages
      };
      
      console.log("Cleaned product data:", cleanedData);
      
      // Update if productId exists, otherwise insert
      if (productId) {
        const { data, error } = await supabase
          .from('products')
          .update(cleanedData)
          .eq('id', productId)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('products')
          .insert(cleanedData)
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: productId ? "Product updated successfully!" : "Product registered successfully!"
      });
      
      if (onSuccess) {
        onSuccess();
      } else {
        setFormData({
          name: "",
          description: "",
          price: "",
          sku: "",
          product_type_id: "",
          shop_id: ""
        });
        setMainImage(null);
        setGalleryImages([]);
      }
      
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to register product. Please try again.",
        variant: "destructive"
      });
      console.error("Error registering product:", error);
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Product name is required.",
        variant: "destructive"
      });
      return;
    }
    
    if (!formData.product_type_id) {
      toast({
        title: "Validation Error",
        description: "Product type is required.",
        variant: "destructive"
      });
      return;
    }
    
    if (!formData.shop_id) {
      toast({
        title: "Validation Error",
        description: "Shop is required.",
        variant: "destructive"
      });
      return;
    }

    // Check product legality before submission
    const legalityCheck = await checkProductLegality(formData.name, formData.description);
    
    if (!legalityCheck.is_legal) {
      toast({
        title: "Product Registration Blocked",
        description: `This product contains prohibited content and cannot be registered in Zimbabwe: ${legalityCheck.violations.join(', ')}`,
        variant: "destructive"
      });
      return;
    }
    
    registerProductMutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: string) => {
    console.log(`Updating ${field} to:`, value);
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Reset validation status when name or description changes
    if (field === 'name' || field === 'description') {
      setValidationStatus({
        isChecked: false,
        isLegal: true,
        violations: []
      });
    }
  };

  const handleSelectChange = (field: string) => (value: string) => {
    console.log(`Select ${field} changed to:`, value);
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleValidateProduct = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a product name first.",
        variant: "destructive"
      });
      return;
    }

    await checkProductLegality(formData.name, formData.description);
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="text-center bg-nust-blue text-white">
        <CardTitle className="text-2xl">{productId ? 'Edit Product' : 'Register New Product'}</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
                placeholder="Enter product name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sku">Product Code</Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) => handleInputChange("sku", e.target.value)}
                placeholder="Enter product code"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Enter product description"
              rows={4}
            />
          </div>

          {/* Product Validation Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Product Legality Check</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleValidateProduct}
                disabled={!formData.name.trim()}
              >
                <Info className="w-4 h-4 mr-2" />
                Check Product
              </Button>
            </div>

            {validationStatus.isChecked && (
              <Alert className={validationStatus.isLegal ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                <div className="flex items-center">
                  {validationStatus.isLegal ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                  )}
                  <AlertDescription className="ml-2">
                    {validationStatus.isLegal ? (
                      <span className="text-green-700">
                        ✅ This product is legal for registration in Zimbabwe
                      </span>
                    ) : (
                      <div className="text-red-700">
                        <div className="font-medium mb-1">
                          ❌ This product contains prohibited content and cannot be registered:
                        </div>
                        <ul className="list-disc list-inside text-sm">
                          {validationStatus.violations.map((violation, index) => (
                            <li key={index}>{violation}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </AlertDescription>
                </div>
              </Alert>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="product_type">Product Type *</Label>
              <Select 
                value={formData.product_type_id} 
                onValueChange={handleSelectChange("product_type_id")}
              >
                <SelectTrigger>
                  <SelectValue placeholder={isLoadingTypes ? "Loading..." : "Select product type"} />
                </SelectTrigger>
                <SelectContent>
                  {productTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name} ({type.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="shop">Shop *</Label>
              <Select 
                value={formData.shop_id} 
                onValueChange={handleSelectChange("shop_id")}
              >
                <SelectTrigger>
                  <SelectValue placeholder={isLoadingShops ? "Loading..." : "Select shop"} />
                </SelectTrigger>
                <SelectContent>
                  {shops.map((shop) => (
                    <SelectItem key={shop.id} value={shop.id}>
                      {shop.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Price</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => handleInputChange("price", e.target.value)}
              placeholder="Enter price"
            />
          </div>

          {/* Product Images Section */}
          <div className="col-span-full">
            <ProductImageUpload
              mainImage={mainImage}
              galleryImages={galleryImages}
              onMainImageChange={setMainImage}
              onGalleryImagesChange={setGalleryImages}
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button 
              type="submit" 
              className="flex-1 bg-nust-blue hover:bg-nust-blue-dark"
              disabled={registerProductMutation.isPending || (validationStatus.isChecked && !validationStatus.isLegal)}
            >
              {registerProductMutation.isPending 
                ? (productId ? "Updating..." : "Registering...") 
                : (productId ? "Update Product" : "Register Product")
              }
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              className="flex-1"
              onClick={() => {
                setFormData({
                  name: "",
                  description: "",
                  price: "",
                  sku: "",
                  product_type_id: "",
                  shop_id: ""
                });
                setMainImage(null);
                setGalleryImages([]);
                setValidationStatus({
                  isChecked: false,
                  isLegal: true,
                  violations: []
                });
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

export default ProductRegistrationForm;
