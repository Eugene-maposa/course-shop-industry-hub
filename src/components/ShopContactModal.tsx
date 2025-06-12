
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Phone, Mail, Globe, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ShopContactModalProps {
  shop: any;
  isOpen: boolean;
  onClose: () => void;
}

const ShopContactModal = ({ shop, isOpen, onClose }: ShopContactModalProps) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create mailto link
    const subject = encodeURIComponent(formData.subject);
    const body = encodeURIComponent(
      `Dear ${shop?.name} Team,\n\n${formData.message}\n\nBest regards,\n${formData.name}\n${formData.email}`
    );
    
    if (shop?.email) {
      window.open(`mailto:${shop.email}?subject=${subject}&body=${body}`);
      toast({
        title: "Email Client Opened",
        description: "Your default email client should open with the pre-filled message."
      });
    } else {
      toast({
        title: "No Email Available",
        description: "This shop hasn't provided an email address.",
        variant: "destructive"
      });
    }
    
    onClose();
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  const handlePhoneCall = () => {
    if (shop?.phone) {
      window.open(`tel:${shop.phone}`);
    } else {
      toast({
        title: "No Phone Available",
        description: "This shop hasn't provided a phone number.",
        variant: "destructive"
      });
    }
  };

  const handleWebsiteVisit = () => {
    if (shop?.website) {
      const url = shop.website.startsWith('http') ? shop.website : `https://${shop.website}`;
      window.open(url, '_blank');
    } else {
      toast({
        title: "No Website Available",
        description: "This shop hasn't provided a website.",
        variant: "destructive"
      });
    }
  };

  if (!shop) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Contact {shop.name}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Shop Contact Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold mb-3">Shop Information</h3>
            <div className="space-y-2">
              {shop.address && (
                <div className="flex items-center text-sm">
                  <MapPin className="w-4 h-4 mr-2 text-muted-foreground" />
                  <span>{shop.address}</span>
                </div>
              )}
              
              {shop.phone && (
                <div className="flex items-center text-sm">
                  <Phone className="w-4 h-4 mr-2 text-muted-foreground" />
                  <span>{shop.phone}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    className="ml-2 h-6 px-2 text-xs"
                    onClick={handlePhoneCall}
                  >
                    Call
                  </Button>
                </div>
              )}
              
              {shop.email && (
                <div className="flex items-center text-sm">
                  <Mail className="w-4 h-4 mr-2 text-muted-foreground" />
                  <span>{shop.email}</span>
                </div>
              )}
              
              {shop.website && (
                <div className="flex items-center text-sm">
                  <Globe className="w-4 h-4 mr-2 text-muted-foreground" />
                  <span>{shop.website}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    className="ml-2 h-6 px-2 text-xs"
                    onClick={handleWebsiteVisit}
                  >
                    Visit
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Contact Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Your Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                  placeholder="Enter your name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Your Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                  placeholder="Enter your email"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="subject">Subject *</Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                required
                placeholder="Enter message subject"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="message">Message *</Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                required
                placeholder="Enter your message"
                rows={4}
              />
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1">
                Send Email
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShopContactModal;
