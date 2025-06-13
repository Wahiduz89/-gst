// src/app/(dashboard)/invoices/[id]/page.tsx

'use client';

import { useState, useEffect, useRef, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft,
  Download,
  Edit,
  Printer,
  Mail,
  CheckCircle,
  XCircle,
  FileText,
  Loader2,
  Building2,
  Phone,
  MapPin,
  Calendar,
  Hash
} from 'lucide-react';
import toast from 'react-hot-toast';
import { formatCurrency, numberToWords } from '@/lib/utils';
import { format } from 'date-fns';
import InvoiceTemplate from '@/components/invoice/InvoiceTemplate';

interface InvoiceDetails {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string | null;
  status: 'DRAFT' | 'GENERATED' | 'CANCELLED';
  customerName: string;
  customerGST: string | null;
  customerAddress: string;
  customerPhone: string | null;
  customerEmail: string | null;
  subtotal: string;
  cgst: string;
  sgst: string;
  igst: string;
  totalAmount: string;
  isInterState: boolean;
  termsConditions: string | null;
  notes: string | null;
  createdAt: string;
  items: Array<{
    id: string;
    description: string;
    quantity: string;
    rate: string;
    gstRate: string;
    amount: string;
    cgst: string;
    sgst: string;
    igst: string;
    totalAmount: string;
  }>;
  user: {
    businessName: string;
    businessAddress: string;
    businessGST: string | null;
    businessPhone: string | null;
    businessEmail: string | null;
  };
}

