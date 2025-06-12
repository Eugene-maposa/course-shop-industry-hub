import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Building2, TrendingUp, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/Navbar";
import IndustryRegistrationForm from "@/components/forms/IndustryRegistrationForm";
import IndustryDetailModal from "@/components/IndustryDetailModal";
import { supabase } from "@/integrations/supabase/client";

const Industries = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("browse");
  const [selectedIndustry, setSelectedIndustry] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Fetch industries with counts
  const { data: industries = [], isLoading } = useQuery({
    queryKey: ['industries-with-counts'],
    queryFn: async () => {
      const { data: industriesData, error: industriesError } = await supabase
        .from('industries')
        .select('*');
      
      if (industriesError) throw industriesError;

      // Get counts for each industry
      const industriesWithCounts = await Promise.all(
        (industriesData || []).map(async (industry) => {
          const [shopsResult, productTypesResult] = await Promise.all([
            supabase
              .from('shops')
              .select('id', { count: 'exact' })
              .eq('industry_id', industry.id),
            supabase
              .from('product_types')
              .select('id', { count: 'exact' })
              .eq('industry_id', industry.id)
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

  const filteredIndustries = industries.filter(industry => 
    industry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    industry.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewDetails = (industry) => {
    setSelectedIndustry(industry);
    setShowDetailModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Industry Management
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Register new industries or browse existing ones
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="browse" className="text-lg py-3">Browse Industries</TabsTrigger>
            <TabsTrigger value="register" className="text-lg py-3">Register Industry</TabsTrigger>
          </TabsList>

          <TabsContent value="register">
            <IndustryRegistrationForm />
          </TabsContent>

          <TabsContent value="browse">
            {/* Search */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-8 shadow-lg border border-border">
              <div className="relative max-w-md mx-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input
                  placeholder="Search industries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 text-base"
                />
              </div>
            </div>

            {/* Industries Grid */}
            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-xl text-muted-foreground">Loading industries...</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredIndustries.map((industry) => (
                  <Card key={industry.id} className="group bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start mb-2">
                        <Badge variant="secondary" className="text-xs">
                          {industry.status}
                        </Badge>
                        <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                          {industry.code}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg group-hover:text-blue-600 transition-colors flex items-center">
                        <Building2 className="w-5 h-5 mr-2" />
                        {industry.name}
                      </CardTitle>
                      {industry.description && (
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {industry.description}
                        </p>
                      )}
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <div className="flex items-center justify-center mb-1">
                            <Users className="w-4 h-4 text-blue-600 mr-1" />
                          </div>
                          <div className="text-lg font-bold text-blue-600">{industry.shopsCount}</div>
                          <div className="text-xs text-muted-foreground">Shops</div>
                        </div>
                        
                        <div className="text-center p-3 bg-purple-50 rounded-lg">
                          <div className="flex items-center justify-center mb-1">
                            <TrendingUp className="w-4 h-4 text-purple-600 mr-1" />
                          </div>
                          <div className="text-lg font-bold text-purple-600">{industry.productTypesCount}</div>
                          <div className="text-xs text-muted-foreground">Product Types</div>
                        </div>
                      </div>
                      
                      <Button 
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        onClick={() => handleViewDetails(industry)}
                      >
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {filteredIndustries.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <p className="text-xl text-muted-foreground">No industries found matching your criteria.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Detail Modal */}
      <IndustryDetailModal
        industry={selectedIndustry}
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
      />
    </div>
  );
};

export default Industries;
