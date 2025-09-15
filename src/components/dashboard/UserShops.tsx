import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, Plus, Edit, Eye, MapPin, Phone, Mail, Globe } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import ShopRegistrationForm from '@/components/forms/ShopRegistrationForm';

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

  useEffect(() => {
    if (user) {
      fetchUserShops();
    }
  }, [user]);

  const fetchUserShops = async () => {
    if (!user) return;

    try {
      // Note: In a real implementation, there would be a user_id field in shops table
      // For now, we'll fetch all shops as a demo
      const { data, error } = await supabase
        .from('shops')
        .select(`
          *,
          industries (
            name,
            code
          )
        `)
        .order('created_at', { ascending: false })
        .limit(5); // Limit for demo purposes

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
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Register New Shop</DialogTitle>
                  <DialogDescription>
                    Fill in your shop details to get started with the verification process.
                  </DialogDescription>
                </DialogHeader>
                <ShopRegistrationForm />
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
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="w-4 h-4 mr-1" />
                        View Details
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Edit className="w-4 h-4 mr-1" />
                        Edit Shop
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
    </div>
  );
};

export default UserShops;