export default function InvoiceViewPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const shouldDownload = searchParams.get('download') === 'true';
  
  const { id } = use(params);
  
  const [invoice, setInvoice] = useState<InvoiceDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const invoiceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchInvoice();
  }, [id]);

  useEffect(() => {
    if (shouldDownload && invoice && invoice.status === 'GENERATED') {
      handleDownloadPDF();
    }
  }, [shouldDownload, invoice]);

  const fetchInvoice = async () => {
    try {
      const response = await fetch(`/api/invoices/${id}`);
      
      if (response.ok) {
        const data = await response.json();
        setInvoice(data);
      } else if (response.status === 404) {
        toast.error('Invoice not found');
        router.push('/invoices');
      } else {
        toast.error('Failed to load invoice');
      }
    } catch (error) {
      toast.error('Error loading invoice');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: 'GENERATED' | 'CANCELLED') => {
    try {
      const response = await fetch(`/api/invoices/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        toast.success(`Invoice ${newStatus.toLowerCase()} successfully`);
        fetchInvoice();
      } else {
        toast.error('Failed to update invoice status');
      }
    } catch (error) {
      toast.error('Error updating invoice status');
    }
  };

  const handleDownloadPDF = async () => {
    if (!invoice || !invoiceRef.current) return;

    setIsGeneratingPDF(true);
    
    try {
      // Create a temporary container with PDF-compatible styling
      const originalElement = invoiceRef.current;
      const tempContainer = document.createElement('div');
      
      // Apply the PDF-compatible class defined in globals.css
      tempContainer.className = 'pdf-generation';
      tempContainer.style.cssText = `
        position: fixed;
        top: -10000px;
        left: -10000px;
        width: 800px;
        background: #ffffff;
        font-family: Arial, sans-serif;
        color: #111827;
        z-index: -999;
        padding: 40px;
      `;

      // Clone the original content
      const clonedContent = originalElement.cloneNode(true) as HTMLElement;
      
      // Apply additional compatibility styles to ensure no oklch colors remain
      const sanitizeElement = (element: HTMLElement) => {
        // Remove any inline styles that might contain oklch
        const style = element.style;
        const computedStyle = window.getComputedStyle(element);
        
        // Override with compatible colors based on classes
        if (element.classList.contains('text-gray-900')) {
          element.style.color = '#111827';
        } else if (element.classList.contains('text-gray-800')) {
          element.style.color = '#1f2937';
        } else if (element.classList.contains('text-gray-700')) {
          element.style.color = '#374151';
        } else if (element.classList.contains('text-gray-600')) {
          element.style.color = '#4b5563';
        } else if (element.classList.contains('text-gray-500')) {
          element.style.color = '#6b7280';
        } else if (element.classList.contains('text-indigo-600')) {
          element.style.color = '#4f46e5';
        } else if (element.classList.contains('text-indigo-700')) {
          element.style.color = '#4338ca';
        }
        
        // Override background colors
        if (element.classList.contains('bg-white')) {
          element.style.backgroundColor = '#ffffff';
        } else if (element.classList.contains('bg-gray-50')) {
          element.style.backgroundColor = '#f9fafb';
        } else if (element.classList.contains('bg-gray-100')) {
          element.style.backgroundColor = '#f3f4f6';
        }
        
        // Override border colors
        if (element.classList.contains('border-gray-200')) {
          element.style.borderColor = '#e5e7eb';
        } else if (element.classList.contains('border-gray-300')) {
          element.style.borderColor = '#d1d5db';
        }
        
        // Ensure font family is set
        element.style.fontFamily = 'Arial, sans-serif';
        
        // Process child elements recursively
        const children = element.children;
        for (let i = 0; i < children.length; i++) {
          const child = children[i];
          if (child instanceof HTMLElement) {
            sanitizeElement(child);
          }
        }
      };

      // Sanitize the cloned content
      sanitizeElement(clonedContent);
      
      // Append to temporary container
      tempContainer.appendChild(clonedContent);
      document.body.appendChild(tempContainer);

      // Wait for styles to be applied
      await new Promise(resolve => setTimeout(resolve, 100));

      // Import PDF generation libraries dynamically
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf')
      ]);

      // Generate canvas with enhanced compatibility settings
      const canvas = await html2canvas(tempContainer, {
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        removeContainer: false,
        imageTimeout: 15000,
        width: 800,
        height: tempContainer.scrollHeight,
        ignoreElements: (element) => {
          // Skip elements that might cause parsing issues
          const tagName = element.tagName.toLowerCase();
          return tagName === 'script' || 
                 tagName === 'style' ||
                 tagName === 'link' ||
                 element.style.display === 'none' ||
                 element.style.visibility === 'hidden';
        },
        onclone: (clonedDoc) => {
          // Final sanitization pass on the cloned document
          const allElements = clonedDoc.querySelectorAll('*');
          allElements.forEach(el => {
            if (el instanceof HTMLElement) {
              // Ensure Arial font family
              el.style.fontFamily = 'Arial, sans-serif';
              
              // Remove any remaining CSS custom properties or oklch references
              const computedStyle = window.getComputedStyle(el);
              const inlineStyle = el.style;
              
              // Check for and remove problematic color values
              for (let i = inlineStyle.length - 1; i >= 0; i--) {
                const property = inlineStyle[i];
                const value = inlineStyle.getPropertyValue(property);
                
                if (value.includes('oklch') || value.includes('var(--')) {
                  inlineStyle.removeProperty(property);
                }
              }
            }
          });
          
          // Set document background to white
          if (clonedDoc.body) {
            clonedDoc.body.style.backgroundColor = '#ffffff';
            clonedDoc.body.style.color = '#111827';
          }
        },
      });

      // Remove temporary container
      document.body.removeChild(tempContainer);

      // Create PDF with optimal settings
      const imgData = canvas.toDataURL('image/png', 0.98);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
      });

      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, '', 'FAST');
      heightLeft -= pageHeight;

      // Add additional pages if content exceeds one page
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, '', 'FAST');
        heightLeft -= pageHeight;
      }

      // Save the PDF with invoice number as filename
      pdf.save(`${invoice.invoiceNumber}.pdf`);
      toast.success('PDF downloaded successfully');
      
    } catch (error) {
      console.error('PDF generation error:', error);
      
      // Provide specific error handling based on error type
      if (error instanceof Error) {
        if (error.message.includes('oklch') || error.message.includes('color function')) {
          toast.error('PDF generation failed due to color compatibility issues. Please refresh the page and try again.');
        } else if (error.message.includes('canvas') || error.message.includes('html2canvas')) {
          toast.error('Failed to render invoice content. Please check your browser compatibility.');
        } else if (error.message.includes('jsPDF')) {
          toast.error('Failed to create PDF document. Please try again.');
        } else {
          toast.error('An unexpected error occurred during PDF generation.');
        }
      } else {
        toast.error('Failed to generate PDF. Please try again.');
      }
      
      // Offer fallback option to use browser print
      const useBrowserPrint = window.confirm(
        'PDF generation failed. Would you like to use your browser\'s print dialog as an alternative?'
      );
      
      if (useBrowserPrint) {
        // Add print-specific styles temporarily
        const printStyle = document.createElement('style');
        printStyle.textContent = `
          @media print {
            body * { visibility: hidden; }
            .invoice-print-area, .invoice-print-area * { visibility: visible; }
            .invoice-print-area { position: absolute; left: 0; top: 0; width: 100%; }
            .no-print { display: none !important; }
          }
        `;
        document.head.appendChild(printStyle);
        
        // Add print class to invoice area
        if (invoiceRef.current) {
          invoiceRef.current.classList.add('invoice-print-area');
        }
        
        // Trigger print dialog
        window.print();
        
        // Clean up after print dialog closes
        setTimeout(() => {
          document.head.removeChild(printStyle);
          if (invoiceRef.current) {
            invoiceRef.current.classList.remove('invoice-print-area');
          }
        }, 1000);
      }
      
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!invoice) {
    return null;
  }

  const getStatusIcon = () => {
    switch (invoice.status) {
      case 'GENERATED':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'CANCELLED':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <FileText className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusBadge = () => {
    const statusConfig = {
      DRAFT: 'bg-yellow-100 text-yellow-800',
      GENERATED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
    };
    return statusConfig[invoice.status];
  };

  return (
    <div>
      {/* Page Header */}
      <div className="mb-6 bg-white shadow rounded-lg p-6 no-print">
        <div className="flex items-center justify-between mb-4">
          <Link
            href="/invoices"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Invoices
          </Link>
          
          <div className="flex items-center space-x-4">
            {invoice.status === 'DRAFT' && (
              <>
                <Link
                  href={`/invoices/${invoice.id}/edit`}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Link>
                <button
                  onClick={() => handleStatusChange('GENERATED')}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Mark as Generated
                </button>
              </>
            )}
            
            {invoice.status === 'GENERATED' && (
              <>
                <button
                  onClick={handlePrint}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <Printer className="mr-2 h-4 w-4" />
                  Print
                </button>
                <button
                  onClick={handleDownloadPDF}
                  disabled={isGeneratingPDF}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGeneratingPDF ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="mr-2 h-4 w-4" />
                  )}
                  {isGeneratingPDF ? 'Generating...' : 'Download PDF'}
                </button>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              {getStatusIcon()}
              <span className="ml-2">{invoice.invoiceNumber}</span>
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Created on {format(new Date(invoice.createdAt), 'dd MMMM yyyy')}
            </p>
          </div>
          <span className={`inline-flex text-sm leading-5 font-semibold rounded-full px-3 py-1 ${getStatusBadge()}`}>
            {invoice.status}
          </span>
        </div>
      </div>

      {/* Invoice Preview */}
      <div className="bg-white shadow rounded-lg">
        <div ref={invoiceRef}>
          <InvoiceTemplate invoice={invoice} />
        </div>
      </div>

      {/* Action Buttons for Draft */}
      {invoice.status === 'DRAFT' && (
        <div className="mt-6 bg-white shadow rounded-lg p-6 no-print">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Invoice Actions</h3>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => handleStatusChange('GENERATED')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <CheckCircle className="mr-2 h-5 w-5" />
              Generate Invoice
            </button>
            <button
              onClick={() => handleStatusChange('CANCELLED')}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              <XCircle className="mr-2 h-5 w-5" />
              Cancel Invoice
            </button>
          </div>
        </div>
      )}
    </div>
  );
}