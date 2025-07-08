
import { HelpCircle, Mail, Phone, MessageCircle, FileText, Video, MapPin, Clock, Globe } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";

const Help = () => {
  const helpSections = [
    {
      icon: FileText,
      title: "User Guides",
      description: "Step-by-step guides for using ProductHub features",
      items: [
        "How to register a product",
        "Managing your shop profile",
        "Industry categorization guide",
        "Search and filtering products"
      ]
    },
    {
      icon: Video,
      title: "Video Tutorials",
      description: "Watch detailed video tutorials",
      items: [
        "Getting started with ProductHub",
        "Product registration walkthrough",
        "Shop management best practices",
        "Advanced search techniques"
      ]
    },
    {
      icon: MessageCircle,
      title: "FAQs",
      description: "Find answers to common questions",
      items: [
        "Account setup and login issues",
        "Product approval process",
        "Payment and billing questions",
        "Technical troubleshooting"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <HelpCircle className="w-12 h-12 text-nust-blue mr-3" />
            <h1 className="text-4xl font-bold text-nust-blue">Help Center</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Find answers, get support, and learn how to make the most of ProductHub
          </p>
        </div>

        {/* Help Sections */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {helpSections.map((section, index) => {
            const Icon = section.icon;
            return (
              <Card key={index} className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-nust-blue rounded-full flex items-center justify-center">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl text-nust-blue">{section.title}</CardTitle>
                  <CardDescription className="text-gray-600">
                    {section.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {section.items.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-center text-gray-700 hover:text-nust-blue cursor-pointer transition-colors">
                        <span className="w-2 h-2 bg-nust-blue rounded-full mr-3"></span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Contact Support */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-nust-blue mb-4">Need More Help?</h2>
            <p className="text-gray-600 text-lg">
              Our support team is here to assist you with any questions or issues
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="border-2 border-nust-blue/20 hover:border-nust-blue transition-colors">
              <CardContent className="p-6 text-center">
                <Mail className="w-12 h-12 text-nust-blue mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-nust-blue mb-2">Email Support</h3>
                <p className="text-gray-600 mb-4">Get help via email</p>
                <Button className="bg-nust-blue hover:bg-nust-blue-dark text-white">
                  Send Email
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-nust-blue/20 hover:border-nust-blue transition-colors">
              <CardContent className="p-6 text-center">
                <Phone className="w-12 h-12 text-nust-blue mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-nust-blue mb-2">Phone Support</h3>
                <p className="text-gray-600 mb-4">Call our support line</p>
                <Button className="bg-nust-blue hover:bg-nust-blue-dark text-white">
                  Call Now
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-nust-blue/20 hover:border-nust-blue transition-colors">
              <CardContent className="p-6 text-center">
                <MessageCircle className="w-12 h-12 text-nust-blue mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-nust-blue mb-2">Live Chat</h3>
                <p className="text-gray-600 mb-4">Chat with our team</p>
                <Button className="bg-nust-blue hover:bg-nust-blue-dark text-white">
                  Start Chat
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Full Contact Information Section */}
        <div id="contact" className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-nust-blue mb-4">Contact Us</h2>
            <p className="text-gray-600 text-lg">
              Ministry of Industry and Commerce - Zimbabwe
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Physical Address */}
            <Card className="border border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <MapPin className="w-6 h-6 text-nust-blue mr-3" />
                  <h3 className="text-lg font-semibold text-nust-blue">Physical Address</h3>
                </div>
                <div className="space-y-2 text-gray-700">
                  <p className="font-medium">Mukwati Building</p>
                  <p>Corner 4th Street/Central Avenue</p>
                  <p>Harare, Zimbabwe</p>
                </div>
              </CardContent>
            </Card>

            {/* Postal Address */}
            <Card className="border border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <Mail className="w-6 h-6 text-nust-blue mr-3" />
                  <h3 className="text-lg font-semibold text-nust-blue">Postal Address</h3>
                </div>
                <div className="space-y-2 text-gray-700">
                  <p>P.O. Box CY 708</p>
                  <p>Causeway</p>
                  <p>Harare, Zimbabwe</p>
                </div>
              </CardContent>
            </Card>

            {/* Contact Numbers */}
            <Card className="border border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <Phone className="w-6 h-6 text-nust-blue mr-3" />
                  <h3 className="text-lg font-semibold text-nust-blue">Phone & Fax</h3>
                </div>
                <div className="space-y-2 text-gray-700">
                  <p><strong>Main Line:</strong> +263 4 703 001-9</p>
                  <p><strong>Switchboard:</strong> +263 4 703 000</p>
                  <p><strong>Fax:</strong> +263 4 728 695</p>
                </div>
              </CardContent>
            </Card>

            {/* Email Contacts */}
            <Card className="border border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <Mail className="w-6 h-6 text-nust-blue mr-3" />
                  <h3 className="text-lg font-semibold text-nust-blue">Email Contacts</h3>
                </div>
                <div className="space-y-2 text-gray-700">
                  <p><strong>General Inquiries:</strong></p>
                  <p className="text-blue-600">info@mic.gov.zw</p>
                  <p><strong>Product Registration:</strong></p>
                  <p className="text-blue-600">products@mic.gov.zw</p>
                  <p><strong>Technical Support:</strong></p>
                  <p className="text-blue-600">support@mic.gov.zw</p>
                </div>
              </CardContent>
            </Card>

            {/* Office Hours */}
            <Card className="border border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <Clock className="w-6 h-6 text-nust-blue mr-3" />
                  <h3 className="text-lg font-semibold text-nust-blue">Office Hours</h3>
                </div>
                <div className="space-y-2 text-gray-700">
                  <p><strong>Monday - Friday:</strong></p>
                  <p>8:00 AM - 4:30 PM</p>
                  <p><strong>Saturday - Sunday:</strong></p>
                  <p>Closed</p>
                  <p className="text-sm text-gray-500 mt-3">*Public holidays excluded</p>
                </div>
              </CardContent>
            </Card>

            {/* Website & Online Services */}
            <Card className="border border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <Globe className="w-6 h-6 text-nust-blue mr-3" />
                  <h3 className="text-lg font-semibold text-nust-blue">Online Services</h3>
                </div>
                <div className="space-y-2 text-gray-700">
                  <p><strong>Official Website:</strong></p>
                  <a 
                    href="https://www.mic.gov.zw" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline block"
                  >
                    www.mic.gov.zw
                  </a>
                  <p><strong>Online Portal:</strong></p>
                  <p className="text-blue-600">portal.mic.gov.zw</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Additional Information */}
          <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="text-lg font-semibold text-nust-blue mb-3">Important Notice</h3>
            <div className="text-gray-700 space-y-2">
              <p>
                • For urgent matters outside office hours, please send an email to our support team
              </p>
              <p>
                • All product registration applications must be submitted through the official online portal
              </p>
              <p>
                • Physical visits to our offices require prior appointment for specialized services
              </p>
              <p>
                • Document verification and approval processes may take 5-10 business days
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;
