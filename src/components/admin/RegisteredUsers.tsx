import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Users, Search, Shield, UserCheck, Eye, Mail, Phone, Building2, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface RegisteredUser {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  company: string | null;
}

export const RegisteredUsers = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<RegisteredUser | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['all-registered-users'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_all_users');
      if (error) throw error;
      return (data || []) as RegisteredUser[];
    },
    refetchInterval: 15000
  });

  // Fetch user roles
  const { data: userRoles = [] } = useQuery({
    queryKey: ['all-user-roles'],
    queryFn: async () => {
      const { data, error } = await supabase.from('user_roles').select('*');
      if (error) throw error;
      return data || [];
    },
    refetchInterval: 15000
  });

  // Fetch admin users
  const { data: adminUsers = [] } = useQuery({
    queryKey: ['admin-users-list'],
    queryFn: async () => {
      const { data, error } = await supabase.from('admin_users').select('*');
      if (error) throw error;
      return data || [];
    },
    refetchInterval: 15000
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const { data, error } = await supabase.rpc('admin_update_user_role', {
        target_user_id: userId,
        new_role: role as any
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({ title: "Success", description: "User role updated successfully!" });
      queryClient.invalidateQueries({ queryKey: ['all-user-roles'] });
    },
    onError: (error) => {
      toast({ title: "Error", description: "Failed to update role.", variant: "destructive" });
      console.error(error);
    }
  });

  const promoteToAdminMutation = useMutation({
    mutationFn: async ({ email, role }: { email: string; role: string }) => {
      const { data, error } = await supabase.rpc('create_admin_user_safe', {
        user_email: email,
        admin_role: role as "super_admin" | "admin" | "moderator"
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({ title: "Success", description: "User promoted to admin!" });
      queryClient.invalidateQueries({ queryKey: ['admin-users-list'] });
    },
    onError: (error) => {
      toast({ title: "Error", description: error instanceof Error ? error.message : "Failed to promote user.", variant: "destructive" });
    }
  });

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    return !q || 
      u.email?.toLowerCase().includes(q) || 
      u.first_name?.toLowerCase().includes(q) || 
      u.last_name?.toLowerCase().includes(q) ||
      u.company?.toLowerCase().includes(q);
  });

  const getUserRole = (userId: string) => {
    const role = userRoles.find(r => r.user_id === userId);
    return role?.role || 'user';
  };

  const isAdminUser = (userId: string) => {
    return adminUsers.some(a => a.user_id === userId && a.is_active);
  };

  const getAdminRole = (userId: string) => {
    const admin = adminUsers.find(a => a.user_id === userId && a.is_active);
    return admin?.role || null;
  };

  const getInitials = (user: RegisteredUser) => {
    if (user.first_name && user.last_name) return `${user.first_name[0]}${user.last_name[0]}`;
    return user.email?.[0]?.toUpperCase() || '?';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5" />
            Registered Users ({users.length})
          </h2>
          <p className="text-slate-400 text-sm">View and manage all registered users</p>
        </div>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search users..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 bg-slate-700 border-slate-600 text-white text-sm"
          />
        </div>
      </div>

      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto" />
              <p className="text-slate-400 mt-2 text-sm">Loading users...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-slate-300">User</TableHead>
                    <TableHead className="text-slate-300">Email</TableHead>
                    <TableHead className="text-slate-300">Role</TableHead>
                    <TableHead className="text-slate-300">Admin</TableHead>
                    <TableHead className="text-slate-300">Joined</TableHead>
                    <TableHead className="text-slate-300">Last Login</TableHead>
                    <TableHead className="text-slate-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(user => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={user.avatar_url || ''} />
                            <AvatarFallback className="bg-slate-600 text-white text-xs">{getInitials(user)}</AvatarFallback>
                          </Avatar>
                          <span className="text-white text-sm">
                            {user.first_name || user.last_name 
                              ? `${user.first_name || ''} ${user.last_name || ''}`.trim() 
                              : '—'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-300 text-sm">{user.email}</TableCell>
                      <TableCell>
                        <Badge className={getUserRole(user.id) === 'admin' ? 'bg-blue-500 text-white' : 'bg-slate-600 text-white'}>
                          {getUserRole(user.id)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {isAdminUser(user.id) ? (
                          <Badge className="bg-purple-500 text-white text-xs">{getAdminRole(user.id)}</Badge>
                        ) : (
                          <span className="text-slate-500 text-xs">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-slate-300 text-xs">
                        {new Date(user.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-slate-300 text-xs">
                        {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : '—'}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700 h-7 px-2"
                            onClick={() => { setSelectedUser(user); setProfileOpen(true); }}>
                            <Eye className="w-3 h-3" />
                          </Button>
                          {!isAdminUser(user.id) && (
                            <Button size="sm" variant="outline" className="border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white h-7 px-2"
                              onClick={() => promoteToAdminMutation.mutate({ email: user.email, role: 'admin' })}>
                              <Shield className="w-3 h-3" />
                            </Button>
                          )}
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

      {/* User Profile Dialog */}
      <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">User Profile</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="w-14 h-14">
                  <AvatarImage src={selectedUser.avatar_url || ''} />
                  <AvatarFallback className="bg-slate-600 text-white">{getInitials(selectedUser)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-white font-medium">
                    {selectedUser.first_name || selectedUser.last_name 
                      ? `${selectedUser.first_name || ''} ${selectedUser.last_name || ''}`.trim() 
                      : 'No name set'}
                  </p>
                  <p className="text-slate-400 text-sm">{selectedUser.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-slate-300">
                  <Phone className="w-4 h-4 text-slate-500" />
                  {selectedUser.phone || '—'}
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <Building2 className="w-4 h-4 text-slate-500" />
                  {selectedUser.company || '—'}
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <Calendar className="w-4 h-4 text-slate-500" />
                  Joined {new Date(selectedUser.created_at).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <UserCheck className="w-4 h-4 text-slate-500" />
                  {selectedUser.last_sign_in_at ? `Last login ${new Date(selectedUser.last_sign_in_at).toLocaleDateString()}` : 'Never logged in'}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-white text-sm">App Role</Label>
                <Select 
                  value={getUserRole(selectedUser.id)} 
                  onValueChange={(val) => updateRoleMutation.mutate({ userId: selectedUser.id, role: val })}
                >
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {!isAdminUser(selectedUser.id) && (
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-sm"
                  onClick={() => promoteToAdminMutation.mutate({ email: selectedUser.email, role: 'admin' })}
                  disabled={promoteToAdminMutation.isPending}
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Promote to Admin
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
