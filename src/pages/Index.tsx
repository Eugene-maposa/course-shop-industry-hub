
import { Link } from "react-router-dom";
import { ArrowRight, Package, Store, Building2, Star, TrendingUp, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/Navbar";

const Index = () => {
  const features = [
    {
      icon: Package,
      title: "Smart Product Management",
      description: "Organize and manage your product catalog with advanced filtering and search capabilities."
    },
    {
      icon: Store,
      title: "Shop Analytics",
      description: "Track performance metrics and gain insights into shop operations and customer behavior."
    },
    {
      icon: Building2,
      title: "Industry Insights",
      description: "Explore market trends and industry-specific data to make informed business decisions."
    }
  ];

  const stats = [
    { label: "Active Products", value: "2,500+", icon: Package },
    { label: "Partner Shops", value: "150+", icon: Store },
    { label: "Industries", value: "25+", icon: Building2 },
    { label: "Success Rate", value: "98%", icon: TrendingUp }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-6 animate-fade-in">
              Your Ultimate Product Management Hub
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed">
              Discover, manage, and optimize your product ecosystem. Connect shops across industries 
              and unlock powerful insights to drive your business forward.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-3">
              Explore Products <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-3 border-2">
              Watch Demo
            </Button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index} className="bg-white/60 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="p-6 text-center">
                    <Icon className="w-8 h-8 mx-auto mb-3 text-blue-600" />
                    <div className="text-2xl font-bold text-foreground mb-1">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Powerful Features for Modern Commerce
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to manage products, shops, and industry relationships in one integrated platform.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group">
                  <CardHeader className="text-center pb-4">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-xl mb-2">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-center text-base leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Quick Navigation */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Explore Our Platform
            </h2>
            <p className="text-xl text-muted-foreground">
              Navigate through our comprehensive product ecosystem
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Link to="/products" className="group">
              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 hover:from-blue-600 hover:to-blue-700 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
                <CardContent className="p-8 text-center">
                  <Package className="w-16 h-16 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
                  <h3 className="text-2xl font-bold mb-3">Products</h3>
                  <p className="text-blue-100 mb-4">
                    Browse our comprehensive product catalog with advanced filtering and search
                  </p>
                  <div className="flex items-center justify-center text-sm font-medium">
                    Explore Products <ArrowRight className="ml-2 w-4 h-4" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link to="/shops" className="group">
              <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 hover:from-purple-600 hover:to-purple-700 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
                <CardContent className="p-8 text-center">
                  <Store className="w-16 h-16 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
                  <h3 className="text-2xl font-bold mb-3">Shops</h3>
                  <p className="text-purple-100 mb-4">
                    Discover partner shops and their specialties across various industries
                  </p>
                  <div className="flex items-center justify-center text-sm font-medium">
                    View Shops <ArrowRight className="ml-2 w-4 h-4" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link to="/industries" className="group">
              <Card className="bg-gradient-to-br from-pink-500 to-pink-600 text-white border-0 hover:from-pink-600 hover:to-pink-700 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
                <CardContent className="p-8 text-center">
                  <Building2 className="w-16 h-16 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
                  <h3 className="text-2xl font-bold mb-3">Industries</h3>
                  <p className="text-pink-100 mb-4">
                    Explore different industry sectors and their market dynamics
                  </p>
                  <div className="flex items-center justify-center text-sm font-medium">
                    Browse Industries <ArrowRight className="ml-2 w-4 h-4" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">ProductHub</span>
          </div>
          <p className="text-gray-400 mb-4">
            Empowering businesses with intelligent product management solutions
          </p>
          <div className="flex justify-center space-x-6 text-sm text-gray-400">
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
