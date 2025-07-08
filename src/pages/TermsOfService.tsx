
import { FileText, AlertTriangle, Scale, Users, Shield } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/Navbar";

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Scale className="w-12 h-12 text-nust-blue mr-3" />
            <h1 className="text-4xl font-bold text-nust-blue">Terms of Service</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Please read these terms carefully before using ProductHub services.
          </p>
          <p className="text-sm text-gray-500 mt-4">
            Last updated: January 2025
          </p>
        </div>

        {/* Terms Content */}
        <div className="space-y-8">
          
          {/* Acceptance of Terms */}
          <Card className="bg-white shadow-lg">
            <CardHeader>
              <div className="flex items-center mb-2">
                <FileText className="w-6 h-6 text-nust-blue mr-2" />
                <CardTitle className="text-nust-blue">Acceptance of Terms</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                By accessing and using ProductHub, you accept and agree to be bound by the terms and provision of this agreement. 
                If you do not agree to abide by the above, please do not use this service.
              </p>
              <p className="text-gray-700">
                These terms apply to all users of the platform, including individuals, businesses, and organizations 
                registering products, shops, or industries in Zimbabwe.
              </p>
            </CardContent>
          </Card>

          {/* Service Description */}
          <Card className="bg-white shadow-lg">
            <CardHeader>
              <div className="flex items-center mb-2">
                <Users className="w-6 h-6 text-nust-blue mr-2" />
                <CardTitle className="text-nust-blue">Service Description</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                ProductHub is an official platform operated by the Ministry of Industry and Commerce of Zimbabwe for:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Product registration and management</li>
                <li>Shop and business registration</li>
                <li>Industry classification and registration</li>
                <li>Document verification and compliance checking</li>
                <li>Business information management</li>
              </ul>
            </CardContent>
          </Card>

          {/* User Responsibilities */}
          <Card className="bg-white shadow-lg">
            <CardHeader>
              <div className="flex items-center mb-2">
                <Shield className="w-6 h-6 text-nust-blue mr-2" />
                <CardTitle className="text-nust-blue">User Responsibilities</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Account Security</h4>
                <ul className="list-disc pl-6 space-y-1 text-gray-700">
                  <li>Maintain the confidentiality of your account credentials</li>
                  <li>Notify us immediately of unauthorized access</li>
                  <li>Use strong passwords and update them regularly</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Information Accuracy</h4>
                <ul className="list-disc pl-6 space-y-1 text-gray-700">
                  <li>Provide accurate and truthful information</li>
                  <li>Update information when changes occur</li>
                  <li>Submit only authentic documents</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Compliance</h4>
                <ul className="list-disc pl-6 space-y-1 text-gray-700">
                  <li>Comply with all applicable laws and regulations</li>
                  <li>Respect intellectual property rights</li>
                  <li>Not engage in fraudulent activities</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Prohibited Activities */}
          <Card className="bg-white shadow-lg border-l-4 border-red-500">
            <CardHeader>
              <div className="flex items-center mb-2">
                <AlertTriangle className="w-6 h-6 text-red-600 mr-2" />
                <CardTitle className="text-red-600">Prohibited Activities</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">Users are strictly prohibited from:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Submitting false or misleading information</li>
                <li>Attempting to circumvent verification processes</li>
                <li>Using the platform for illegal activities</li>
                <li>Interfering with platform operations</li>
                <li>Accessing other users' accounts without permission</li>
                <li>Registering prohibited or controlled products</li>
                <li>Violating any applicable laws or regulations</li>
              </ul>
            </CardContent>
          </Card>

          {/* Verification Process */}
          <Card className="bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="text-nust-blue">Verification & Approval Process</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                All registrations are subject to verification and approval by the Ministry of Industry and Commerce.
              </p>
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Process Timeline</h4>
                <ul className="list-disc pl-6 space-y-1 text-gray-700">
                  <li>Initial review: 3-5 business days</li>
                  <li>Document verification: 5-10 business days</li>
                  <li>Final approval: Up to 15 business days</li>
                </ul>
              </div>
              <p className="text-sm text-gray-600 bg-yellow-50 p-3 rounded">
                <strong>Note:</strong> Processing times may vary based on application complexity and document requirements.
              </p>
            </CardContent>
          </Card>

          {/* Intellectual Property */}
          <Card className="bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="text-nust-blue">Intellectual Property</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                The ProductHub platform, including its design, functionality, and content, is owned by the Government of Zimbabwe.
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Users retain ownership of their submitted business information</li>
                <li>The Government may use aggregated data for policy and research purposes</li>
                <li>Users grant permission to verify and process their information</li>
                <li>Trademark and copyright laws apply to all content</li>
              </ul>
            </CardContent>
          </Card>

          {/* Limitation of Liability */}
          <Card className="bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="text-nust-blue">Limitation of Liability</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                The Ministry of Industry and Commerce provides this service "as is" and makes no warranties regarding:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Continuous availability of the platform</li>
                <li>Accuracy of third-party information</li>
                <li>Guarantee of registration approval</li>
                <li>Protection against data loss or technical issues</li>
              </ul>
              <p className="text-gray-700 mt-4">
                Users are responsible for maintaining backups of their important information.
              </p>
            </CardContent>
          </Card>

          {/* Termination */}
          <Card className="bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="text-nust-blue">Account Termination</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                We reserve the right to terminate or suspend accounts that:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Violate these terms of service</li>
                <li>Engage in fraudulent activities</li>
                <li>Provide false information repeatedly</li>
                <li>Pose security risks to the platform</li>
              </ul>
              <p className="text-gray-700 mt-4">
                Users may request account deletion by contacting our support team.
              </p>
            </CardContent>
          </Card>

          {/* Changes to Terms */}
          <Card className="bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="text-nust-blue">Changes to Terms</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                We reserve the right to modify these terms at any time. Users will be notified of significant changes 
                via email or platform notification. Continued use of the platform after changes constitutes acceptance 
                of the new terms.
              </p>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="bg-blue-50 border border-blue-200 shadow-lg">
            <CardHeader>
              <CardTitle className="text-nust-blue">Legal Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                For legal questions regarding these terms, please contact:
              </p>
              <div className="space-y-2 text-gray-700">
                <p><strong>Ministry of Industry and Commerce - Legal Department</strong></p>
                <p>Mukwati Building, Corner 4th Street/Central Avenue</p>
                <p>P.O. Box CY 708, Causeway, Harare, Zimbabwe</p>
                <p><strong>Email:</strong> legal@mic.gov.zw</p>
                <p><strong>Phone:</strong> +263 4 703 001-9</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
