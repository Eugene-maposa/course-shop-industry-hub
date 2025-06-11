
import { useState } from "react";
import { Search, TrendingUp, Building2, Users, Package, DollarSign, BarChart3 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Navbar from "@/components/Navbar";

const Industries = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const industries = [
    {
      id: 1,
      name: "Technology",
      description: "Cutting-edge electronics, software, and digital solutions",
      shops: 45,
      products: 1250,
      marketValue: "$12.5B",
      growth: 15.8,
      trend: "up",
      color: "from-blue-500 to-cyan-500",
      icon: "💻",
      topProducts: ["Smartphones", "Laptops", "Smart Home", "Wearables"],
      marketShare: 35
    },
    {
      id: 2,
      name: "Health & Wellness",
      description: "Fitness equipment, supplements, and wellness products",
      shops: 32,
      products: 890,
      marketValue: "$8.9B",
      growth: 22.3,
      trend: "up",
      color: "from-green-500 to-emerald-500",
      icon: "🏃‍♂️",
      topProducts: ["Fitness Equipment", "Supplements", "Yoga Gear", "Health Tech"],
      marketShare: 18
    },
    {
      id: 3,
      name: "Fashion",
      description: "Clothing, accessories, and lifestyle products",
      shops: 28,
      products: 720,
      marketValue: "$6.7B",
      growth: 8.2,
      trend: "up",
      color: "from-pink-500 to-rose-500",
      icon: "👗",
      topProducts: ["Clothing", "Accessories", "Footwear", "Jewelry"],
      marketShare: 25
    },
    {
      id: 4,
      name: "Food & Beverage",
      description: "Gourmet foods, beverages, and culinary equipment",
      shops: 38,
      products: 1100,
      marketValue: "$9.2B",
      growth: 12.1,
      trend: "up",
      color: "from-orange-500 to-amber-500",
      icon: "🍕",
      topProducts: ["Specialty Foods", "Beverages", "Kitchen Tools", "Snacks"],
      marketShare: 22
    },
    {
      id: 5,
      name: "Home & Garden",
      description: "Furniture, decor, and outdoor living solutions",
      shops: 25,
      products: 650,
      marketValue: "$5.8B",
      growth: 6.5,
      trend: "stable",
      color: "from-green-500 to-teal-500",
      icon: "🏠",
      topProducts: ["Furniture", "Decor", "Garden Tools", "Appliances"],
      marketShare: 15
    },
    {
      id: 6,
      name: "Automotive",
      description: "Car accessories, parts, and automotive technology",
      shops: 18,
      products: 420,
      marketValue: "$4.2B",
      growth: -2.1,
      trend: "down",
      color: "from-gray-500 to-slate-500",
      icon: "🚗",
      topProducts: ["Car Parts", "Accessories", "Tools", "Electronics"],
      marketShare: 12
    }
  ];

  const filteredIndustries = industries.filter(industry =>
    industry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    industry.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case "down":
        return <TrendingUp className="w-4 h-4 text-red-600 rotate-180" />;
      default:
        return <BarChart3 className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "up":
        return "text-green-600";
      case "down":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent mb-4">
            Industry Insights
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Explore market trends and opportunities across different industry sectors
          </p>
        </div>

        {/* Search */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-8 shadow-lg border border-border">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              placeholder="Search industries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-14 text-base rounded-xl"
            />
          </div>
        </div>

        {/* Industries Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredIndustries.map((industry) => (
            <Card key={industry.id} className="group bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden">
              <div className={`h-2 bg-gradient-to-r ${industry.color}`} />
              
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-3xl">{industry.icon}</div>
                  <div className="flex items-center space-x-1">
                    {getTrendIcon(industry.trend)}
                    <span className={`text-sm font-medium ${getTrendColor(industry.trend)}`}>
                      {industry.growth > 0 ? '+' : ''}{industry.growth}%
                    </span>
                  </div>
                </div>
                
                <CardTitle className="text-xl group-hover:text-indigo-600 transition-colors mb-2">
                  {industry.name}
                </CardTitle>
                
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                  {industry.description}
                </p>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Market Share</span>
                    <span className="text-sm font-medium">{industry.marketShare}%</span>
                  </div>
                  <Progress value={industry.marketShare} className="h-2" />
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-center mb-2">
                      <Building2 className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="text-lg font-bold text-foreground">{industry.shops}</div>
                    <div className="text-xs text-muted-foreground">Shops</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-center mb-2">
                      <Package className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="text-lg font-bold text-foreground">{industry.products.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">Products</div>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex items-center justify-center mb-2">
                    <DollarSign className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground">{industry.marketValue}</div>
                    <div className="text-sm text-muted-foreground">Market Value</div>
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="text-sm font-medium text-foreground mb-3">Top Product Categories</h4>
                  <div className="flex flex-wrap gap-1">
                    {industry.topProducts.map((product, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {product}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button className={`flex-1 py-2 px-4 rounded-lg text-white font-medium bg-gradient-to-r ${industry.color} hover:opacity-90 transition-opacity`}>
                    Explore
                  </button>
                  <button className="flex-1 py-2 px-4 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors">
                    Analytics
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredIndustries.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xl text-muted-foreground">No industries found matching your search criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Industries;
