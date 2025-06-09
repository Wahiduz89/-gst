// src/app/page.tsx

import Link from 'next/link';
import { 
  FileText, 
  Users, 
  TrendingUp, 
  Shield, 
  Zap, 
  CheckCircle,
  ArrowRight,
  IndianRupee,
  Calculator,
  Download,
  Clock,
  Building2
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-indigo-600 mr-2" />
              <span className="text-xl font-bold text-gray-900">GST Invoice Generator</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/login"
                className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-2 rounded-md text-sm font-medium"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-indigo-50 via-white to-purple-50 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight">
              Professional GST Invoicing
              <span className="block text-indigo-600 mt-2">Made Simple for India</span>
            </h1>
            <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">
              Create GST-compliant invoices in minutes. Designed specifically for Indian small businesses 
              to streamline billing, manage customers, and stay tax compliant.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10"
              >
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                href="#features"
                className="inline-flex items-center justify-center px-8 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Everything you need for GST invoicing
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              Powerful features designed for Indian businesses
            </p>
          </div>

          <div className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-white p-8 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                  <Calculator className="h-6 w-6" />
                </div>
                <h3 className="mt-6 text-lg font-medium text-gray-900">
                  Automatic GST Calculation
                </h3>
                <p className="mt-2 text-base text-gray-500">
                  Intelligent CGST, SGST, and IGST calculations based on transaction type. 
                  Support for all GST rates from 0% to 28%.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-white p-8 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="mt-6 text-lg font-medium text-gray-900">
                  Customer Management
                </h3>
                <p className="mt-2 text-base text-gray-500">
                  Maintain complete customer records with GST numbers. Differentiate between 
                  B2B and B2C transactions automatically.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-white p-8 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                  <Download className="h-6 w-6" />
                </div>
                <h3 className="mt-6 text-lg font-medium text-gray-900">
                  Professional PDF Export
                </h3>
                <p className="mt-2 text-base text-gray-500">
                  Generate beautiful, print-ready PDF invoices with your business branding 
                  and complete GST compliance.
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-white p-8 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                  <Building2 className="h-6 w-6" />
                </div>
                <h3 className="mt-6 text-lg font-medium text-gray-900">
                  Multi-State Support
                </h3>
                <p className="mt-2 text-base text-gray-500">
                  Automatic detection of inter-state and intra-state transactions based 
                  on GST numbers for accurate tax application.
                </p>
              </div>
            </div>

            {/* Feature 5 */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-white p-8 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <h3 className="mt-6 text-lg font-medium text-gray-900">
                  Business Analytics
                </h3>
                <p className="mt-2 text-base text-gray-500">
                  Track revenue, monitor invoice trends, and gain insights into your 
                  business performance with intuitive dashboards.
                </p>
              </div>
            </div>

            {/* Feature 6 */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-white p-8 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                  <Shield className="h-6 w-6" />
                </div>
                <h3 className="mt-6 text-lg font-medium text-gray-900">
                  Secure & Compliant
                </h3>
                <p className="mt-2 text-base text-gray-500">
                  Bank-grade security with encrypted data storage. Fully compliant with 
                  Indian GST regulations and standards.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                Why choose GST Invoice Generator?
              </h2>
              <p className="mt-3 max-w-3xl text-lg text-gray-500">
                Built specifically for Indian businesses, our platform understands your unique 
                needs and compliance requirements.
              </p>

              <dl className="mt-10 space-y-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-10 w-10 rounded-md bg-indigo-500 text-white">
                      <Clock className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <dt className="text-lg leading-6 font-medium text-gray-900">
                      Save Time
                    </dt>
                    <dd className="mt-2 text-base text-gray-500">
                      Create professional invoices in under 60 seconds. No more manual calculations 
                      or formatting hassles.
                    </dd>
                  </div>
                </div>

                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-10 w-10 rounded-md bg-indigo-500 text-white">
                      <CheckCircle className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <dt className="text-lg leading-6 font-medium text-gray-900">
                      100% GST Compliant
                    </dt>
                    <dd className="mt-2 text-base text-gray-500">
                      Stay compliant with automatic GST calculations, proper invoice formatting, 
                      and all required fields as per Indian tax laws.
                    </dd>
                  </div>
                </div>

                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-10 w-10 rounded-md bg-indigo-500 text-white">
                      <Zap className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <dt className="text-lg leading-6 font-medium text-gray-900">
                      Easy to Use
                    </dt>
                    <dd className="mt-2 text-base text-gray-500">
                      Intuitive interface designed for non-technical users. Get started in minutes 
                      without any training required.
                    </dd>
                  </div>
                </div>
              </dl>
            </div>

            <div className="mt-10 lg:mt-0">
              <div className="bg-white rounded-lg shadow-xl overflow-hidden">
                <div className="bg-indigo-600 px-6 py-4">
                  <h3 className="text-lg font-medium text-white">Invoice Preview</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="space-y-2 mt-6">
                      <div className="h-3 bg-gray-100 rounded"></div>
                      <div className="h-3 bg-gray-100 rounded"></div>
                      <div className="h-3 bg-gray-100 rounded"></div>
                    </div>
                    <div className="flex justify-between mt-6">
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-4 bg-indigo-200 rounded w-1/4"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-indigo-700">
        <div className="max-w-7xl mx-auto text-center py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            <span className="block">Ready to streamline your invoicing?</span>
            <span className="block text-indigo-200">Start your free trial today.</span>
          </h2>
          <div className="mt-8 flex justify-center">
            <div className="inline-flex rounded-md shadow">
              <Link
                href="/register"
                className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-white hover:bg-indigo-50"
              >
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
          <p className="mt-4 text-lg leading-6 text-indigo-200">
            No credit card required • Free forever for up to 10 invoices/month
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-indigo-400" />
                <span className="ml-2 text-lg font-bold text-white">GST Invoice</span>
              </div>
              <p className="mt-4 text-sm text-gray-400">
                Professional GST invoicing solution for Indian small businesses.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
                Product
              </h3>
              <ul className="mt-4 space-y-2">
                <li>
                  <Link href="#features" className="text-base text-gray-300 hover:text-white">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="text-base text-gray-300 hover:text-white">
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
                Company
              </h3>
              <ul className="mt-4 space-y-2">
                <li>
                  <Link href="/about" className="text-base text-gray-300 hover:text-white">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-base text-gray-300 hover:text-white">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
                Legal
              </h3>
              <ul className="mt-4 space-y-2">
                <li>
                  <Link href="/privacy" className="text-base text-gray-300 hover:text-white">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-base text-gray-300 hover:text-white">
                    Terms
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-700 pt-8 md:flex md:items-center md:justify-between">
            <p className="text-base text-gray-400 text-center">
              &copy; 2025 GST Invoice Generator. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        .bg-grid-pattern {
          background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%236366f1' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
        }
      `}</style>
    </div>
  );
}