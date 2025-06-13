
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { AlertCircle } from "lucide-react";

const ProductRegistrationForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    sku: "",
    product_type_id: "",
    shop_id: ""
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

  // Fetch shops - try all statuses if no active shops found
  const { data: shops = [], isLoading: isLoadingShops } = useQuery({
    queryKey: ['shops'],
    queryFn: async () => {
      console.log("Fetching active shops...");
      const { data: activeShops, error: activeError } = await supabase
        .from('shops')
        .select('*')
        .eq('status', 'active');
      
      if (activeError) {
        console.error("Error fetching active shops:", activeError);
        throw activeError;
      }
      
      console.log("Active shops fetched:", activeShops);
      
      // If no active shops, try fetching all shops
      if (!activeShops || activeShops.length === 0) {
        console.log("No active shops found, fetching all shops...");
        const { data: allShops, error: allError } = await supabase
          .from('shops')
          .select('*');
        
        if (allError) {
          console.error("Error fetching all shops:", allError);
          throw allError;
        }
        
        console.log("All shops fetched:", allShops);
        return allShops || [];
      }
      
      return activeShops || [];
    }
  });

  const registerProductMutation = useMutation({
    mutationFn: async (productData: typeof formData) => {
      console.log("Submitting product data:", productData);
      
      // Convert empty strings to null for UUID fields
      const cleanedData = {
        ...productData,
        price: productData.price ? parseFloat(productData.price) : null,
        product_type_id: productData.product_type_id || null,
        shop_id: productData.shop_id || null,
        sku: productData.sku || null
      };
      
      console.log("Cleaned product data:", cleanedData);
      
      const { data, error } = await supabase
        .from('products')
        .insert(cleanedData)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Product registered successfully!"
      });
      setFormData({
        name: "",
        description: "",
        price: "",
        sku: "",
        product_type_id: "",
        shop_id: ""
      });
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

  const handleSubmit = (e: React.FormEvent) => {
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
    
    registerProductMutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: string) => {
    console.log(`Updating ${field} to:`, value);
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSelectChange = (field: string) => (value: string) => {
    console.log(`Select ${field} changed to:`, value);
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      sku: "",
      product_type_id: "",
      shop_id: ""
    });
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader className="text-center bg-nust-blue text-white">
        <CardTitle className="text-2xl">Register New Product</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {/* Show alert if no shops are available */}
        {!isLoadingShops && shops.length === 0 && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No shops are available. You need to{" "}
              <Link to="/shops" className="text-blue-600 hover:underline">
                register a shop
              </Link>{" "}
              first before creating products.
            </AlertDescription>
          </Alert>
        )}

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
                disabled={shops.length === 0}
              >
                <SelectTrigger>
                  <SelectValue 
                    placeholder={
                      isLoadingShops 
                        ? "Loading..." 
                        : shops.length === 0 
                          ? "No shops available" 
                          : "Select shop"
                    } 
                  />
                </SelectTrigger>
                <SelectContent>
                  {shops.map((shop) => (
                    <SelectItem key={shop.id} value={shop.id}>
                      {shop.name} {shop.status !== 'active' && `(${shop.status})`}
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

          <div className="flex gap-4 pt-4">
            <Button 
              type="submit" 
              className="flex-1 bg-nust-blue hover:bg-nust-blue-dark"
              disabled={registerProductMutation.isPending || shops.length === 0}
            >
              {registerProductMutation.isPending ? "Registering..." : "Register Product"}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              className="flex-1"
              onClick={resetForm}
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
