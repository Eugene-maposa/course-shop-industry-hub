
import { useState } from "react";
import { Search, MapPin, Star, Package, Users, TrendingUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Navbar from "@/components/Navbar";

const Shops = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const shops = [
    {
      id: 1,
      name: "TechWorld",
      industry: "Technology",
      location: "San Francisco, CA",
      rating: 4.8,
      products: 156,
      members: 12,
      revenue: "$2.4M",
      description: "Leading technology retailer specializing in cutting-edge electronics and smart devices.",
      avatar: "https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=100&h=100&fit=crop&crop=face",
      verified: true,
      trending: true
    },
    {
      id: 2,
      name: "CoffeeCorner",
      industry: "Food & Beverage",
      location: "Portland, OR",
      rating: 4.6,
      products: 89,
      members: 8,
      revenue: "$650K",
      description: "Premium coffee roasters bringing you the finest organic beans from around the world.",
      avatar: "https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=100&h=100&fit=crop&crop=face",
      verified: true
    },
    {
      id: 3,
      name: "HomeDesign",
      industry: "Furniture",
      location: "Austin, TX",
      rating: 4.7,
      products: 234,
      members: 15,
      revenue: "$1.8M",
      description: "Modern home furnishing solutions with minimalist designs and sustainable materials.",
      avatar: "https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=100&h=100&fit=crop&crop=face",
      verified: true,
      trending: true
    },
    {
      id: 4,
      name: "FitLife",
      industry: "Health & Wellness",
      location: "Miami, FL",
      rating: 4.9,
      products: 312,
      members: 22,
      revenue: "$3.1M",
      description: "Complete fitness and wellness solutions for a healthier lifestyle.",
      avatar: "https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=100&h=100&fit=crop&crop=face",
      verified: true
    },
    {
      id: 5,
      name: "CraftedGoods",
      industry: "Fashion",
      location: "New York, NY",
      rating: 4.5,
      products: 167,
      members: 9,
      revenue: "$980K",
      description: "Handcrafted fashion accessories and leather goods made by skilled artisans.",
      avatar: "https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=100&h=100&fit=crop&crop=face",
      verified: false
    },
    {
      id: 6,
      name: "SecureHome",
      industry: "Technology",
      location: "Seattle, WA",
      rating: 4.4,
      products: 128,
      members: 11,
      revenue: "$1.2M",
      description: "Smart home security solutions to keep your family and property safe.",
      avatar: "https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=100&h=100&fit=crop&crop=face",
      verified: true
    }
  ];

  const filteredShops = shops.filter(shop =>
    shop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shop.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shop.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Partner Shops
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Connect with our verified partner shops across various industries and locations
          </p>
        </div>

        {/* Search */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-8 shadow-lg border border-border">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              placeholder="Search shops by name, industry, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-14 text-base rounded-xl"
            />
          </div>
        </div>

        {/* Shops Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredShops.map((shop) => (
            <Card key={shop.id} className="group bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={shop.avatar} alt={shop.name} />
                      <AvatarFallback>{shop.name.slice(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center space-x-2">
                        <CardTitle className="text-lg group-hover:text-purple-600 transition-colors">
                          {shop.name}
                        </CardTitle>
                        {shop.verified && (
                          <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                            ✓ Verified
                          </Badge>
                        )}
                      </div>
                      <Badge variant="outline" className="text-xs mt-1">
                        {shop.industry}
                      </Badge>
                    </div>
                  </div>
                  {shop.trending && (
                    <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Trending
                    </Badge>
                  )}
                </div>

                <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                  {shop.description}
                </p>

                <div className="flex items-center text-sm text-muted-foreground mb-3">
                  <MapPin className="w-4 h-4 mr-1" />
                  {shop.location}
                </div>

                <div className="flex items-center space-x-1 mb-4">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">{shop.rating}</span>
                  <span className="text-sm text-muted-foreground">rating</span>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Package className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="text-lg font-bold text-foreground">{shop.products}</div>
                    <div className="text-xs text-muted-foreground">Products</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Users className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="text-lg font-bold text-foreground">{shop.members}</div>
                    <div className="text-xs text-muted-foreground">Members</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <TrendingUp className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="text-lg font-bold text-foreground">{shop.revenue}</div>
                    <div className="text-xs text-muted-foreground">Revenue</div>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                    View Shop
                  </Button>
                  <Button variant="outline" className="flex-1 hover:bg-purple-50">
                    Contact
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredShops.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xl text-muted-foreground">No shops found matching your search criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Shops;
