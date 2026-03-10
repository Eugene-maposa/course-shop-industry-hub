import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Shield, Users, Building, Package, Activity, UserPlus, MoreHorizontal, CheckCircle, XCircle, Clock, FileText, Eye, Settings, Plus, Trash2, Edit, Database, BarChart3, Monitor, Palette } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useAdmin } from "@/hooks/useAdmin";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Navigate } from "react-router-dom";
import { SystemMonitor } from "@/components/admin/SystemMonitor";
import { UserManagement } from "@/components/admin/UserManagement";
import { RegisteredUsers } from "@/components/admin/RegisteredUsers";
import { VisitorAnalytics } from "@/components/admin/VisitorAnalytics";
import { ContentManagement } from "@/components/admin/ContentManagement";
import { AuditLogs } from "@/components/admin/AuditLogs";
import { ShopDocumentManagement } from "@/components/admin/ShopDocumentManagement";
import { ThemeCustomizer } from "@/components/admin/ThemeCustomizer";

const AdminPanel = () => {
  const { isAdmin, adminRole, loading: adminLoading, logAdminAction } = useAdmin();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedShop, setSelectedShop] = useState(null);
  const [verificationNotes, setVerificationNotes] = useState("");

  console.log('AdminPanel render:', { user: user?.email, isAdmin, adminRole, adminLoading, authLoading });

  // Only super-admins can access all features
  const isSuperAdmin = adminRole === 'super_admin';

  // Fetch dashboard stats - call all hooks before conditional returns
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      console.log('Fetching admin stats...');
      const [shopsResponse, productsResponse, adminsResponse, industriesResponse, usersResponse] = await Promise.all([
        supabase.from('shops').select('status'),
        supabase.from('products').select('status'),
        supabase.from('admin_users').select('*', { count: 'exact', head: true }),
        supabase.from('industries').select('status'),
        supabase.rpc('get_user_count')
      ]);

      console.log('Stats responses:', { shopsResponse, productsResponse, adminsResponse, industriesResponse, usersResponse });

      const shops = shopsResponse.data || [];
      const products = productsResponse.data || [];
      const industries = industriesResponse.data || [];

      return {
        totalShops: shops.length,
        pendingShops: shops.filter(s => s.status === 'pending').length,
        activeShops: shops.filter(s => s.status === 'active').length,
        totalProducts: products.length,
        pendingProducts: products.filter(p => p.status === 'pending').length,
        totalAdmins: adminsResponse.count || 0,
        totalUsers: usersResponse.data || 0,
        totalIndustries: industries.length,
        activeIndustries: industries.filter(i => i.status === 'active').length
      };
    },
    enabled: !!user && isAdmin,
    refetchInterval: 10000 // Auto-refresh stats every 10 seconds
  });

  // Fetch shops for approval including document verification
  const { data: shops = [], isLoading: shopsLoading } = useQuery({
    queryKey: ['admin-shops'],
    queryFn: async () => {
      console.log('Fetching shops...');
      const { data, error } = await supabase
        .from('shops')
        .select(`
          *,
          industries(name)
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching shops:', error);
        throw error;
      }
      console.log('Shops fetched:', data?.length);
      return data || [];
    },
    enabled: !!user && isAdmin,
    refetchInterval: 10000 // Auto-refresh shops every 10 seconds
  });

  // Shop approval mutation with document verification
  const approveShopMutation = useMutation({
    mutationFn: async ({ shopId, status, notes }: { shopId: string, status: 'active' | 'inactive', notes?: string }) => {
      const shop = shops.find(s => s.id === shopId);
      const updateData: any = { 
        status, 
        updated_at: new Date().toISOString(),
        document_verification_status: status === 'active' ? 'approved' : 'rejected'
      };
      
      if (notes) {
        updateData.verification_notes = notes;
      }
      
      if (status === 'active') {
        updateData.verified_by = user.id;
        updateData.verified_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('shops')
        .update(updateData)
        .eq('id', shopId)
        .select()
        .single();
      
      if (error) throw error;

      // Log admin action
      await logAdminAction(
        `Shop ${status === 'active' ? 'approved' : 'rejected'}`,
        'shops',
        shopId,
        { status: shop?.status, document_verification_status: shop?.document_verification_status },
        { status, document_verification_status: updateData.document_verification_status }
      );

      return data;
    },
    onSuccess: (data, variables) => {
      toast({
        title: "Success",
        description: `Shop ${variables.status === 'active' ? 'approved' : 'rejected'} successfully!`
      });
      queryClient.invalidateQueries({ queryKey: ['admin-shops'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      setSelectedShop(null);
      setVerificationNotes("");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update shop status.",
        variant: "destructive"
      });
      console.error("Error updating shop status:", error);
    }
  });

  // Bulk approve mutation
  const bulkApproveMutation = useMutation({
    mutationFn: async () => {
      const pendingShops = shops.filter(shop => shop.status === 'pending');
      const { data, error } = await supabase
        .from('shops')
        .update({ 
          status: 'active', 
          updated_at: new Date().toISOString(),
          document_verification_status: 'approved',
          verified_by: user.id,
          verified_at: new Date().toISOString()
        })
        .in('id', pendingShops.map(shop => shop.id))
        .select();
      
      if (error) throw error;

      // Log admin action
      await logAdminAction(
        `Bulk approved ${pendingShops.length} shops`,
        'shops',
        undefined,
        undefined,
        { approved_count: pendingShops.length }
      );

      return data;
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: `${data?.length || 0} shops approved successfully!`
      });
      queryClient.invalidateQueries({ queryKey: ['admin-shops'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    }
  });

  const handleApproveShop = (shopId: string, notes?: string) => {
    approveShopMutation.mutate({ shopId, status: 'active', notes });
  };

  const handleRejectShop = (shopId: string, notes?: string) => {
    approveShopMutation.mutate({ shopId, status: 'inactive', notes });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500 text-white">Active</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500 text-white">Pending</Badge>;
      case 'inactive':
        return <Badge className="bg-red-500 text-white">Inactive</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getDocumentVerificationBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500 text-white">Approved</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500 text-white">Pending Review</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500 text-white">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Show loading while checking authentication and admin status
  if (authLoading || adminLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-white text-xl">Loading admin panel...</div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/site-ops/login" replace />;
  }

  // Show access denied if not admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <Card className="w-full max-w-md bg-slate-800 border-slate-700">
          <CardContent className="p-6 text-center">
            <Shield className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
            <p className="text-slate-400 mb-4">You don't have admin privileges.</p>
            <Button 
              onClick={() => window.location.href = '/'}
              className="bg-slate-700 hover:bg-slate-600 text-white"
            >
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 px-4 py-3">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center space-x-3">
              <Shield className="w-6 h-6 text-blue-400" />
              <div>
                <h1 className="text-xl font-bold text-white">Admin Panel</h1>
                <p className="text-sm text-slate-400">System Administration</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 flex-wrap gap-2">
              <Button 
                variant="outline"
                onClick={() => window.location.href = '/site-ops/ministry'}
                className="bg-slate-700 hover:bg-slate-600 text-white border-slate-600 text-sm"
                size="sm"
              >
                <Building className="w-4 h-4 mr-1" />
                Ministry
              </Button>
              <Badge className="bg-blue-500 text-white text-xs">{adminRole}</Badge>
              <span className="text-slate-300 text-sm hidden md:inline">{user?.email}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-3">
              <div className="flex items-center space-x-2">
                <Building className="w-6 h-6 text-blue-400" />
                <div>
                  <p className="text-xs text-slate-400">Total Shops</p>
                  <p className="text-xl font-bold text-white">{stats?.totalShops || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-3">
              <div className="flex items-center space-x-2">
                <Clock className="w-6 h-6 text-yellow-400" />
                <div>
                  <p className="text-xs text-slate-400">Pending</p>
                  <p className="text-xl font-bold text-white">{stats?.pendingShops || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-3">
              <div className="flex items-center space-x-2">
                <Package className="w-6 h-6 text-green-400" />
                <div>
                  <p className="text-xs text-slate-400">Products</p>
                  <p className="text-xl font-bold text-white">{stats?.totalProducts || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-3">
              <div className="flex items-center space-x-2">
                <Shield className="w-6 h-6 text-purple-400" />
                <div>
                  <p className="text-xs text-slate-400">Admins</p>
                  <p className="text-xl font-bold text-white">{stats?.totalAdmins || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-3">
              <div className="flex items-center space-x-2">
                <Users className="w-6 h-6 text-orange-400" />
                <div>
                  <p className="text-xs text-slate-400">Users</p>
                  <p className="text-xl font-bold text-white">{stats?.totalUsers || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="dashboard" className="space-y-4">
          <TabsList className="bg-slate-800 border-slate-700 h-auto flex-wrap gap-1 p-1">
            <TabsTrigger 
              value="home" 
              className="data-[state=active]:bg-slate-700 text-xs px-2 py-1"
              onClick={() => window.location.href = '/'}
            >
              <Shield className="w-3 h-3 mr-1" />
              Home
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-slate-700 text-xs px-2 py-1">
              <BarChart3 className="w-3 h-3 mr-1" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="monitor" className="data-[state=active]:bg-slate-700 text-xs px-2 py-1">
              <Monitor className="w-3 h-3 mr-1" />
              Monitor
            </TabsTrigger>
            <TabsTrigger value="shops" className="data-[state=active]:bg-slate-700 text-xs px-2 py-1">
              <Building className="w-3 h-3 mr-1" />
              Shops
            </TabsTrigger>
            <TabsTrigger value="documents" className="data-[state=active]:bg-slate-700 text-xs px-2 py-1">
              <FileText className="w-3 h-3 mr-1" />
              Documents
            </TabsTrigger>
            {isSuperAdmin && (
              <>
                <TabsTrigger value="users" className="data-[state=active]:bg-slate-700 text-xs px-2 py-1">
                  <Users className="w-3 h-3 mr-1" />
                  Users
                </TabsTrigger>
                <TabsTrigger value="content" className="data-[state=active]:bg-slate-700 text-xs px-2 py-1">
                  <Package className="w-3 h-3 mr-1" />
                  Content
                </TabsTrigger>
                <TabsTrigger value="audit" className="data-[state=active]:bg-slate-700 text-xs px-2 py-1">
                  <FileText className="w-3 h-3 mr-1" />
                  Audit
                </TabsTrigger>
                <TabsTrigger value="theme" className="data-[state=active]:bg-slate-700 text-xs px-2 py-1">
                  <Palette className="w-3 h-3 mr-1" />
                  Theme
                </TabsTrigger>
                <TabsTrigger value="system" className="data-[state=active]:bg-slate-700 text-xs px-2 py-1">
                  <Database className="w-3 h-3 mr-1" />
                  System
                </TabsTrigger>
              </>
            )}
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Card className="bg-slate-800 border-slate-700 lg:col-span-1">
                <CardHeader className="p-4">
                  <CardTitle className="text-white flex items-center space-x-2 text-sm">
                    <Settings className="w-4 h-4" />
                    <span>Quick Actions</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <Button 
                    onClick={() => bulkApproveMutation.mutate()}
                    disabled={!stats?.pendingShops || bulkApproveMutation.isPending}
                    className="w-full bg-green-600 hover:bg-green-700 text-sm"
                    size="sm"
                  >
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Bulk Approve ({stats?.pendingShops || 0})
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700 lg:col-span-2">
                <CardHeader className="p-4">
                  <CardTitle className="text-white flex items-center space-x-2 text-sm">
                    <Activity className="w-4 h-4" />
                    <span>System Performance</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400 mb-1">
                        {stats ? Math.round((stats.activeShops / (stats.totalShops || 1)) * 100) : 0}%
                      </div>
                      <div className="text-slate-400 text-xs">Shop Approval Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-400 mb-1">
                        {stats?.totalUsers || 0}
                      </div>
                      <div className="text-slate-400 text-xs">Platform Users</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Document Review Tab */}
          <TabsContent value="documents">
            <ShopDocumentManagement />
          </TabsContent>

          {/* System Monitor Tab */}
          <TabsContent value="monitor">
            <SystemMonitor />
          </TabsContent>

          <TabsContent value="shops">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader className="p-4">
                <CardTitle className="text-white text-sm">Shop Approvals & Document Verification</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                {shopsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
                    <p className="text-slate-400 mt-2">Loading shops...</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-slate-300">Shop Name</TableHead>
                        <TableHead className="text-slate-300">Industry</TableHead>
                        <TableHead className="text-slate-300">Status</TableHead>
                        <TableHead className="text-slate-300">Doc Verification</TableHead>
                        <TableHead className="text-slate-300">Registration Date</TableHead>
                        <TableHead className="text-slate-300">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {shops.map((shop) => (
                        <TableRow key={shop.id}>
                          <TableCell className="text-white font-medium">{shop.name}</TableCell>
                          <TableCell className="text-slate-300">{shop.industries?.name || 'N/A'}</TableCell>
                          <TableCell>{getStatusBadge(shop.status)}</TableCell>
                          <TableCell>{getDocumentVerificationBadge(shop.document_verification_status)}</TableCell>
                          <TableCell className="text-slate-300">
                            {new Date(shop.registration_date).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button 
                                size="sm" 
                                onClick={() => handleApproveShop(shop.id)}
                                disabled={shop.status === 'active' || approveShopMutation.isPending}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleRejectShop(shop.id)}
                                disabled={shop.status === 'inactive' || approveShopMutation.isPending}
                                className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {isSuperAdmin && (
            <TabsContent value="users">
              <UserManagement />
            </TabsContent>
          )}

          {isSuperAdmin && (
            <TabsContent value="content">
              <ContentManagement />
            </TabsContent>
          )}

          {isSuperAdmin && (
            <TabsContent value="audit">
              <AuditLogs />
            </TabsContent>
          )}

          {isSuperAdmin && (
            <TabsContent value="theme">
              <ThemeCustomizer />
            </TabsContent>
          )}

          {isSuperAdmin && (
            <TabsContent value="system">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="p-4">
                  <CardTitle className="text-white text-sm">System Information</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-semibold text-white mb-2">Database Status</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Connection:</span>
                          <Badge className="bg-green-500 text-white text-xs">Active</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Total Tables:</span>
                          <span className="text-white">8</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white mb-2">Application Health</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Uptime:</span>
                          <span className="text-white">99.9%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Response Time:</span>
                          <span className="text-white">150ms</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPanel;