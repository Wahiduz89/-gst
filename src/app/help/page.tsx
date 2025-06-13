// src/app/help/page.tsx

import Link from 'next/link';
import { 
  ArrowLeft, 
  HelpCircle, 
  FileText, 
  Users, 
  CreditCard, 
  Settings, 
  Download,
  Calculator,
  Building2,
  Phone,
  Mail,
  Globe,
  CheckCircle,
  AlertCircle,
  Search,
  Book,
  PlayCircle,
  MessageSquare,
  ExternalLink
} from 'lucide-react';

export default function HelpCenterPage() {
  const faqCategories = [
    {
      title: "Getting Started",
      icon: <PlayCircle className="h-6 w-6" />,
      faqs: [
        {
          question: "How do I create my first invoice?",
          answer: "After signing up, complete your business profile in Settings, then click 'Create Invoice' from the dashboard. Add customer details, invoice items with GST rates, and generate your professional invoice instantly."
        },
        {
          question: "What information do I need to set up my business profile?",
          answer: "You need your business name, complete address, GST number (if registered), contact details, and business state. This information appears on all your invoices and ensures GST compliance."
        },
        {
          question: "Can I use the platform without a GST number?",
          answer: "Yes, you can create invoices without a GST number for B2C transactions. However, having a GST number enables B2B invoicing with proper tax calculations and compliance features."
        }
      ]
    },
    {
      title: "GST & Compliance",
      icon: <Calculator className="h-6 w-6" />,
      faqs: [
        {
          question: "How does the platform handle inter-state and intra-state transactions?",
          answer: "The system automatically detects transaction type based on GST numbers. Inter-state transactions apply IGST, while intra-state transactions split GST into CGST and SGST equally. All calculations comply with Indian GST regulations."
        },
        {
          question: "What GST rates are supported?",
          answer: "We support all standard GST rates: 0%, 5%, 12%, 18%, and 28%. You can assign different rates to different items in the same invoice based on product categories and HSN codes."
        },
        {
          question: "Are the invoices legally compliant for GST filing?",
          answer: "Yes, all invoices generated are 100% GST compliant with proper sequential numbering, mandatory fields, tax calculations, and formatting as per GST guidelines. They can be directly used for tax filing."
        },
        {
          question: "How is the place of supply determined?",
          answer: "Place of supply is automatically determined based on customer's GST number state code or manually selected state. This ensures correct tax application for inter-state versus intra-state transactions."
        }
      ]
    },
    {
      title: "Customer Management",
      icon: <Users className="h-6 w-6" />,
      faqs: [
        {
          question: "How do I add and manage customers?",
          answer: "Navigate to the Customers section to add new customers with their details including GST numbers. You can search, edit, and organize customer information. The system maintains a complete transaction history for each customer."
        },
        {
          question: "Can I import customers in bulk?",
          answer: "Currently, customers are added individually through the interface. Bulk import functionality is planned for future releases. You can quickly add customers during invoice creation if needed."
        },
        {
          question: "What's the difference between B2B and B2C customers?",
          answer: "B2B customers have GST numbers and receive detailed tax invoices with full GST breakdown. B2C customers are individuals without GST numbers who receive simplified invoices without detailed tax information."
        }
      ]
    },
    {
      title: "Invoicing Features",
      icon: <FileText className="h-6 w-6" />,
      faqs: [
        {
          question: "Can I customize invoice templates?",
          answer: "Professional and Enterprise plans include customizable templates. You can add your logo, adjust colors, modify layouts, and include custom terms and conditions to match your brand identity."
        },
        {
          question: "How do I set payment terms and due dates?",
          answer: "When creating an invoice, you can set custom due dates and add payment terms in the Terms & Conditions section. Common terms like 'Net 30' or 'Payment on delivery' can be saved as templates."
        },
        {
          question: "Can I edit invoices after creation?",
          answer: "Draft invoices can be edited until they are marked as 'Generated'. Once generated, invoices cannot be modified to maintain audit trail integrity. You can create credit notes for corrections if needed."
        },
        {
          question: "What formats can I export invoices in?",
          answer: "Invoices can be exported as professional PDF files optimized for printing and digital sharing. The PDFs include all necessary legal information and maintain formatting consistency."
        }
      ]
    },
    {
      title: "Billing & Plans",
      icon: <CreditCard className="h-6 w-6" />,
      faqs: [
        {
          question: "What's included in the free plan?",
          answer: "The free plan includes up to 10 invoices per month, unlimited customers, basic GST calculations, PDF export, and email support. Perfect for freelancers and small businesses getting started."
        },
        {
          question: "When should I upgrade to a paid plan?",
          answer: "Upgrade when you need more than 10 invoices per month, want advanced features like custom templates, priority support, analytics dashboards, or bulk operations for growing business needs."
        },
        {
          question: "How does billing work for paid plans?",
          answer: "Paid plans are billed monthly or annually in advance. All payments are processed securely through our payment partners. You can upgrade, downgrade, or cancel anytime from your account settings."
        },
        {
          question: "Is there a discount for annual billing?",
          answer: "Yes, annual billing offers significant savings compared to monthly billing. Contact our sales team for current discount rates and enterprise pricing options."
        }
      ]
    },
    {
      title: "Technical Support",
      icon: <Settings className="h-6 w-6" />,
      faqs: [
        {
          question: "What browsers are supported?",
          answer: "We support all modern browsers including Chrome, Firefox, Safari, and Edge. For optimal experience, use the latest browser versions with JavaScript enabled."
        },
        {
          question: "Is my data secure and backed up?",
          answer: "Yes, we use bank-grade encryption for data protection and maintain regular automated backups. All data is stored securely in compliance with international data protection standards."
        },
        {
          question: "Can I access the platform on mobile devices?",
          answer: "Yes, the platform is fully responsive and works seamlessly on smartphones and tablets. You can create, view, and manage invoices from any device with internet access."
        },
        {
          question: "What happens if I experience technical issues?",
          answer: "Contact our support team immediately through the channels listed below. We provide email support for free users and priority support for paid plan subscribers with faster response times."
        }
      ]
    }
  ];

  const quickLinks = [
    {
      title: "Video Tutorials",
      description: "Watch step-by-step guides for common tasks",
      icon: <PlayCircle className="h-5 w-5" />,
      href: "#tutorials"
    },
    {
      title: "Feature Documentation",
      description: "Detailed guides for all platform features",
      icon: <Book className="h-5 w-5" />,
      href: "#documentation"
    },
    {
      title: "API Documentation", 
      description: "Integration guides for developers",
      icon: <Globe className="h-5 w-5" />,
      href: "#api"
    },
    {
      title: "Contact Support",
      description: "Get help from our support team",
      icon: <MessageSquare className="h-5 w-5" />,
      href: "/contact"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
          
          <div className="flex items-center mb-6">
            <HelpCircle className="h-10 w-10 text-indigo-600 mr-3" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Help Center</h1>
              <p className="text-gray-600">Find answers to common questions and get support</p>
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="max-w-2xl">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search for help articles, guides, or FAQs..."
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Quick Links */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Access</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickLinks.map((link, index) => (
              <Link
                key={index}
                href={link.href}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow group"
              >
                <div className="flex items-center mb-3">
                  <div className="p-2 bg-indigo-50 rounded-lg group-hover:bg-indigo-100 transition-colors">
                    {link.icon}
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{link.title}</h3>
                <p className="text-sm text-gray-600">{link.description}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* FAQ Sections */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
          <div className="space-y-8">
            {faqCategories.map((category, categoryIndex) => (
              <div key={categoryIndex} className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center">
                    <div className="p-2 bg-indigo-50 rounded-lg mr-3">
                      {category.icon}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">{category.title}</h3>
                  </div>
                </div>
                <div className="p-6">
                  <div className="space-y-6">
                    {category.faqs.map((faq, faqIndex) => (
                      <div key={faqIndex}>
                        <h4 className="text-lg font-medium text-gray-900 mb-2 flex items-start">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          {faq.question}
                        </h4>
                        <p className="text-gray-600 leading-relaxed ml-7">{faq.answer}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Still Need Help */}
        <section className="mt-12">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg shadow-lg p-8 text-white text-center">
            <h2 className="text-2xl font-bold mb-4">Still Need Help?</h2>
            <p className="text-indigo-100 mb-6 max-w-2xl mx-auto">
              Can't find what you're looking for? Our support team is here to help you get the most out of GST Invoice Generator.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="inline-flex items-center px-6 py-3 bg-white text-indigo-600 rounded-lg font-medium hover:bg-gray-100 transition-colors"
              >
                <MessageSquare className="mr-2 h-5 w-5" />
                Contact Support
              </Link>
              <a
                href="mailto:help@gstinvoicegenerator.com"
                className="inline-flex items-center px-6 py-3 border-2 border-white text-white rounded-lg font-medium hover:bg-white hover:text-indigo-600 transition-colors"
              >
                <Mail className="mr-2 h-5 w-5" />
                Email Us Directly
              </a>
            </div>
          </div>
        </section>

        {/* Contact Information */}
        <section className="mt-12">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Support Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-50 rounded-lg mb-4">
                  <Mail className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="font-medium text-gray-900 mb-2">Email Support</h3>
                <p className="text-sm text-gray-600 mb-2">
                  Get help via email with detailed responses
                </p>
                <p className="text-sm font-medium text-indigo-600">
                  help@gstinvoicegenerator.com
                </p>
              </div>
              
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-green-50 rounded-lg mb-4">
                  <Phone className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-medium text-gray-900 mb-2">Phone Support</h3>
                <p className="text-sm text-gray-600 mb-2">
                  Premium plan users only
                </p>
                <p className="text-sm font-medium text-green-600">
                  Available 9 AM - 6 PM IST
                </p>
              </div>
              
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-50 rounded-lg mb-4">
                  <MessageSquare className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-medium text-gray-900 mb-2">Live Chat</h3>
                <p className="text-sm text-gray-600 mb-2">
                  Real-time assistance during business hours
                </p>
                <p className="text-sm font-medium text-blue-600">
                  Monday - Friday, 9 AM - 6 PM IST
                </p>
              </div>
            </div>
            
            <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium mb-1">Response Times</p>
                  <ul className="list-disc list-inside space-y-1 text-yellow-700">
                    <li>Free Plan: Within 48 hours via email</li>
                    <li>Professional Plan: Within 24 hours with priority support</li>
                    <li>Enterprise Plan: Within 4 hours with dedicated support</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}