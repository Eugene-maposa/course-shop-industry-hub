import { useState, useMemo, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Building, Package, Briefcase, Download, Search, Filter, TrendingUp, Eye, Users, BarChart3, Shield, MapPin } from "lucide-react";
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
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend, Tooltip } from "recharts";
import ShopMap from "@/components/ShopMap";

const MinistryDashboard = () => {
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const queryClient = useQueryClient();
  const [shopSearch, setShopSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [industrySearch, setIndustrySearch] = useState("");
  const [ownerSearch, setOwnerSearch] = useState("");
  const [shopStatusFilter, setShopStatusFilter] = useState("all");
  const [productStatusFilter, setProductStatusFilter] = useState("all");
  const [selectedShop, setSelectedShop] = useState<any>(null);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [selectedOwner, setSelectedOwner] = useState<any>(null);

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
          shops(name, address, user_id),
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

  // Fetch user profiles for business owners
  const { data: userProfiles = [], isLoading: profilesLoading } = useQuery({
    queryKey: ['ministry-user-profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  // Real-time subscription for shops
  useEffect(() => {
    const channel = supabase
      .channel('ministry-shops-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shops' }, () => {
        queryClient.invalidateQueries({ queryKey: ['ministry-shops'] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Get unique business owners (users who have shops)
  const businessOwners = useMemo(() => {
    const ownerMap = new Map();
    
    shops.forEach(shop => {
      if (shop.user_id) {
        if (!ownerMap.has(shop.user_id)) {
          const profile = userProfiles.find(p => p.user_id === shop.user_id);
          ownerMap.set(shop.user_id, {
            user_id: shop.user_id,
            profile,
            shops: [shop],
            totalProducts: 0,
            firstShopDate: shop.registration_date || shop.created_at
          });
        } else {
          const existing = ownerMap.get(shop.user_id);
          existing.shops.push(shop);
          if (new Date(shop.registration_date || shop.created_at) < new Date(existing.firstShopDate)) {
            existing.firstShopDate = shop.registration_date || shop.created_at;
          }
        }
      }
    });

    // Count products per owner
    products.forEach(product => {
      if (product.shops?.user_id && ownerMap.has(product.shops.user_id)) {
        ownerMap.get(product.shops.user_id).totalProducts++;
      }
    });

    return Array.from(ownerMap.values());
  }, [shops, products, userProfiles]);

  // Analytics data
  const analyticsData = useMemo(() => {
    // Shops by industry
    const shopsByIndustry = industries.map(industry => ({
      name: industry.name.length > 15 ? industry.name.substring(0, 15) + '...' : industry.name,
      fullName: industry.name,
      shops: shops.filter(s => s.industry_id === industry.id).length,
      products: products.filter(p => {
        const shop = shops.find(s => s.id === p.shop_id);
        return shop?.industry_id === industry.id;
      }).length
    })).filter(i => i.shops > 0 || i.products > 0);

    // Status distribution for shops
    const shopStatusData = [
      { name: 'Active', value: shops.filter(s => s.status === 'active').length, color: '#22c55e' },
      { name: 'Pending', value: shops.filter(s => s.status === 'pending').length, color: '#eab308' },
      { name: 'Inactive', value: shops.filter(s => s.status === 'inactive').length, color: '#ef4444' }
    ].filter(s => s.value > 0);

    // Status distribution for products
    const productStatusData = [
      { name: 'Active', value: products.filter(p => p.status === 'active').length, color: '#22c55e' },
      { name: 'Pending', value: products.filter(p => p.status === 'pending').length, color: '#eab308' },
      { name: 'Inactive', value: products.filter(p => p.status === 'inactive').length, color: '#ef4444' }
    ].filter(s => s.value > 0);

    // Registration trends (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlyTrends: Record<string, { month: string; shops: number; products: number }> = {};
    
    for (let i = 0; i < 6; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = date.toLocaleString('default', { month: 'short', year: '2-digit' });
      monthlyTrends[monthKey] = { month: monthKey, shops: 0, products: 0 };
    }

    shops.forEach(shop => {
      const date = new Date(shop.registration_date || shop.created_at);
      if (date >= sixMonthsAgo) {
        const monthKey = date.toLocaleString('default', { month: 'short', year: '2-digit' });
        if (monthlyTrends[monthKey]) {
          monthlyTrends[monthKey].shops++;
        }
      }
    });

    products.forEach(product => {
      const date = new Date(product.registration_date || product.created_at);
      if (date >= sixMonthsAgo) {
        const monthKey = date.toLocaleString('default', { month: 'short', year: '2-digit' });
        if (monthlyTrends[monthKey]) {
          monthlyTrends[monthKey].products++;
        }
      }
    });

    const trendsArray = Object.values(monthlyTrends).reverse();

    // Top industries by shops
    const topIndustries = [...shopsByIndustry]
      .sort((a, b) => b.shops - a.shops)
      .slice(0, 5);

    // Business owner activity
    const ownerActivityData = [
      { name: '1 Shop', value: businessOwners.filter(o => o.shops.length === 1).length },
      { name: '2-3 Shops', value: businessOwners.filter(o => o.shops.length >= 2 && o.shops.length <= 3).length },
      { name: '4+ Shops', value: businessOwners.filter(o => o.shops.length >= 4).length }
    ].filter(d => d.value > 0);

    return {
      shopsByIndustry,
      shopStatusData,
      productStatusData,
      trendsArray,
      topIndustries,
      ownerActivityData
    };
  }, [shops, products, industries, businessOwners]);

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
    totalBusinessOwners: businessOwners.length,
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

  // Filter business owners
  const filteredOwners = businessOwners.filter(owner => {
    const searchLower = ownerSearch.toLowerCase();
    const fullName = `${owner.profile?.first_name || ''} ${owner.profile?.last_name || ''}`.toLowerCase();
    const email = owner.profile?.phone?.toLowerCase() || '';
    const company = owner.profile?.company?.toLowerCase() || '';
    const shopNames = owner.shops.map((s: any) => s.name.toLowerCase()).join(' ');
    
    return fullName.includes(searchLower) ||
      email.includes(searchLower) ||
      company.includes(searchLower) ||
      shopNames.includes(searchLower);
  });

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
      head: [['Product Name', 'Shop', 'Type', 'P Number', 'Price', 'Status']],
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

  // Export business owners to PDF
  const exportOwnersPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text("Ministry of Industry and Commerce", 14, 20);
    doc.setFontSize(14);
    doc.text("Business Owners Report", 14, 28);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 35);

    const tableData = filteredOwners.map(owner => [
      `${owner.profile?.first_name || ''} ${owner.profile?.last_name || ''}`.trim() || 'N/A',
      owner.profile?.company || 'N/A',
      owner.profile?.phone || 'N/A',
      owner.shops.length,
      owner.totalProducts,
      new Date(owner.firstShopDate).toLocaleDateString()
    ]);

    autoTable(doc, {
      startY: 40,
      head: [['Owner Name', 'Company', 'Phone', 'Total Shops', 'Total Products', 'First Registration']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [51, 65, 85] }
    });

    doc.save(`business-owners-report-${new Date().toISOString().split('T')[0]}.pdf`);
    
    toast({
      title: "Success",
      description: "Business owners report downloaded successfully!"
    });
  };

  // Export analytics charts and trends to PDF
  const exportAnalyticsPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text("Ministry of Industry and Commerce", 14, 20);
    doc.setFontSize(14);
    doc.text("Analytics & Trends Report", 14, 28);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 35);

    doc.setFontSize(12);
    doc.text("Key Metrics Summary", 14, 48);
    
    autoTable(doc, {
      startY: 52,
      head: [['Metric', 'Value']],
      body: [
        ['Total Shops', String(stats.totalShops)],
        ['Active Shops', String(stats.activeShops)],
        ['Shop Activation Rate', `${stats.totalShops > 0 ? (stats.activeShops / stats.totalShops * 100).toFixed(0) : 0}%`],
        ['Total Products', String(stats.totalProducts)],
        ['Active Products', String(stats.activeProducts)],
        ['Product Activation Rate', `${stats.totalProducts > 0 ? (stats.activeProducts / stats.totalProducts * 100).toFixed(0) : 0}%`],
        ['Total Industries', String(stats.totalIndustries)],
        ['Total Business Owners', String(stats.totalBusinessOwners)],
        ['Avg Shops per Owner', stats.totalBusinessOwners > 0 ? (stats.totalShops / stats.totalBusinessOwners).toFixed(1) : '0'],
        ['Avg Products per Shop', stats.totalShops > 0 ? (stats.totalProducts / stats.totalShops).toFixed(1) : '0'],
      ],
      theme: 'striped',
      headStyles: { fillColor: [51, 65, 85] }
    });

    let currentY = (doc as any).lastAutoTable?.finalY || 120;
    currentY += 10;
    doc.setFontSize(12);
    doc.text("Registration Trends (Last 6 Months)", 14, currentY);
    
    autoTable(doc, {
      startY: currentY + 4,
      head: [['Month', 'Shops Registered', 'Products Registered']],
      body: analyticsData.trendsArray.map(t => [t.month, String(t.shops), String(t.products)]),
      theme: 'striped',
      headStyles: { fillColor: [51, 65, 85] }
    });

    currentY = (doc as any).lastAutoTable?.finalY || 200;
    currentY += 10;
    if (currentY > 250) { doc.addPage(); currentY = 20; }
    doc.setFontSize(12);
    doc.text("Shops & Products by Industry", 14, currentY);
    
    autoTable(doc, {
      startY: currentY + 4,
      head: [['Industry', 'Shops', 'Products']],
      body: analyticsData.shopsByIndustry.map(i => [i.fullName || i.name, String(i.shops), String(i.products)]),
      theme: 'striped',
      headStyles: { fillColor: [51, 65, 85] }
    });

    currentY = (doc as any).lastAutoTable?.finalY || 200;
    currentY += 10;
    if (currentY > 230) { doc.addPage(); currentY = 20; }
    doc.setFontSize(12);
    doc.text("Shop Status Distribution", 14, currentY);
    
    autoTable(doc, {
      startY: currentY + 4,
      head: [['Status', 'Count', 'Percentage']],
      body: analyticsData.shopStatusData.map(s => [
        s.name, String(s.value),
        `${stats.totalShops > 0 ? (s.value / stats.totalShops * 100).toFixed(1) : 0}%`
      ]),
      theme: 'striped',
      headStyles: { fillColor: [51, 65, 85] }
    });

    currentY = (doc as any).lastAutoTable?.finalY || 200;
    currentY += 10;
    if (currentY > 230) { doc.addPage(); currentY = 20; }
    doc.setFontSize(12);
    doc.text("Product Status Distribution", 14, currentY);
    
    autoTable(doc, {
      startY: currentY + 4,
      head: [['Status', 'Count', 'Percentage']],
      body: analyticsData.productStatusData.map(s => [
        s.name, String(s.value),
        `${stats.totalProducts > 0 ? (s.value / stats.totalProducts * 100).toFixed(1) : 0}%`
      ]),
      theme: 'striped',
      headStyles: { fillColor: [51, 65, 85] }
    });

    currentY = (doc as any).lastAutoTable?.finalY || 200;
    currentY += 10;
    if (currentY > 230) { doc.addPage(); currentY = 20; }
    doc.setFontSize(12);
    doc.text("Business Owner Activity", 14, currentY);
    
    autoTable(doc, {
      startY: currentY + 4,
      head: [['Category', 'Count']],
      body: analyticsData.ownerActivityData.map(d => [d.name, String(d.value)]),
      theme: 'striped',
      headStyles: { fillColor: [51, 65, 85] }
    });

    doc.save(`analytics-report-${new Date().toISOString().split('T')[0]}.pdf`);
    
    toast({
      title: "Success",
      description: "Analytics report downloaded successfully!"
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
    return <Navigate to="/site-ops/login" replace />;
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

  const CHART_COLORS = ['#3b82f6', '#22c55e', '#eab308', '#ef4444', '#8b5cf6', '#ec4899'];

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
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
                  <p className="text-sm text-muted-foreground">Business Owners</p>
                  <p className="text-3xl font-bold">{stats.totalBusinessOwners}</p>
                  <p className="text-xs text-muted-foreground">Registered users</p>
                </div>
                <Users className="w-12 h-12 text-indigo-500" />
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
        <Tabs defaultValue="analytics" className="space-y-6">
          <TabsList className="flex-wrap">
            <TabsTrigger value="analytics">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="owners">
              <Users className="w-4 h-4 mr-2" />
              Business Owners ({stats.totalBusinessOwners})
            </TabsTrigger>
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
            <TabsTrigger value="map">
              <MapPin className="w-4 h-4 mr-2" />
              Shop Map
            </TabsTrigger>
          </TabsList>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="flex justify-end mb-4">
              <Button onClick={exportAnalyticsPDF} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export Analytics PDF
              </Button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Registration Trends */}
              <Card className="col-span-1 lg:col-span-2">
                <CardHeader>
                  <CardTitle>Registration Trends (Last 6 Months)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={analyticsData.trendsArray}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="shops" stroke="#3b82f6" strokeWidth={2} name="Shops" />
                        <Line type="monotone" dataKey="products" stroke="#22c55e" strokeWidth={2} name="Products" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Shops by Industry */}
              <Card>
                <CardHeader>
                  <CardTitle>Shops by Industry</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analyticsData.topIndustries} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis type="category" dataKey="name" width={100} />
                        <Tooltip 
                          formatter={(value, name) => [value, name === 'shops' ? 'Shops' : 'Products']}
                          labelFormatter={(label) => analyticsData.topIndustries.find(i => i.name === label)?.fullName || label}
                        />
                        <Bar dataKey="shops" fill="#3b82f6" name="Shops" />
                        <Bar dataKey="products" fill="#22c55e" name="Products" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Shop Status Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Shop Status Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={analyticsData.shopStatusData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {analyticsData.shopStatusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Product Status Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Product Status Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={analyticsData.productStatusData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {analyticsData.productStatusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Business Owner Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Business Owner Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analyticsData.ownerActivityData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#8b5cf6" name="Owners" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Key Metrics Summary */}
              <Card className="col-span-1 lg:col-span-2">
                <CardHeader>
                  <CardTitle>Key Metrics Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                      <p className="text-4xl font-bold text-blue-600">{stats.totalShops > 0 ? (stats.activeShops / stats.totalShops * 100).toFixed(0) : 0}%</p>
                      <p className="text-sm text-muted-foreground">Shop Activation Rate</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                      <p className="text-4xl font-bold text-green-600">{stats.totalProducts > 0 ? (stats.activeProducts / stats.totalProducts * 100).toFixed(0) : 0}%</p>
                      <p className="text-sm text-muted-foreground">Product Activation Rate</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                      <p className="text-4xl font-bold text-purple-600">{stats.totalBusinessOwners > 0 ? (stats.totalShops / stats.totalBusinessOwners).toFixed(1) : 0}</p>
                      <p className="text-sm text-muted-foreground">Avg Shops per Owner</p>
                    </div>
                    <div className="text-center p-4 bg-orange-50 dark:bg-orange-950 rounded-lg">
                      <p className="text-4xl font-bold text-orange-600">{stats.totalShops > 0 ? (stats.totalProducts / stats.totalShops).toFixed(1) : 0}</p>
                      <p className="text-sm text-muted-foreground">Avg Products per Shop</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Business Owners Tab */}
          <TabsContent value="owners">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Business Owners</CardTitle>
                  <Button onClick={exportOwnersPDF} variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export PDF
                  </Button>
                </div>
                <div className="mt-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name, company, phone, or shop name..."
                      value={ownerSearch}
                      onChange={(e) => setOwnerSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {profilesLoading || shopsLoading ? (
                  <div className="text-center py-8">Loading business owners...</div>
                ) : filteredOwners.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No business owners found
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Owner Name</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Shops</TableHead>
                        <TableHead>Products</TableHead>
                        <TableHead>First Registration</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOwners.map((owner) => (
                        <TableRow key={owner.user_id}>
                          <TableCell className="font-medium">
                            {`${owner.profile?.first_name || ''} ${owner.profile?.last_name || ''}`.trim() || 'Unknown'}
                          </TableCell>
                          <TableCell>{owner.profile?.company || 'N/A'}</TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>{owner.profile?.phone || 'N/A'}</div>
                              {owner.profile?.address && (
                                <div className="text-muted-foreground text-xs">{owner.profile.address}</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{owner.shops.length}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{owner.totalProducts}</Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(owner.firstShopDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedOwner(owner)}
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
                        placeholder="Search products by name, P Number, or description..."
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
                        <TableHead>P Number</TableHead>
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

          {/* Map Tab */}
          <TabsContent value="map">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Real-Time Shop Location Map
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ShopMap shops={shops} />
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
                  <label className="text-sm font-medium">P Number</label>
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

      {/* Business Owner Details Dialog */}
      <Dialog open={!!selectedOwner} onOpenChange={() => setSelectedOwner(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Business Owner Details</DialogTitle>
          </DialogHeader>
          {selectedOwner && (
            <div className="space-y-6">
              {/* Owner Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Full Name</label>
                  <p className="text-sm text-muted-foreground">
                    {`${selectedOwner.profile?.first_name || ''} ${selectedOwner.profile?.last_name || ''}`.trim() || 'Unknown'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Company</label>
                  <p className="text-sm text-muted-foreground">{selectedOwner.profile?.company || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Phone</label>
                  <p className="text-sm text-muted-foreground">{selectedOwner.profile?.phone || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Website</label>
                  <p className="text-sm text-muted-foreground">{selectedOwner.profile?.website || 'N/A'}</p>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium">Address</label>
                  <p className="text-sm text-muted-foreground">{selectedOwner.profile?.address || 'N/A'}</p>
                </div>
                {selectedOwner.profile?.bio && (
                  <div className="col-span-2">
                    <label className="text-sm font-medium">Bio</label>
                    <p className="text-sm text-muted-foreground">{selectedOwner.profile.bio}</p>
                  </div>
                )}
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold">{selectedOwner.shops.length}</p>
                    <p className="text-sm text-muted-foreground">Total Shops</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold">{selectedOwner.totalProducts}</p>
                    <p className="text-sm text-muted-foreground">Total Products</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <p className="text-2xl font-bold">
                      {new Date(selectedOwner.firstShopDate).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-muted-foreground">Member Since</p>
                  </CardContent>
                </Card>
              </div>

              {/* Owned Shops */}
              <div>
                <label className="text-sm font-medium mb-2 block">Owned Shops</label>
                <div className="space-y-2">
                  {selectedOwner.shops.map((shop: any) => (
                    <div key={shop.id} className="p-3 border rounded-lg flex justify-between items-center">
                      <div>
                        <p className="font-medium">{shop.name}</p>
                        <p className="text-sm text-muted-foreground">{shop.industries?.name || 'No Industry'}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(shop.status)}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedOwner(null);
                            setSelectedShop(shop);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MinistryDashboard;
