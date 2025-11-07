import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, Plus, Edit, Eye, MapPin, Phone, Mail, Globe, FileText, Trash2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import ShopRegistrationForm from '@/components/forms/ShopRegistrationForm';
import DocumentUpdateModal from '@/components/DocumentUpdateModal';

interface UserShop {
  id: string;
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  icon_url?: string;
  status: 'pending' | 'active' | 'inactive';
  document_verification_status: string;
  verification_notes?: string;
  created_at: string;
  updated_at: string;
  industry_id?: string;
  industry?: {
    name: string;
    code: string;
  };
}

const UserShops = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [shops, setShops] = useState<UserShop[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedShop, setSelectedShop] = useState<UserShop | null>(null);
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [shopToDelete, setShopToDelete] = useState<UserShop | null>(null);

  useEffect(() => {
    if (user) {
      fetchUserShops();
    }
  }, [user]);

  const fetchUserShops = async () => {
    if (!user) return;

    try {
      // Fetch shops owned by the current user
      const { data, error } = await supabase
        .from('shops')
        .select(`
          *,
          industries (
            name,
            code
          )
        `)
        .eq('user_id', user.id) // Filter by current user
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching shops:', error);
        return;
      }

      setShops(data || []);
    } catch (error) {
      console.error('Error fetching shops:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: UserShop['status']) => {
    switch (status) {
      case 'active':
        return <Badge variant="default">Active</Badge>;
      case 'inactive':
        return <Badge variant="destructive">Inactive</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  const getDocumentStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="default" className="text-xs">Docs Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="text-xs">Docs Rejected</Badge>;
      case 'needs_review':
        return <Badge variant="secondary" className="text-xs">Docs Need Review</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">Docs Pending</Badge>;
    }
  };

  const handleUpdateDocuments = (shop: UserShop) => {
    setSelectedShop(shop);
    setIsDocumentModalOpen(true);
  };

  const closeDocumentModal = () => {
    setSelectedShop(null);
    setIsDocumentModalOpen(false);
    // Refresh shops to show updated status
    fetchUserShops();
  };

  const handleViewDetails = (shop: UserShop) => {
    setSelectedShop(shop);
    setIsViewModalOpen(true);
  };

  const handleEditShop = (shop: UserShop) => {
    setSelectedShop(shop);
    setIsEditModalOpen(true);
  };

  const closeViewModal = () => {
    setSelectedShop(null);
    setIsViewModalOpen(false);
  };

  const closeEditModal = () => {
    setSelectedShop(null);
    setIsEditModalOpen(false);
    fetchUserShops();
  };

  const handleDeleteShop = (shop: UserShop) => {
    setShopToDelete(shop);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!shopToDelete) return;

    try {
      const { error } = await supabase
        .from('shops')
        .delete()
        .eq('id', shopToDelete.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Shop deleted successfully',
      });

      fetchUserShops();
    } catch (error) {
      console.error('Error deleting shop:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete shop',
        variant: 'destructive',
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setShopToDelete(null);
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
                <Building2 className="w-5 h-5" />
                Your Shops
              </CardTitle>
              <CardDescription>
                Manage your business shops and their verification status.
              </CardDescription>
            </div>
            <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Register New Shop
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh]">
                <DialogHeader>
                  <DialogTitle>Register New Shop</DialogTitle>
                  <DialogDescription>
                    Fill in your shop details to get started with the verification process.
                  </DialogDescription>
                </DialogHeader>
                <ScrollArea className="max-h-[calc(90vh-120px)]">
                  <ShopRegistrationForm />
                </ScrollArea>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {shops.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No shops registered</h3>
              <p className="text-muted-foreground mb-4">
                Register your first shop to start selling products.
              </p>
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Register Your First Shop
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {shops.map((shop) => (
                <Card key={shop.id} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        {shop.icon_url ? (
                          <img 
                            src={shop.icon_url} 
                            alt={shop.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                            <Building2 className="w-6 h-6 text-primary" />
                          </div>
                        )}
                        <div>
                          <h3 className="font-semibold">{shop.name}</h3>
                          {shop.industry && (
                            <p className="text-sm text-muted-foreground">
                              {shop.industry.name}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-1 items-end">
                        {getStatusBadge(shop.status)}
                        {getDocumentStatusBadge(shop.document_verification_status)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {shop.description && (
                      <p className="text-sm text-muted-foreground">
                        {shop.description}
                      </p>
                    )}
                    
                    <div className="space-y-2">
                      {shop.address && (
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">{shop.address}</span>
                        </div>
                      )}
                      
                      {shop.phone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">{shop.phone}</span>
                        </div>
                      )}
                      
                      {shop.email && (
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">{shop.email}</span>
                        </div>
                      )}
                      
                      {shop.website && (
                        <div className="flex items-center gap-2 text-sm">
                          <Globe className="w-4 h-4 text-muted-foreground" />
                          <a 
                            href={shop.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            Visit Website
                          </a>
                        </div>
                      )}
                    </div>

                    {shop.verification_notes && shop.status === 'inactive' && (
                      <div className="bg-red-50 p-3 rounded-lg">
                        <p className="text-sm font-medium text-red-800 mb-1">
                          Rejection Reason:
                        </p>
                        <p className="text-sm text-red-700">
                          {shop.verification_notes}
                        </p>
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleViewDetails(shop)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleEditShop(shop)}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleDeleteShop(shop)}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    </div>

                    {/* Document Update Button */}
                    <div className="pt-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={() => handleUpdateDocuments(shop)}
                      >
                        <FileText className="w-4 h-4 mr-1" />
                        Update Documents
                      </Button>
                    </div>

                    <div className="text-xs text-muted-foreground pt-2 border-t">
                      Registered: {new Date(shop.created_at).toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Document Update Modal */}
      <DocumentUpdateModal
        shop={selectedShop}
        isOpen={isDocumentModalOpen}
        onClose={closeDocumentModal}
      />

      {/* View Shop Details Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={closeViewModal}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Shop Details</DialogTitle>
            <DialogDescription>
              Complete information about {selectedShop?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedShop && (
            <ScrollArea className="max-h-[calc(90vh-120px)] pr-4">
              <div className="space-y-6">
                {/* Shop Icon and Basic Info */}
                <div className="flex items-center gap-4">
                  {selectedShop.icon_url ? (
                    <img 
                      src={selectedShop.icon_url} 
                      alt={selectedShop.name}
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Building2 className="w-10 h-10 text-primary" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold">{selectedShop.name}</h3>
                    {selectedShop.industry && (
                      <p className="text-muted-foreground">{selectedShop.industry.name}</p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    {getStatusBadge(selectedShop.status)}
                    {getDocumentStatusBadge(selectedShop.document_verification_status)}
                  </div>
                </div>

                {/* Description */}
                {selectedShop.description && (
                  <div>
                    <h4 className="font-semibold mb-2">Description</h4>
                    <p className="text-muted-foreground">{selectedShop.description}</p>
                  </div>
                )}

                {/* Contact Information */}
                <div>
                  <h4 className="font-semibold mb-3">Contact Information</h4>
                  <div className="space-y-3">
                    {selectedShop.address && (
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="font-medium text-sm">Address</p>
                          <p className="text-muted-foreground">{selectedShop.address}</p>
                        </div>
                      </div>
                    )}
                    {selectedShop.phone && (
                      <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-sm">Phone</p>
                          <p className="text-muted-foreground">{selectedShop.phone}</p>
                        </div>
                      </div>
                    )}
                    {selectedShop.email && (
                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-sm">Email</p>
                          <p className="text-muted-foreground">{selectedShop.email}</p>
                        </div>
                      </div>
                    )}
                    {selectedShop.website && (
                      <div className="flex items-center gap-3">
                        <Globe className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-sm">Website</p>
                          <a 
                            href={selectedShop.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            {selectedShop.website}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Verification Notes */}
                {selectedShop.verification_notes && (
                  <div>
                    <h4 className="font-semibold mb-2">Verification Notes</h4>
                    <div className="bg-muted p-3 rounded-lg">
                      <p className="text-sm">{selectedShop.verification_notes}</p>
                    </div>
                  </div>
                )}

                {/* Timestamps */}
                <div className="flex gap-4 text-sm text-muted-foreground pt-4 border-t">
                  <div>
                    <span className="font-medium">Created:</span> {new Date(selectedShop.created_at).toLocaleString()}
                  </div>
                  <div>
                    <span className="font-medium">Updated:</span> {new Date(selectedShop.updated_at).toLocaleString()}
                  </div>
                </div>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Shop Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={closeEditModal}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Edit Shop</DialogTitle>
            <DialogDescription>
              Update your shop information
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[calc(90vh-120px)]">
            <ShopRegistrationForm 
              shopId={selectedShop?.id}
              initialData={selectedShop ? {
                name: selectedShop.name,
                description: selectedShop.description || '',
                address: selectedShop.address || '',
                phone: selectedShop.phone || '',
                email: selectedShop.email || '',
                website: selectedShop.website || '',
                industry_id: selectedShop.industry_id || '',
                icon_url: selectedShop.icon_url || ''
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
              This will permanently delete "{shopToDelete?.name}". This action cannot be undone.
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

export default UserShops;