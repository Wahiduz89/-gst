// src/app/(dashboard)/invoices/[id]/edit/page.tsx

'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
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
  Loader2,
  AlertCircle,
  X
} from 'lucide-react';
import { format } from 'date-fns';
import CustomerSelector from '@/components/customers/CustomerSelector';
import InvoiceItems from '@/components/invoice/InvoiceItems';
import InvoiceTotals from '@/components/invoice/InvoiceTotals';

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

interface InvoiceDetails {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string | null;
  status: string;
  customerId: string | null;
  customerName: string;
  customerGST: string | null;
  customerAddress: string;
  customerPhone: string | null;
  customerEmail: string | null;
  isInterState: boolean;
  termsConditions: string | null;
  notes: string | null;
  items: Array<{
    description: string;
    quantity: string;
    rate: string;
    gstRate: string;
  }>;
}

export default function EditInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  
  // Unwrap the params Promise
  const { id } = use(params);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [invoice, setInvoice] = useState<InvoiceDetails | null>(null);
  const [businessInfo, setBusinessInfo] = useState<any>(null);
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
    reset,
    formState: { errors },
  } = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceFormSchema),
  });

  const watchedItems = watch('items');
  const watchedIsInterState = watch('isInterState');

  useEffect(() => {
    fetchInvoiceAndBusinessInfo();
  }, [id]);

  const fetchInvoiceAndBusinessInfo = async () => {
    try {
      // Fetch invoice details
      const invoiceResponse = await fetch(`/api/invoices/${id}`);
      if (!invoiceResponse.ok) {
        if (invoiceResponse.status === 404) {
          toast.error('Invoice not found');
          router.push('/invoices');
          return;
        }
        throw new Error('Failed to load invoice');
      }

      const invoiceData = await invoiceResponse.json();
      
      // Check if invoice is editable
      if (invoiceData.status !== 'DRAFT') {
        toast.error('Only draft invoices can be edited');
        router.push(`/invoices/${id}`);
        return;
      }

      setInvoice(invoiceData);

      // Fetch business information
      const businessResponse = await fetch('/api/user/profile');
      if (businessResponse.ok) {
        const businessData = await businessResponse.json();
        setBusinessInfo(businessData.user);
      }

      // Populate form with invoice data
      reset({
        customerId: invoiceData.customerId || '',
        customerName: invoiceData.customerName,
        customerGST: invoiceData.customerGST || '',
        customerAddress: invoiceData.customerAddress,
        customerPhone: invoiceData.customerPhone || '',
        customerEmail: invoiceData.customerEmail || '',
        invoiceDate: format(new Date(invoiceData.invoiceDate), 'yyyy-MM-dd'),
        dueDate: invoiceData.dueDate ? format(new Date(invoiceData.dueDate), 'yyyy-MM-dd') : '',
        isInterState: invoiceData.isInterState,
        termsConditions: invoiceData.termsConditions || '',
        notes: invoiceData.notes || '',
        items: invoiceData.items.map((item: any) => ({
          description: item.description,
          quantity: parseFloat(item.quantity),
          rate: parseFloat(item.rate),
          gstRate: parseFloat(item.gstRate),
        })),
      });

    } catch (error) {
      toast.error('Error loading invoice');
      router.push('/invoices');
    } finally {
      setIsLoading(false);
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
      };

      const response = await fetch(`/api/invoices/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invoiceData),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success('Invoice updated successfully');
        router.push(`/invoices/${id}`);
      } else {
        toast.error(result.error || 'Failed to update invoice');
      }
    } catch (error) {
      toast.error('Error updating invoice');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!invoice || !businessInfo) {
    return null;
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <Link
          href={`/invoices/${id}`}
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Invoice
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Invoice {invoice.invoiceNumber}
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Modify the invoice details below. Only draft invoices can be edited.
        </p>
      </div>

      <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex">
          <AlertCircle className="h-5 w-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-yellow-800">
              Invoice Status: DRAFT
            </h3>
            <p className="mt-1 text-sm text-yellow-700">
              This invoice is still in draft status. You can make changes until it is generated.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Customer Details</h2>
          
          <CustomerSelector
            selectedCustomerId={invoice.customerId || undefined}
            onCustomerSelect={handleCustomerSelect}
            onNewCustomer={() => router.push('/customers/new')}
          />
        </div>

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

        <div className="flex justify-end space-x-3">
          <Link
            href={`/invoices/${id}`}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Update Invoice
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}