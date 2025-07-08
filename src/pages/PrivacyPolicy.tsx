
import { Shield, Eye, Database, Lock, Mail, Phone } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/Navbar";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Shield className="w-12 h-12 text-nust-blue mr-3" />
            <h1 className="text-4xl font-bold text-nust-blue">Privacy Policy</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Your privacy is important to us. This policy explains how we collect, use, and protect your information.
          </p>
          <p className="text-sm text-gray-500 mt-4">
            Last updated: January 2025
          </p>
        </div>

        {/* Privacy Policy Content */}
        <div className="space-y-8">
          
          {/* Information We Collect */}
          <Card className="bg-white shadow-lg">
            <CardHeader>
              <div className="flex items-center mb-2">
                <Database className="w-6 h-6 text-nust-blue mr-2" />
                <CardTitle className="text-nust-blue">Information We Collect</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Personal Information</h4>
                <ul className="list-disc pl-6 space-y-1 text-gray-700">
                  <li>Name and contact information (email, phone number, address)</li>
                  <li>Business registration details</li>
                  <li>Product information and descriptions</li>
                  <li>Shop and industry details</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Technical Information</h4>
                <ul className="list-disc pl-6 space-y-1 text-gray-700">
                  <li>IP address and browser information</li>
                  <li>Usage patterns and preferences</li>
                  <li>Device information and operating system</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* How We Use Information */}
          <Card className="bg-white shadow-lg">
            <CardHeader>
              <div className="flex items-center mb-2">
                <Eye className="w-6 h-6 text-nust-blue mr-2" />
                <CardTitle className="text-nust-blue">How We Use Your Information</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>To provide and maintain our product registration services</li>
                <li>To process your applications and verify business information</li>
                <li>To communicate with you about your account and services</li>
                <li>To improve our platform and develop new features</li>
                <li>To comply with legal and regulatory requirements</li>
                <li>To prevent fraud and ensure platform security</li>
              </ul>
            </CardContent>
          </Card>

          {/* Data Protection */}
          <Card className="bg-white shadow-lg">
            <CardHeader>
              <div className="flex items-center mb-2">
                <Lock className="w-6 h-6 text-nust-blue mr-2" />
                <CardTitle className="text-nust-blue">Data Protection & Security</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
              </p>
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Security Measures Include:</h4>
                <ul className="list-disc pl-6 space-y-1 text-gray-700">
                  <li>Encryption of data in transit and at rest</li>
                  <li>Regular security assessments and updates</li>
                  <li>Access controls and authentication requirements</li>
                  <li>Secure data centers and backup systems</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Information Sharing */}
          <Card className="bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="text-nust-blue">Information Sharing</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                We do not sell, trade, or otherwise transfer your personal information to third parties except in the following circumstances:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>With your explicit consent</li>
                <li>To government agencies as required by law</li>
                <li>To service providers who assist in operating our platform</li>
                <li>In case of business transfer or merger</li>
                <li>To protect our rights and prevent fraud</li>
              </ul>
            </CardContent>
          </Card>

          {/* Your Rights */}
          <Card className="bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="text-nust-blue">Your Rights</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">You have the right to:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Access and review your personal information</li>
                <li>Request correction of inaccurate data</li>
                <li>Request deletion of your data (subject to legal requirements)</li>
                <li>Object to processing for marketing purposes</li>
                <li>Request data portability</li>
                <li>Withdraw consent where applicable</li>
              </ul>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="text-nust-blue">Contact Us About Privacy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                If you have questions about this Privacy Policy or wish to exercise your rights, please contact us:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center">
                  <Mail className="w-5 h-5 text-nust-blue mr-2" />
                  <span className="text-gray-700">privacy@mic.gov.zw</span>
                </div>
                <div className="flex items-center">
                  <Phone className="w-5 h-5 text-nust-blue mr-2" />
                  <span className="text-gray-700">+263 4 703 001-9</span>
                </div>
              </div>
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>Data Protection Officer:</strong> Ministry of Industry and Commerce<br />
                  Mukwati Building, Corner 4th Street/Central Avenue<br />
                  P.O. Box CY 708, Causeway, Harare, Zimbabwe
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
