
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, ShoppingCart, Eye, Heart, Package } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/Navbar";
import ProductRegistrationForm from "@/components/forms/ProductRegistrationForm";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { useAuth } from "@/hooks/useAuth";

const Products = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activeTab, setActiveTab] = useState("browse");
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`*, product_types(name, code)`);
      if (error) throw error;
      return data || [];
    }
  });

  const { data: publicShops = [] } = useQuery({
    queryKey: ['public-shops-products'],
    queryFn: async () => {
      const { data, error } = await (supabase as any).rpc('get_public_shops');
      if (error) throw error;
      return (data || []) as any[];
    }
  });

  const { data: productTypes = [] } = useQuery({
    queryKey: ['productTypes'],
    queryFn: async () => {
      const { data, error } = await supabase.from('product_types').select('*');
      if (error) throw error;
      return data || [];
    }
  });

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.shops?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || product.product_types?.name === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, hsl(var(--foreground)) 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Package className="w-4 h-4" />
            Product Marketplace
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tight mb-4">
            Product Management
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Register new products or browse existing ones across all shops.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className={`grid w-full max-w-md mx-auto mb-10 h-12 bg-muted/60 p-1 rounded-xl ${user ? 'grid-cols-2' : 'grid-cols-1'}`}>
            <TabsTrigger value="browse" className="rounded-lg text-sm font-semibold data-[state=active]:bg-background data-[state=active]:shadow-sm">Browse Products</TabsTrigger>
            {user && <TabsTrigger value="register" className="rounded-lg text-sm font-semibold data-[state=active]:bg-background data-[state=active]:shadow-sm">Register Product</TabsTrigger>}
          </TabsList>

          <TabsContent value="register">
            <div className="mb-6 max-w-4xl mx-auto rounded-xl border border-primary/20 bg-primary/5 p-4">
              <p className="text-sm text-foreground">
                <strong>Product Registration:</strong> Complete the form below to register a new product. It will be reviewed for compliance.
              </p>
            </div>
            <ProductRegistrationForm />
          </TabsContent>

          <TabsContent value="browse">
            {/* Search and Filters */}
            <div className="bg-card rounded-2xl p-4 mb-8 shadow-sm border border-border">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search products or shops..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-9 text-sm"
                  />
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full md:w-44 h-9 text-sm">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {productTypes.map(type => (
                      <SelectItem key={type.id} value={type.name}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Results count */}
            <div className="flex items-center gap-2 mb-6 text-xs text-muted-foreground">
              <Package className="w-4 h-4 text-primary" />
              Showing {filteredProducts.length} products
            </div>

            {isLoading ? (
              <div className="text-center py-16">
                <div className="animate-pulse text-muted-foreground">Loading products...</div>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-16">
                <Package className="w-12 h-12 mx-auto mb-3 text-muted-foreground/40" />
                <p className="text-muted-foreground">No products found matching your criteria.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <Card key={product.id} className="group bg-card border border-border hover:border-primary/30 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
                    <div className="relative">
                      <Badge className="absolute top-3 left-3 z-10 bg-primary/10 text-primary border-0 text-xs font-medium">
                        {product.product_types?.name || 'General'}
                      </Badge>
                      <div className="absolute top-3 right-3 z-10">
                        <Button 
                          size="sm" 
                          variant="secondary" 
                          className={`h-7 w-7 p-0 bg-background/80 backdrop-blur-sm hover:bg-background/90 ${isInWishlist(product.id) ? 'text-red-500' : ''}`}
                          onClick={() => {
                            if (isInWishlist(product.id)) {
                              removeFromWishlist(product.id);
                            } else {
                              addToWishlist({
                                id: product.id,
                                name: product.name,
                                price: product.price || 0,
                                image: product.main_image_url || "/placeholder.svg"
                              });
                            }
                          }}
                        >
                          <Heart className={`w-3.5 h-3.5 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
                        </Button>
                      </div>
                      <div className="w-full h-40 bg-muted/50 flex items-center justify-center overflow-hidden">
                        {product.main_image_url ? (
                          <img 
                            src={product.main_image_url} 
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ShoppingCart className="w-12 h-12 text-muted-foreground/30" />
                        )}
                      </div>
                    </div>
                    
                    <CardHeader className="pb-2 pt-3 space-y-1">
                      <div className="flex justify-between items-start">
                        <Badge variant="secondary" className="text-xs">
                          {product.status}
                        </Badge>
                      </div>
                      <CardTitle className="text-base font-bold text-foreground group-hover:text-primary transition-colors leading-snug">
                        {product.name}
                      </CardTitle>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>by {product.shops?.name || 'Unknown Shop'}</span>
                        <span>{product.sku ? `P#: ${product.sku}` : ''}</span>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="text-xl font-bold text-foreground">
                          {product.price ? `$${product.price}` : 'Price TBD'}
                        </div>
                        <div className="flex gap-1.5">
                          <Link to={`/product/${product.id}`}>
                            <Button size="sm" variant="outline" className="h-8 text-xs">
                              <Eye className="w-3.5 h-3.5 mr-1" />
                              View
                            </Button>
                          </Link>
                          <Button 
                            size="sm" 
                            className="h-8 text-xs"
                            onClick={() => {
                              addToCart({
                                id: product.id,
                                name: product.name,
                                price: product.price || 0,
                                image: product.main_image_url || "/placeholder.svg"
                              });
                            }}
                          >
                            <ShoppingCart className="w-3.5 h-3.5 mr-1" />
                            Add
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Products;
