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
  
  // Unwrap the params Promise
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
      // Import PDF generation libraries dynamically
      const { default: html2canvas } = await import('html2canvas');
      const { jsPDF } = await import('jspdf');

      // Generate canvas from invoice template
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        logging: false,
        useCORS: true,
      });

      // Create PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      // Add image to PDF
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add new pages if content is longer than one page
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Save PDF
      pdf.save(`${invoice.invoiceNumber}.pdf`);
      toast.success('PDF downloaded successfully');
    } catch (error) {
      toast.error('Failed to generate PDF');
      console.error('PDF generation error:', error);
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
      <div className="mb-6 bg-white shadow rounded-lg p-6">
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
                  Download PDF
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
        <div className="mt-6 bg-white shadow rounded-lg p-6">
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