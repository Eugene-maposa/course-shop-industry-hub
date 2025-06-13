
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Filter, Building2, Users, TrendingUp, Eye } from "lucide-react";
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

const Industries = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [activeTab, setActiveTab] = useState("browse");
  const [selectedIndustry, setSelectedIndustry] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Fetch industries with related counts
  const { data: industries = [], isLoading } = useQuery({
    queryKey: ['industriesWithCounts'],
    queryFn: async () => {
      const { data: industriesData, error: industriesError } = await supabase
        .from('industries')
        .select('*');
      
      if (industriesError) throw industriesError;

      // Get counts for each industry
      const industriesWithCounts = await Promise.all(
        industriesData.map(async (industry) => {
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
      case 'active':
        return 'bg-green-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'inactive':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
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
            {/* Search and Filters */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-8 shadow-lg border border-border">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <Input
                    placeholder="Search industries..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-12 text-base"
                  />
                </div>
                
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-full md:w-48 h-12">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>

                <Button className="h-12 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  <Filter className="w-5 h-5 mr-2" />
                  Filter
                </Button>
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
                        <Badge variant="secondary" className={`text-xs text-white ${getStatusColor(industry.status)}`}>
                          {industry.status}
                        </Badge>
                        <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                          {industry.code}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg group-hover:text-blue-600 transition-colors flex items-center gap-2">
                        <Building2 className="w-5 h-5" />
                        {industry.name}
                      </CardTitle>
                      {industry.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {industry.description}
                        </p>
                      )}
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
                            <Users className="w-4 h-4" />
                            <span className="text-lg font-bold">{industry.shopsCount}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">Shops</p>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 text-purple-600 mb-1">
                            <TrendingUp className="w-4 h-4" />
                            <span className="text-lg font-bold">{industry.productTypesCount}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">Product Types</p>
                        </div>
                      </div>
                      
                      <Button 
                        size="sm" 
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        onClick={() => handleViewDetails(industry)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
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

      {/* Industry Detail Modal */}
      <IndustryDetailModal 
        industry={selectedIndustry}
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
      />
    </div>
  );
};

export default Industries;
