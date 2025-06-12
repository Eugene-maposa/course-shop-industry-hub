
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Star, Heart, ShoppingCart, Share2, Shield, Truck, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Navbar from "@/components/Navbar";

const ProductDetail = () => {
  const { id } = useParams();
  
  // Mock product data - in a real app, this would come from an API
  const product = {
    id: 1,
    name: "Smart Wireless Headphones",
    category: "Electronics",
    price: 299,
    originalPrice: 399,
    rating: 4.8,
    reviews: 156,
    shop: "TechWorld",
    industry: "Technology",
    images: [
      "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=600&h=600&fit=crop",
      "https://images.unsplash.com/photo-1460574283810-2aab119d8511?w=600&h=600&fit=crop"
    ],
    description: "Experience premium audio quality with our latest smart wireless headphones. Featuring advanced noise cancellation, 30-hour battery life, and seamless connectivity across all your devices.",
    features: [
      "Active Noise Cancellation",
      "30-hour battery life",
      "Bluetooth 5.0 connectivity",
      "Premium leather comfort fit",
      "Voice assistant integration",
      "Quick charge - 5 min for 2 hours playback"
    ],
    specifications: {
      "Driver Size": "40mm",
      "Frequency Response": "20Hz - 20kHz",
      "Impedance": "32 Ohm",
      "Weight": "280g",
      "Connectivity": "Bluetooth 5.0, 3.5mm jack",
      "Battery": "30 hours playback"
    },
    inStock: true,
    stockCount: 12
  };

  const reviews = [
    {
      id: 1,
      user: "Sarah M.",
      avatar: "https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=40&h=40&fit=crop&crop=face",
      rating: 5,
      comment: "Amazing sound quality and the noise cancellation is incredible. Best purchase I've made this year!",
      date: "2 days ago"
    },
    {
      id: 2,
      user: "Mike R.",
      avatar: "https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=40&h=40&fit=crop&crop=face",
      rating: 4,
      comment: "Great headphones overall. Battery life is fantastic and they're very comfortable for long sessions.",
      date: "1 week ago"
    },
    {
      id: 3,
      user: "Emma L.",
      avatar: "https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=40&h=40&fit=crop&crop=face",
      rating: 5,
      comment: "The build quality is excellent and the sound is crystal clear. Highly recommend!",
      date: "2 weeks ago"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
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
          <div className="space-y-4">
            <div className="aspect-square bg-white rounded-2xl overflow-hidden shadow-lg">
              <img 
                src={product.images[0]} 
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              {product.images.slice(1).map((image, index) => (
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
                <Badge variant="secondary">{product.category}</Badge>
                <Badge variant="outline">{product.industry}</Badge>
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
                        className={`w-5 h-5 ${i < Math.floor(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium">{product.rating}</span>
                  <span className="text-sm text-muted-foreground">({product.reviews} reviews)</span>
                </div>
                <span className="text-sm text-muted-foreground">by {product.shop}</span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-3xl font-bold text-foreground">${product.price}</div>
              {product.originalPrice && (
                <div className="text-lg text-muted-foreground line-through">${product.originalPrice}</div>
              )}
              <Badge className="bg-green-100 text-green-700">
                {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
              </Badge>
            </div>

            <p className="text-muted-foreground leading-relaxed">{product.description}</p>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${product.inStock ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-sm font-medium">
                  {product.inStock ? `In Stock (${product.stockCount} available)` : 'Out of Stock'}
                </span>
              </div>

              <div className="flex space-x-4">
                <Button 
                  size="lg" 
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg py-6"
                  disabled={!product.inStock}
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Add to Cart
                </Button>
                <Button size="lg" variant="outline" className="px-6 py-6">
                  <Heart className="w-5 h-5" />
                </Button>
                <Button size="lg" variant="outline" className="px-6 py-6">
                  <Share2 className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border">
              <div className="text-center">
                <Shield className="w-6 h-6 mx-auto mb-2 text-green-600" />
                <div className="text-xs font-medium">Warranty</div>
                <div className="text-xs text-muted-foreground">2 Years</div>
              </div>
              <div className="text-center">
                <Truck className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                <div className="text-xs font-medium">Free Shipping</div>
                <div className="text-xs text-muted-foreground">2-3 Days</div>
              </div>
              <div className="text-center">
                <RotateCcw className="w-6 h-6 mx-auto mb-2 text-purple-600" />
                <div className="text-xs font-medium">Returns</div>
                <div className="text-xs text-muted-foreground">30 Days</div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Features */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Key Features</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {product.features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Specifications */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Specifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(product.specifications).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">{key}</span>
                  <span className="text-sm font-medium">{value}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Reviews */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Customer Reviews</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {reviews.slice(0, 3).map((review) => (
                <div key={review.id} className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={review.avatar} alt={review.user} />
                      <AvatarFallback>{review.user.slice(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-sm font-medium">{review.user}</div>
                      <div className="flex items-center space-x-1">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-3 h-3 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                            />
                          ))}
                        </div>
                        <span className="text-xs text-muted-foreground">{review.date}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{review.comment}</p>
                  {review.id < reviews.length && <Separator />}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
