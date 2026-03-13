
import { HelpCircle, Mail, Phone, MessageCircle, FileText, Video, MapPin, Clock, Globe, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState } from "react";
import Navbar from "@/components/Navbar";

const Help = () => {
  const [openFaqSections, setOpenFaqSections] = useState<Record<string, boolean>>({});
  const [openFaqItems, setOpenFaqItems] = useState<Record<string, boolean>>({});

  const toggleFaqSection = (section: string) => {
    setOpenFaqSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const toggleFaqItem = (itemKey: string) => {
    setOpenFaqItems(prev => ({
      ...prev,
      [itemKey]: !prev[itemKey]
    }));
  };
  const helpSections = [
    {
      icon: FileText,
      title: "User Guides",
      description: "Complete step-by-step guides for all ProductHub features",
      items: [
        "Getting Started - Creating your first account and setting up your profile",
        "Product Registration - Complete guide from initial submission to approval",
        "Shop Profile Management - Setting up and optimizing your business presence",
        "Industry Classification - Understanding categories and selecting the right industry",
        "Product Image Guidelines - Requirements, formats, and best practices",
        "Search & Discovery - Advanced filtering and finding products effectively",
        "Product Updates - Editing, pricing, and managing your product listings",
        "Quality Control - Meeting standards and passing review processes",
        "Account Security - Password management and two-factor authentication",
        "Mobile App Usage - Using ProductHub on mobile devices"
      ]
    },
    {
      icon: Video,
      title: "Video Tutorials",
      description: "Comprehensive video walkthroughs for visual learners",
      items: [
        "Complete Platform Overview - 15-minute introduction to ProductHub",
        "Product Registration Walkthrough - Step-by-step submission process",
        "Shop Setup & Optimization - Creating an attractive business profile",
        "Photo Guidelines & Best Practices - Taking and uploading quality images",
        "Advanced Search Techniques - Finding exactly what you need",
        "Bulk Product Management - Handling multiple listings efficiently",
        "Common Issues & Solutions - Troubleshooting frequent problems",
        "Mobile App Features - Using the mobile interface effectively",
        "Industry-Specific Guidelines - Tailored advice for different sectors",
        "Success Stories - Learn from top-performing shops and products"
      ]
    },
    {
      icon: MessageCircle,
      title: "Frequently Asked Questions",
      description: "Detailed answers to the most common user questions",
      items: [
        "Account & Registration",
        "Product Submission & Approval",
        "Shop Management & Verification",
        "Payment & Billing Information",
        "Technical Support & Troubleshooting",
        "Privacy & Security Guidelines",
        "Industry Compliance & Standards",
        "Mobile App Support",
        "Business Features & Tools",
        "Contact & Support Options"
      ]
    }
  ];

  const faqDetails = {
    "Account & Registration": [
      {
        question: "How do I create a ProductHub account?",
        answer: "Visit the registration page, provide your business details, email, and phone number. You'll receive a verification email to activate your account. For businesses, additional documentation may be required."
      },
      {
        question: "What documents do I need for business verification?",
        answer: "You'll need: Business registration certificate, Tax clearance certificate, Valid ID of the business owner, Proof of address, and any relevant industry licenses."
      },
      {
        question: "How long does account verification take?",
        answer: "Standard verification takes 3-5 business days. Complex cases requiring additional documentation may take up to 10 business days."
      },
      {
        question: "Can I register multiple shops under one account?",
        answer: "Yes, you can manage multiple business locations or brands under a single account. Each shop will have its own profile and product listings."
      }
    ],
    "Product Submission & Approval": [
      {
        question: "What are the product image requirements?",
        answer: "Images must be: High resolution (minimum 800x600px), Clear and well-lit, Show the actual product, No watermarks or logos, Maximum 5MB per image, Accepted formats: JPG, PNG, WEBP."
      },
      {
        question: "How long does product approval take?",
        answer: "Most products are reviewed within 24-48 hours. Complex products requiring additional verification may take up to 5 business days."
      },
      {
        question: "Why was my product rejected?",
        answer: "Common reasons include: Poor image quality, Incomplete product information, Non-compliance with industry standards, Prohibited items, or missing documentation."
      },
      {
        question: "Can I edit products after approval?",
        answer: "Yes, you can update pricing, descriptions, and images. Significant changes may require re-approval. Changes to product category or type require admin review."
      }
    ],
    "Shop Management & Verification": [
      {
        question: "How do I optimize my shop profile?",
        answer: "Complete all profile sections, add high-quality business photos, write detailed descriptions, upload business certificates, maintain regular product updates, and respond promptly to inquiries."
      },
      {
        question: "What are the shop verification badges?",
        answer: "Verified Badge: Basic business verification complete, Premium Badge: Enhanced verification with additional documents, Top Rated: Based on customer reviews and performance metrics."
      },
      {
        question: "How can I improve my shop's visibility?",
        answer: "Keep your profile complete and updated, maintain high-quality product images, respond quickly to customer inquiries, encourage customer reviews, and regularly add new products."
      }
    ],
    "Technical Support & Troubleshooting": [
      {
        question: "I can't upload images. What should I do?",
        answer: "Check your internet connection, ensure images meet size requirements (max 5MB), try a different browser, clear your browser cache, or try uploading one image at a time."
      },
      {
        question: "The website is loading slowly. How can I fix this?",
        answer: "Clear your browser cache and cookies, disable browser extensions, check your internet speed, try using a different browser, or contact support if the issue persists."
      },
      {
        question: "I forgot my password. How do I reset it?",
        answer: "Click 'Forgot Password' on the login page, enter your email address, check your email for reset instructions, and follow the link to create a new password."
      }
    ],
    "Industry Compliance & Standards": [
      {
        question: "What products are prohibited on ProductHub?",
        answer: "Prohibited items include: Illegal substances, Weapons and ammunition, Counterfeit goods, Expired products, Items requiring special licenses without proper documentation."
      },
      {
        question: "Do I need special permits for certain products?",
        answer: "Yes, certain categories require permits: Pharmaceuticals need MCAZ approval, Food products need health department certification, Electronics need POTRAZ compliance, Chemicals need environmental clearance."
      },
      {
        question: "How do I ensure my products meet Zimbabwe standards?",
        answer: "Check with the Standards Association of Zimbabwe (SAZ), ensure products have proper labeling, verify safety certifications, and consult with industry-specific regulatory bodies."
      }
    ]
  };

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

        {/* Detailed FAQ Section */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-nust-blue mb-4">Detailed FAQs</h2>
            <p className="text-gray-600 text-lg">
              Comprehensive answers to help you navigate ProductHub successfully
            </p>
          </div>

          <div className="space-y-6">
            {Object.entries(faqDetails).map(([category, questions]) => (
              <Card key={category} className="border border-gray-200">
                <Collapsible open={openFaqSections[category]} onOpenChange={() => toggleFaqSection(category)}>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg text-nust-blue">{category}</CardTitle>
                        {openFaqSections[category] ? (
                          <ChevronUp className="w-5 h-5 text-nust-blue" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-nust-blue" />
                        )}
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="pt-0">
                      <div className="space-y-4">
                        {questions.map((faq, index) => {
                          const itemKey = `${category}-${index}`;
                          return (
                            <div key={index} className="border-l-4 border-nust-blue/20 pl-4">
                              <Collapsible open={openFaqItems[itemKey]} onOpenChange={() => toggleFaqItem(itemKey)}>
                                <CollapsibleTrigger asChild>
                                  <div className="cursor-pointer hover:bg-gray-50 p-3 rounded transition-colors">
                                    <div className="flex items-center justify-between">
                                      <h4 className="font-medium text-gray-900 text-left">{faq.question}</h4>
                                      {openFaqItems[itemKey] ? (
                                        <ChevronUp className="w-4 h-4 text-gray-500 flex-shrink-0 ml-2" />
                                      ) : (
                                        <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0 ml-2" />
                                      )}
                                    </div>
                                  </div>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                  <div className="mt-2 p-3 bg-gray-50 rounded text-gray-700 leading-relaxed">
                                    {faq.answer}
                                  </div>
                                </CollapsibleContent>
                              </Collapsible>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            ))}
          </div>
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
              National University of Science and Technology - Zimbabwe
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
