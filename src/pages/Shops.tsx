
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Filter, MapPin, Phone, Mail, Globe } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/Navbar";
import ShopRegistrationForm from "@/components/forms/ShopRegistrationForm";
import ShopContactModal from "@/components/ShopContactModal";
import { supabase } from "@/integrations/supabase/client";

const Shops = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("all");
  const [activeTab, setActiveTab] = useState("browse");
  const [selectedShop, setSelectedShop] = useState(null);
  const [showContactModal, setShowContactModal] = useState(false);

  // Fetch only active shops for regular users
  const { data: shops = [], isLoading } = useQuery({
    queryKey: ['shops'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shops')
        .select(`
          *,
          industries(name, code)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch industries for filtering
  const { data: industries = [] } = useQuery({
    queryKey: ['industries'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('industries')
        .select('*');
      if (error) throw error;
      return data || [];
    }
  });

  const filteredShops = shops.filter(shop => {
    const matchesSearch = shop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         shop.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesIndustry = selectedIndustry === "all" || shop.industries?.name === selectedIndustry;
    return matchesSearch && matchesIndustry;
  });

  const handleContact = (shop) => {
    setSelectedShop(shop);
    setShowContactModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Shop Directory
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Register your shop or browse existing ones
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="browse" className="text-lg py-3">Browse Shops</TabsTrigger>
            <TabsTrigger value="register" className="text-lg py-3">Register Shop</TabsTrigger>
          </TabsList>

          <TabsContent value="register">
            <ShopRegistrationForm />
          </TabsContent>

          <TabsContent value="browse">
            {/* Search and Filters */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-8 shadow-lg border border-border">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                    <Input
                      placeholder="Search shops..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 h-12 text-base"
                    />
                  </div>
                  
                  <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                    <SelectTrigger className="w-full md:w-48 h-12">
                      <SelectValue placeholder="Industry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Industries</SelectItem>
                      {industries.map(industry => (
                        <SelectItem key={industry.id} value={industry.name}>
                          {industry.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button className="h-12 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    <Filter className="w-5 h-5 mr-2" />
                    Filter
                  </Button>
                </div>
              </div>
            </div>

            {/* Shops Grid */}
            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-xl text-muted-foreground">Loading shops...</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredShops.map((shop) => (
                  <Card key={shop.id} className="group bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start mb-2">
                        <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                          {shop.industries?.name || 'General'}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                        {shop.name}
                      </CardTitle>
                      {shop.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {shop.description}
                        </p>
                      )}
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      <div className="space-y-2">
                        {shop.address && (
                          <div className="flex items-center text-sm text-muted-foreground">
                            <MapPin className="w-4 h-4 mr-2" />
                            <span className="line-clamp-1">{shop.address}</span>
                          </div>
                        )}
                        
                        {shop.phone && (
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Phone className="w-4 h-4 mr-2" />
                            <span>{shop.phone}</span>
                          </div>
                        )}
                        
                        {shop.email && (
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Mail className="w-4 h-4 mr-2" />
                            <span className="line-clamp-1">{shop.email}</span>
                          </div>
                        )}
                        
                        {shop.website && (
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Globe className="w-4 h-4 mr-2" />
                            <span className="line-clamp-1">{shop.website}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-2 mt-4">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1 hover:bg-blue-50"
                          onClick={() => handleContact(shop)}
                        >
                          Contact
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {filteredShops.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <p className="text-xl text-muted-foreground">No shops found matching your criteria.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Contact Modal */}
      <ShopContactModal 
        shop={selectedShop}
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
      />
    </div>
  );
};

export default Shops;
