// src/app/privacy/page.tsx

import Link from 'next/link';
import { ArrowLeft, Shield, Lock, Eye, Database } from 'lucide-react';

export default function PrivacyPolicyPage() {
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
            <Shield className="h-10 w-10 text-indigo-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
          </div>
          
          <p className="text-sm text-gray-500 mb-8">Last updated: January 2025</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Introduction</h2>
            <p className="text-gray-600 leading-relaxed">
              GST Invoice Generator ("we," "our," or "us") is committed to protecting your privacy. 
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information 
              when you use our web application. Please read this privacy policy carefully.
            </p>
          </section>

          <section>
            <div className="flex items-center mb-4">
              <Database className="h-6 w-6 text-indigo-600 mr-2" />
              <h2 className="text-2xl font-semibold text-gray-900">Information We Collect</h2>
            </div>
            <div className="space-y-4 text-gray-600">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Personal Information</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Name and email address</li>
                  <li>Business information (name, address, GST number)</li>
                  <li>Customer information you add to the system</li>
                  <li>Invoice data and transaction details</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Automatically Collected Information</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>IP address and browser information</li>
                  <li>Device and operating system details</li>
                  <li>Usage patterns and preferences</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <div className="flex items-center mb-4">
              <Eye className="h-6 w-6 text-indigo-600 mr-2" />
              <h2 className="text-2xl font-semibold text-gray-900">How We Use Your Information</h2>
            </div>
            <ul className="list-disc pl-5 space-y-2 text-gray-600">
              <li>To provide and maintain our invoice generation services</li>
              <li>To manage your account and authenticate users</li>
              <li>To generate invoices and maintain transaction records</li>
              <li>To communicate with you about service updates</li>
              <li>To comply with legal obligations and tax regulations</li>
              <li>To improve our services and user experience</li>
            </ul>
          </section>

          <section>
            <div className="flex items-center mb-4">
              <Lock className="h-6 w-6 text-indigo-600 mr-2" />
              <h2 className="text-2xl font-semibold text-gray-900">Data Security</h2>
            </div>
            <p className="text-gray-600 leading-relaxed">
              We implement appropriate technical and organizational security measures to protect your 
              personal information. All data is encrypted in transit and at rest. We use secure 
              servers and follow industry best practices to safeguard your information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Data Retention</h2>
            <p className="text-gray-600 leading-relaxed">
              We retain your personal information for as long as necessary to provide our services 
              and comply with legal obligations. Invoice data is retained as per Indian tax law 
              requirements (typically 8 years). You may request deletion of your account at any time.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your Rights</h2>
            <p className="text-gray-600 leading-relaxed mb-3">
              You have the right to:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-gray-600">
              <li>Access your personal information</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Export your data in a portable format</li>
              <li>Opt-out of marketing communications</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Us</h2>
            <p className="text-gray-600 leading-relaxed">
              If you have questions about this Privacy Policy or our data practices, please contact us at:
            </p>
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-700">
                Email: privacy@gstinvoicegenerator.com<br />
                Address: Jorhat, Assam, India
              </p>
            </div>
          </section>

          <div className="pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500 text-center">
              By using GST Invoice Generator, you agree to the terms outlined in this Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}