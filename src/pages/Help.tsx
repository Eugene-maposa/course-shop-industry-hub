
import { HelpCircle, Mail, Phone, MessageCircle, FileText, Video } from "lucide-react";
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
        <div className="bg-white rounded-lg shadow-lg p-8">
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
      </div>
    </div>
  );
};

export default Help;
