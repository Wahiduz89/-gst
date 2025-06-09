// src/app/(dashboard)/invoices/new/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { 
  ArrowLeft,
  Calendar,
  FileText,
  Save,
  Send,
  Loader2,
  AlertCircle,
  Plus,
  Trash2
} from 'lucide-react';
import { format } from 'date-fns';
import CustomerSelector from '@/components/customers/CustomerSelector';
import InvoiceItems from '@/components/invoice/InvoiceItems';
import InvoiceTotals from '@/components/invoice/InvoiceTotals';

// Form validation schema
const invoiceFormSchema = z.object({
  customerId: z.string().optional(),
  customerName: z.string().min(2, 'Customer name is required'),
  customerGST: z.string().optional(),
  customerAddress: z.string().min(5, 'Customer address is required'),
  customerPhone: z.string().optional(),
  customerEmail: z.string().optional(),
  invoiceDate: z.string(),
  dueDate: z.string().optional(),
  isInterState: z.boolean(),
  termsConditions: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(z.object({
    description: z.string().min(1, 'Description is required'),
    quantity: z.number().positive('Quantity must be positive'),
    rate: z.number().positive('Rate must be positive'),
    gstRate: z.number().min(0).max(28),
  })).min(1, 'At least one item is required'),
});

type InvoiceFormData = z.infer<typeof invoiceFormSchema>;

interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
  gstRate: number;
}

export default function CreateInvoicePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedCustomerId = searchParams.get('customerId');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveAsDraft, setSaveAsDraft] = useState(false);
  const [businessInfo, setBusinessInfo] = useState<any>(null);
  const [isLoadingBusinessInfo, setIsLoadingBusinessInfo] = useState(true);
  const [totals, setTotals] = useState({
    subtotal: 0,
    cgst: 0,
    sgst: 0,
    igst: 0,
    totalAmount: 0,
  });

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      invoiceDate: format(new Date(), 'yyyy-MM-dd'),
      isInterState: false,
      items: [{ description: '', quantity: 1, rate: 0, gstRate: 18 }],
    },
  });

  const watchedItems = watch('items');
  const watchedIsInterState = watch('isInterState');

  // Fetch business information
  useEffect(() => {
    fetchBusinessInfo();
  }, []);

  const fetchBusinessInfo = async () => {
    try {
      const response = await fetch('/api/user/profile');
      if (response.ok) {
        const data = await response.json();
        setBusinessInfo(data.user);
      } else {
        toast.error('Failed to load business information');
      }
    } catch (error) {
      toast.error('Error loading business information');
    } finally {
      setIsLoadingBusinessInfo(false);
    }
  };

  const handleCustomerSelect = (customer: any) => {
    if (customer) {
      setValue('customerId', customer.id);
      setValue('customerName', customer.name);
      setValue('customerGST', customer.gstNumber || '');
      setValue('customerAddress', customer.address);
      setValue('customerPhone', customer.phone || '');
      setValue('customerEmail', customer.email || '');
      
      // Determine if inter-state based on GST numbers
      if (businessInfo?.businessGST && customer.gstNumber) {
        const businessStateCode = businessInfo.businessGST.substring(0, 2);
        const customerStateCode = customer.gstNumber.substring(0, 2);
        setValue('isInterState', businessStateCode !== customerStateCode);
      }
    } else {
      // Clear customer fields
      setValue('customerId', '');
      setValue('customerName', '');
      setValue('customerGST', '');
      setValue('customerAddress', '');
      setValue('customerPhone', '');
      setValue('customerEmail', '');
      setValue('isInterState', false);
    }
  };

  const onSubmit = async (data: InvoiceFormData) => {
    setIsSubmitting(true);

    try {
      const invoiceData = {
        ...data,
        invoiceDate: new Date(data.invoiceDate).toISOString(),
        dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : null,
        status: saveAsDraft ? 'DRAFT' : 'GENERATED',
      };

      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invoiceData),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(`Invoice ${saveAsDraft ? 'saved as draft' : 'generated'} successfully`);
        router.push(`/invoices/${result.invoice.id}`);
      } else {
        toast.error(result.error || 'Failed to create invoice');
      }
    } catch (error) {
      toast.error('Error creating invoice');
    } finally {
      setIsSubmitting(false);
      setSaveAsDraft(false);
    }
  };

  if (isLoadingBusinessInfo) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!businessInfo?.businessName || !businessInfo?.businessAddress) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex">
            <AlertCircle className="h-6 w-6 text-yellow-600 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-lg font-medium text-yellow-800">
                Complete Your Business Profile
              </h3>
              <p className="mt-2 text-sm text-yellow-700">
                Before creating invoices, you need to set up your business information.
                This information will appear on all your invoices.
              </p>
              <div className="mt-4">
                <Link
                  href="/dashboard/settings"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-yellow-800 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                >
                  Go to Business Settings
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <Link
          href="/invoices"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Invoices
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Create New Invoice</h1>
        <p className="mt-2 text-sm text-gray-600">
          Fill in the details below to generate a GST-compliant invoice
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Customer Selection */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Customer Details</h2>
          
          <CustomerSelector
            selectedCustomerId={preselectedCustomerId || undefined}
            onCustomerSelect={handleCustomerSelect}
            onNewCustomer={() => router.push('/customers/new')}
          />
        </div>

        {/* Invoice Details */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Invoice Details</h2>
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="invoiceDate" className="block text-sm font-medium text-gray-700">
                Invoice Date
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('invoiceDate')}
                  type="date"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              {errors.invoiceDate && (
                <p className="mt-1 text-sm text-red-600">{errors.invoiceDate.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">
                Due Date (Optional)
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('dueDate')}
                  type="date"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>
          </div>

          <div className="mt-4">
            <label className="flex items-center">
              <input
                {...register('isInterState')}
                type="checkbox"
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">
                Inter-state transaction (IGST will be applied instead of CGST/SGST)
              </span>
            </label>
          </div>
        </div>

        {/* Invoice Items */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Invoice Items</h2>
              <InvoiceItems
                control={control}
                register={register}
                errors={errors}
                isInterState={watchedIsInterState}
                onTotalsChange={setTotals}
              />
            </div>
          </div>

          {/* Invoice Totals */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg p-6">
              <InvoiceTotals
                subtotal={totals.subtotal}
                cgst={totals.cgst}
                sgst={totals.sgst}
                igst={totals.igst}
                totalAmount={totals.totalAmount}
                isInterState={watchedIsInterState}
              />
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Additional Information</h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="termsConditions" className="block text-sm font-medium text-gray-700">
                Terms & Conditions (Optional)
              </label>
              <textarea
                {...register('termsConditions')}
                rows={3}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Payment terms, delivery conditions, etc."
              />
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                Notes (Optional)
              </label>
              <textarea
                {...register('notes')}
                rows={3}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Additional notes or comments"
              />
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3">
          <Link
            href="/invoices"
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </Link>
          <button
            type="submit"
            onClick={() => setSaveAsDraft(true)}
            disabled={isSubmitting}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting && saveAsDraft ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save as Draft
              </>
            )}
          </button>
          <button
            type="submit"
            onClick={() => setSaveAsDraft(false)}
            disabled={isSubmitting}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting && !saveAsDraft ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Generate Invoice
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}