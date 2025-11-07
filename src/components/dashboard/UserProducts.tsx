import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, Plus, Edit, Eye, DollarSign, Building2, Trash2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  gallery_images?: any;
  status: 'pending' | 'active' | 'inactive';
  created_at: string;
  updated_at: string;
  product_type_id?: string;
  shop_id?: string;
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
  const [selectedProduct, setSelectedProduct] = useState<UserProduct | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<UserProduct | null>(null);

  useEffect(() => {
    if (user) {
      fetchUserProducts();
    }
  }, [user]);

  const fetchUserProducts = async () => {
    if (!user) return;

    try {
      // Fetch products that belong to shops owned by the current user
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_types (
            name,
            code
          ),
          shops!inner (
            name,
            id,
            user_id
          )
        `)
        .eq('shops.user_id', user.id) // Filter by shops owned by current user
        .order('created_at', { ascending: false });

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
      case 'active':
        return <Badge variant="default">Active</Badge>;
      case 'inactive':
        return <Badge variant="destructive">Inactive</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  const handleViewProduct = (product: UserProduct) => {
    setSelectedProduct(product);
    setIsViewModalOpen(true);
  };

  const handleEditProduct = (product: UserProduct) => {
    setSelectedProduct(product);
    setIsEditModalOpen(true);
  };

  const closeViewModal = () => {
    setSelectedProduct(null);
    setIsViewModalOpen(false);
  };

  const closeEditModal = () => {
    setSelectedProduct(null);
    setIsEditModalOpen(false);
    fetchUserProducts();
  };

  const handleDeleteProduct = (product: UserProduct) => {
    setProductToDelete(product);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productToDelete.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Product deleted successfully',
      });

      fetchUserProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete product',
        variant: 'destructive',
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setProductToDelete(null);
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
              <DialogContent className="max-w-2xl max-h-[90vh]">
                <DialogHeader>
                  <DialogTitle>Register New Product</DialogTitle>
                  <DialogDescription>
                    Add a new product to your catalog for review and approval.
                  </DialogDescription>
                </DialogHeader>
                <ScrollArea className="max-h-[calc(90vh-120px)]">
                  <ProductRegistrationForm />
                </ScrollArea>
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
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleViewProduct(product)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleEditProduct(product)}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleDeleteProduct(product)}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
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

      {/* View Product Details Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={closeViewModal}>
        <DialogContent className="max-w-3xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Product Details</DialogTitle>
            <DialogDescription>
              Complete information about {selectedProduct?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedProduct && (
            <ScrollArea className="max-h-[calc(90vh-120px)] pr-4">
              <div className="space-y-6">
                {/* Product Image */}
                <div className="aspect-video relative bg-muted rounded-lg overflow-hidden">
                  {selectedProduct.main_image_url ? (
                    <img 
                      src={selectedProduct.main_image_url} 
                      alt={selectedProduct.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-24 h-24 text-muted-foreground" />
                    </div>
                  )}
                  <div className="absolute top-4 right-4">
                    {getStatusBadge(selectedProduct.status)}
                  </div>
                </div>

                {/* Basic Information */}
                <div>
                  <h3 className="text-2xl font-bold mb-2">{selectedProduct.name}</h3>
                  <div className="flex items-center gap-4 text-muted-foreground">
                    {selectedProduct.product_type && (
                      <span>{selectedProduct.product_type.name}</span>
                    )}
                    {selectedProduct.sku && (
                      <span>SKU: {selectedProduct.sku}</span>
                    )}
                  </div>
                </div>

                {/* Price */}
                {selectedProduct.price && (
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-6 h-6 text-green-600" />
                    <span className="text-3xl font-bold text-green-600">
                      ${selectedProduct.price}
                    </span>
                  </div>
                )}

                {/* Description */}
                {selectedProduct.description && (
                  <div>
                    <h4 className="font-semibold mb-2">Description</h4>
                    <p className="text-muted-foreground">{selectedProduct.description}</p>
                  </div>
                )}

                {/* Shop Information */}
                {selectedProduct.shop && (
                  <div>
                    <h4 className="font-semibold mb-2">Shop</h4>
                    <div className="flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-muted-foreground" />
                      <span className="text-muted-foreground">{selectedProduct.shop.name}</span>
                    </div>
                  </div>
                )}

                {/* Gallery Images */}
                {selectedProduct.gallery_images && Array.isArray(selectedProduct.gallery_images) && selectedProduct.gallery_images.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">Gallery</h4>
                    <div className="grid grid-cols-3 gap-4">
                      {selectedProduct.gallery_images.map((img: string, idx: number) => (
                        <div key={idx} className="aspect-square bg-muted rounded-lg overflow-hidden">
                          <img 
                            src={img} 
                            alt={`Gallery ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Timestamps */}
                <div className="flex gap-4 text-sm text-muted-foreground pt-4 border-t">
                  <div>
                    <span className="font-medium">Created:</span> {new Date(selectedProduct.created_at).toLocaleString()}
                  </div>
                  <div>
                    <span className="font-medium">Updated:</span> {new Date(selectedProduct.updated_at).toLocaleString()}
                  </div>
                </div>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Product Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={closeEditModal}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>
              Update your product information
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[calc(90vh-120px)]">
            <ProductRegistrationForm 
              productId={selectedProduct?.id}
              initialData={selectedProduct ? {
                name: selectedProduct.name,
                description: selectedProduct.description || '',
                price: selectedProduct.price,
                sku: selectedProduct.sku || '',
                product_type_id: selectedProduct.product_type_id || '',
                shop_id: selectedProduct.shop_id || '',
                main_image_url: selectedProduct.main_image_url || '',
                gallery_images: selectedProduct.gallery_images
              } : undefined}
              onSuccess={closeEditModal}
            />
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{productToDelete?.name}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default UserProducts;