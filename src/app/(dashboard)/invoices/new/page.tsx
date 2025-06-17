// src/app/(dashboard)/invoices/new/page.tsx - Enhanced version with HSN/SAC integration

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
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
  Trash2,
  Search,
  Star,
  Package,
  Tag
} from 'lucide-react';
import { format } from 'date-fns';
import CustomerSelector from '@/components/customers/CustomerSelector';
import InvoiceTotals from '@/components/invoice/InvoiceTotals';

// Enhanced form validation schema with HSN/SAC support
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
    hsnSacCode: z.string().optional(),
    hsnSacType: z.enum(['HSN', 'SAC']).optional(),
    unit: z.string().optional(),
  })).min(1, 'At least one item is required'),
});

type InvoiceFormData = z.infer<typeof invoiceFormSchema>;

interface HsnSacItem {
  code: string;
  description: string;
  type: 'HSN' | 'SAC';
  gstRate: number;
  unit?: string;
}

interface FrequentItem {
  id: string;
  description: string;
  rate: number;
  gstRate: number;
  hsnSacCode?: string;
  hsnSacType?: 'HSN' | 'SAC';
  unit?: string;
  usageCount: number;
}

export default function CreateInvoicePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedCustomerId = searchParams.get('customerId');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [businessInfo, setBusinessInfo] = useState<any>(null);
  const [isLoadingBusinessInfo, setIsLoadingBusinessInfo] = useState(true);
  const [totals, setTotals] = useState({
    subtotal: 0,
    cgst: 0,
    sgst: 0,
    igst: 0,
    totalAmount: 0,
  });

  // Enhanced HSN/SAC functionality states
  const [hsnSacItems, setHsnSacItems] = useState<HsnSacItem[]>([]);
  const [frequentItems, setFrequentItems] = useState<FrequentItem[]>([]);
  const [isLoadingHsnSac, setIsLoadingHsnSac] = useState(false);
  const [showFrequentItems, setShowFrequentItems] = useState(false);
  const [hsnSacSearchTerm, setHsnSacSearchTerm] = useState('');
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    getValues,
    formState: { errors },
  } = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      invoiceDate: format(new Date(), 'yyyy-MM-dd'),
      isInterState: false,
      items: [{ 
        description: '', 
        quantity: 1, 
        rate: 0, 
        gstRate: 18,
        hsnSacCode: '',
        hsnSacType: 'HSN',
        unit: 'PCS'
      }],
    },
  });

  const watchedItems = watch('items');
  const watchedIsInterState = watch('isInterState');

  // Fetch business information and enhanced data
  useEffect(() => {
    fetchBusinessInfo();
    fetchFrequentItems();
  }, []);

  // Calculate totals when items change
  useEffect(() => {
    calculateTotals();
  }, [watchedItems, watchedIsInterState]);

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

  const fetchFrequentItems = async () => {
    try {
      const response = await fetch('/api/items/frequent');
      if (response.ok) {
        const data = await response.json();
        setFrequentItems(data.items || []);
      }
    } catch (error) {
      console.error('Error loading frequent items:', error);
    }
  };

  const searchHsnSacCodes = async (searchTerm: string) => {
    if (searchTerm.length < 2) {
      setHsnSacItems([]);
      return;
    }

    setIsLoadingHsnSac(true);
    try {
      const response = await fetch(`/api/hsn-sac/search?q=${encodeURIComponent(searchTerm)}`);
      if (response.ok) {
        const data = await response.json();
        setHsnSacItems(data.items || []);
      }
    } catch (error) {
      console.error('Error searching HSN/SAC codes:', error);
    } finally {
      setIsLoadingHsnSac(false);
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

  const addItem = () => {
    const currentItems = getValues('items');
    setValue('items', [
      ...currentItems,
      { 
        description: '', 
        quantity: 1, 
        rate: 0, 
        gstRate: 18,
        hsnSacCode: '',
        hsnSacType: 'HSN',
        unit: 'PCS'
      }
    ]);
  };

  const removeItem = (index: number) => {
    const currentItems = getValues('items');
    if (currentItems.length > 1) {
      setValue('items', currentItems.filter((_, i) => i !== index));
    }
  };

  const handleHsnSacSelect = (item: HsnSacItem, itemIndex: number) => {
    setValue(`items.${itemIndex}.hsnSacCode`, item.code);
    setValue(`items.${itemIndex}.hsnSacType`, item.type);
    setValue(`items.${itemIndex}.gstRate`, item.gstRate);
    if (item.unit) {
      setValue(`items.${itemIndex}.unit`, item.unit);
    }
    setHsnSacItems([]);
    setHsnSacSearchTerm('');
    setSelectedItemIndex(null);
  };

  const handleFrequentItemSelect = (item: FrequentItem) => {
    const currentItems = getValues('items');
    const lastItemIndex = currentItems.length - 1;
    
    // Check if last item is empty, if so replace it, otherwise add new item
    const lastItem = currentItems[lastItemIndex];
    const isLastItemEmpty = !lastItem.description && lastItem.rate === 0;
    
    const newItem = {
      description: item.description,
      quantity: 1,
      rate: item.rate,
      gstRate: item.gstRate,
      hsnSacCode: item.hsnSacCode || '',
      hsnSacType: (item.hsnSacType || 'HSN') as 'HSN' | 'SAC',
      unit: item.unit || 'PCS',
    };

    if (isLastItemEmpty) {
      setValue(`items.${lastItemIndex}`, newItem);
    } else {
      setValue('items', [...currentItems, newItem]);
    }

    setShowFrequentItems(false);
    
    // Update usage count
    updateItemUsage(item.id);
  };

  const updateItemUsage = async (itemId: string) => {
    try {
      await fetch(`/api/items/frequent/${itemId}/usage`, {
        method: 'PATCH',
      });
    } catch (error) {
      console.error('Error updating item usage:', error);
    }
  };

  const calculateTotals = () => {
    const items = getValues('items');
    let subtotal = 0;
    let totalCgst = 0;
    let totalSgst = 0;
    let totalIgst = 0;

    items.forEach(item => {
      const amount = item.quantity * item.rate;
      subtotal += amount;
      
      const gstAmount = (amount * item.gstRate) / 100;
      
      if (watchedIsInterState) {
        totalIgst += gstAmount;
      } else {
        totalCgst += gstAmount / 2;
        totalSgst += gstAmount / 2;
      }
    });

    const totalAmount = subtotal + totalCgst + totalSgst + totalIgst;

    setTotals({
      subtotal,
      cgst: totalCgst,
      sgst: totalSgst,
      igst: totalIgst,
      totalAmount,
    });
  };

  const handleFormSubmit = async (data: InvoiceFormData, isDraft: boolean = false) => {
    setIsSubmitting(true);

    try {
      const invoiceData = {
        ...data,
        invoiceDate: new Date(data.invoiceDate).toISOString(),
        dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : null,
        status: isDraft ? 'DRAFT' : 'GENERATED',
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
        toast.success(`Invoice ${isDraft ? 'saved as draft' : 'generated'} successfully`);
        router.push(`/invoices/${result.invoice.id}`);
      } else {
        toast.error(result.error || 'Failed to create invoice');
      }
    } catch (error) {
      toast.error('Error creating invoice');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmit = (data: InvoiceFormData) => {
    handleFormSubmit(data, false);
  };

  const handleSaveAsDraft = () => {
    handleSubmit((data) => handleFormSubmit(data, true))();
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
    <div className="max-w-6xl mx-auto">
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
          Fill in the details below to generate a GST-compliant invoice with automated HSN/SAC code suggestions
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

        {/* Enhanced Invoice Items */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900">Invoice Items</h2>
                <div className="flex space-x-2">
                  {frequentItems.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowFrequentItems(!showFrequentItems)}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <Star className="mr-1 h-4 w-4" />
                      Frequent Items
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={addItem}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <Plus className="mr-1 h-4 w-4" />
                    Add Item
                  </button>
                </div>
              </div>

              {/* Frequent Items Panel */}
              {showFrequentItems && frequentItems.length > 0 && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Frequently Used Items</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {frequentItems.slice(0, 6).map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleFrequentItemSelect(item)}
                        className="text-left p-3 bg-white border border-gray-200 rounded-md hover:border-indigo-300 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {item.description}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          ₹{item.rate} • GST: {item.gstRate}% • Used {item.usageCount} times
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Items List */}
              <div className="space-y-4">
                {watchedItems.map((item, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Item Description */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Item Description
                        </label>
                        <input
                          {...register(`items.${index}.description`)}
                          type="text"
                          placeholder="Enter item description"
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                        {errors.items?.[index]?.description && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.items[index]?.description?.message}
                          </p>
                        )}
                      </div>

                      {/* HSN/SAC Code with Search */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          HSN/SAC Code
                        </label>
                        <div className="mt-1 relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Tag className="h-4 w-4 text-gray-400" />
                          </div>
                          <input
                            {...register(`items.${index}.hsnSacCode`)}
                            type="text"
                            placeholder="Search HSN/SAC"
                            value={hsnSacSearchTerm}
                            onChange={(e) => {
                              const value = e.target.value;
                              setHsnSacSearchTerm(value);
                              setSelectedItemIndex(index);
                              setValue(`items.${index}.hsnSacCode`, value);
                              searchHsnSacCodes(value);
                            }}
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          />
                          {isLoadingHsnSac && selectedItemIndex === index && (
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                              <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                            </div>
                          )}
                        </div>

                        {/* HSN/SAC Search Results */}
                        {selectedItemIndex === index && hsnSacItems.length > 0 && (
                          <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                            {hsnSacItems.map((hsnItem) => (
                              <button
                                key={hsnItem.code}
                                type="button"
                                onClick={() => handleHsnSacSelect(hsnItem, index)}
                                className="w-full text-left px-4 py-2 hover:bg-indigo-600 hover:text-white focus:bg-indigo-600 focus:text-white"
                              >
                                <div className="flex justify-between">
                                  <span className="font-medium">{hsnItem.code}</span>
                                  <span className="text-sm">{hsnItem.type}</span>
                                </div>
                                <div className="text-sm opacity-75 truncate">
                                  {hsnItem.description}
                                </div>
                                <div className="text-xs opacity-75">
                                  GST: {hsnItem.gstRate}%
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Unit */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Unit
                        </label>
                        <select
                          {...register(`items.${index}.unit`)}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        >
                          <option value="PCS">PCS</option>
                          <option value="KG">KG</option>
                          <option value="LITER">LITER</option>
                          <option value="METER">METER</option>
                          <option value="SQM">SQM</option>
                          <option value="HOUR">HOUR</option>
                          <option value="DAY">DAY</option>
                          <option value="MONTH">MONTH</option>
                          <option value="YEAR">YEAR</option>
                        </select>
                      </div>

                      {/* Quantity */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Quantity
                        </label>
                        <input
                          {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                          type="number"
                          min="0.01"
                          step="0.01"
                          placeholder="1"
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                        {errors.items?.[index]?.quantity && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.items[index]?.quantity?.message}
                          </p>
                        )}
                      </div>

                      {/* Rate */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Rate (₹)
                        </label>
                        <input
                          {...register(`items.${index}.rate`, { valueAsNumber: true })}
                          type="number"
                          min="0.01"
                          step="0.01"
                          placeholder="0.00"
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                        {errors.items?.[index]?.rate && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.items[index]?.rate?.message}
                          </p>
                        )}
                      </div>

                      {/* GST Rate */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          GST Rate (%)
                        </label>
                        <select
                          {...register(`items.${index}.gstRate`, { valueAsNumber: true })}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        >
                          <option value={0}>0%</option>
                          <option value={5}>5%</option>
                          <option value={12}>12%</option>
                          <option value={18}>18%</option>
                          <option value={28}>28%</option>
                        </select>
                      </div>

                      {/* HSN/SAC Type */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Type
                        </label>
                        <select
                          {...register(`items.${index}.hsnSacType`)}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        >
                          <option value="HSN">HSN (Goods)</option>
                          <option value="SAC">SAC (Services)</option>
                        </select>
                      </div>

                      {/* Amount Display */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Amount (₹)
                        </label>
                        <div className="mt-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm text-gray-900">
                          ₹{(item.quantity * item.rate).toFixed(2)}
                        </div>
                      </div>
                    </div>

                    {/* Remove Item Button */}
                    {watchedItems.length > 1 && (
                      <div className="mt-4 flex justify-end">
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="inline-flex items-center px-3 py-1.5 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          <Trash2 className="mr-1 h-4 w-4" />
                          Remove Item
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Invoice Totals */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg p-6 sticky top-6">
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
            type="button"
            onClick={handleSaveAsDraft}
            disabled={isSubmitting}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
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
            disabled={isSubmitting}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
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