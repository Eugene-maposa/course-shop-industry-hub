
import { useState } from "react";
import { Search, Filter, Star, ShoppingCart, Eye, Heart } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";

const Products = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("popular");

  const products = [
    {
      id: 1,
      name: "Smart Wireless Headphones",
      category: "Electronics",
      price: 299,
      rating: 4.8,
      reviews: 156,
      shop: "TechWorld",
      industry: "Technology",
      image: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=400&h=300&fit=crop",
      featured: true
    },
    {
      id: 2,
      name: "Organic Coffee Beans",
      category: "Food & Beverage",
      price: 24,
      rating: 4.6,
      reviews: 89,
      shop: "CoffeeCorner",
      industry: "Food & Beverage",
      image: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=400&h=300&fit=crop"
    },
    {
      id: 3,
      name: "Minimalist Desk Lamp",
      category: "Home & Garden",
      price: 89,
      rating: 4.7,
      reviews: 234,
      shop: "HomeDesign",
      industry: "Furniture",
      image: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=400&h=300&fit=crop"
    },
    {
      id: 4,
      name: "Premium Yoga Mat",
      category: "Sports & Fitness",
      price: 79,
      rating: 4.9,
      reviews: 312,
      shop: "FitLife",
      industry: "Health & Wellness",
      image: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=400&h=300&fit=crop",
      featured: true
    },
    {
      id: 5,
      name: "Artisan Leather Wallet",
      category: "Fashion",
      price: 149,
      rating: 4.5,
      reviews: 67,
      shop: "CraftedGoods",
      industry: "Fashion",
      image: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=400&h=300&fit=crop"
    },
    {
      id: 6,
      name: "Smart Home Security Camera",
      category: "Electronics",
      price: 199,
      rating: 4.4,
      reviews: 128,
      shop: "SecureHome",
      industry: "Technology",
      image: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=400&h=300&fit=crop"
    }
  ];

  const categories = ["all", "Electronics", "Food & Beverage", "Home & Garden", "Sports & Fitness", "Fashion"];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.shop.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Product Catalog
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover amazing products from our partner shops across various industries
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-8 shadow-lg border border-border">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                placeholder="Search products or shops..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 text-base"
              />
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-48 h-12">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category === "all" ? "All Categories" : category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-48 h-12">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>

            <Button className="h-12 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Filter className="w-5 h-5 mr-2" />
              Filter
            </Button>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="group bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden">
              <div className="relative">
                {product.featured && (
                  <Badge className="absolute top-4 left-4 z-10 bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                    Featured
                  </Badge>
                )}
                <div className="absolute top-4 right-4 z-10">
                  <Button size="sm" variant="secondary" className="bg-white/80 backdrop-blur-sm hover:bg-white/90">
                    <Heart className="w-4 h-4" />
                  </Button>
                </div>
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="secondary" className="text-xs">
                    {product.category}
                  </Badge>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{product.rating}</span>
                    <span className="text-sm text-muted-foreground">({product.reviews})</span>
                  </div>
                </div>
                <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                  {product.name}
                </CardTitle>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>by {product.shop}</span>
                  <span>{product.industry}</span>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-foreground">
                    ${product.price}
                  </div>
                  <div className="flex space-x-2">
                    <Link to={`/product/${product.id}`}>
                      <Button size="sm" variant="outline" className="hover:bg-blue-50">
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                    </Link>
                    <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                      <ShoppingCart className="w-4 h-4 mr-1" />
                      Add
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xl text-muted-foreground">No products found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
