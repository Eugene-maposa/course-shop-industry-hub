import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Package, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  Camera, 
  Upload,
  User,
  Building2,
  DollarSign,
  X
} from "lucide-react";

interface ProductRegistrationGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProductRegistrationGuide = ({ isOpen, onClose }: ProductRegistrationGuideProps) => {
  const [activeTab, setActiveTab] = useState("steps");

  if (!isOpen) return null;

  const registrationSteps = [
    {
      step: 1,
      title: "Prepare Your Product Information",
      description: "Gather all necessary details about your product",
      items: [
        "Product name and description",
        "Category and subcategory",
        "Price and pricing structure",
        "Manufacturing details",
        "Quality certifications (if any)"
      ]
    },
    {
      step: 2,
      title: "Prepare Visual Materials",
      description: "High-quality images are crucial for product success",
      items: [
        "Take clear, well-lit product photos",
        "Include multiple angles (front, back, sides)",
        "Show product in use or context",
        "Ensure images are at least 800x600 pixels",
        "Use proper lighting and clean backgrounds"
      ]
    },
    {
      step: 3,
      title: "Create Your Account",
      description: "Register for a ProductHub account if you haven't already",
      items: [
        "Click 'Login / Sign Up' button",
        "Provide valid email address",
        "Create a secure password",
        "Verify your email address",
        "Complete your profile information"
      ]
    },
    {
      step: 4,
      title: "Register Your Shop (Optional)",
      description: "Create a shop profile to group your products",
      items: [
        "Click 'Register Shop' button",
        "Enter shop name and description",
        "Add shop location and contact details",
        "Upload shop logo or banner",
        "Set shop policies and terms"
      ]
    },
    {
      step: 5,
      title: "Submit Product Registration",
      description: "Fill out the product registration form",
      items: [
        "Click 'Register New Product' button",
        "Complete all required fields",
        "Upload product images",
        "Set pricing and availability",
        "Review and submit your application"
      ]
    },
    {
      step: 6,
      title: "Wait for Approval",
      description: "Your product will be reviewed before going live",
      items: [
        "Typical review time: 1-3 business days",
        "You'll receive email notifications",
        "Check your dashboard for status updates",
        "Respond promptly to any review requests",
        "Product goes live after approval"
      ]
    }
  ];

  const tips = [
    {
      icon: <Camera className="w-5 h-5" />,
      title: "High-Quality Images",
      description: "Use well-lit, high-resolution photos with clean backgrounds. Show your product from multiple angles."
    },
    {
      icon: <FileText className="w-5 h-5" />,
      title: "Detailed Descriptions",
      description: "Provide comprehensive product descriptions including dimensions, materials, and key features."
    },
    {
      icon: <DollarSign className="w-5 h-5" />,
      title: "Competitive Pricing",
      description: "Research market prices and set competitive rates. Consider your costs and desired profit margins."
    },
    {
      icon: <Building2 className="w-5 h-5" />,
      title: "Complete Business Info",
      description: "Ensure your shop and business information is complete and professional."
    },
    {
      icon: <CheckCircle className="w-5 h-5" />,
      title: "Quality Certifications",
      description: "Include any quality certifications, standards compliance, or awards your product has received."
    },
    {
      icon: <User className="w-5 h-5" />,
      title: "Customer Focus",
      description: "Write descriptions from the customer's perspective. Highlight benefits, not just features."
    }
  ];

  const requirements = [
    {
      category: "Business Requirements",
      items: [
        "Valid business registration (if applicable)",
        "Tax identification number",
        "Contact information and address",
        "Valid email address and phone number"
      ]
    },
    {
      category: "Product Requirements",
      items: [
        "Product must be legal to sell in Zimbabwe",
        "Clear product ownership or distribution rights",
        "Accurate product information and specifications",
        "Compliance with local regulations and standards"
      ]
    },
    {
      category: "Technical Requirements",
      items: [
        "High-quality product images (minimum 800x600px)",
        "Detailed product descriptions",
        "Accurate pricing information",
        "Proper categorization of products"
      ]
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <CardHeader className="bg-nust-blue text-white relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:bg-white/20"
          >
            <X className="w-4 h-4" />
          </Button>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Package className="w-6 h-6" />
            How to Register Products
          </CardTitle>
          <CardDescription className="text-blue-100">
            Complete guide to successfully register your products on ProductHub
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 rounded-none">
              <TabsTrigger value="steps" className="text-sm">
                Step-by-Step Guide
              </TabsTrigger>
              <TabsTrigger value="tips" className="text-sm">
                Tips & Best Practices
              </TabsTrigger>
              <TabsTrigger value="requirements" className="text-sm">
                Requirements
              </TabsTrigger>
            </TabsList>
            
            <div className="max-h-[60vh] overflow-y-auto">
              <TabsContent value="steps" className="p-6 space-y-6">
                <div className="grid gap-4">
                  {registrationSteps.map((step, index) => (
                    <Card key={index} className="border-l-4 border-l-nust-blue">
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-3">
                          <Badge variant="default" className="bg-nust-blue">
                            Step {step.step}
                          </Badge>
                          <CardTitle className="text-lg">{step.title}</CardTitle>
                        </div>
                        <CardDescription>{step.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {step.items.map((item, itemIndex) => (
                            <li key={itemIndex} className="flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                              <span className="text-sm">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="tips" className="p-6 space-y-4">
                <div className="grid gap-4">
                  {tips.map((tip, index) => (
                    <Card key={index} className="border-l-4 border-l-orange-500">
                      <CardContent className="pt-4">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
                            {tip.icon}
                          </div>
                          <div>
                            <h4 className="font-semibold text-sm mb-1">{tip.title}</h4>
                            <p className="text-sm text-muted-foreground">{tip.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-sm text-blue-900 mb-1">
                          Pro Tip: Start with your best products
                        </h4>
                        <p className="text-sm text-blue-800">
                          Begin by registering your highest-quality, most popular products first. 
                          This helps establish credibility and attracts initial customers to your shop.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="requirements" className="p-6 space-y-4">
                <div className="grid gap-6">
                  {requirements.map((req, index) => (
                    <Card key={index}>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <AlertCircle className="w-5 h-5 text-red-600" />
                          {req.category}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {req.items.map((item, itemIndex) => (
                            <li key={itemIndex} className="flex items-start gap-2">
                              <div className="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0" />
                              <span className="text-sm">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                <Card className="bg-yellow-50 border-yellow-200">
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-sm text-yellow-900 mb-1">
                          Important Notice
                        </h4>
                        <p className="text-sm text-yellow-800">
                          All products are subject to review and approval. Ensure compliance with 
                          local laws and regulations. Misleading information may result in rejection 
                          or account suspension.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductRegistrationGuide;