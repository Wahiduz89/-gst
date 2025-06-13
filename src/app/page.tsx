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
              <Link href="#features" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                Features
              </Link>
              <Link href="#pricing" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                Pricing
              </Link>
              <Link href="#testimonials" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                Testimonials
              </Link>
              <Link href="#faq" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
                FAQ
              </Link>
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
              <Link
                href="#demo"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium rounded-full text-gray-700 bg-white border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
              >
                Watch Demo
              </Link>
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
            {/* Feature Cards with Hover Effects */}
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
                {/* Card Glow Effect */}
                <div className={`absolute -inset-0.5 bg-gradient-to-r ${feature.gradient} rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200`}></div>
                
                {/* Card Content */}
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

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
              Create Your First Invoice in
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600"> 3 Simple Steps</span>
            </h2>
          </div>

          <div className="relative">
            {/* Connection Line */}
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 hidden lg:block"></div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative">
              {[
                {
                  step: "1",
                  title: "Add Your Business",
                  description: "Set up your business profile with GST number and other details. One-time setup, use forever.",
                  icon: <Building2 className="h-6 w-6" />
                },
                {
                  step: "2",
                  title: "Create Invoice",
                  description: "Add customer details, items, and GST rates. Our system automatically calculates taxes.",
                  icon: <FileText className="h-6 w-6" />
                },
                {
                  step: "3",
                  title: "Download & Send",
                  description: "Generate professional PDF invoices instantly. Email directly or download for records.",
                  icon: <Download className="h-6 w-6" />
                }
              ].map((item, index) => (
                <div key={index} className="relative">
                  <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-200">
                    {/* Step Number */}
                    <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                      <div className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                        {item.step}
                      </div>
                    </div>
                    
                    <div className="text-center pt-6">
                      <div className="inline-flex p-3 rounded-lg bg-indigo-50 text-indigo-600 mb-4">
                        {item.icon}
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {item.title}
                      </h3>
                      <p className="text-gray-600">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
              Loved by Businesses
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600"> Across India</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Priya Sharma",
                role: "Owner, Sharma Electronics",
                location: "Mumbai",
                content: "GST Invoice Pro has transformed our billing process. What used to take hours now takes minutes. The automatic GST calculations are a lifesaver!",
                rating: 5
              },
              {
                name: "Rahul Verma",
                role: "CA, Verma & Associates",
                location: "Delhi",
                content: "As a CA, I recommend GST Invoice Pro to all my clients. It's 100% compliant and makes GST filing so much easier. Excellent support team too!",
                rating: 5
              },
              {
                name: "Anita Patel",
                role: "Founder, Patel Textiles",
                location: "Ahmedabad",
                content: "The multi-state invoice feature is brilliant! We deal with clients across India and this handles IGST calculations perfectly. Highly recommended!",
                rating: 5
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg p-8 relative">
                <Quote className="absolute top-4 right-4 h-8 w-8 text-indigo-100" />
                
                {/* Rating */}
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                
                <p className="text-gray-700 mb-6 italic">
                  "{testimonial.content}"
                </p>
                
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                  <p className="text-sm text-gray-500">{testimonial.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
              Simple, Transparent
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600"> Pricing</span>
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              Start free, upgrade when you need more
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Free Plan */}
            <div className="relative bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
              <h3 className="text-2xl font-bold text-gray-900">Free</h3>
              <p className="mt-4 text-gray-600">Perfect for freelancers and small businesses</p>
              <p className="mt-8">
                <span className="text-4xl font-extrabold text-gray-900">₹0</span>
                <span className="text-gray-600">/month</span>
              </p>
              
              <ul className="mt-8 space-y-4">
                {[
                  "Up to 10 invoices/month",
                  "Unlimited customers",
                  "Basic GST calculations",
                  "PDF export",
                  "Email support"
                ].map((feature, i) => (
                  <li key={i} className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Link
                href="/register"
                className="mt-8 w-full inline-flex items-center justify-center px-6 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 font-medium transition-colors"
              >
                Get Started
              </Link>
            </div>

            {/* Pro Plan - Featured */}
            <div className="relative bg-gradient-to-b from-indigo-50 to-white rounded-2xl shadow-xl border-2 border-indigo-600 p-8 transform lg:-translate-y-4">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </span>
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900">Professional</h3>
              <p className="mt-4 text-gray-600">For growing businesses with more invoicing needs</p>
              <p className="mt-8">
                <span className="text-4xl font-extrabold text-gray-900">₹499</span>
                <span className="text-gray-600">/month</span>
              </p>
              
              <ul className="mt-8 space-y-4">
                {[
                  "Unlimited invoices",
                  "Advanced customer management",
                  "Multi-state GST support",
                  "Custom invoice templates",
                  "Priority support",
                  "Analytics dashboard",
                  "Bulk invoice export"
                ].map((feature, i) => (
                  <li key={i} className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Link
                href="/register"
                className="mt-8 w-full inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg"
              >
                Start Free Trial
              </Link>
            </div>

            {/* Enterprise Plan */}
            <div className="relative bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
              <h3 className="text-2xl font-bold text-gray-900">Enterprise</h3>
              <p className="mt-4 text-gray-600">For large organizations with custom needs</p>
              <p className="mt-8">
                <span className="text-4xl font-extrabold text-gray-900">Custom</span>
              </p>
              
              <ul className="mt-8 space-y-4">
                {[
                  "Everything in Professional",
                  "API access",
                  "Custom integrations",
                  "Dedicated account manager",
                  "24/7 phone support",
                  "Training & onboarding",
                  "SLA guarantee"
                ].map((feature, i) => (
                  <li key={i} className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Link
                href="/contact"
                className="mt-8 w-full inline-flex items-center justify-center px-6 py-3 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 font-medium transition-colors"
              >
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
              Frequently Asked
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600"> Questions</span>
            </h2>
          </div>

          <div className="space-y-6">
            {[
              {
                question: "Is GST Invoice Pro compliant with Indian GST laws?",
                answer: "Yes, absolutely! GST Invoice Pro is 100% compliant with Indian GST regulations. We regularly update our system to match the latest GST rules and requirements."
              },
              {
                question: "Can I use it for inter-state transactions?",
                answer: "Yes! Our system automatically detects whether a transaction is inter-state or intra-state based on GST numbers and applies IGST or CGST/SGST accordingly."
              },
              {
                question: "What happens after the free trial?",
                answer: "You can continue using the free plan with up to 10 invoices per month forever. If you need more, you can upgrade to our Professional plan anytime."
              },
              {
                question: "Can I customize invoice templates?",
                answer: "Yes, Professional and Enterprise plans include customizable invoice templates. You can add your logo, choose colors, and modify the layout to match your brand."
              },
              {
                question: "Is my data secure?",
                answer: "Absolutely. We use bank-grade encryption to protect your data. All information is stored securely and we never share your data with third parties."
              },
              {
                question: "Do you provide customer support?",
                answer: "Yes! Free plan users get email support, Professional users get priority support, and Enterprise users get 24/7 phone support with a dedicated account manager."
              }
            ].map((faq, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {faq.question}
                </h3>
                <p className="text-gray-600">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-extrabold text-white sm:text-5xl">
            Ready to streamline your invoicing?
          </h2>
          <p className="mt-6 text-xl text-indigo-100">
            Join 10,000+ Indian businesses already using GST Invoice Pro
          </p>
          
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium rounded-full text-indigo-600 bg-white hover:bg-gray-100 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
            >
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium rounded-full text-white border-2 border-white hover:bg-white hover:text-indigo-600 transition-all duration-200"
            >
              Talk to Sales
            </Link>
          </div>

          {/* Features Grid */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-white">
            {[
              { icon: <Clock className="h-6 w-6" />, text: "Setup in 2 minutes" },
              { icon: <RefreshCw className="h-6 w-6" />, text: "Free updates forever" },
              { icon: <Headphones className="h-6 w-6" />, text: "24/7 support" },
              { icon: <Smartphone className="h-6 w-6" />, text: "Works on all devices" }
            ].map((item, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className="mb-2">{item.icon}</div>
                <span className="text-sm">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="bg-gray-900 text-gray-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center mb-4">
                <FileText className="h-8 w-8 text-indigo-400" />
                <span className="ml-2 text-lg font-bold text-white">GST Invoice Pro</span>
              </div>
              <p className="text-sm text-gray-400 mb-4">
                Professional GST invoicing solution trusted by thousands of Indian businesses.
              </p>
              <div className="flex space-x-4">
                {/* Social Media Icons */}
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Product Links */}
            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="#features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/api" className="hover:text-white transition-colors">API</Link></li>
                <li><Link href="/integrations" className="hover:text-white transition-colors">Integrations</Link></li>
              </ul>
            </div>

            {/* Company Links */}
            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="/careers" className="hover:text-white transition-colors">Careers</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>

            {/* Support Links */}
            <div>
              <h3 className="text-white font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/help" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="/documentation" className="hover:text-white transition-colors">Documentation</Link></li>
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