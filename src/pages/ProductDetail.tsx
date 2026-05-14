
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { ArrowLeft, Star, Heart, ShoppingCart, Share2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Navbar from "@/components/Navbar";
import ProductImageEditor from "@/components/ProductImageEditor";
import ProductReviews from "@/components/ProductReviews";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { useShare } from "@/hooks/useShare";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";
import { useToast } from "@/hooks/use-toast";

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { shareProduct } = useShare();
  
  const { user } = useAuth();
  const { isAdmin } = useAdmin();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", price: "", sku: "" });

  // Fetch real product data from database
  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      console.log("Fetching product with ID:", id);
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_types(name, code)
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error("Error fetching product:", error);
        throw error;
      }
      console.log("Fetched product data:", data);
      return data;
    },
    enabled: !!id
  });

  const { data: shopInfo } = useQuery({
    queryKey: ['public-shop', product?.shop_id],
    queryFn: async () => {
      if (!product?.shop_id) return null;

      const { data, error } = await (supabase as any).rpc('get_public_shop_by_id', {
        p_shop_id: product.shop_id,
      });

      if (error) throw error;
      if (!Array.isArray(data) || data.length === 0) return null;
      return data[0] as { id: string; name: string; website: string | null; industry_name: string | null; industry_code: string | null };
    },
    enabled: !!product?.shop_id,
  });

  // Fetch review stats for header display
  const { data: reviewStats } = useQuery({
    queryKey: ['product-review-stats', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_reviews' as any)
        .select('rating')
        .eq('product_id', id);
      if (error) throw error;
      const ratings = (data as any[]) || [];
      const total = ratings.length;
      const avg = total > 0 ? ratings.reduce((s: number, r: any) => s + r.rating, 0) / total : 0;
      return { avg, total };
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
        <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <p className="text-xl text-muted-foreground">Loading product details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <p className="text-xl text-red-600">Product not found or error loading product details.</p>
            <Link to="/products" className="text-blue-600 hover:text-blue-800 mt-4 inline-block">
              ← Back to Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Keep persisted images separate from UI placeholders so edits save real values only
  const fallbackImage = "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=600&h=600&fit=crop";
  const persistedMainImage = (product.main_image_url as string) || "";
  const persistedGalleryImages: string[] = Array.isArray(product.gallery_images)
    ? (product.gallery_images as string[])
    : [];

  const mainImageUrl = persistedMainImage || fallbackImage;
  const displayGalleryImages = persistedGalleryImages.length > 0 ? persistedGalleryImages : [fallbackImage, fallbackImage];
  const productImages = [mainImageUrl, ...displayGalleryImages];
  const canEditProduct = Boolean(user);

  const handleAddToCart = () => {
    if (product.price) {
      addToCart({
        id: product.id,
        name: product.name,
        price: Number(product.price),
        image: mainImageUrl
      });
    }
  };

  const handleWishlistToggle = () => {
    const wishlistItem = {
      id: product.id,
      name: product.name,
      price: Number(product.price) || 0,
      image: mainImageUrl
    };

    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(wishlistItem);
    }
  };

  const handleShare = () => {
    shareProduct({
      title: product.name,
      text: product.description || `Check out ${product.name}`,
      url: window.location.href
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 mb-8">
          <Link to="/products" className="flex items-center text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Products
          </Link>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 mb-12">
          {/* Product Images */}
          <div className="space-y-4 relative">
            <div className="aspect-square bg-card rounded-2xl overflow-hidden shadow-lg relative">
              <img 
                src={productImages[0]} 
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {canEditProduct && (
                <ProductImageEditor
                  productId={product.id}
                  mainImage={persistedMainImage}
                  galleryImages={persistedGalleryImages}
                />
              )}
            </div>
            <div className="grid grid-cols-3 gap-4">
              {productImages.slice(1).map((image, index) => (
                <div key={index} className="aspect-square bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer">
                  <img 
                    src={image} 
                    alt={`${product.name} ${index + 2}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Badge variant="secondary">{product.product_types?.name || 'General'}</Badge>
                <Badge variant="outline">{product.status}</Badge>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                {product.name}
              </h1>
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center space-x-1">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-5 h-5 ${i < Math.round(reviewStats?.avg || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'}`} 
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium">{reviewStats?.avg ? reviewStats.avg.toFixed(1) : '—'}</span>
                  <span className="text-sm text-muted-foreground">({reviewStats?.total || 0} reviews)</span>
                </div>
                <span className="text-sm text-muted-foreground">by {shopInfo?.name || 'Unknown Shop'}</span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-3xl font-bold text-foreground">
                {product.price ? `$${product.price}` : 'Price not set'}
              </div>
            </div>

            <p className="text-muted-foreground leading-relaxed">
              {product.description || 'No description available for this product.'}
            </p>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-sm font-medium">In Stock</span>
              </div>

              <div className="flex space-x-4">
                <Button 
                  size="lg" 
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg py-6"
                  onClick={handleAddToCart}
                  disabled={!product.price}
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Add to Cart
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="px-6 py-6"
                  onClick={handleWishlistToggle}
                >
                  <Heart className={`w-5 h-5 ${isInWishlist(product.id) ? 'fill-red-500 text-red-500' : ''}`} />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="px-6 py-6"
                  onClick={handleShare}
                >
                  <Share2 className="w-5 h-5" />
                </Button>
              </div>
            </div>

          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Product Info */}
          <Card className="bg-card/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Product Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">P Number</span>
                <span className="text-sm font-medium">{product.sku || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Category</span>
                <span className="text-sm font-medium">{product.product_types?.name || 'General'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Status</span>
                <span className="text-sm font-medium capitalize">{product.status}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Registration Date</span>
                <span className="text-sm font-medium">
                  {product.registration_date ? new Date(product.registration_date).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Shop Information */}
          <Card className="bg-card/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Shop Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Shop Name</span>
                <span className="text-sm font-medium">{shopInfo?.name || 'Unknown'}</span>
              </div>
              {shopInfo?.industry_name && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Industry</span>
                  <span className="text-sm font-medium">{shopInfo.industry_name}</span>
                </div>
              )}
              {shopInfo?.website && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Website</span>
                  <a 
                    href={shopInfo.website.startsWith('http') ? shopInfo.website : `https://${shopInfo.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-primary hover:opacity-80 underline"
                  >
                    Visit Website
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

        </div>

        {/* Full Reviews Section */}
        <div className="mt-8">
          <ProductReviews productId={product.id} />
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
