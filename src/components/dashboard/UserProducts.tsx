import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, Plus, Edit, Eye, DollarSign, Building2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import ProductRegistrationForm from '@/components/forms/ProductRegistrationForm';

interface UserProduct {
  id: string;
  name: string;
  description?: string;
  price?: number;
  sku?: string;
  main_image_url?: string;
  gallery_images?: string[];
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
  product_type?: {
    name: string;
    code: string;
  };
  shop?: {
    name: string;
    id: string;
  };
}

const UserProducts = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [products, setProducts] = useState<UserProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserProducts();
    }
  }, [user]);

  const fetchUserProducts = async () => {
    if (!user) return;

    try {
      // Note: In a real implementation, there would be a user_id field to filter by
      // For now, we'll fetch all products as a demo
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_types (
            name,
            code
          ),
          shops (
            name,
            id
          )
        `)
        .order('created_at', { ascending: false })
        .limit(10); // Limit for demo purposes

      if (error) {
        console.error('Error fetching products:', error);
        return;
      }

      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: UserProduct['status']) => {
    switch (status) {
      case 'approved':
        return <Badge variant="default">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Your Products
              </CardTitle>
              <CardDescription>
                Manage your product listings and their approval status.
              </CardDescription>
            </div>
            <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Product
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Register New Product</DialogTitle>
                  <DialogDescription>
                    Add a new product to your catalog for review and approval.
                  </DialogDescription>
                </DialogHeader>
                <ProductRegistrationForm 
                  onSuccess={() => {
                    setShowCreateForm(false);
                    fetchUserProducts();
                    toast({
                      title: 'Product Added',
                      description: 'Your product has been submitted for review.',
                    });
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No products listed</h3>
              <p className="text-muted-foreground mb-4">
                Add your first product to start building your catalog.
              </p>
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Product
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <Card key={product.id} className="relative overflow-hidden">
                  <div className="aspect-square relative bg-muted">
                    {product.main_image_url ? (
                      <img 
                        src={product.main_image_url} 
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-16 h-16 text-muted-foreground" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      {getStatusBadge(product.status)}
                    </div>
                  </div>
                  
                  <CardHeader className="pb-2">
                    <div className="space-y-1">
                      <h3 className="font-semibold text-lg leading-tight">
                        {product.name}
                      </h3>
                      {product.product_type && (
                        <p className="text-sm text-muted-foreground">
                          {product.product_type.name}
                        </p>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    {product.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {product.description}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between">
                      {product.price && (
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4 text-green-600" />
                          <span className="font-semibold text-green-600">
                            ${product.price}
                          </span>
                        </div>
                      )}
                      
                      {product.sku && (
                        <span className="text-xs text-muted-foreground">
                          SKU: {product.sku}
                        </span>
                      )}
                    </div>

                    {product.shop && (
                      <div className="flex items-center gap-2 text-sm">
                        <Building2 className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{product.shop.name}</span>
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                    </div>

                    <div className="text-xs text-muted-foreground pt-2 border-t">
                      Listed: {new Date(product.created_at).toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserProducts;