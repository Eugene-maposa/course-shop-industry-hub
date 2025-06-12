
import { useState } from "react";
import { Link } from "react-router-dom";
import { Package, Store, Building2, User, ShoppingCart, FileText, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import AuthModal from "@/components/AuthModal";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { user, loading } = useAuth();

  const handleRegistrationClick = () => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nust-blue mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

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
            
            {/* Product Registration Card */}
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
                {user ? (
                  <>
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
                  </>
                ) : (
                  <>
                    <Button 
                      onClick={handleRegistrationClick}
                      className="w-full bg-nust-blue hover:bg-nust-blue-dark text-white py-3 text-sm font-medium"
                    >
                      <Package className="w-4 h-4 mr-2" />
                      REGISTER NEW PRODUCT
                    </Button>
                    
                    <Button 
                      onClick={handleRegistrationClick}
                      className="w-full bg-nust-blue hover:bg-nust-blue-dark text-white py-3 text-sm font-medium"
                    >
                      <Store className="w-4 h-4 mr-2" />
                      REGISTER SHOP
                    </Button>
                    
                    <Button 
                      onClick={handleRegistrationClick}
                      className="w-full bg-nust-blue hover:bg-nust-blue-dark text-white py-3 text-sm font-medium"
                    >
                      <Building2 className="w-4 h-4 mr-2" />
                      REGISTER INDUSTRY
                    </Button>
                  </>
                )}
                
                <Button variant="outline" className="w-full border-nust-blue text-nust-blue hover:bg-nust-blue hover:text-white py-3 text-sm font-medium">
                  <FileText className="w-4 h-4 mr-2" />
                  HOW TO REGISTER PRODUCTS
                </Button>
              </CardContent>
            </Card>

            {/* Authentication Card */}
            <Card className="bg-white/95 backdrop-blur-sm shadow-xl border-0">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold text-nust-blue mb-4">
                  {user ? 'WELCOME BACK' : 'SHOP AND ADMIN LOGIN'}
                </CardTitle>
                <CardDescription className="text-gray-600 text-base leading-relaxed">
                  {user 
                    ? `Welcome back, ${user.email}! You can now access all features.`
                    : 'Please login to access registration features and manage your products.'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {user ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center">
                        <User className="w-5 h-5 text-green-600 mr-2" />
                        <span className="text-green-800 font-medium">Logged in as:</span>
                      </div>
                      <p className="text-green-700 mt-1">{user.email}</p>
                    </div>
                    
                    <Link to="/products" className="block">
                      <Button className="w-full bg-nust-blue hover:bg-nust-blue-dark text-white py-3">
                        <Package className="w-4 h-4 mr-2" />
                        Manage Products
                      </Button>
                    </Link>
                    
                    <Link to="/shops" className="block">
                      <Button className="w-full bg-nust-blue hover:bg-nust-blue-dark text-white py-3">
                        <Store className="w-4 h-4 mr-2" />
                        Manage Shops
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Button 
                      onClick={() => setIsAuthModalOpen(true)}
                      className="w-full bg-nust-blue hover:bg-nust-blue-dark text-white py-3 text-lg font-medium"
                    >
                      Login / Sign Up
                    </Button>
                    
                    <div className="text-center">
                      <button
                        onClick={() => setIsAuthModalOpen(true)}
                        className="text-blue-600 hover:underline text-sm"
                      >
                        Need help with your account?
                      </button>
                    </div>
                  </div>
                )}
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

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </div>
  );
};

export default Index;
