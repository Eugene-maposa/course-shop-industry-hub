import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Package, Building, Factory, Plus, Edit, Trash2, Eye, CheckCircle, XCircle, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAdmin } from "@/hooks/useAdmin";

export const ContentManagement = () => {
  const { toast } = useToast();
  const { logAdminAction } = useAdmin();
  const queryClient = useQueryClient();
  
  // Edit state for shops & products
  const [editingShop, setEditingShop] = useState<any>(null);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  // Industry management state
  const [newIndustryName, setNewIndustryName] = useState("");
  const [newIndustryCode, setNewIndustryCode] = useState("");
  const [newIndustryDescription, setNewIndustryDescription] = useState("");
  const [editingIndustry, setEditingIndustry] = useState<any>(null);
  const [isIndustryDialogOpen, setIsIndustryDialogOpen] = useState(false);
  const [isEditIndustryDialogOpen, setIsEditIndustryDialogOpen] = useState(false);

  // Fetch industries
  const { data: industries = [], isLoading: industriesLoading } = useQuery({
    queryKey: ['content-industries'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('industries')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch products
  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ['content-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          shops(name)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch shops
  const { data: shops = [], isLoading: shopsLoading } = useQuery({
    queryKey: ['content-shops'],
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

  // Industry mutations
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
      queryClient.invalidateQueries({ queryKey: ['content-industries'] });
      setNewIndustryName("");
      setNewIndustryCode("");
      setNewIndustryDescription("");
      setIsIndustryDialogOpen(false);
      logAdminAction("Industry created", "industries");
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
      queryClient.invalidateQueries({ queryKey: ['content-industries'] });
      setEditingIndustry(null);
      logAdminAction("Industry updated", "industries");
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
      queryClient.invalidateQueries({ queryKey: ['content-industries'] });
      logAdminAction("Industry deleted", "industries");
    }
  });

  // Update product status
  const updateProductStatusMutation = useMutation({
    mutationFn: async ({ productId, status }: { productId: string, status: "active" | "inactive" | "pending" }) => {
      const { data, error } = await supabase
        .from('products')
        .update({ status })
        .eq('id', productId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Product status updated successfully!"
      });
      queryClient.invalidateQueries({ queryKey: ['content-products'] });
      logAdminAction("Product status updated", "products");
    }
  });

  // Update shop status
  const updateShopStatusMutation = useMutation({
    mutationFn: async ({ shopId, status }: { shopId: string, status: "active" | "inactive" | "pending" }) => {
      const { data, error } = await supabase
        .from('shops')
        .update({ status })
        .eq('id', shopId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Shop status updated successfully!"
      });
      queryClient.invalidateQueries({ queryKey: ['content-shops'] });
      logAdminAction("Shop status updated", "shops");
    }
  });

  // Admin edit product (name, description, price, sku, image)
  const editProductMutation = useMutation({
    mutationFn: async (p: any) => {
      const { data, error } = await supabase
        .from('products')
        .update({
          name: p.name,
          description: p.description,
          price: p.price ? Number(p.price) : null,
          sku: p.sku,
          main_image_url: p.main_image_url,
        })
        .eq('id', p.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({ title: "Product updated" });
      queryClient.invalidateQueries({ queryKey: ['content-products'] });
      setEditingProduct(null);
      logAdminAction("Product edited", "products");
    },
    onError: (e: any) => toast({ title: "Update failed", description: e.message, variant: "destructive" }),
  });

  // Admin delete product
  const deleteProductMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Product deleted" });
      queryClient.invalidateQueries({ queryKey: ['content-products'] });
      logAdminAction("Product deleted", "products");
    },
    onError: (e: any) => toast({ title: "Delete failed", description: e.message, variant: "destructive" }),
  });

  // Admin edit shop (name, description, website, phone, email, address)
  const editShopMutation = useMutation({
    mutationFn: async (s: any) => {
      const { data, error } = await supabase
        .from('shops')
        .update({
          name: s.name,
          description: s.description,
          website: s.website,
          phone: s.phone,
          email: s.email,
          address: s.address,
          icon_url: s.icon_url,
        })
        .eq('id', s.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({ title: "Shop updated" });
      queryClient.invalidateQueries({ queryKey: ['content-shops'] });
      setEditingShop(null);
      logAdminAction("Shop edited", "shops");
    },
    onError: (e: any) => toast({ title: "Update failed", description: e.message, variant: "destructive" }),
  });

  // Admin delete shop
  const deleteShopMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('shops').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Shop deleted" });
      queryClient.invalidateQueries({ queryKey: ['content-shops'] });
      logAdminAction("Shop deleted", "shops");
    },
    onError: (e: any) => toast({ title: "Delete failed", description: e.message, variant: "destructive" }),
  });
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
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
          <Package className="w-6 h-6" />
          <span>Content Management</span>
        </h2>
        <p className="text-slate-400">Manage industries, products, and shops</p>
      </div>

      <Tabs defaultValue="industries" className="space-y-6">
        <TabsList className="bg-slate-800 border-slate-700">
          <TabsTrigger value="industries" className="data-[state=active]:bg-slate-700">
            <Factory className="w-4 h-4 mr-2" />
            Industries
          </TabsTrigger>
          <TabsTrigger value="products" className="data-[state=active]:bg-slate-700">
            <Package className="w-4 h-4 mr-2" />
            Products
          </TabsTrigger>
          <TabsTrigger value="shops" className="data-[state=active]:bg-slate-700">
            <Building className="w-4 h-4 mr-2" />
            Shops
          </TabsTrigger>
        </TabsList>

        {/* Industries Tab */}
        <TabsContent value="industries">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">Industries Management</CardTitle>
                <Dialog open={isIndustryDialogOpen} onOpenChange={setIsIndustryDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700">
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
                          placeholder="e.g., Technology"
                        />
                      </div>
                      <div>
                        <Label htmlFor="code" className="text-white">Industry Code</Label>
                        <Input
                          id="code"
                          value={newIndustryCode}
                          onChange={(e) => setNewIndustryCode(e.target.value)}
                          className="bg-slate-700 border-slate-600 text-white"
                          placeholder="e.g., TECH"
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
                        className="w-full bg-blue-600 hover:bg-blue-700"
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
                <div className="text-center py-8">
                  <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
                  <p className="text-slate-400 mt-2">Loading industries...</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-slate-300">Name</TableHead>
                      <TableHead className="text-slate-300">Code</TableHead>
                      <TableHead className="text-slate-300">Status</TableHead>
                      <TableHead className="text-slate-300">Created</TableHead>
                      <TableHead className="text-slate-300">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {industries.map((industry) => (
                      <TableRow key={industry.id}>
                        <TableCell className="text-white font-medium">{industry.name}</TableCell>
                        <TableCell className="text-slate-300">{industry.code}</TableCell>
                        <TableCell>{getStatusBadge(industry.status)}</TableCell>
                        <TableCell className="text-slate-300">
                          {new Date(industry.created_at).toLocaleDateString()}
                        </TableCell>
                         <TableCell>
                           <div className="flex items-center space-x-2">
                             <Dialog open={isEditIndustryDialogOpen && editingIndustry?.id === industry.id} onOpenChange={(open) => {
                               setIsEditIndustryDialogOpen(open);
                               if (!open) setEditingIndustry(null);
                             }}>
                               <DialogTrigger asChild>
                                 <Button 
                                   variant="outline" 
                                   size="sm" 
                                   className="border-slate-600 text-slate-300 hover:bg-slate-600"
                                   onClick={() => {
                                     setEditingIndustry(industry);
                                     setIsEditIndustryDialogOpen(true);
                                   }}
                                 >
                                   <Edit className="w-4 h-4" />
                                 </Button>
                               </DialogTrigger>
                               <DialogContent className="bg-slate-800 border-slate-700">
                                 <DialogHeader>
                                   <DialogTitle className="text-white">Edit Industry</DialogTitle>
                                 </DialogHeader>
                                 <div className="space-y-4">
                                   <div>
                                     <Label htmlFor="edit-name" className="text-white">Industry Name</Label>
                                     <Input
                                       id="edit-name"
                                       value={editingIndustry?.name || ""}
                                       onChange={(e) => setEditingIndustry({...editingIndustry, name: e.target.value})}
                                       className="bg-slate-700 border-slate-600 text-white"
                                     />
                                   </div>
                                   <div>
                                     <Label htmlFor="edit-code" className="text-white">Industry Code</Label>
                                     <Input
                                       id="edit-code"
                                       value={editingIndustry?.code || ""}
                                       onChange={(e) => setEditingIndustry({...editingIndustry, code: e.target.value})}
                                       className="bg-slate-700 border-slate-600 text-white"
                                     />
                                   </div>
                                   <div>
                                     <Label htmlFor="edit-description" className="text-white">Description</Label>
                                     <Textarea
                                       id="edit-description"
                                       value={editingIndustry?.description || ""}
                                       onChange={(e) => setEditingIndustry({...editingIndustry, description: e.target.value})}
                                       className="bg-slate-700 border-slate-600 text-white"
                                     />
                                   </div>
                                   <div>
                                     <Label htmlFor="edit-status" className="text-white">Status</Label>
                                     <Select 
                                       value={editingIndustry?.status || "active"} 
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
                                     onClick={() => {
                                       updateIndustryMutation.mutate(editingIndustry);
                                       setIsEditIndustryDialogOpen(false);
                                     }}
                                     disabled={!editingIndustry?.name || !editingIndustry?.code || updateIndustryMutation.isPending}
                                     className="w-full bg-blue-600 hover:bg-blue-700"
                                   >
                                     {updateIndustryMutation.isPending ? "Updating..." : "Update Industry"}
                                   </Button>
                                 </div>
                               </DialogContent>
                             </Dialog>
                             <AlertDialog>
                               <AlertDialogTrigger asChild>
                                 <Button variant="outline" size="sm" className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white">
                                   <Trash2 className="w-4 h-4" />
                                 </Button>
                               </AlertDialogTrigger>
                               <AlertDialogContent className="bg-slate-800 border-slate-700">
                                 <AlertDialogHeader>
                                   <AlertDialogTitle className="text-white">Delete Industry</AlertDialogTitle>
                                   <AlertDialogDescription className="text-slate-300">
                                     Are you sure you want to delete this industry? This action cannot be undone.
                                   </AlertDialogDescription>
                                 </AlertDialogHeader>
                                 <AlertDialogFooter>
                                   <AlertDialogCancel className="bg-slate-700 text-white hover:bg-slate-600">Cancel</AlertDialogCancel>
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
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Products Management</CardTitle>
            </CardHeader>
            <CardContent>
              {productsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
                  <p className="text-slate-400 mt-2">Loading products...</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-slate-300">Image</TableHead>
                      <TableHead className="text-slate-300">Name</TableHead>
                      <TableHead className="text-slate-300">Shop</TableHead>
                      <TableHead className="text-slate-300">Price</TableHead>
                      <TableHead className="text-slate-300">Status</TableHead>
                      <TableHead className="text-slate-300">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.slice(0, 10).map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-700">
                            {product.main_image_url ? (
                              <img 
                                src={product.main_image_url} 
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-slate-600 flex items-center justify-center">
                                <Package className="w-6 h-6 text-slate-400" />
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-white font-medium">{product.name}</TableCell>
                        <TableCell className="text-slate-300">{product.shops?.name || 'N/A'}</TableCell>
                        <TableCell className="text-slate-300">${product.price || 0}</TableCell>
                        <TableCell>{getStatusBadge(product.status)}</TableCell>
                        <TableCell>
                          <Select onValueChange={(value) => updateProductStatusMutation.mutate({ productId: product.id, status: value as "active" | "inactive" | "pending" })}>
                            <SelectTrigger className="w-32 bg-slate-700 border-slate-600 text-white">
                              <SelectValue placeholder="Update" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-700 border-slate-600">
                              <SelectItem value="active">Approve</SelectItem>
                              <SelectItem value="inactive">Reject</SelectItem>
                              <SelectItem value="pending">Pending</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Shops Tab */}
        <TabsContent value="shops">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Shops Management</CardTitle>
            </CardHeader>
            <CardContent>
              {shopsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
                  <p className="text-slate-400 mt-2">Loading shops...</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-slate-300">Name</TableHead>
                      <TableHead className="text-slate-300">Industry</TableHead>
                      <TableHead className="text-slate-300">Status</TableHead>
                      <TableHead className="text-slate-300">Verification</TableHead>
                      <TableHead className="text-slate-300">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {shops.slice(0, 10).map((shop) => (
                      <TableRow key={shop.id}>
                        <TableCell className="text-white font-medium">{shop.name}</TableCell>
                        <TableCell className="text-slate-300">{shop.industries?.name || 'N/A'}</TableCell>
                        <TableCell>{getStatusBadge(shop.status)}</TableCell>
                        <TableCell>{getStatusBadge(shop.document_verification_status)}</TableCell>
                        <TableCell>
                          <Select onValueChange={(value) => updateShopStatusMutation.mutate({ shopId: shop.id, status: value as "active" | "inactive" | "pending" })}>
                            <SelectTrigger className="w-32 bg-slate-700 border-slate-600 text-white">
                              <SelectValue placeholder="Update" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-700 border-slate-600">
                              <SelectItem value="active">Approve</SelectItem>
                              <SelectItem value="inactive">Reject</SelectItem>
                              <SelectItem value="pending">Pending</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};