import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, MapPin, Phone, Mail, Globe, ExternalLink, Store, ShieldCheck } from "lucide-react";
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

  const { data: shops = [], isLoading } = useQuery({
    queryKey: ['shops'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shops')
        .select(`*, industries(name, code)`)
        .eq('status', 'active')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  const { data: industries = [] } = useQuery({
    queryKey: ['industries'],
    queryFn: async () => {
      const { data, error } = await supabase.from('industries').select('*');
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

  const handleContact = (shop: any) => {
    setSelectedShop(shop);
    setShowContactModal(true);
  };

  const handleVisitWebsite = (website: string) => {
    if (website) {
      const url = website.startsWith('http') ? website : `https://${website}`;
      window.open(url, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, hsl(var(--foreground)) 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Store className="w-4 h-4" />
            Verified Business Directory
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tight mb-4">
            Shop Directory
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Register your business or discover verified shops across Zimbabwe.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-10 h-12 bg-muted/60 p-1 rounded-xl">
            <TabsTrigger value="browse" className="rounded-lg text-sm font-semibold data-[state=active]:bg-background data-[state=active]:shadow-sm">Browse Shops</TabsTrigger>
            <TabsTrigger value="register" className="rounded-lg text-sm font-semibold data-[state=active]:bg-background data-[state=active]:shadow-sm">Register Shop</TabsTrigger>
          </TabsList>

          <TabsContent value="register">
            <div className="mb-6 max-w-4xl mx-auto rounded-xl border border-primary/20 bg-primary/5 p-4">
              <p className="text-sm text-foreground">
                <strong>Shop Registration:</strong> Complete the form below to register your shop. It will be reviewed and you'll be notified once approved.
              </p>
            </div>
            <ShopRegistrationForm />
          </TabsContent>

          <TabsContent value="browse">
            {/* Search & Filters */}
            <div className="bg-card rounded-2xl p-5 mb-8 shadow-sm border border-border">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search shops by name or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-11"
                  />
                </div>
                <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                  <SelectTrigger className="w-full md:w-52 h-11">
                    <SelectValue placeholder="All Industries" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Industries</SelectItem>
                    {industries.map((industry: any) => (
                      <SelectItem key={industry.id} value={industry.name}>
                        {industry.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Verified Notice */}
            <div className="flex items-center gap-2 mb-6 text-xs text-muted-foreground">
              <ShieldCheck className="w-4 h-4 text-primary" />
              Only verified and approved shops are displayed.
            </div>

            {/* Grid */}
            {isLoading ? (
              <div className="text-center py-16">
                <div className="animate-pulse text-muted-foreground">Loading shops...</div>
              </div>
            ) : filteredShops.length === 0 ? (
              <div className="text-center py-16">
                <Store className="w-12 h-12 mx-auto mb-3 text-muted-foreground/40" />
                <p className="text-muted-foreground">No shops found matching your criteria.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredShops.map((shop: any) => (
                  <Card key={shop.id} className="group bg-card border border-border hover:border-primary/30 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
                    <CardHeader className="pb-3 space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="bg-primary/10 text-primary border-0 text-xs font-medium">
                          {shop.industries?.name || 'General'}
                        </Badge>
                        <Badge className="bg-green-500/10 text-green-700 border-0 text-xs">
                          <ShieldCheck className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      </div>
                      <CardTitle className="text-base font-bold text-foreground group-hover:text-primary transition-colors leading-snug">
                        {shop.name}
                      </CardTitle>
                      {shop.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                          {shop.description}
                        </p>
                      )}
                    </CardHeader>

                    <CardContent className="pt-0 space-y-4">
                      <div className="space-y-2">
                        {shop.address && (
                          <div className="flex items-start gap-2 text-sm text-muted-foreground">
                            <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                            <span className="line-clamp-1">{shop.address}</span>
                          </div>
                        )}
                        {shop.phone && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Phone className="w-3.5 h-3.5 shrink-0" />
                            <span>{shop.phone}</span>
                          </div>
                        )}
                        {shop.email && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Mail className="w-3.5 h-3.5 shrink-0" />
                            <span className="line-clamp-1">{shop.email}</span>
                          </div>
                        )}
                        {shop.website && (
                          <div className="flex items-center gap-2 text-sm">
                            <Globe className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
                            <button
                              onClick={() => handleVisitWebsite(shop.website)}
                              className="text-primary hover:underline text-left line-clamp-1"
                            >
                              {shop.website}
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 pt-1">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 h-9 text-xs font-semibold"
                          onClick={() => handleContact(shop)}
                        >
                          Contact
                        </Button>
                        {shop.website && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-9 px-3"
                            onClick={() => handleVisitWebsite(shop.website)}
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <ShopContactModal
        shop={selectedShop}
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
      />
    </div>
  );
};

export default Shops;
