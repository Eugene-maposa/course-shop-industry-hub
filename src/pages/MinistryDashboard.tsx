import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Building, Package, Briefcase, Download, Search, Filter, TrendingUp, Eye, FileText, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";
import { Navigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const MinistryDashboard = () => {
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const [shopSearch, setShopSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [industrySearch, setIndustrySearch] = useState("");
  const [shopStatusFilter, setShopStatusFilter] = useState("all");
  const [productStatusFilter, setProductStatusFilter] = useState("all");
  const [selectedShop, setSelectedShop] = useState<any>(null);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  // Fetch all shops with industry details
  const { data: shops = [], isLoading: shopsLoading } = useQuery({
    queryKey: ['ministry-shops'],
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

  // Fetch all products with shop and industry details
  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ['ministry-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          shops(name, address),
          product_types(name, code, industries(name))
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch all industries with stats
  const { data: industries = [], isLoading: industriesLoading } = useQuery({
    queryKey: ['ministry-industries'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('industries')
        .select(`
          *,
          shops(count),
          product_types(count)
        `)
        .order('name', { ascending: true });
      
      if (error) throw error;
      return data || [];
    }
  });

  // Calculate statistics
  const stats = {
    totalShops: shops.length,
    activeShops: shops.filter(s => s.status === 'active').length,
    pendingShops: shops.filter(s => s.status === 'pending').length,
    totalProducts: products.length,
    activeProducts: products.filter(p => p.status === 'active').length,
    pendingProducts: products.filter(p => p.status === 'pending').length,
    totalIndustries: industries.length,
    activeIndustries: industries.filter(i => i.status === 'active').length,
  };

  // Filter shops
  const filteredShops = shops.filter(shop => {
    const matchesSearch = shop.name.toLowerCase().includes(shopSearch.toLowerCase()) ||
      shop.email?.toLowerCase().includes(shopSearch.toLowerCase()) ||
      shop.address?.toLowerCase().includes(shopSearch.toLowerCase());
    const matchesStatus = shopStatusFilter === 'all' || shop.status === shopStatusFilter;
    return matchesSearch && matchesStatus;
  });

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      product.description?.toLowerCase().includes(productSearch.toLowerCase()) ||
      product.sku?.toLowerCase().includes(productSearch.toLowerCase());
    const matchesStatus = productStatusFilter === 'all' || product.status === productStatusFilter;
    return matchesSearch && matchesStatus;
  });

  // Filter industries
  const filteredIndustries = industries.filter(industry =>
    industry.name.toLowerCase().includes(industrySearch.toLowerCase()) ||
    industry.code.toLowerCase().includes(industrySearch.toLowerCase())
  );

  // Export shops to PDF
  const exportShopsPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text("Ministry of Industry and Commerce", 14, 20);
    doc.setFontSize(14);
    doc.text("Registered Shops Report", 14, 28);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 35);

    const tableData = filteredShops.map(shop => [
      shop.name,
      shop.industries?.name || 'N/A',
      shop.email || 'N/A',
      shop.phone || 'N/A',
      shop.status,
      new Date(shop.registration_date).toLocaleDateString()
    ]);

    autoTable(doc, {
      startY: 40,
      head: [['Shop Name', 'Industry', 'Email', 'Phone', 'Status', 'Registration Date']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [51, 65, 85] }
    });

    doc.save(`shops-report-${new Date().toISOString().split('T')[0]}.pdf`);
    
    toast({
      title: "Success",
      description: "Shops report downloaded successfully!"
    });
  };

  // Export products to PDF
  const exportProductsPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text("Ministry of Industry and Commerce", 14, 20);
    doc.setFontSize(14);
    doc.text("Registered Products Report", 14, 28);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 35);

    const tableData = filteredProducts.map(product => [
      product.name,
      product.shops?.name || 'N/A',
      product.product_types?.name || 'N/A',
      product.sku || 'N/A',
      `$${product.price || 0}`,
      product.status
    ]);

    autoTable(doc, {
      startY: 40,
      head: [['Product Name', 'Shop', 'Type', 'SKU', 'Price', 'Status']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [51, 65, 85] }
    });

    doc.save(`products-report-${new Date().toISOString().split('T')[0]}.pdf`);
    
    toast({
      title: "Success",
      description: "Products report downloaded successfully!"
    });
  };

  // Export industries to PDF
  const exportIndustriesPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text("Ministry of Industry and Commerce", 14, 20);
    doc.setFontSize(14);
    doc.text("Industries Report", 14, 28);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 35);

    const tableData = filteredIndustries.map(industry => [
      industry.name,
      industry.code,
      industry.shops?.length || 0,
      industry.product_types?.length || 0,
      industry.status
    ]);

    autoTable(doc, {
      startY: 40,
      head: [['Industry Name', 'Code', 'Total Shops', 'Product Types', 'Status']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [51, 65, 85] }
    });

    doc.save(`industries-report-${new Date().toISOString().split('T')[0]}.pdf`);
    
    toast({
      title: "Success",
      description: "Industries report downloaded successfully!"
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">Active</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500">Pending</Badge>;
      case 'inactive':
        return <Badge className="bg-red-500">Inactive</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Show loading state while checking authentication
  if (authLoading || adminLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Verifying access...</p>
        </div>
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader>
            <div className="flex items-center justify-center mb-4">
              <Shield className="w-16 h-16 text-destructive" />
            </div>
            <CardTitle className="text-center text-2xl">Access Denied</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              You do not have permission to access the Ministry Dashboard. 
              This area is restricted to authorized administrators only.
            </p>
            <Button onClick={() => window.location.href = '/'} className="w-full">
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b px-6 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center space-x-3 mb-2">
            <Building className="w-10 h-10 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Ministry of Industry and Commerce</h1>
              <p className="text-muted-foreground">Comprehensive Dashboard & Reporting System</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Statistics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Shops</p>
                  <p className="text-3xl font-bold">{stats.totalShops}</p>
                  <p className="text-xs text-green-500">{stats.activeShops} active</p>
                </div>
                <Building className="w-12 h-12 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Products</p>
                  <p className="text-3xl font-bold">{stats.totalProducts}</p>
                  <p className="text-xs text-green-500">{stats.activeProducts} active</p>
                </div>
                <Package className="w-12 h-12 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Industries</p>
                  <p className="text-3xl font-bold">{stats.totalIndustries}</p>
                  <p className="text-xs text-green-500">{stats.activeIndustries} active</p>
                </div>
                <Briefcase className="w-12 h-12 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Reviews</p>
                  <p className="text-3xl font-bold">{stats.pendingShops + stats.pendingProducts}</p>
                  <p className="text-xs text-yellow-500">Requires attention</p>
                </div>
                <TrendingUp className="w-12 h-12 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="shops" className="space-y-6">
          <TabsList>
            <TabsTrigger value="shops">
              <Building className="w-4 h-4 mr-2" />
              Shops ({stats.totalShops})
            </TabsTrigger>
            <TabsTrigger value="products">
              <Package className="w-4 h-4 mr-2" />
              Products ({stats.totalProducts})
            </TabsTrigger>
            <TabsTrigger value="industries">
              <Briefcase className="w-4 h-4 mr-2" />
              Industries ({stats.totalIndustries})
            </TabsTrigger>
          </TabsList>

          {/* Shops Tab */}
          <TabsContent value="shops">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Registered Shops</CardTitle>
                  <Button onClick={exportShopsPDF} variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export PDF
                  </Button>
                </div>
                <div className="flex gap-4 mt-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search shops by name, email, or address..."
                        value={shopSearch}
                        onChange={(e) => setShopSearch(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={shopStatusFilter} onValueChange={setShopStatusFilter}>
                    <SelectTrigger className="w-40">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                {shopsLoading ? (
                  <div className="text-center py-8">Loading shops...</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Shop Name</TableHead>
                        <TableHead>Industry</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Registration Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredShops.map((shop) => (
                        <TableRow key={shop.id}>
                          <TableCell className="font-medium">{shop.name}</TableCell>
                          <TableCell>{shop.industries?.name || 'N/A'}</TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>{shop.email || 'N/A'}</div>
                              <div className="text-muted-foreground">{shop.phone || 'N/A'}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {new Date(shop.registration_date).toLocaleDateString()}
                          </TableCell>
                          <TableCell>{getStatusBadge(shop.status)}</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedShop(shop)}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
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
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Registered Products</CardTitle>
                  <Button onClick={exportProductsPDF} variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export PDF
                  </Button>
                </div>
                <div className="flex gap-4 mt-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search products by name, SKU, or description..."
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={productStatusFilter} onValueChange={setProductStatusFilter}>
                    <SelectTrigger className="w-40">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                {productsLoading ? (
                  <div className="text-center py-8">Loading products...</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product Name</TableHead>
                        <TableHead>Shop</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProducts.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell>{product.shops?.name || 'N/A'}</TableCell>
                          <TableCell>{product.product_types?.name || 'N/A'}</TableCell>
                          <TableCell className="font-mono text-sm">{product.sku || 'N/A'}</TableCell>
                          <TableCell>${product.price || 0}</TableCell>
                          <TableCell>{getStatusBadge(product.status)}</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedProduct(product)}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Industries Tab */}
          <TabsContent value="industries">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Industries Overview</CardTitle>
                  <Button onClick={exportIndustriesPDF} variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export PDF
                  </Button>
                </div>
                <div className="mt-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search industries..."
                      value={industrySearch}
                      onChange={(e) => setIndustrySearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {industriesLoading ? (
                  <div className="text-center py-8">Loading industries...</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Industry Name</TableHead>
                        <TableHead>Code</TableHead>
                        <TableHead>Total Shops</TableHead>
                        <TableHead>Product Types</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredIndustries.map((industry) => (
                        <TableRow key={industry.id}>
                          <TableCell className="font-medium">{industry.name}</TableCell>
                          <TableCell className="font-mono">{industry.code}</TableCell>
                          <TableCell>{industry.shops?.length || 0}</TableCell>
                          <TableCell>{industry.product_types?.length || 0}</TableCell>
                          <TableCell>{getStatusBadge(industry.status)}</TableCell>
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

      {/* Shop Details Dialog */}
      <Dialog open={!!selectedShop} onOpenChange={() => setSelectedShop(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Shop Details</DialogTitle>
          </DialogHeader>
          {selectedShop && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Shop Name</label>
                  <p className="text-sm text-muted-foreground">{selectedShop.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Industry</label>
                  <p className="text-sm text-muted-foreground">{selectedShop.industries?.name || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <p className="text-sm text-muted-foreground">{selectedShop.email || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Phone</label>
                  <p className="text-sm text-muted-foreground">{selectedShop.phone || 'N/A'}</p>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium">Address</label>
                  <p className="text-sm text-muted-foreground">{selectedShop.address || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Registration Date</label>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedShop.registration_date).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <div className="mt-1">{getStatusBadge(selectedShop.status)}</div>
                </div>
                {selectedShop.description && (
                  <div className="col-span-2">
                    <label className="text-sm font-medium">Description</label>
                    <p className="text-sm text-muted-foreground">{selectedShop.description}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Product Details Dialog */}
      <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Product Details</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Product Name</label>
                  <p className="text-sm text-muted-foreground">{selectedProduct.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Shop</label>
                  <p className="text-sm text-muted-foreground">{selectedProduct.shops?.name || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">SKU</label>
                  <p className="text-sm text-muted-foreground font-mono">{selectedProduct.sku || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Price</label>
                  <p className="text-sm text-muted-foreground">${selectedProduct.price || 0}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Category</label>
                  <p className="text-sm text-muted-foreground">{selectedProduct.product_types?.name || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <div className="mt-1">{getStatusBadge(selectedProduct.status)}</div>
                </div>
                {selectedProduct.description && (
                  <div className="col-span-2">
                    <label className="text-sm font-medium">Description</label>
                    <p className="text-sm text-muted-foreground">{selectedProduct.description}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MinistryDashboard;
