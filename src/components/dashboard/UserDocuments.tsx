import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText, Upload, Download, Edit, Eye, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface UserDocument {
  id: string;
  shop_id?: string;
  document_type: string;
  document_name: string;
  file_url?: string;
  status: 'pending' | 'approved' | 'rejected' | 'needs_review';
  admin_notes?: string;
  uploaded_at: string;
  updated_at: string;
}

interface DocumentRequirement {
  id: string;
  document_type: string;
  document_name: string;
  description?: string;
  is_required: boolean;
}

const UserDocuments = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [documents, setDocuments] = useState<UserDocument[]>([]);
  const [requirements, setRequirements] = useState<DocumentRequirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchDocuments();
      fetchRequirements();
    }
  }, [user]);

  const fetchDocuments = async () => {
    if (!user) return;

    try {
      // Note: This would need to be adapted based on actual document storage structure
      // For now, we'll simulate with notifications that have document-related types
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .in('type', ['document_approved', 'document_rejected', 'document_review_needed'])
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching documents:', error);
        return;
      }

      // Transform notifications into document format for demo
      const mockDocuments: UserDocument[] = data?.map((notification, index) => ({
        id: notification.id,
        document_type: 'business_license',
        document_name: `Document ${index + 1}`,
        status: notification.type.includes('approved') ? 'approved' as const :
               notification.type.includes('rejected') ? 'rejected' as const :
               'needs_review' as const,
        admin_notes: notification.message,
        uploaded_at: notification.created_at,
        updated_at: notification.updated_at || notification.created_at
      })) || [];

      setDocuments(mockDocuments);
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  const fetchRequirements = async () => {
    try {
      const { data, error } = await supabase
        .from('shop_document_requirements')
        .select('*')
        .eq('is_required', true);

      if (error) {
        console.error('Error fetching requirements:', error);
        return;
      }

      setRequirements(data || []);
    } catch (error) {
      console.error('Error fetching requirements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (requirementId: string, file: File) => {
    if (!user || !file) return;

    setUploading(requirementId);
    try {
      // Simulate file upload (in real implementation, this would upload to Supabase Storage)
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast({
        title: 'Document Uploaded',
        description: 'Your document has been uploaded and is pending review.',
      });

      fetchDocuments(); // Refresh documents
    } catch (error) {
      console.error('Error uploading document:', error);
      toast({
        title: 'Upload Failed',
        description: 'Failed to upload document. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setUploading(null);
    }
  };

  const getStatusIcon = (status: UserDocument['status']) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'needs_review':
        return <Edit className="w-4 h-4 text-yellow-500" />;
      default:
        return <Clock className="w-4 h-4 text-blue-500" />;
    }
  };

  const getStatusBadge = (status: UserDocument['status']) => {
    switch (status) {
      case 'approved':
        return <Badge variant="default">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'needs_review':
        return <Badge variant="secondary">Needs Review</Badge>;
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
      {/* Document Requirements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Required Documents
          </CardTitle>
          <CardDescription>
            Upload the required documents for shop verification.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {requirements.map((requirement) => {
              const userDoc = documents.find(doc => doc.document_type === requirement.document_type);
              
              return (
                <div key={requirement.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{requirement.document_name}</h4>
                    {userDoc && getStatusIcon(userDoc.status)}
                  </div>
                  
                  {requirement.description && (
                    <p className="text-sm text-muted-foreground mb-3">
                      {requirement.description}
                    </p>
                  )}

                  {userDoc ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        {getStatusBadge(userDoc.status)}
                        <div className="flex gap-2">
                          {userDoc.file_url && (
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                          )}
                          {userDoc.status === 'needs_review' && (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <Edit className="w-4 h-4 mr-1" />
                                  Update
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Update Document</DialogTitle>
                                  <DialogDescription>
                                    Upload a new version of your document.
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  {userDoc.admin_notes && (
                                    <div className="bg-yellow-50 p-3 rounded-lg">
                                      <p className="text-sm font-medium text-yellow-800 mb-1">
                                        Admin Notes:
                                      </p>
                                      <p className="text-sm text-yellow-700">
                                        {userDoc.admin_notes}
                                      </p>
                                    </div>
                                  )}
                                  <div>
                                    <Label htmlFor={`file-${requirement.id}`}>
                                      Select new file
                                    </Label>
                                    <Input
                                      id={`file-${requirement.id}`}
                                      type="file"
                                      accept=".pdf,.jpg,.jpeg,.png"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          handleFileUpload(requirement.id, file);
                                        }
                                      }}
                                    />
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          )}
                        </div>
                      </div>
                      
                      {userDoc.admin_notes && userDoc.status === 'rejected' && (
                        <div className="bg-red-50 p-3 rounded-lg">
                          <p className="text-sm font-medium text-red-800 mb-1">
                            Rejection Reason:
                          </p>
                          <p className="text-sm text-red-700">
                            {userDoc.admin_notes}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label htmlFor={`file-upload-${requirement.id}`}>
                        Upload {requirement.document_name}
                      </Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id={`file-upload-${requirement.id}`}
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          disabled={uploading === requirement.id}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleFileUpload(requirement.id, file);
                            }
                          }}
                        />
                        {uploading === requirement.id && (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Uploaded Documents */}
      <Card>
        <CardHeader>
          <CardTitle>Document History</CardTitle>
          <CardDescription>
            View all your uploaded documents and their verification status.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No documents uploaded</h3>
              <p className="text-muted-foreground">
                Upload the required documents above to get started.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <h4 className="font-medium">{doc.document_name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Uploaded {new Date(doc.uploaded_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(doc.status)}
                    <div className="flex gap-2">
                      {doc.file_url && (
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserDocuments;