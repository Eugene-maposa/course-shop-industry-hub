import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  FileText, 
  Download, 
  Check, 
  X, 
  Eye, 
  Clock, 
  AlertTriangle,
  Search,
  Filter,
  ExternalLink
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNotifications } from "@/hooks/useNotifications";

interface ShopWithDocuments {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  document_verification_status: string;
  verification_notes: string;
  documents: any; // JSON type from Supabase
  created_at: string;
  industry: { name: string; code: string } | null;
}

export const ShopDocumentManagement = () => {
  const { toast } = useToast();
  const { createNotification } = useNotifications();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedShop, setSelectedShop] = useState<ShopWithDocuments | null>(null);
  const [verificationNotes, setVerificationNotes] = useState("");
  const [isDocumentViewerOpen, setIsDocumentViewerOpen] = useState(false);
  const [currentDocumentUrl, setCurrentDocumentUrl] = useState("");
  const [currentDocumentType, setCurrentDocumentType] = useState("");

  // Fetch shops with documents
  const { data: shops = [], isLoading } = useQuery({
    queryKey: ['shops-with-documents', searchTerm, statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('shops')
        .select(`
          id,
          name,
          email,
          phone,
          status,
          document_verification_status,
          verification_notes,
          documents,
          created_at,
          industry:industries(name, code)
        `)
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
      }

      if (statusFilter !== 'all') {
        query = query.eq('document_verification_status', statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      // Filter shops that have documents
      return (data || []).filter(shop => 
        shop.documents && typeof shop.documents === 'object' && Object.keys(shop.documents).length > 0
      );
    },
    refetchInterval: 30000 // Auto-refresh every 30 seconds
  });

  // Update verification status mutation
  const updateVerificationMutation = useMutation({
    mutationFn: async ({ 
      shopId, 
      status, 
      notes 
    }: { 
      shopId: string; 
      status: 'approved' | 'rejected' | 'requires_review'; 
      notes: string; 
    }) => {
      const updateData: any = {
        document_verification_status: status,
        verification_notes: notes,
        updated_at: new Date().toISOString()
      };

      if (status === 'approved') {
        updateData.verified_at = new Date().toISOString();
        updateData.status = 'active'; // Automatically activate approved shops
      }

      const { data, error } = await supabase
        .from('shops')
        .update(updateData)
        .eq('id', shopId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: async (data, variables) => {
      toast({
        title: "Success",
        description: `Shop documents ${variables.status === 'approved' ? 'approved' : variables.status === 'rejected' ? 'rejected' : 'marked for review'} successfully!`
      });

      // Create notification for shop owner
      if (selectedShop) {
        const notificationTitle = variables.status === 'approved' 
          ? `Shop Documents Approved - ${selectedShop.name}`
          : variables.status === 'rejected'
          ? `Shop Documents Rejected - ${selectedShop.name}`
          : `Shop Documents Need Review - ${selectedShop.name}`;
          
        const notificationMessage = variables.status === 'approved'
          ? `Congratulations! Your shop "${selectedShop.name}" documents have been approved. Your shop is now active.`
          : variables.status === 'rejected'
          ? `Your shop "${selectedShop.name}" documents have been rejected. Please review the feedback and resubmit. Notes: ${variables.notes}`
          : `Your shop "${selectedShop.name}" documents require additional review. Please check the notes and provide additional information if needed. Notes: ${variables.notes}`;

        // For now, we'll use a placeholder user ID since we don't have user-shop relationship
        // In a real system, you'd fetch the user ID from the shop record
        const notificationType = variables.status === 'approved' 
          ? 'document_approved' 
          : variables.status === 'rejected'
          ? 'document_rejected'
          : 'document_review_needed';

        // Note: This would need the actual shop owner's user ID in a real implementation
        console.log('Would create notification:', {
          title: notificationTitle,
          message: notificationMessage,
          type: notificationType
        });
      }

      queryClient.invalidateQueries({ queryKey: ['shops-with-documents'] });
      setSelectedShop(null);
      setVerificationNotes("");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update verification status.",
        variant: "destructive"
      });
      console.error("Verification update error:", error);
    }
  });

  const getVerificationStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500 text-white">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500 text-white">Rejected</Badge>;
      case 'requires_review':
        return <Badge className="bg-yellow-500 text-white">Needs Review</Badge>;
      case 'pending':
      default:
        return <Badge className="bg-blue-500 text-white">Pending</Badge>;
    }
  };

  const getShopStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500 text-white">Active</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-500 text-white">Inactive</Badge>;
      case 'pending':
      default:
        return <Badge className="bg-blue-500 text-white">Pending</Badge>;
    }
  };

  const viewDocument = (url: string, type: string) => {
    setCurrentDocumentUrl(url);
    setCurrentDocumentType(type);
    setIsDocumentViewerOpen(true);
  };

  const downloadDocument = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleVerificationAction = (action: 'approve' | 'reject' | 'review') => {
    if (!selectedShop) return;
    
    const status = action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'requires_review';
    updateVerificationMutation.mutate({
      shopId: selectedShop.id,
      status,
      notes: verificationNotes
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
            <FileText className="w-6 h-6" />
            <span>Shop Document Management</span>
          </h2>
          <p className="text-slate-400">Review and verify shop registration documents</p>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Search by shop name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="requires_review">Needs Review</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shops Table */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Shops with Documents ({shops.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
              <p className="text-slate-400 mt-2">Loading shops...</p>
            </div>
          ) : shops.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-400">No shops with documents found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-slate-300">Shop Name</TableHead>
                  <TableHead className="text-slate-300">Industry</TableHead>
                  <TableHead className="text-slate-300">Contact</TableHead>
                  <TableHead className="text-slate-300">Documents</TableHead>
                  <TableHead className="text-slate-300">Verification</TableHead>
                  <TableHead className="text-slate-300">Status</TableHead>
                  <TableHead className="text-slate-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shops.map((shop) => (
                  <TableRow key={shop.id}>
                    <TableCell className="text-white">
                      <div>
                        <p className="font-medium">{shop.name}</p>
                        <p className="text-sm text-slate-400">
                          Registered: {new Date(shop.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-300">
                      {shop.industry ? (
                        <div>
                          <p>{shop.industry.name}</p>
                          <p className="text-sm text-slate-400">({shop.industry.code})</p>
                        </div>
                      ) : (
                        <span className="text-slate-400">Not specified</span>
                      )}
                    </TableCell>
                    <TableCell className="text-slate-300">
                      <div>
                        <p className="text-sm">{shop.email}</p>
                        <p className="text-sm text-slate-400">{shop.phone}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-blue-400" />
                        <span className="text-white">
                          {Object.keys(shop.documents as Record<string, string>).length} files
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getVerificationStatusBadge(shop.document_verification_status)}
                    </TableCell>
                    <TableCell>
                      {getShopStatusBadge(shop.status)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setSelectedShop(shop);
                                setVerificationNotes(shop.verification_notes || "");
                              }}
                              className="border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-slate-800 border-slate-700 max-w-4xl">
                            <DialogHeader>
                              <DialogTitle className="text-white">
                                Review Documents - {selectedShop?.name}
                              </DialogTitle>
                            </DialogHeader>
                            
                            {selectedShop && (
                              <div className="space-y-6">
                                {/* Shop Info */}
                                <div className="bg-slate-700 rounded-lg p-4">
                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <span className="text-slate-400">Industry:</span>
                                      <span className="text-white ml-2">
                                        {selectedShop.industry?.name || 'Not specified'}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-slate-400">Email:</span>
                                      <span className="text-white ml-2">{selectedShop.email}</span>
                                    </div>
                                    <div>
                                      <span className="text-slate-400">Phone:</span>
                                      <span className="text-white ml-2">{selectedShop.phone}</span>
                                    </div>
                                    <div>
                                      <span className="text-slate-400">Current Status:</span>
                                      <span className="ml-2">
                                        {getVerificationStatusBadge(selectedShop.document_verification_status)}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Documents */}
                                <div>
                                  <h4 className="text-white font-medium mb-3">Submitted Documents</h4>
                                  <div className="space-y-2">
                                    {Object.entries(selectedShop.documents as Record<string, string>).map(([docType, url]) => (
                                      <div key={docType} className="flex items-center justify-between bg-slate-700 rounded-lg p-3">
                                        <div className="flex items-center space-x-3">
                                          <FileText className="w-5 h-5 text-blue-400" />
                                          <div>
                                            <p className="text-white font-medium capitalize">
                                              {docType.replace(/_/g, ' ')}
                                            </p>
                                            <p className="text-slate-400 text-sm">
                                              {url.includes('.pdf') ? 'PDF Document' : 'Image File'}
                                            </p>
                                          </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => viewDocument(url, docType)}
                                            className="border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white"
                                          >
                                            <Eye className="w-4 h-4 mr-1" />
                                            View
                                          </Button>
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => downloadDocument(url, `${selectedShop.name}_${docType}`)}
                                            className="border-green-600 text-green-400 hover:bg-green-600 hover:text-white"
                                          >
                                            <Download className="w-4 h-4 mr-1" />
                                            Download
                                          </Button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Verification Notes */}
                                <div>
                                  <Label htmlFor="notes" className="text-white">
                                    Verification Notes
                                  </Label>
                                  <Textarea
                                    id="notes"
                                    value={verificationNotes}
                                    onChange={(e) => setVerificationNotes(e.target.value)}
                                    placeholder="Add notes about the verification process..."
                                    className="bg-slate-700 border-slate-600 text-white mt-2"
                                    rows={3}
                                  />
                                </div>

                                {/* Action Buttons */}
                                <div className="flex justify-end space-x-3 pt-4 border-t border-slate-600">
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button 
                                        variant="outline"
                                        className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                                      >
                                        <X className="w-4 h-4 mr-2" />
                                        Reject
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent className="bg-slate-800 border-slate-700">
                                      <AlertDialogHeader>
                                        <AlertDialogTitle className="text-white">Reject Documents</AlertDialogTitle>
                                        <AlertDialogDescription className="text-slate-300">
                                          Are you sure you want to reject these documents? The shop will be notified.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel className="bg-slate-700 text-white hover:bg-slate-600">
                                          Cancel
                                        </AlertDialogCancel>
                                        <AlertDialogAction 
                                          onClick={() => handleVerificationAction('reject')}
                                          className="bg-red-600 hover:bg-red-700"
                                        >
                                          Reject Documents
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>

                                  <Button 
                                    variant="outline"
                                    onClick={() => handleVerificationAction('review')}
                                    className="border-yellow-600 text-yellow-400 hover:bg-yellow-600 hover:text-white"
                                  >
                                    <AlertTriangle className="w-4 h-4 mr-2" />
                                    Needs Review
                                  </Button>

                                  <Button 
                                    onClick={() => handleVerificationAction('approve')}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    <Check className="w-4 h-4 mr-2" />
                                    Approve Documents
                                  </Button>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Document Viewer Modal */}
      <Dialog open={isDocumentViewerOpen} onOpenChange={setIsDocumentViewerOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>Document: {currentDocumentType.replace(/_/g, ' ')}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(currentDocumentUrl, '_blank')}
                className="ml-auto border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white"
              >
                <ExternalLink className="w-4 h-4 mr-1" />
                Open in New Tab
              </Button>
            </DialogTitle>
          </DialogHeader>
          <div className="h-[70vh] overflow-hidden">
            {currentDocumentUrl.includes('.pdf') ? (
              <iframe
                src={currentDocumentUrl}
                className="w-full h-full border-0"
                title="Document Viewer"
              />
            ) : (
              <img
                src={currentDocumentUrl}
                alt="Document"
                className="w-full h-full object-contain"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};