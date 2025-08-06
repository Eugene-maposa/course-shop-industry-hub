import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Shield, Users, Building, Package, Activity, UserPlus, MoreHorizontal, CheckCircle, XCircle, Clock, FileText, Eye, Settings, Plus, Trash2, Edit, Database, BarChart3 } from "lucide-react";
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

const AdminPanel = () => {
  const { isAdmin, adminRole, loading: adminLoading, logAdminAction } = useAdmin();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedShop, setSelectedShop] = useState(null);
  const [verificationNotes, setVerificationNotes] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserRole, setNewUserRole] = useState("admin");
  const [newIndustryName, setNewIndustryName] = useState("");
  const [newIndustryCode, setNewIndustryCode] = useState("");
  const [newIndustryDescription, setNewIndustryDescription] = useState("");
  const [editingIndustry, setEditingIndustry] = useState(null);

  console.log('AdminPanel render:', { user: user?.email, isAdmin, adminRole, adminLoading, authLoading });

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
    return <Navigate to="/admin/login" replace />;
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

  // Only super-admins can access all features
  const isSuperAdmin = adminRole === 'super_admin';

  // Fetch dashboard stats
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
    enabled: !!user && isAdmin
  });

  // Fetch admin users (super-admin only)
  const { data: adminUsers = [], isLoading: adminUsersLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user && isSuperAdmin
  });

  // Fetch industries for management
  const { data: industries = [], isLoading: industriesLoading } = useQuery({
    queryKey: ['admin-industries'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('industries')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user && isSuperAdmin
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
    enabled: !!user && isAdmin
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

  // User management mutations (super-admin only)
  const createAdminMutation = useMutation({
    mutationFn: async ({ email, role }: { email: string, role: string }) => {
      // Then add to admin_users table
      const { data, error } = await supabase
        .from('admin_users')
        .insert({
          user_id: email, // Temporary - in real app would create auth user first
          role: role as "super_admin" | "admin" | "moderator",
          email: email
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Admin user created successfully!"
      });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      setNewUserEmail("");
      setNewUserRole("admin");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create admin user.",
        variant: "destructive"
      });
      console.error("Error creating admin user:", error);
    }
  });

  const deactivateAdminMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { data, error } = await supabase
        .from('admin_users')
        .update({ is_active: false })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Admin user deactivated successfully!"
      });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    }
  });

  // Industry management mutations (super-admin only)
  const createIndustryMutation = useMutation({
    mutationFn: async (industryData: { name: string, code: string, description: string }) => {
      const { data, error } = await supabase
        .from('industries')
        .insert(industryData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Industry created successfully!"
      });
      queryClient.invalidateQueries({ queryKey: ['admin-industries'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      setNewIndustryName("");
      setNewIndustryCode("");
      setNewIndustryDescription("");
    }
  });

  const updateIndustryMutation = useMutation({
    mutationFn: async ({ id, ...updateData }: any) => {
      const { data, error } = await supabase
        .from('industries')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Industry updated successfully!"
      });
      queryClient.invalidateQueries({ queryKey: ['admin-industries'] });
      setEditingIndustry(null);
    }
  });

  const deleteIndustryMutation = useMutation({
    mutationFn: async (industryId: string) => {
      const { error } = await supabase
        .from('industries')
        .delete()
        .eq('id', industryId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Industry deleted successfully!"
      });
      queryClient.invalidateQueries({ queryKey: ['admin-industries'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="w-8 h-8 text-blue-400" />
              <div>
                <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
                <p className="text-slate-400">System Administration Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className="bg-blue-500 text-white">{adminRole}</Badge>
              <span className="text-slate-300">{user?.email}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Building className="w-8 h-8 text-blue-400" />
                <div>
                  <p className="text-slate-400">Total Shops</p>
                  <p className="text-2xl font-bold text-white">{stats?.totalShops || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Clock className="w-8 h-8 text-yellow-400" />
                <div>
                  <p className="text-slate-400">Pending Shops</p>
                  <p className="text-2xl font-bold text-white">{stats?.pendingShops || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Package className="w-8 h-8 text-green-400" />
                <div>
                  <p className="text-slate-400">Total Products</p>
                  <p className="text-2xl font-bold text-white">{stats?.totalProducts || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Shield className="w-8 h-8 text-purple-400" />
                <div>
                  <p className="text-slate-400">Admin Users</p>
                  <p className="text-2xl font-bold text-white">{stats?.totalAdmins || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Users className="w-8 h-8 text-indigo-400" />
                <div>
                  <p className="text-slate-400">Total Users</p>
                  <p className="text-2xl font-bold text-white">{stats?.totalUsers || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        {(stats?.pendingShops || 0) > 0 && (
          <Card className="bg-slate-800 border-slate-700 mb-8">
            <CardHeader>
              <CardTitle className="text-white">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button className="bg-green-600 hover:bg-green-700">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve All Pending Shops ({stats?.pendingShops || 0})
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-slate-800 border-slate-700">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-white">Approve All Pending Shops</AlertDialogTitle>
                    <AlertDialogDescription className="text-slate-400">
                      Are you sure you want to approve all {stats?.pendingShops || 0} pending shops? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="bg-slate-700 text-white border-slate-600">Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={() => bulkApproveMutation.mutate()}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Approve All
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        )}

        {/* Super Admin Features */}
        {isSuperAdmin ? (
          <Tabs defaultValue="shops" className="space-y-6">
            <TabsList className="bg-slate-800 border-slate-700">
              <TabsTrigger value="shops" className="data-[state=active]:bg-slate-700">
                <Building className="w-4 h-4 mr-2" />
                Shops Management
              </TabsTrigger>
              <TabsTrigger value="users" className="data-[state=active]:bg-slate-700">
                <Users className="w-4 h-4 mr-2" />
                User Management
              </TabsTrigger>
              <TabsTrigger value="industries" className="data-[state=active]:bg-slate-700">
                <Package className="w-4 h-4 mr-2" />
                Industries
              </TabsTrigger>
              <TabsTrigger value="system" className="data-[state=active]:bg-slate-700">
                <Database className="w-4 h-4 mr-2" />
                System Overview
              </TabsTrigger>
            </TabsList>

            <TabsContent value="shops">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Shops Management & Document Verification</CardTitle>
                </CardHeader>
                <CardContent>
                  {shopsLoading ? (
                    <div className="text-slate-400 text-center py-8">Loading shops...</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-slate-700">
                            <TableHead className="text-slate-300">Name</TableHead>
                            <TableHead className="text-slate-300">Industry</TableHead>
                            <TableHead className="text-slate-300">Status</TableHead>
                            <TableHead className="text-slate-300">Documents</TableHead>
                            <TableHead className="text-slate-300">Created</TableHead>
                            <TableHead className="text-slate-300">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {shops.map((shop) => (
                            <TableRow key={shop.id} className="border-slate-700">
                              <TableCell className="text-white font-medium">{shop.name}</TableCell>
                              <TableCell className="text-slate-300">{shop.industries?.name || 'N/A'}</TableCell>
                              <TableCell>{getStatusBadge(shop.status)}</TableCell>
                              <TableCell>{getDocumentVerificationBadge(shop.document_verification_status || 'pending')}</TableCell>
                              <TableCell className="text-slate-300">
                                {new Date(shop.created_at).toLocaleDateString()}
                              </TableCell>
                              <TableCell>
                                <div className="flex space-x-2">
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => setSelectedShop(shop)}
                                        className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
                                      >
                                        <Eye className="w-4 h-4" />
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent className="bg-slate-800 border-slate-700 max-w-4xl">
                                      <DialogHeader>
                                        <DialogTitle className="text-white">Shop Documents - {shop.name}</DialogTitle>
                                      </DialogHeader>
                                      <div className="space-y-4">
                                        {shop.documents && Object.keys(shop.documents).length > 0 ? (
                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {Object.entries(shop.documents).map(([docType, url]) => (
                                              <Card key={docType} className="bg-slate-700 border-slate-600">
                                                <CardContent className="p-4">
                                                  <div className="flex items-center justify-between mb-2">
                                                    <span className="text-white font-medium capitalize">
                                                      {docType.replace('_', ' ')}
                                                    </span>
                                                    <FileText className="w-4 h-4 text-blue-400" />
                                                  </div>
                                                  <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => window.open(url as string, '_blank')}
                                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
                                                  >
                                                    View Document
                                                  </Button>
                                                </CardContent>
                                              </Card>
                                            ))}
                                          </div>
                                        ) : (
                                          <div className="text-slate-400 text-center py-8">
                                            No documents uploaded for this shop.
                                          </div>
                                        )}
                                        
                                        <div className="border-t border-slate-600 pt-4">
                                          <Label htmlFor="verification-notes" className="text-white">
                                            Verification Notes (Optional)
                                          </Label>
                                          <Textarea
                                            id="verification-notes"
                                            value={verificationNotes}
                                            onChange={(e) => setVerificationNotes(e.target.value)}
                                            placeholder="Add notes about the verification process..."
                                            className="mt-2 bg-slate-700 border-slate-600 text-white"
                                          />
                                        </div>

                                        <div className="flex space-x-2">
                                          <Button
                                            onClick={() => handleApproveShop(shop.id, verificationNotes)}
                                            disabled={approveShopMutation.isPending}
                                            className="flex-1 bg-green-600 hover:bg-green-700"
                                          >
                                            <CheckCircle className="w-4 h-4 mr-2" />
                                            Approve Shop
                                          </Button>
                                          <Button
                                            onClick={() => handleRejectShop(shop.id, verificationNotes)}
                                            disabled={approveShopMutation.isPending}
                                            variant="destructive"
                                            className="flex-1"
                                          >
                                            <XCircle className="w-4 h-4 mr-2" />
                                            Reject Shop
                                          </Button>
                                        </div>
                                      </div>
                                    </DialogContent>
                                  </Dialog>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="users">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white">Admin Users Management</CardTitle>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="bg-blue-600 hover:bg-blue-700">
                          <UserPlus className="w-4 h-4 mr-2" />
                          Add Admin User
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-slate-800 border-slate-700">
                        <DialogHeader>
                          <DialogTitle className="text-white">Create New Admin User</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="email" className="text-white">Email</Label>
                            <Input
                              id="email"
                              type="email"
                              value={newUserEmail}
                              onChange={(e) => setNewUserEmail(e.target.value)}
                              className="bg-slate-700 border-slate-600 text-white"
                              placeholder="admin@example.com"
                            />
                          </div>
                          <div>
                            <Label htmlFor="role" className="text-white">Role</Label>
                            <Select value={newUserRole} onValueChange={setNewUserRole}>
                              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-slate-700 border-slate-600">
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="moderator">Moderator</SelectItem>
                                <SelectItem value="super_admin">Super Admin</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <Button 
                            onClick={() => createAdminMutation.mutate({ email: newUserEmail, role: newUserRole })}
                            disabled={!newUserEmail || createAdminMutation.isPending}
                            className="w-full bg-blue-600 hover:bg-blue-700"
                          >
                            {createAdminMutation.isPending ? "Creating..." : "Create Admin User"}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  {adminUsersLoading ? (
                    <div className="text-slate-400 text-center py-8">Loading admin users...</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-slate-700">
                            <TableHead className="text-slate-300">Email</TableHead>
                            <TableHead className="text-slate-300">Role</TableHead>
                            <TableHead className="text-slate-300">Status</TableHead>
                            <TableHead className="text-slate-300">Created</TableHead>
                            <TableHead className="text-slate-300">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {adminUsers.map((admin) => (
                            <TableRow key={admin.id} className="border-slate-700">
                              <TableCell className="text-white font-medium">{admin.email}</TableCell>
                              <TableCell>
                                <Badge className={admin.role === 'super_admin' ? 'bg-red-500' : admin.role === 'admin' ? 'bg-blue-500' : 'bg-green-500'}>
                                  {admin.role}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge className={admin.is_active ? 'bg-green-500' : 'bg-red-500'}>
                                  {admin.is_active ? 'Active' : 'Inactive'}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-slate-300">
                                {new Date(admin.created_at).toLocaleDateString()}
                              </TableCell>
                              <TableCell>
                                {admin.user_id !== user?.id && admin.is_active && (
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => deactivateAdminMutation.mutate(admin.user_id)}
                                    disabled={deactivateAdminMutation.isPending}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="industries">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white">Industries Management</CardTitle>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="bg-green-600 hover:bg-green-700">
                          <Plus className="w-4 h-4 mr-2" />
                          Add Industry
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-slate-800 border-slate-700">
                        <DialogHeader>
                          <DialogTitle className="text-white">Create New Industry</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="name" className="text-white">Industry Name</Label>
                            <Input
                              id="name"
                              value={newIndustryName}
                              onChange={(e) => setNewIndustryName(e.target.value)}
                              className="bg-slate-700 border-slate-600 text-white"
                              placeholder="Technology"
                            />
                          </div>
                          <div>
                            <Label htmlFor="code" className="text-white">Industry Code</Label>
                            <Input
                              id="code"
                              value={newIndustryCode}
                              onChange={(e) => setNewIndustryCode(e.target.value)}
                              className="bg-slate-700 border-slate-600 text-white"
                              placeholder="TECH"
                            />
                          </div>
                          <div>
                            <Label htmlFor="description" className="text-white">Description</Label>
                            <Textarea
                              id="description"
                              value={newIndustryDescription}
                              onChange={(e) => setNewIndustryDescription(e.target.value)}
                              className="bg-slate-700 border-slate-600 text-white"
                              placeholder="Industry description..."
                            />
                          </div>
                          <Button 
                            onClick={() => createIndustryMutation.mutate({ 
                              name: newIndustryName, 
                              code: newIndustryCode, 
                              description: newIndustryDescription 
                            })}
                            disabled={!newIndustryName || !newIndustryCode || createIndustryMutation.isPending}
                            className="w-full bg-green-600 hover:bg-green-700"
                          >
                            {createIndustryMutation.isPending ? "Creating..." : "Create Industry"}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  {industriesLoading ? (
                    <div className="text-slate-400 text-center py-8">Loading industries...</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-slate-700">
                            <TableHead className="text-slate-300">Name</TableHead>
                            <TableHead className="text-slate-300">Code</TableHead>
                            <TableHead className="text-slate-300">Status</TableHead>
                            <TableHead className="text-slate-300">Created</TableHead>
                            <TableHead className="text-slate-300">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {industries.map((industry) => (
                            <TableRow key={industry.id} className="border-slate-700">
                              <TableCell className="text-white font-medium">{industry.name}</TableCell>
                              <TableCell className="text-slate-300">{industry.code}</TableCell>
                              <TableCell>{getStatusBadge(industry.status)}</TableCell>
                              <TableCell className="text-slate-300">
                                {new Date(industry.created_at).toLocaleDateString()}
                              </TableCell>
                              <TableCell>
                                <div className="flex space-x-2">
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => setEditingIndustry(industry)}
                                        className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
                                      >
                                        <Edit className="w-4 h-4" />
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent className="bg-slate-800 border-slate-700">
                                      <DialogHeader>
                                        <DialogTitle className="text-white">Edit Industry</DialogTitle>
                                      </DialogHeader>
                                      {editingIndustry && (
                                        <div className="space-y-4">
                                          <div>
                                            <Label className="text-white">Industry Name</Label>
                                            <Input
                                              value={editingIndustry.name}
                                              onChange={(e) => setEditingIndustry({...editingIndustry, name: e.target.value})}
                                              className="bg-slate-700 border-slate-600 text-white"
                                            />
                                          </div>
                                          <div>
                                            <Label className="text-white">Status</Label>
                                            <Select 
                                              value={editingIndustry.status} 
                                              onValueChange={(value) => setEditingIndustry({...editingIndustry, status: value})}
                                            >
                                              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                                                <SelectValue />
                                              </SelectTrigger>
                                              <SelectContent className="bg-slate-700 border-slate-600">
                                                <SelectItem value="active">Active</SelectItem>
                                                <SelectItem value="inactive">Inactive</SelectItem>
                                              </SelectContent>
                                            </Select>
                                          </div>
                                          <Button 
                                            onClick={() => updateIndustryMutation.mutate(editingIndustry)}
                                            disabled={updateIndustryMutation.isPending}
                                            className="w-full bg-blue-600 hover:bg-blue-700"
                                          >
                                            {updateIndustryMutation.isPending ? "Updating..." : "Update Industry"}
                                          </Button>
                                        </div>
                                      )}
                                    </DialogContent>
                                  </Dialog>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button
                                        size="sm"
                                        variant="destructive"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent className="bg-slate-800 border-slate-700">
                                      <AlertDialogHeader>
                                        <AlertDialogTitle className="text-white">Delete Industry</AlertDialogTitle>
                                        <AlertDialogDescription className="text-slate-400">
                                          Are you sure you want to delete "{industry.name}"? This action cannot be undone.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel className="bg-slate-700 text-white border-slate-600">Cancel</AlertDialogCancel>
                                        <AlertDialogAction 
                                          onClick={() => deleteIndustryMutation.mutate(industry.id)}
                                          className="bg-red-600 hover:bg-red-700"
                                        >
                                          Delete
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="system">
              <div className="grid gap-6">
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <BarChart3 className="w-5 h-5 mr-2" />
                      System Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="bg-slate-700 p-4 rounded-lg">
                        <h4 className="text-white font-medium mb-2">Platform Statistics</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between text-slate-300">
                            <span>Active Shops:</span>
                            <span className="text-green-400">{stats?.activeShops || 0}</span>
                          </div>
                          <div className="flex justify-between text-slate-300">
                            <span>Pending Shops:</span>
                            <span className="text-yellow-400">{stats?.pendingShops || 0}</span>
                          </div>
                          <div className="flex justify-between text-slate-300">
                            <span>Active Industries:</span>
                            <span className="text-blue-400">{stats?.activeIndustries || 0}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-slate-700 p-4 rounded-lg">
                        <h4 className="text-white font-medium mb-2">Content Statistics</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between text-slate-300">
                            <span>Total Products:</span>
                            <span className="text-purple-400">{stats?.totalProducts || 0}</span>
                          </div>
                          <div className="flex justify-between text-slate-300">
                            <span>Pending Products:</span>
                            <span className="text-orange-400">{stats?.pendingProducts || 0}</span>
                          </div>
                          <div className="flex justify-between text-slate-300">
                            <span>Total Industries:</span>
                            <span className="text-indigo-400">{stats?.totalIndustries || 0}</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-slate-700 p-4 rounded-lg">
                        <h4 className="text-white font-medium mb-2">User Management</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between text-slate-300">
                            <span>Total Users:</span>
                            <span className="text-cyan-400">{stats?.totalUsers || 0}</span>
                          </div>
                          <div className="flex justify-between text-slate-300">
                            <span>Admin Users:</span>
                            <span className="text-red-400">{stats?.totalAdmins || 0}</span>
                          </div>
                          <div className="flex justify-between text-slate-300">
                            <span>Your Role:</span>
                            <span className="text-green-400 capitalize">{adminRole}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          // Regular admin view (shops management only)
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Shops Management & Document Verification</CardTitle>
            </CardHeader>
            <CardContent>
              {shopsLoading ? (
                <div className="text-slate-400 text-center py-8">Loading shops...</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-700">
                        <TableHead className="text-slate-300">Name</TableHead>
                        <TableHead className="text-slate-300">Industry</TableHead>
                        <TableHead className="text-slate-300">Status</TableHead>
                        <TableHead className="text-slate-300">Documents</TableHead>
                        <TableHead className="text-slate-300">Created</TableHead>
                        <TableHead className="text-slate-300">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {shops.map((shop) => (
                        <TableRow key={shop.id} className="border-slate-700">
                          <TableCell className="text-white font-medium">{shop.name}</TableCell>
                          <TableCell className="text-slate-300">{shop.industries?.name || 'N/A'}</TableCell>
                          <TableCell>{getStatusBadge(shop.status)}</TableCell>
                          <TableCell>{getDocumentVerificationBadge(shop.document_verification_status || 'pending')}</TableCell>
                          <TableCell className="text-slate-300">
                            {new Date(shop.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setSelectedShop(shop)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="bg-slate-800 border-slate-700 max-w-4xl">
                                  <DialogHeader>
                                    <DialogTitle className="text-white">Shop Documents - {shop.name}</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    {shop.documents && Object.keys(shop.documents).length > 0 ? (
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {Object.entries(shop.documents).map(([docType, url]) => (
                                          <Card key={docType} className="bg-slate-700 border-slate-600">
                                            <CardContent className="p-4">
                                              <div className="flex items-center justify-between mb-2">
                                                <span className="text-white font-medium capitalize">
                                                  {docType.replace('_', ' ')}
                                                </span>
                                                <FileText className="w-4 h-4 text-blue-400" />
                                              </div>
                                              <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => window.open(url as string, '_blank')}
                                                className="w-full bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
                                              >
                                                View Document
                                              </Button>
                                            </CardContent>
                                          </Card>
                                        ))}
                                      </div>
                                    ) : (
                                      <div className="text-slate-400 text-center py-8">
                                        No documents uploaded for this shop.
                                      </div>
                                    )}
                                    
                                    <div className="border-t border-slate-600 pt-4">
                                      <Label htmlFor="verification-notes" className="text-white">
                                        Verification Notes (Optional)
                                      </Label>
                                      <Textarea
                                        id="verification-notes"
                                        value={verificationNotes}
                                        onChange={(e) => setVerificationNotes(e.target.value)}
                                        placeholder="Add notes about the verification process..."
                                        className="mt-2 bg-slate-700 border-slate-600 text-white"
                                      />
                                    </div>

                                    <div className="flex space-x-2">
                                      <Button
                                        onClick={() => handleApproveShop(shop.id, verificationNotes)}
                                        disabled={approveShopMutation.isPending}
                                        className="flex-1 bg-green-600 hover:bg-green-700"
                                      >
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        Approve Shop
                                      </Button>
                                      <Button
                                        onClick={() => handleRejectShop(shop.id, verificationNotes)}
                                        disabled={approveShopMutation.isPending}
                                        variant="destructive"
                                        className="flex-1"
                                      >
                                        <XCircle className="w-4 h-4 mr-2" />
                                        Reject Shop
                                      </Button>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;