import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Upload, FileText, CheckCircle, X, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import DocumentUpload from './DocumentUpload';

interface UserShop {
  id: string;
  name: string;
  user_id?: string;
  document_verification_status?: string;
}

interface DocumentRequirement {
  id: string;
  document_type: string;
  document_name: string;
  is_required: boolean;
  description: string;
}

interface DocumentUpdateModalProps {
  shop: UserShop | null;
  isOpen: boolean;
  onClose: () => void;
}

const DocumentUpdateModal: React.FC<DocumentUpdateModalProps> = ({
  shop,
  isOpen,
  onClose
}) => {
  const [documents, setDocuments] = useState<Record<string, File>>({});
  const [documentProgress, setDocumentProgress] = useState(0);
  const [documentRequirements, setDocumentRequirements] = useState<DocumentRequirement[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (isOpen && shop) {
      fetchDocumentRequirements();
    }
  }, [isOpen, shop]);

  const fetchDocumentRequirements = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('shop_document_requirements')
        .select('*')
        .eq('country_code', 'ZW')
        .order('is_required', { ascending: false })
        .order('document_name');

      if (error) {
        console.error('Error fetching document requirements:', error);
        return;
      }

      setDocumentRequirements(data || []);
    } catch (error) {
      console.error('Error fetching document requirements:', error);
    } finally {
      setLoading(false);
    }
  };

  const uploadDocumentsToStorage = async (documents: Record<string, File>) => {
    const documentUrls: Record<string, string> = {};
    
    for (const [docType, file] of Object.entries(documents)) {
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${docType}_${shop?.id}_${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('shop-documents')
          .upload(`shops/${shop?.id}/${fileName}`, file, {
            cacheControl: '3600',
            upsert: true
          });
          
        if (uploadError) {
          console.error(`Document upload error for ${docType}:`, uploadError);
          throw new Error(`Failed to upload ${docType}`);
        }
        
        const { data: { publicUrl } } = supabase.storage
          .from('shop-documents')
          .getPublicUrl(`shops/${shop?.id}/${fileName}`);
          
        documentUrls[docType] = publicUrl;
      } catch (error) {
        console.error(`Error uploading document ${docType}:`, error);
        throw error;
      }
    }
    
    return documentUrls;
  };

  const handleDocumentUpdate = async () => {
    if (!shop || !user || Object.keys(documents).length === 0) {
      toast({
        title: 'No Documents',
        description: 'Please upload at least one document to update.',
        variant: 'destructive'
      });
      return;
    }

    setIsUploading(true);
    try {
      // Upload documents to storage
      const documentUrls = await uploadDocumentsToStorage(documents);

      // Update shop documents in database
      const { error: updateError } = await supabase
        .from('shops')
        .update({
          documents: documentUrls,
          document_verification_status: 'pending',
          updated_at: new Date().toISOString()
        })
        .eq('id', shop.id);

      if (updateError) {
        throw updateError;
      }

      // Mark any previous document-related notifications as read
      const { data: existingNotifications } = await supabase
        .from('notifications')
        .select('id')
        .eq('user_id', user.id)
        .eq('type', 'document_review_needed')
        .eq('read', false);

      if (existingNotifications && existingNotifications.length > 0) {
        const notificationIds = existingNotifications.map(n => n.id);
        await supabase
          .from('notifications')
          .update({ read: true })
          .in('id', notificationIds);
      }

      // Notify admins about document update
      const { data: adminUsers } = await supabase
        .from('admin_users')
        .select('user_id')
        .eq('is_active', true);

      if (adminUsers && adminUsers.length > 0) {
        const adminNotifications = adminUsers.map(admin => ({
          user_id: admin.user_id,
          title: 'Shop Documents Updated',
          message: `Shop "${shop.name}" has uploaded updated documents for review.`,
          type: 'document_update',
          related_entity_type: 'shop',
          related_entity_id: shop.id
        }));

        await supabase
          .from('notifications')
          .insert(adminNotifications);

        // Send email notifications to admins
        for (const admin of adminUsers) {
          try {
            await supabase.functions.invoke('send-notification-email', {
              body: {
                user_id: admin.user_id,
                title: 'Shop Documents Updated',
                message: `Shop "${shop.name}" has uploaded updated documents that require your review.`,
                type: 'document_update'
              }
            });
          } catch (emailError) {
            console.warn('Failed to send email to admin:', emailError);
          }
        }
      }

      toast({
        title: 'Documents Updated',
        description: 'Your documents have been updated successfully and are pending admin review.',
      });

      // Reset state and close modal
      setDocuments({});
      setDocumentProgress(0);
      onClose();

    } catch (error) {
      console.error('Error updating documents:', error);
      toast({
        title: 'Update Failed',
        description: 'Failed to update documents. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDocumentsChange = (newDocuments: Record<string, File>) => {
    setDocuments(newDocuments);
  };

  const handleProgressChange = (progress: number) => {
    setDocumentProgress(progress);
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'pending':
      default:
        return <Badge variant="secondary">Pending Review</Badge>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Update Documents - {shop?.name}
          </DialogTitle>
          <DialogDescription>
            Upload new or updated documents for your shop. Current status: {getStatusBadge(shop?.document_verification_status)}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-180px)]">
          <div className="space-y-6 p-1">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-muted-foreground">Loading document requirements...</p>
              </div>
            ) : (
              <>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-800 mb-1">
                        Document Update Information
                      </p>
                      <p className="text-xs text-blue-700">
                        Upload new documents to replace existing ones or add missing documents.
                        All uploads will reset your verification status to "Pending Review".
                      </p>
                    </div>
                  </div>
                </div>

                <DocumentUpload
                  requirements={documentRequirements}
                  onDocumentsChange={handleDocumentsChange}
                  onProgressChange={handleProgressChange}
                />
              </>
            )}
          </div>
        </ScrollArea>

        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            {Object.keys(documents).length} document(s) ready to upload
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDocumentUpdate}
              disabled={Object.keys(documents).length === 0 || isUploading}
            >
              {isUploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Update Documents
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentUpdateModal;