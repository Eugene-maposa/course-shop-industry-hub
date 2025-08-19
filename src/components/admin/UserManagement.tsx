import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Users, UserPlus, Shield, Trash2, Edit, Mail, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const UserManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserRole, setNewUserRole] = useState("admin");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Fetch admin users with real-time updates
  const { data: adminUsers = [], isLoading } = useQuery({
    queryKey: ['admin-users-management'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    refetchInterval: 10000 // Auto-refresh every 10 seconds
  });

  // Create admin user mutation
  const createAdminMutation = useMutation({
    mutationFn: async ({ email, role }: { email: string, role: string }) => {
      const { data, error } = await supabase
        .from('admin_users')
        .insert({
          user_id: email, // In real app, would create auth user first
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
      queryClient.invalidateQueries({ queryKey: ['admin-users-management'] });
      setNewUserEmail("");
      setNewUserRole("admin");
      setIsCreateDialogOpen(false);
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

  // Deactivate admin user mutation
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
      queryClient.invalidateQueries({ queryKey: ['admin-users-management'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to deactivate admin user.",
        variant: "destructive"
      });
    }
  });

  // Activate admin user mutation
  const activateAdminMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { data, error } = await supabase
        .from('admin_users')
        .update({ is_active: true })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Admin user activated successfully!"
      });
      queryClient.invalidateQueries({ queryKey: ['admin-users-management'] });
    }
  });

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'super_admin':
        return <Badge className="bg-red-500 text-white">Super Admin</Badge>;
      case 'admin':
        return <Badge className="bg-blue-500 text-white">Admin</Badge>;
      case 'moderator':
        return <Badge className="bg-green-500 text-white">Moderator</Badge>;
      default:
        return <Badge variant="secondary">{role}</Badge>;
    }
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge className="bg-green-500 text-white">Active</Badge>
    ) : (
      <Badge className="bg-red-500 text-white">Inactive</Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
            <Users className="w-6 h-6" />
            <span>User Management</span>
          </h2>
          <p className="text-slate-400">Manage admin users and permissions</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <UserPlus className="w-4 h-4 mr-2" />
              Add Admin User
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-800 border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-white">Create Admin User</DialogTitle>
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

      {/* Admin Users Table */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Admin Users</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
              <p className="text-slate-400 mt-2">Loading admin users...</p>
            </div>
          ) : adminUsers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-400">No admin users found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-slate-300">Email</TableHead>
                  <TableHead className="text-slate-300">Role</TableHead>
                  <TableHead className="text-slate-300">Status</TableHead>
                  <TableHead className="text-slate-300">Created</TableHead>
                  <TableHead className="text-slate-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {adminUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="text-white">
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-slate-400" />
                        <span>{user.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>{getStatusBadge(user.is_active)}</TableCell>
                    <TableCell className="text-slate-300">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span>{new Date(user.created_at).toLocaleDateString()}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {user.is_active ? (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm" className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-slate-800 border-slate-700">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-white">Deactivate Admin User</AlertDialogTitle>
                                <AlertDialogDescription className="text-slate-300">
                                  Are you sure you want to deactivate this admin user? They will lose access to the admin panel.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="bg-slate-700 text-white hover:bg-slate-600">Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => deactivateAdminMutation.mutate(user.user_id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Deactivate
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        ) : (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => activateAdminMutation.mutate(user.user_id)}
                            className="border-green-600 text-green-400 hover:bg-green-600 hover:text-white"
                          >
                            <Shield className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};