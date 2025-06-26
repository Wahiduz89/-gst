// src/app/page.tsx - Fixed version

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
  Building2,
  Globe,
  BarChart3,
  Sparkles,
  Star,
  Quote,
  Menu,
  X,
  ChevronRight,
  Award,
  Headphones,
  RefreshCw,
  Smartphone
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Enhanced Navigation with Glass Effect */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md shadow-sm z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg blur-lg opacity-25 group-hover:opacity-40 transition-opacity"></div>
                <FileText className="relative h-8 w-8 text-indigo-600" />
              </div>
              <span className="ml-2 text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                GST Invoice Pro
              </span>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                Features
              </a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                Pricing
              </a>
              <a href="#testimonials" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                Testimonials
              </a>
              <a href="#faq" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                FAQ
              </a>
            </div>

            <div className="hidden md:flex items-center space-x-4">
              <Link
                href="/login"
                className="text-gray-700 hover:text-gray-900 px-4 py-2 text-sm font-medium transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 px-6 py-2 rounded-full text-sm font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
              >
                Start Free Trial
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section with Modern Gradient */}
      <section className="relative pt-24 pb-20 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%236366f1' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>

        {/* Floating Elements Animation */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-1.5 border border-indigo-200 rounded-full text-sm font-medium bg-indigo-50 text-indigo-700 mb-8">
              <Sparkles className="h-4 w-4 mr-2" />
              Trusted by 10,000+ Indian Businesses
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-gray-900 tracking-tight">
              Professional GST Invoicing
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mt-2">
                Simplified for India
              </span>
            </h1>
            
            <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Create GST-compliant invoices in seconds. Built exclusively for Indian businesses 
              with automatic CGST/SGST/IGST calculations, multi-state support, and instant PDF generation.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="group inline-flex items-center justify-center px-8 py-4 text-lg font-medium rounded-full text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
              >
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="#demo"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium rounded-full text-gray-700 bg-white border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
              >
                Watch Demo
              </a>
            </div>

            {/* Trust Indicators */}
            <div className="mt-12 flex flex-wrap justify-center gap-8 text-sm text-gray-600">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                No Credit Card Required
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                Free Forever (10 Invoices/Month)
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                100% GST Compliant
              </div>
            </div>
          </div>

          {/* Hero Image/Mockup */}
          <div className="mt-20 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent z-10"></div>
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
              </div>
              <div className="p-8 bg-gradient-to-br from-indigo-50 to-purple-50">
                <div className="space-y-4">
                  <div className="h-8 bg-white rounded-lg shadow-sm"></div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="h-32 bg-white rounded-lg shadow-sm col-span-2"></div>
                    <div className="h-32 bg-white rounded-lg shadow-sm"></div>
                  </div>
                  <div className="h-48 bg-white rounded-lg shadow-sm"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold">10,000+</div>
              <div className="text-indigo-200 mt-1">Active Businesses</div>
            </div>
            <div>
              <div className="text-4xl font-bold">50,000+</div>
              <div className="text-indigo-200 mt-1">Invoices Generated</div>
            </div>
            <div>
              <div className="text-4xl font-bold">₹100Cr+</div>
              <div className="text-indigo-200 mt-1">Transactions Processed</div>
            </div>
            <div>
              <div className="text-4xl font-bold">4.9/5</div>
              <div className="text-indigo-200 mt-1">Customer Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section with Modern Cards */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
              Everything You Need for
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600"> GST Compliance</span>
            </h2>
            <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
              Powerful features designed specifically for Indian businesses to streamline invoicing and stay compliant
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Feature Cards */}
            {[
              {
                icon: <Calculator className="h-6 w-6" />,
                title: "Smart GST Calculator",
                description: "Automatic CGST, SGST, and IGST calculations based on transaction type. Support for all GST rates from 0% to 28%.",
                gradient: "from-blue-600 to-cyan-600"
              },
              {
                icon: <Globe className="h-6 w-6" />,
                title: "Multi-State Support",
                description: "Intelligent detection of inter-state and intra-state transactions based on GST numbers for accurate tax application.",
                gradient: "from-purple-600 to-pink-600"
              },
              {
                icon: <Users className="h-6 w-6" />,
                title: "Customer Management",
                description: "Maintain complete customer database with GST numbers. Auto-differentiate between B2B and B2C transactions.",
                gradient: "from-orange-600 to-red-600"
              },
              {
                icon: <Download className="h-6 w-6" />,
                title: "Instant PDF Export",
                description: "Generate beautiful, print-ready PDF invoices with your business branding and complete GST compliance.",
                gradient: "from-green-600 to-teal-600"
              },
              {
                icon: <BarChart3 className="h-6 w-6" />,
                title: "Business Analytics",
                description: "Track revenue, monitor trends, and gain insights with intuitive dashboards and detailed reports.",
                gradient: "from-indigo-600 to-purple-600"
              },
              {
                icon: <Shield className="h-6 w-6" />,
                title: "Bank-Grade Security",
                description: "Your data is encrypted and secure. Fully compliant with Indian GST regulations and data protection laws.",
                gradient: "from-gray-600 to-gray-800"
              }
            ].map((feature, index) => (
              <div key={index} className="group relative">
                <div className={`absolute -inset-0.5 bg-gradient-to-r ${feature.gradient} rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200`}></div>
                
                <div className="relative bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 h-full">
                  <div className={`inline-flex p-3 rounded-lg bg-gradient-to-r ${feature.gradient} text-white mb-4`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MVP Footer - Essential Links Only */}
      <footer className="bg-gray-900 text-gray-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Company Info */}
            <div>
              <div className="flex items-center mb-4">
                <FileText className="h-8 w-8 text-indigo-400" />
                <span className="ml-2 text-lg font-bold text-white">GST Invoice Pro</span>
              </div>
              <p className="text-sm text-gray-400 mb-4">
                Professional GST invoicing solution trusted by thousands of Indian businesses.
              </p>
            </div>

            {/* Product Links */}
            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
              </ul>
            </div>

            {/* Support & Legal */}
            <div>
              <h3 className="text-white font-semibold mb-4">Support & Legal</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/help" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-12 pt-8 border-t border-gray-800">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-sm text-gray-400">
                © 2025 GST Invoice Pro. All rights reserved. Made with ❤️ in India
              </p>
              <div className="mt-4 md:mt-0 flex items-center space-x-4 text-sm">
                <span className="flex items-center">
                  <Shield className="h-4 w-4 mr-1 text-green-500" />
                  SSL Secured
                </span>
                <span className="flex items-center">
                  <Award className="h-4 w-4 mr-1 text-yellow-500" />
                  ISO Certified
                </span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}