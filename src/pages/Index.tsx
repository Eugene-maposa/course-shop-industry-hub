
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Package, Store, Building2, User, ShoppingCart, FileText, HelpCircle, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import AuthModal from "@/components/AuthModal";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user, loading, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Signed out successfully",
      });
    }
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    toast({
      title: "Welcome!",
      description: "You are now logged in to ProductHub",
    });
  };

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 mx-auto mb-4 text-nust-blue animate-pulse" />
          <p className="text-gray-600">Loading ProductHub...</p>
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
          {/* User Status Bar */}
          {user && (
            <div className="mb-8 bg-white/10 backdrop-blur-sm rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <User className="w-6 h-6 text-white" />
                <span className="text-white font-medium">Welcome, {user.email}</span>
              </div>
              <Button
                onClick={handleSignOut}
                variant="outline"
                size="sm"
                className="border-white text-white hover:bg-white hover:text-nust-blue"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          )}
          
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
                  <div className="text-center py-4">
                    <p className="text-gray-600 mb-4">Please log in to access registration features</p>
                    <Button 
                      onClick={() => setShowAuthModal(true)}
                      className="w-full bg-nust-blue hover:bg-nust-blue-dark text-white py-3 text-sm font-medium"
                    >
                      <User className="w-4 h-4 mr-2" />
                      LOGIN TO REGISTER
                    </Button>
                  </div>
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
                  {user ? "ACCOUNT MANAGEMENT" : "SHOP AND ADMIN LOGIN"}
                </CardTitle>
                <CardDescription className="text-gray-600 text-base leading-relaxed">
                  {user 
                    ? "Manage your account and access advanced features."
                    : "Please use your shop ID or username and password to log in to the system."
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {user ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <User className="w-5 h-5 text-green-600" />
                        <span className="font-medium text-green-800">Logged in as:</span>
                      </div>
                      <p className="text-green-700 mt-1">{user.email}</p>
                    </div>
                    
                    <Link to="/products" className="block">
                      <Button className="w-full bg-nust-blue hover:bg-nust-blue-dark text-white py-3 text-lg font-medium">
                        <ShoppingCart className="w-5 h-5 mr-2" />
                        Manage Products
                      </Button>
                    </Link>
                    
                    <Button
                      onClick={handleSignOut}
                      variant="outline"
                      className="w-full border-red-500 text-red-500 hover:bg-red-500 hover:text-white py-3 text-lg font-medium"
                    >
                      <LogOut className="w-5 h-5 mr-2" />
                      Sign Out
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Button 
                      onClick={() => setShowAuthModal(true)}
                      className="w-full bg-nust-blue hover:bg-nust-blue-dark text-white py-3 text-lg font-medium"
                    >
                      <User className="w-5 h-5 mr-2" />
                      Login / Sign Up
                    </Button>
                    
                    <div className="text-center">
                      <button 
                        onClick={() => setShowAuthModal(true)}
                        className="text-blue-600 hover:underline text-sm"
                      >
                        Click here if you forgot your password.
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

      {/* Authentication Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="relative">
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute -top-4 -right-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 z-10"
            >
              ✕
            </button>
            <AuthModal onSuccess={handleAuthSuccess} />
          </div>
        </div>
      )}

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
