
import { Link } from "react-router-dom";
import { Package, Store, Building2, User, ShoppingCart, FileText, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/Navbar";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      
      {/* Hero Background Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700">
        {/* Background overlay to match NUST style */}
        <div className="absolute inset-0 bg-black/20"></div>
        
        <div className="relative max-w-6xl mx-auto">
          {/* Main Content Cards */}
          <div className="grid md:grid-cols-2 gap-8 mt-16">
            
            {/* Product Registration Card (equivalent to Online Application) */}
            <Card className="bg-white/95 backdrop-blur-sm shadow-xl border-0">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold text-nust-blue mb-4">
                  PRODUCT REGISTRATION
                </CardTitle>
                <CardDescription className="text-gray-600 text-base leading-relaxed">
                  Through the easy to use product registration forms below you can register your products with ProductHub.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Link to="/products" className="block">
                  <Button className="w-full bg-nust-blue hover:bg-nust-blue-dark text-white py-3 text-sm font-medium">
                    <Package className="w-4 h-4 mr-2" />
                    REGISTER NEW PRODUCT
                  </Button>
                </Link>
                
                <Link to="/shops" className="block">
                  <Button className="w-full bg-nust-blue hover:bg-nust-blue-dark text-white py-3 text-sm font-medium">
                    <Store className="w-4 h-4 mr-2" />
                    REGISTER SHOP
                  </Button>
                </Link>
                
                <Link to="/industries" className="block">
                  <Button className="w-full bg-nust-blue hover:bg-nust-blue-dark text-white py-3 text-sm font-medium">
                    <Building2 className="w-4 h-4 mr-2" />
                    REGISTER INDUSTRY
                  </Button>
                </Link>
                
                <Button variant="outline" className="w-full border-nust-blue text-nust-blue hover:bg-nust-blue hover:text-white py-3 text-sm font-medium">
                  <FileText className="w-4 h-4 mr-2" />
                  HOW TO REGISTER PRODUCTS
                </Button>
              </CardContent>
            </Card>

            {/* Shop and Admin Login Card (equivalent to Student and Staff Login) */}
            <Card className="bg-white/95 backdrop-blur-sm shadow-xl border-0">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold text-nust-blue mb-4">
                  SHOP AND ADMIN LOGIN
                </CardTitle>
                <CardDescription className="text-gray-600 text-base leading-relaxed">
                  Please use your <Link to="#" className="text-blue-600 underline">shop ID</Link> or username and password to log in to the system.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-sm font-medium text-gray-700">
                    Username
                  </Label>
                  <Input 
                    id="username" 
                    type="text" 
                    className="w-full"
                    placeholder="Enter your username"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Password
                  </Label>
                  <Input 
                    id="password" 
                    type="password" 
                    className="w-full"
                    placeholder="Enter your password"
                  />
                </div>
                
                <Button className="w-full bg-nust-blue hover:bg-nust-blue-dark text-white py-3 text-lg font-medium">
                  Login
                </Button>
                
                <div className="text-center">
                  <Link to="#" className="text-blue-600 hover:underline text-sm">
                    Click here if you forgot your password.
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
            <Card className="bg-white/90 backdrop-blur-sm border-0 text-center">
              <CardContent className="p-4">
                <Package className="w-8 h-8 mx-auto mb-2 text-nust-blue" />
                <div className="text-xl font-bold text-nust-blue">2,500+</div>
                <div className="text-sm text-gray-600">Products</div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/90 backdrop-blur-sm border-0 text-center">
              <CardContent className="p-4">
                <Store className="w-8 h-8 mx-auto mb-2 text-nust-blue" />
                <div className="text-xl font-bold text-nust-blue">150+</div>
                <div className="text-sm text-gray-600">Shops</div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/90 backdrop-blur-sm border-0 text-center">
              <CardContent className="p-4">
                <Building2 className="w-8 h-8 mx-auto mb-2 text-nust-blue" />
                <div className="text-xl font-bold text-nust-blue">25+</div>
                <div className="text-sm text-gray-600">Industries</div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/90 backdrop-blur-sm border-0 text-center">
              <CardContent className="p-4">
                <User className="w-8 h-8 mx-auto mb-2 text-nust-blue" />
                <div className="text-xl font-bold text-nust-blue">98%</div>
                <div className="text-sm text-gray-600">Success Rate</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-nust-blue text-white py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-nust-blue" />
            </div>
            <span className="text-xl font-bold">ProductHub</span>
          </div>
          <p className="text-gray-200 mb-4">
            Empowering businesses with intelligent product management solutions
          </p>
          <div className="flex justify-center space-x-6 text-sm text-gray-200">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
