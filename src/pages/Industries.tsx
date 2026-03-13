
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Building2, Users, TrendingUp, Eye, ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/Navbar";
import IndustryRegistrationForm from "@/components/forms/IndustryRegistrationForm";
import IndustryDetailModal from "@/components/IndustryDetailModal";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const Industries = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [activeTab, setActiveTab] = useState("browse");
  const [selectedIndustry, setSelectedIndustry] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const { data: industries = [], isLoading } = useQuery({
    queryKey: ['industriesWithCounts'],
    queryFn: async () => {
      const { data: industriesData, error: industriesError } = await supabase
        .from('industries')
        .select('*');
      
      if (industriesError) throw industriesError;

      const industriesWithCounts = await Promise.all(
        industriesData.map(async (industry) => {
          const [shopsResult, productTypesResult] = await Promise.all([
            supabase.from('shops').select('id', { count: 'exact' }).eq('industry_id', industry.id),
            supabase.from('product_types').select('id', { count: 'exact' }).eq('industry_id', industry.id)
          ]);
          return {
            ...industry,
            shopsCount: shopsResult.count || 0,
            productTypesCount: productTypesResult.count || 0
          };
        })
      );
      return industriesWithCounts;
    }
  });

  const filteredIndustries = industries.filter(industry => {
    const matchesSearch = industry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         industry.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         industry.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === "all" || industry.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleViewDetails = (industry) => {
    setSelectedIndustry(industry);
    setShowDetailModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/10 text-green-700 border-0';
      case 'pending': return 'bg-yellow-500/10 text-yellow-700 border-0';
      case 'inactive': return 'bg-red-500/10 text-red-700 border-0';
      default: return 'bg-muted text-muted-foreground border-0';
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
            <Building2 className="w-4 h-4" />
            Global Industry Registry
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tight mb-4">
            Industry Management
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Register new industries or browse existing ones across all sectors.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className={`grid w-full max-w-md mx-auto mb-10 h-12 bg-muted/60 p-1 rounded-xl ${user ? 'grid-cols-2' : 'grid-cols-1'}`}>
            <TabsTrigger value="browse" className="rounded-lg text-sm font-semibold data-[state=active]:bg-background data-[state=active]:shadow-sm">Browse Industries</TabsTrigger>
            {user && <TabsTrigger value="register" className="rounded-lg text-sm font-semibold data-[state=active]:bg-background data-[state=active]:shadow-sm">Register Industry</TabsTrigger>}
          </TabsList>

          <TabsContent value="register">
            <div className="mb-6 max-w-4xl mx-auto rounded-xl border border-primary/20 bg-primary/5 p-4">
              <p className="text-sm text-foreground">
                <strong>Industry Registration:</strong> Complete the form below to register a new industry category.
              </p>
            </div>
            <IndustryRegistrationForm />
          </TabsContent>

          <TabsContent value="browse">
            {/* Search and Filters */}
            <div className="bg-card rounded-2xl p-4 mb-8 shadow-sm border border-border">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search industries by name, code or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-9 text-sm"
                  />
                </div>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-full md:w-44 h-9 text-sm">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Verified Notice */}
            <div className="flex items-center gap-2 mb-6 text-xs text-muted-foreground">
              <ShieldCheck className="w-4 h-4 text-primary" />
              Showing {filteredIndustries.length} industries
            </div>

            {isLoading ? (
              <div className="text-center py-16">
                <div className="animate-pulse text-muted-foreground">Loading industries...</div>
              </div>
            ) : filteredIndustries.length === 0 ? (
              <div className="text-center py-16">
                <Building2 className="w-12 h-12 mx-auto mb-3 text-muted-foreground/40" />
                <p className="text-muted-foreground">No industries found matching your criteria.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredIndustries.map((industry) => (
                  <Card key={industry.id} className="group bg-card border border-border hover:border-primary/30 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
                    <CardHeader className="pb-3 space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge className={`text-xs font-medium ${getStatusColor(industry.status)}`}>
                          {industry.status}
                        </Badge>
                        <Badge variant="secondary" className="bg-primary/10 text-primary border-0 text-xs font-medium">
                          {industry.code}
                        </Badge>
                      </div>
                      <CardTitle className="text-base font-bold text-foreground group-hover:text-primary transition-colors leading-snug flex items-center gap-2">
                        <Building2 className="w-4 h-4 shrink-0" />
                        {industry.name}
                      </CardTitle>
                      {industry.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                          {industry.description}
                        </p>
                      )}
                    </CardHeader>
                    
                    <CardContent className="pt-0 space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="text-center bg-muted/50 rounded-lg py-2">
                          <div className="flex items-center justify-center gap-1 text-primary mb-0.5">
                            <Users className="w-3.5 h-3.5" />
                            <span className="text-base font-bold">{industry.shopsCount}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">Shops</p>
                        </div>
                        <div className="text-center bg-muted/50 rounded-lg py-2">
                          <div className="flex items-center justify-center gap-1 text-primary mb-0.5">
                            <TrendingUp className="w-3.5 h-3.5" />
                            <span className="text-base font-bold">{industry.productTypesCount}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">Product Types</p>
                        </div>
                      </div>
                      
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="w-full h-9 text-xs font-semibold"
                        onClick={() => handleViewDetails(industry)}
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" />
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <IndustryDetailModal 
        industry={selectedIndustry}
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
      />
    </div>
  );
};

export default Industries;
