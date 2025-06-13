import { 
    Calculator, 
    Users, 
    Globe, 
    Download, 
    BarChart3, 
    Shield, 
    FileText, 
    IndianRupee,
    Zap,
    Clock,
    Building2,
    Smartphone,
    Mail,
    Printer,
    Eye,
    CheckCircle,
    Star,
    ArrowRight,
    Sparkles,
    Target,
    Layers,
    RefreshCw,
    Database,
    Lock,
    Wifi,
    TrendingUp,
    PieChart,
    Calendar,
    Search,
    Filter,
    Settings,
    Headphones,
    Award,
    Bookmark,
    Copy,
    Edit,
    Save,
    Upload,
    CloudDownload
  } from 'lucide-react';
  
  export default function FeaturesPage() {
    const coreFeatures = [
      {
        icon: <Calculator className="h-8 w-8" />,
        title: "Smart GST Calculator",
        description: "Automatic CGST, SGST, and IGST calculations based on transaction type. Supports all GST rates from 0% to 28% with intelligent rate suggestions.",
        features: [
          "Real-time tax calculations",
          "Multi-rate GST support (0%, 5%, 12%, 18%, 28%)",
          "Automatic inter/intra-state detection",
          "Tax-inclusive and exclusive modes"
        ],
        gradient: "from-blue-600 to-cyan-600"
      },
      {
        icon: <Globe className="h-8 w-8" />,
        title: "Multi-State Compliance",
        description: "Intelligent detection of inter-state and intra-state transactions based on GST numbers. Ensures 100% compliance with Indian GST regulations.",
        features: [
          "All 36 states and UTs supported",
          "Automatic state code detection",
          "Place of supply identification",
          "HSN/SAC code management"
        ],
        gradient: "from-purple-600 to-pink-600"
      },
      {
        icon: <Users className="h-8 w-8" />,
        title: "Advanced Customer Management",
        description: "Comprehensive customer database with GST verification. Auto-differentiate between B2B and B2C transactions for accurate billing.",
        features: [
          "Unlimited customer profiles",
          "GST number validation",
          "Customer transaction history",
          "Quick customer search and filters"
        ],
        gradient: "from-orange-600 to-red-600"
      },
      {
        icon: <Download className="h-8 w-8" />,
        title: "Professional PDF Generation",
        description: "Generate beautiful, print-ready PDF invoices with your business branding. Multiple template options and customization features.",
        features: [
          "Instant PDF download",
          "Professional invoice templates",
          "Custom logo and branding",
          "Print-optimized layouts"
        ],
        gradient: "from-green-600 to-teal-600"
      },
      {
        icon: <BarChart3 className="h-8 w-8" />,
        title: "Business Analytics",
        description: "Comprehensive dashboard with revenue tracking, tax summaries, and business insights. Monitor your growth with detailed reports.",
        features: [
          "Revenue and tax analytics",
          "Monthly and yearly reports",
          "Customer performance insights",
          "GST filing ready summaries"
        ],
        gradient: "from-indigo-600 to-purple-600"
      },
      {
        icon: <Shield className="h-8 w-8" />,
        title: "Enterprise Security",
        description: "Bank-grade encryption and security protocols. Your data is protected with industry-leading security measures and compliance standards.",
        features: [
          "256-bit SSL encryption",
          "Regular security audits",
          "GDPR compliant data handling",
          "Secure cloud backup"
        ],
        gradient: "from-gray-600 to-gray-800"
      }
    ];
  
    const additionalFeatures = [
      {
        icon: <FileText className="h-6 w-6" />,
        title: "Invoice Templates",
        description: "Choose from multiple professional templates or create custom designs"
      },
      {
        icon: <Smartphone className="h-6 w-6" />,
        title: "Mobile Responsive",
        description: "Create and manage invoices on any device with our responsive design"
      },
      {
        icon: <Mail className="h-6 w-6" />,
        title: "Email Integration",
        description: "Send invoices directly to customers via email with tracking"
      },
      {
        icon: <Database className="h-6 w-6" />,
        title: "Data Export",
        description: "Export your data in multiple formats (PDF, Excel, CSV)"
      },
      {
        icon: <Search className="h-6 w-6" />,
        title: "Advanced Search",
        description: "Quickly find invoices and customers with powerful search filters"
      },
      {
        icon: <Calendar className="h-6 w-6" />,
        title: "Due Date Tracking",
        description: "Set payment terms and track overdue invoices automatically"
      },
      {
        icon: <Copy className="h-6 w-6" />,
        title: "Duplicate Invoices",
        description: "Create new invoices from existing ones with one click"
      },
      {
        icon: <Bookmark className="h-6 w-6" />,
        title: "Invoice Templates",
        description: "Save frequently used invoice configurations as templates"
      },
      {
        icon: <CloudDownload className="h-6 w-6" />,
        title: "Cloud Sync",
        description: "Access your invoices from anywhere with automatic cloud synchronization"
      }
    ];
  
    const complianceFeatures = [
      {
        title: "GST Compliance",
        description: "100% compliant with latest GST regulations and requirements"
      },
      {
        title: "Invoice Numbering",
        description: "Sequential invoice numbering as per GST guidelines"
      },
      {
        title: "Tax Calculations",
        description: "Accurate CGST, SGST, and IGST calculations"
      },
      {
        title: "Place of Supply",
        description: "Automatic place of supply determination"
      },
      {
        title: "HSN/SAC Codes",
        description: "Support for HSN and SAC code management"
      },
      {
        title: "Digital Signatures",
        description: "Add digital signatures for authenticity"
      }
    ];
  
    const businessBenefits = [
      {
        icon: <Clock className="h-8 w-8 text-green-600" />,
        title: "Save Time",
        value: "90%",
        description: "Reduce invoice creation time from hours to minutes"
      },
      {
        icon: <TrendingUp className="h-8 w-8 text-blue-600" />,
        title: "Increase Accuracy",
        value: "99.9%",
        description: "Eliminate calculation errors with automated GST computation"
      },
      {
        icon: <IndianRupee className="h-8 w-8 text-purple-600" />,
        title: "Cost Savings",
        value: "₹50,000",
        description: "Average annual savings on accounting and compliance costs"
      },
      {
        icon: <Users className="h-8 w-8 text-orange-600" />,
        title: "Customer Satisfaction",
        value: "95%",
        description: "Professional invoices improve payment collection rates"
      }
    ];
  
    return (
      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-20">
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="inline-flex items-center px-4 py-2 bg-indigo-100 rounded-full text-indigo-700 text-sm font-medium mb-8">
                <Sparkles className="h-4 w-4 mr-2" />
                Comprehensive GST Solution
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight">
                Powerful Features for
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mt-2">
                  Modern Businesses
                </span>
              </h1>
              
              <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Everything you need to manage GST invoicing, customer relationships, and business analytics 
                in one comprehensive platform designed specifically for Indian businesses.
              </p>
  
              <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
                <button className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full font-medium hover:from-indigo-700 hover:to-purple-700 transform hover:-translate-y-0.5 transition-all shadow-lg">
                  Explore All Features
                  <ArrowRight className="ml-2 h-5 w-5" />
                </button>
                <button className="inline-flex items-center px-8 py-4 border-2 border-gray-200 text-gray-700 rounded-full font-medium hover:border-gray-300 hover:bg-gray-50 transition-all">
                  <Eye className="mr-2 h-5 w-5" />
                  View Demo
                </button>
              </div>
            </div>
          </div>
        </section>
  
        {/* Core Features Grid */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
                Core Features That
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600"> Power Your Business</span>
              </h2>
              <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
                Six essential capabilities that transform how you handle GST invoicing and business management
              </p>
            </div>
  
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {coreFeatures.map((feature, index) => (
                <div key={index} className="group relative">
                  <div className={`absolute -inset-0.5 bg-gradient-to-r ${feature.gradient} rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200`}></div>
                  
                  <div className="relative bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 h-full">
                    <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${feature.gradient} text-white mb-6`}>
                      {feature.icon}
                    </div>
                    
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                      {feature.title}
                    </h3>
                    
                    <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                      {feature.description}
                    </p>
                    
                    <ul className="space-y-3">
                      {feature.features.map((item, idx) => (
                        <li key={idx} className="flex items-center text-gray-700">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
  
        {/* Business Impact Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
                Measurable Business Impact
              </h2>
              <p className="mt-4 text-xl text-gray-600">
                Real results that matter to your bottom line
              </p>
            </div>
  
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {businessBenefits.map((benefit, index) => (
                <div key={index} className="text-center group">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gray-50 group-hover:bg-gray-100 transition-colors mb-6">
                    {benefit.icon}
                  </div>
                  <div className="text-4xl font-bold text-gray-900 mb-2">
                    {benefit.value}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600">
                    {benefit.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
  
        {/* Additional Features Grid */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
                Additional Capabilities
              </h2>
              <p className="mt-4 text-xl text-gray-600">
                More features to streamline your workflow
              </p>
            </div>
  
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {additionalFeatures.map((feature, index) => (
                <div key={index} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                  <div className="inline-flex p-2 rounded-lg bg-indigo-50 text-indigo-600 mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
  
        {/* GST Compliance Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center px-3 py-1 bg-green-100 rounded-full text-green-700 text-sm font-medium mb-6">
                  <Award className="h-4 w-4 mr-2" />
                  100% GST Compliant
                </div>
                
                <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-6">
                  Built for Indian
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600"> GST Regulations</span>
                </h2>
                
                <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                  Every feature is designed to ensure complete compliance with Indian GST laws. 
                  Stay updated with automatic regulation updates and never worry about compliance issues.
                </p>
  
                <div className="grid grid-cols-2 gap-4">
                  {complianceFeatures.map((feature, index) => (
                    <div key={index} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900">{feature.title}</p>
                        <p className="text-sm text-gray-600">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
  
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-green-200 to-blue-200 rounded-2xl transform rotate-1"></div>
                <div className="relative bg-white p-8 rounded-2xl shadow-xl">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">GST Compliance Score</span>
                      <span className="text-sm font-bold text-green-600">100%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full w-full"></div>
                    </div>
                    
                    <div className="space-y-3 mt-6">
                      {['CGST/SGST Calculations', 'IGST for Inter-state', 'Place of Supply', 'Invoice Sequence'].map((item, idx) => (
                        <div key={idx} className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          <span className="text-sm text-gray-700">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
  
        {/* Integration & Support Section */}
        <section className="py-20 bg-indigo-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-extrabold">
                Ready When You Are
              </h2>
              <p className="mt-4 text-xl text-indigo-200">
                Enterprise-grade reliability with human support
              </p>
            </div>
  
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-500 rounded-2xl mb-6">
                  <Zap className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Instant Setup</h3>
                <p className="text-indigo-200">
                  Get started in under 5 minutes. No complex configurations or technical knowledge required.
                </p>
              </div>
  
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-500 rounded-2xl mb-6">
                  <Headphones className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Expert Support</h3>
                <p className="text-indigo-200">
                  Get help when you need it from our team of GST and invoicing experts. Available via chat, email, and phone.
                </p>
              </div>
  
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-500 rounded-2xl mb-6">
                  <RefreshCw className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Always Updated</h3>
                <p className="text-indigo-200">
                  Automatic updates ensure you're always compliant with the latest GST regulations and tax changes.
                </p>
              </div>
            </div>
          </div>
        </section>
  
        {/* CTA Section */}
        <section className="py-20 bg-gray-900 text-white">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-6">
              Ready to Transform Your Invoicing?
            </h2>
            <p className="text-xl text-gray-300 mb-10">
              Join thousands of Indian businesses already using our platform to streamline their GST invoicing
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full font-medium hover:from-indigo-700 hover:to-purple-700 transform hover:-translate-y-0.5 transition-all shadow-lg">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
              <button className="inline-flex items-center px-8 py-4 border-2 border-gray-600 text-gray-300 rounded-full font-medium hover:border-gray-500 hover:text-white transition-all">
                <Calendar className="mr-2 h-5 w-5" />
                Schedule Demo
              </button>
            </div>
  
            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                { icon: <Clock className="h-6 w-6" />, text: "5-minute setup" },
                { icon: <Shield className="h-6 w-6" />, text: "Bank-grade security" },
                { icon: <Headphones className="h-6 w-6" />, text: "24/7 support" },
                { icon: <Award className="h-6 w-6" />, text: "GST compliant" }
              ].map((item, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div className="text-gray-400 mb-2">{item.icon}</div>
                  <span className="text-sm text-gray-300">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    );
  }