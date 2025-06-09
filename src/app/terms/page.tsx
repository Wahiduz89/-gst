// src/app/terms/page.tsx

import Link from 'next/link';
import { ArrowLeft, FileText, Scale, AlertCircle, Shield } from 'lucide-react';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
          
          <div className="flex items-center mb-6">
            <FileText className="h-10 w-10 text-indigo-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Terms of Service</h1>
          </div>
          
          <p className="text-sm text-gray-500 mb-8">Effective Date: January 2025</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-600 leading-relaxed">
              By accessing and using GST Invoice Generator, you accept and agree to be bound by the 
              terms and provision of this agreement. If you do not agree to abide by the above, 
              please do not use this service.
            </p>
          </section>

          <section>
            <div className="flex items-center mb-4">
              <Scale className="h-6 w-6 text-indigo-600 mr-2" />
              <h2 className="text-2xl font-semibold text-gray-900">2. Use License</h2>
            </div>
            <div className="space-y-3 text-gray-600">
              <p>
                Permission is granted to use GST Invoice Generator for personal and commercial purposes 
                to generate GST-compliant invoices for your business, subject to the following restrictions:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>You must maintain accurate business information</li>
                <li>You must not use the service for any illegal purposes</li>
                <li>You must not attempt to reverse engineer the software</li>
                <li>You must not share your account credentials with others</li>
                <li>You must comply with all applicable GST regulations</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Service Description</h2>
            <p className="text-gray-600 leading-relaxed mb-3">
              GST Invoice Generator provides the following services:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-gray-600">
              <li>Creation and management of GST-compliant invoices</li>
              <li>Customer information management</li>
              <li>Automatic GST calculations based on Indian tax laws</li>
              <li>PDF generation and export functionality</li>
              <li>Business analytics and reporting features</li>
            </ul>
          </section>

          <section>
            <div className="flex items-center mb-4">
              <AlertCircle className="h-6 w-6 text-indigo-600 mr-2" />
              <h2 className="text-2xl font-semibold text-gray-900">4. Limitations and Disclaimers</h2>
            </div>
            <div className="space-y-3 text-gray-600">
              <p className="font-medium text-gray-900">Tax Compliance</p>
              <p>
                While GST Invoice Generator helps create GST-compliant invoices, users are solely 
                responsible for ensuring their compliance with all applicable tax laws and regulations. 
                We recommend consulting with a tax professional for specific advice.
              </p>
              
              <p className="font-medium text-gray-900 mt-4">Service Availability</p>
              <p>
                We strive to maintain 99.9% uptime but do not guarantee uninterrupted service. 
                Scheduled maintenance and unforeseen circumstances may affect availability.
              </p>
              
              <p className="font-medium text-gray-900 mt-4">Data Accuracy</p>
              <p>
                Users are responsible for the accuracy of all data entered into the system. 
                We are not liable for errors resulting from incorrect information.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. User Responsibilities</h2>
            <ul className="list-disc pl-5 space-y-2 text-gray-600">
              <li>Maintain accurate and up-to-date business information</li>
              <li>Ensure all invoice data is correct before generation</li>
              <li>Keep your account credentials secure</li>
              <li>Comply with all applicable laws and regulations</li>
              <li>Report any security vulnerabilities or issues promptly</li>
              <li>Back up important data regularly</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Pricing and Payment</h2>
            <div className="space-y-3 text-gray-600">
              <p>
                GST Invoice Generator offers a free tier with limited features. Premium plans are 
                available for users requiring additional functionality. Pricing details are available 
                on our pricing page.
              </p>
              <p>
                All payments are processed securely through our payment partners. Subscription fees 
                are billed in advance on a monthly or annual basis.
              </p>
            </div>
          </section>

          <section>
            <div className="flex items-center mb-4">
              <Shield className="h-6 w-6 text-indigo-600 mr-2" />
              <h2 className="text-2xl font-semibold text-gray-900">7. Intellectual Property</h2>
            </div>
            <p className="text-gray-600 leading-relaxed">
              All content, features, and functionality of GST Invoice Generator are owned by us and 
              are protected by international copyright, trademark, and other intellectual property laws. 
              Your use of our service does not grant you ownership of any intellectual property rights.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Termination</h2>
            <p className="text-gray-600 leading-relaxed">
              We may terminate or suspend your account immediately, without prior notice or liability, 
              for any reason whatsoever, including without limitation if you breach the Terms. Upon 
              termination, your right to use the service will cease immediately.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Limitation of Liability</h2>
            <p className="text-gray-600 leading-relaxed">
              In no event shall GST Invoice Generator, nor its directors, employees, partners, agents, 
              suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, 
              or punitive damages, including without limitation, loss of profits, data, use, goodwill, 
              or other intangible losses.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Changes to Terms</h2>
            <p className="text-gray-600 leading-relaxed">
              We reserve the right to modify or replace these Terms at any time. If a revision is 
              material, we will provide at least 30 days notice prior to any new terms taking effect.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Contact Information</h2>
            <p className="text-gray-600 leading-relaxed">
              If you have any questions about these Terms, please contact us at:
            </p>
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-700">
                Email: legal@gstinvoicegenerator.com<br />
                Address: Jorhat, Assam, India
              </p>
            </div>
          </section>

          <div className="pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500 text-center">
              By using GST Invoice Generator, you acknowledge that you have read and understood these 
              Terms of Service and agree to be bound by them.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}