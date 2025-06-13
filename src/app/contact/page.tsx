// src/app/contact/page.tsx

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { 
  ArrowLeft, 
  MessageSquare, 
  Mail, 
  Phone, 
  MapPin, 
  Clock,
  Send,
  Loader2,
  Building2,
  HelpCircle,
  CreditCard,
  Users,
  AlertCircle,
  CheckCircle,
  Globe,
  FileText,
  Headphones
} from 'lucide-react';

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  category: z.string().min(1, 'Please select a category'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  priority: z.enum(['low', 'medium', 'high']),
});

type ContactFormData = z.infer<typeof contactSchema>;

export default function ContactUsPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      priority: 'medium',
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // In a real implementation, you would send this to your backend
      console.log('Contact form submitted:', data);
      
      toast.success('Message sent successfully! We\'ll respond within 24 hours.');
      setSubmitted(true);
      reset();
    } catch (error) {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactReasons = [
    {
      value: 'general',
      label: 'General Inquiry',
      icon: <HelpCircle className="h-5 w-5" />,
      description: 'General questions about our platform'
    },
    {
      value: 'technical',
      label: 'Technical Support',
      icon: <FileText className="h-5 w-5" />,
      description: 'Issues with invoices, features, or bugs'
    },
    {
      value: 'billing',
      label: 'Billing & Plans',
      icon: <CreditCard className="h-5 w-5" />,
      description: 'Questions about pricing, payments, or subscriptions'
    },
    {
      value: 'sales',
      label: 'Sales Inquiry',
      icon: <Users className="h-5 w-5" />,
      description: 'Enterprise plans and custom solutions'
    },
    {
      value: 'partnership',
      label: 'Partnership',
      icon: <Building2 className="h-5 w-5" />,
      description: 'Business partnerships and integrations'
    },
    {
      value: 'feedback',
      label: 'Feedback',
      icon: <MessageSquare className="h-5 w-5" />,
      description: 'Suggestions and feature requests'
    }
  ];

  const contactMethods = [
    {
      title: "Email Support",
      description: "Get detailed help via email",
      icon: <Mail className="h-8 w-8" />,
      contact: "support@gstinvoicegenerator.com",
      availability: "24/7 - Response within 24 hours",
      color: "indigo"
    },
    {
      title: "Phone Support",
      description: "Speak directly with our team",
      icon: <Phone className="h-8 w-8" />,
      contact: "+91 98765 43210",
      availability: "Mon-Fri, 9:00 AM - 6:00 PM IST",
      color: "green"
    },
    {
      title: "Live Chat",
      description: "Real-time assistance",
      icon: <MessageSquare className="h-8 w-8" />,
      contact: "Available on website",
      availability: "Mon-Fri, 9:00 AM - 6:00 PM IST",
      color: "blue"
    }
  ];

  const officeInfo = {
    address: "Tech Hub Innovation Center\nJorhat, Assam 785001\nIndia",
    businessHours: [
      { day: "Monday - Friday", hours: "9:00 AM - 6:00 PM IST" },
      { day: "Saturday", hours: "10:00 AM - 2:00 PM IST" },
      { day: "Sunday", hours: "Closed" }
    ]
  };

  if (submitted) {
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
          </div>
        </div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Message Sent Successfully!</h1>
            <p className="text-gray-600 mb-8">
              Thank you for contacting us. We've received your message and will respond within 24 hours. 
              You should receive a confirmation email shortly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Return to Home
              </Link>
              <button
                onClick={() => setSubmitted(false)}
                className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Send Another Message
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
            <MessageSquare className="h-10 w-10 text-indigo-600 mr-3" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Contact Us</h1>
              <p className="text-gray-600">Get in touch with our team for support, questions, or feedback</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Contact Methods */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Choose Your Preferred Contact Method</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {contactMethods.map((method, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-lg mb-4 ${
                  method.color === 'indigo' ? 'bg-indigo-50 text-indigo-600' :
                  method.color === 'green' ? 'bg-green-50 text-green-600' :
                  'bg-blue-50 text-blue-600'
                }`}>
                  {method.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{method.title}</h3>
                <p className="text-gray-600 mb-4">{method.description}</p>
                <p className={`font-medium mb-2 ${
                  method.color === 'indigo' ? 'text-indigo-600' :
                  method.color === 'green' ? 'text-green-600' :
                  'text-blue-600'
                }`}>
                  {method.contact}
                </p>
                <p className="text-sm text-gray-500">{method.availability}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Send us a Message</h2>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register('name')}
                      type="text"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="Your full name"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register('email')}
                      type="email"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="your.email@example.com"
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register('category')}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="">Select a category</option>
                    {contactReasons.map((reason) => (
                      <option key={reason.value} value={reason.value}>
                        {reason.label}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
                  )}
                  
                  {/* Category descriptions */}
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {contactReasons.map((reason) => (
                      <div key={reason.value} className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-gray-400 mr-2">
                          {reason.icon}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{reason.label}</p>
                          <p className="text-xs text-gray-600">{reason.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register('subject')}
                    type="text"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Brief description of your inquiry"
                  />
                  {errors.subject && (
                    <p className="mt-1 text-sm text-red-600">{errors.subject.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
                    Priority Level
                  </label>
                  <select
                    {...register('priority')}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="low">Low - General inquiry</option>
                    <option value="medium">Medium - Standard support</option>
                    <option value="high">High - Urgent issue</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    {...register('message')}
                    rows={6}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Please provide detailed information about your inquiry..."
                  />
                  {errors.message && (
                    <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>
                  )}
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">Before submitting:</p>
                      <ul className="list-disc list-inside space-y-1 text-blue-700">
                        <li>Check our <Link href="/help" className="underline">Help Center</Link> for quick answers</li>
                        <li>Include relevant details like error messages or invoice numbers</li>
                        <li>For technical issues, mention your browser and device type</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-5 w-5 mr-2" />
                        Send Message
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Contact Information Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Office Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Building2 className="h-5 w-5 mr-2 text-indigo-600" />
                Office Information
              </h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-1">Address</p>
                    <p className="text-sm text-gray-600 whitespace-pre-line">{officeInfo.address}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Business Hours */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Clock className="h-5 w-5 mr-2 text-indigo-600" />
                Business Hours
              </h3>
              <div className="space-y-2">
                {officeInfo.businessHours.map((schedule, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-gray-600">{schedule.day}</span>
                    <span className="font-medium text-gray-900">{schedule.hours}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Globe className="h-5 w-5 mr-2 text-indigo-600" />
                Quick Links
              </h3>
              <div className="space-y-3">
                <Link
                  href="/help"
                  className="flex items-center text-sm text-indigo-600 hover:text-indigo-700"
                >
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Help Center & FAQs
                </Link>
                <Link
                  href="/features"
                  className="flex items-center text-sm text-indigo-600 hover:text-indigo-700"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Feature Documentation
                </Link>
                <Link
                  href="/#pricing"
                  className="flex items-center text-sm text-indigo-600 hover:text-indigo-700"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Pricing & Plans
                </Link>
                <a
                  href="mailto:sales@gstinvoicegenerator.com"
                  className="flex items-center text-sm text-indigo-600 hover:text-indigo-700"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Enterprise Sales
                </a>
              </div>
            </div>

            {/* Response Time */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start">
                <Clock className="h-5 w-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium mb-1">Expected Response Times</p>
                  <ul className="space-y-1 text-yellow-700">
                    <li>• General inquiries: 24-48 hours</li>
                    <li>• Technical support: 12-24 hours</li>
                    <li>• Billing issues: 4-12 hours</li>
                    <li>• Enterprise: 2-4 hours</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}