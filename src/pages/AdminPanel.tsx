
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Shield, Users, Building, Package, Activity, UserPlus, MoreHorizontal, CheckCircle, XCircle, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { useAdmin } from "@/hooks/useAdmin";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Navigate } from "react-router-dom";

const AdminPanel = () => {
  const { isAdmin, adminRole, loading: adminLoading, logAdminAction } = useAdmin();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminRole, setNewAdminRole] = useState<'admin' | 'moderator'>('admin');

  // Redirect if not admin
  if (!adminLoading && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  if (adminLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-white text-xl">Loading admin panel...</div>
      </div>
    );
  }

  // Fetch dashboard stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [shopsResponse, productsResponse, usersResponse] = await Promise.all([
        supabase.from('shops').select('status').then(res => res.data || []),
        supabase.from('products').select('status').then(res => res.data || []),
        supabase.rpc('get_user_count').then(res => res.data || 0)
      ]);

      const shops = shopsResponse;
      const products = productsResponse;
      const totalUsers = usersResponse;

      return {
        totalShops: shops.length,
        pendingShops: shops.filter(s => s.status === 'pending').length,
        activeShops: shops.filter(s => s.status === 'active').length,
        totalProducts: products.length,
        pendingProducts: products.filter(p => p.status === 'pending').length,
        totalUsers
      };
    }
  });

  // Fetch shops for approval
  const { data: shops = [], isLoading: shopsLoading } = useQuery({
    queryKey: ['admin-shops'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shops')
        .select(`
          *,
          industries(name)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  // Shop approval mutation
  const approveShopMutation = useMutation({
    mutationFn: async ({ shopId, status }: { shopId: string, status: 'active' | 'inactive' }) => {
      const shop = shops.find(s => s.id === shopId);
      const { data, error } = await supabase
        .from('shops')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', shopId)
        .select()
        .single();
      
      if (error) throw error;

      // Log admin action
      await logAdminAction(
        `Shop ${status === 'active' ? 'approved' : 'rejected'}`,
        'shops',
        shopId,
        { status: shop?.status },
        { status }
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
        .update({ status: 'active', updated_at: new Date().toISOString() })
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

  const handleApproveShop = (shopId: string) => {
    approveShopMutation.mutate({ shopId, status: 'active' });
  };

  const handleRejectShop = (shopId: string) => {
    approveShopMutation.mutate({ shopId, status: 'inactive' });
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
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
                <Users className="w-8 h-8 text-purple-400" />
                <div>
                  <p className="text-slate-400">Total Users</p>
                  <p className="text-2xl font-bold text-white">{stats?.totalUsers || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        {stats?.pendingShops > 0 && (
          <Card className="bg-slate-800 border-slate-700 mb-8">
            <CardHeader>
              <CardTitle className="text-white">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button className="bg-green-600 hover:bg-green-700">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve All Pending Shops ({stats.pendingShops})
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-slate-800 border-slate-700">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-white">Approve All Pending Shops</AlertDialogTitle>
                    <AlertDialogDescription className="text-slate-400">
                      Are you sure you want to approve all {stats.pendingShops} pending shops? This action cannot be undone.
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

        {/* Shops Management */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Shops Management</CardTitle>
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
                        <TableCell className="text-slate-300">
                          {new Date(shop.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {shop.status === 'pending' && (
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                onClick={() => handleApproveShop(shop.id)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleRejectShop(shop.id)}
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
                            </div>
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
      </div>
    </div>
  );
};

export default AdminPanel;
