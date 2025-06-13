
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Filter, MapPin, Phone, Mail, Globe, Building, CheckCircle, XCircle, Clock, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import Navbar from "@/components/Navbar";
import ShopRegistrationForm from "@/components/forms/ShopRegistrationForm";
import ShopContactModal from "@/components/ShopContactModal";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const Shops = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("browse");
  const [selectedShop, setSelectedShop] = useState(null);
  const [showContactModal, setShowContactModal] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check if user is admin (you can implement proper role checking later)
  const isAdmin = user?.email?.includes('admin') || false;

  // Fetch shops with related data
  const { data: shops = [], isLoading } = useQuery({
    queryKey: ['shops'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shops')
        .select(`
          *,
          industries(name, code)
        `)
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

  // Shop approval mutation
  const approveShopMutation = useMutation({
    mutationFn: async ({ shopId, status }: { shopId: string, status: 'active' | 'inactive' }) => {
      const { data, error } = await supabase
        .from('shops')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', shopId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      toast({
        title: "Success",
        description: `Shop ${variables.status === 'active' ? 'approved' : 'rejected'} successfully!`
      });
      queryClient.invalidateQueries({ queryKey: ['shops'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update shop status. Please try again.",
        variant: "destructive"
      });
      console.error("Error updating shop status:", error);
    }
  });

  // Bulk approve mutation
  const bulkApproveMutation = useMutation({
    mutationFn: async () => {
      const pendingShops = filteredShops.filter(shop => shop.status === 'pending');
      const { data, error } = await supabase
        .from('shops')
        .update({ status: 'active', updated_at: new Date().toISOString() })
        .in('id', pendingShops.map(shop => shop.id))
        .select();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: `${data?.length || 0} shops approved successfully!`
      });
      queryClient.invalidateQueries({ queryKey: ['shops'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to approve shops. Please try again.",
        variant: "destructive"
      });
      console.error("Error bulk approving shops:", error);
    }
  });

  const filteredShops = shops.filter(shop => {
    const matchesSearch = shop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         shop.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesIndustry = selectedIndustry === "all" || shop.industries?.name === selectedIndustry;
    const matchesStatus = statusFilter === "all" || shop.status === statusFilter;
    return matchesSearch && matchesIndustry && matchesStatus;
  });

  const pendingShopsCount = shops.filter(shop => shop.status === 'pending').length;
  const activeShopsCount = shops.filter(shop => shop.status === 'active').length;
  const inactiveShopsCount = shops.filter(shop => shop.status === 'inactive').length;

  const handleContact = (shop) => {
    setSelectedShop(shop);
    setShowContactModal(true);
  };

  const handleApproveShop = (shopId: string) => {
    approveShopMutation.mutate({ shopId, status: 'active' });
  };

  const handleRejectShop = (shopId: string) => {
    approveShopMutation.mutate({ shopId, status: 'inactive' });
  };

  const handleBulkApprove = () => {
    bulkApproveMutation.mutate();
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
            Shop Management
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Register new shops or browse existing ones
          </p>
        </div>

        {/* Admin Dashboard Stats */}
        {isAdmin && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-yellow-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Pending</p>
                    <p className="text-2xl font-bold text-yellow-600">{pendingShopsCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Active</p>
                    <p className="text-2xl font-bold text-green-600">{activeShopsCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <XCircle className="w-5 h-5 text-red-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Inactive</p>
                    <p className="text-2xl font-bold text-red-600">{inactiveShopsCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="text-2xl font-bold text-blue-600">{shops.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

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

                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full md:w-48 h-12">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button className="h-12 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    <Filter className="w-5 h-5 mr-2" />
                    Filter
                  </Button>
                </div>

                {/* Admin Bulk Actions */}
                {isAdmin && pendingShopsCount > 0 && (
                  <div className="flex gap-2 pt-4 border-t">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button className="bg-green-600 hover:bg-green-700">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Approve All Pending ({pendingShopsCount})
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Approve All Pending Shops</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to approve all {pendingShopsCount} pending shops? This will make them visible to all users.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handleBulkApprove}>
                            Approve All
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
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
                        <Badge variant="secondary" className={`text-xs text-white ${getStatusColor(shop.status)}`}>
                          {shop.status}
                        </Badge>
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
                        
                        {/* Admin approval buttons */}
                        {isAdmin && shop.status === 'pending' && (
                          <div className="flex gap-1">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                  <CheckCircle className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Approve Shop</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to approve "{shop.name}"? This will make it visible to all users.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleApproveShop(shop.id)}>
                                    Approve
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                            
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="destructive">
                                  <XCircle className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Reject Shop</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to reject "{shop.name}"? This action can be reversed later.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleRejectShop(shop.id)}>
                                    Reject
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        )}
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
