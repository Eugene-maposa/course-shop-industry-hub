
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Users, Shield, UserCheck, UserX, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useUserRoles } from "@/hooks/useUserRoles";
import { useToast } from "@/hooks/use-toast";
import { Navigate } from "react-router-dom";

const Admin = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  
  const { user } = useAuth();
  const { isAdmin, loading: rolesLoading } = useUserRoles(user);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Redirect non-admin users
  if (!rolesLoading && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  // Show loading while checking roles
  if (rolesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-xl text-muted-foreground">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  // Fetch users with their roles
  const { data: usersData = [], isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      // First get all users from auth.users (we can't query this directly, so we'll get from user_roles)
      const { data: userRoles, error } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Group roles by user_id
      const userRoleMap = userRoles?.reduce((acc, ur) => {
        if (!acc[ur.user_id]) {
          acc[ur.user_id] = [];
        }
        acc[ur.user_id].push(ur.role);
        return acc;
      }, {} as Record<string, string[]>) || {};

      // For demo purposes, we'll create user data based on the roles
      // In a real app, you'd have a profiles table or get this data differently
      return Object.entries(userRoleMap).map(([userId, roles]) => ({
        id: userId,
        email: `user-${userId.slice(0, 8)}@example.com`, // Mock email
        roles: roles,
        created_at: new Date().toISOString(),
        last_sign_in: new Date().toISOString()
      }));
    }
  });

  // Add role mutation
  const addRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string, role: 'admin' | 'user' }) => {
      const { data, error } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: role,
        });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Role added successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add role. Please try again.",
        variant: "destructive",
      });
      console.error("Error adding role:", error);
    }
  });

  // Remove role mutation
  const removeRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string, role: 'admin' | 'user' }) => {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', role);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Role removed successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to remove role. Please try again.",
        variant: "destructive",
      });
      console.error("Error removing role:", error);
    }
  });

  const filteredUsers = usersData.filter(userData => {
    const matchesSearch = userData.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || userData.roles.includes(roleFilter);
    return matchesSearch && matchesRole;
  });

  const totalUsers = usersData.length;
  const adminUsers = usersData.filter(u => u.roles.includes('admin')).length;
  const regularUsers = usersData.filter(u => u.roles.includes('user')).length;

  const handleAddRole = (userId: string, role: 'admin' | 'user') => {
    addRoleMutation.mutate({ userId, role });
  };

  const handleRemoveRole = (userId: string, role: 'admin' | 'user') => {
    removeRoleMutation.mutate({ userId, role });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Admin Control Panel
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Manage users and their roles across the platform
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Users className="w-8 h-8 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  <p className="text-3xl font-bold text-blue-600">{totalUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Shield className="w-8 h-8 text-red-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Admin Users</p>
                  <p className="text-3xl font-bold text-red-600">{adminUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <UserCheck className="w-8 h-8 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Regular Users</p>
                  <p className="text-3xl font-bold text-green-600">{regularUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>User Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input
                  placeholder="Search users by email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                </SelectContent>
              </Select>

              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Filter className="w-5 h-5 mr-2" />
                Filter
              </Button>
            </div>

            {/* Users Table */}
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-xl text-muted-foreground">Loading users...</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User ID</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Roles</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((userData) => (
                    <TableRow key={userData.id}>
                      <TableCell className="font-mono text-sm">
                        {userData.id.slice(0, 8)}...
                      </TableCell>
                      <TableCell>{userData.email}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {userData.roles.map((role) => (
                            <Badge
                              key={role}
                              variant={role === 'admin' ? 'destructive' : 'secondary'}
                              className="flex items-center space-x-1"
                            >
                              {role === 'admin' ? (
                                <Shield className="w-3 h-3" />
                              ) : (
                                <UserCheck className="w-3 h-3" />
                              )}
                              <span>{role}</span>
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {!userData.roles.includes('admin') && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" className="bg-red-600 hover:bg-red-700">
                                  <Shield className="w-4 h-4 mr-1" />
                                  Make Admin
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Grant Admin Access</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to grant admin privileges to this user? 
                                    This will give them full access to the admin panel.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleAddRole(userData.id, 'admin')}
                                  >
                                    Grant Admin
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                          
                          {userData.roles.includes('admin') && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="outline">
                                  <UserX className="w-4 h-4 mr-1" />
                                  Remove Admin
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Remove Admin Access</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to remove admin privileges from this user? 
                                    They will lose access to the admin panel.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleRemoveRole(userData.id, 'admin')}
                                  >
                                    Remove Admin
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {filteredUsers.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <p className="text-xl text-muted-foreground">No users found matching your criteria.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Admin;
