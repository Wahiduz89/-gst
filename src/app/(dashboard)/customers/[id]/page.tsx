// src/app/(dashboard)/customers/[id]/edit/page.tsx

'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { 
  User, 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  Save,
  X,
  Loader2,
  ArrowLeft,
  AlertCircle
} from 'lucide-react';

const customerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  gstNumber: z.string()
    .regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Invalid GST number format')
    .optional()
    .or(z.literal('')),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  phone: z.string()
    .regex(/^[6-9]\d{9}$/, 'Invalid phone number')
    .optional()
    .or(z.literal('')),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
});

type CustomerFormData = z.infer<typeof customerSchema>;

interface CustomerData extends CustomerFormData {
  id: string;
  invoiceCount: number;
}

export default function EditCustomerPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  
  // Unwrap the params Promise
  const { id } = use(params);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customer, setCustomer] = useState<CustomerData | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
  });

  useEffect(() => {
    fetchCustomer();
  }, [id]);

  const fetchCustomer = async () => {
    try {
      const response = await fetch(`/api/customers/${id}`);
      
      if (response.ok) {
        const data = await response.json();
        setCustomer({
          id: data.id,
          name: data.name,
          gstNumber: data.gstNumber || '',
          address: data.address,
          phone: data.phone || '',
          email: data.email || '',
          invoiceCount: data.invoiceCount,
        });
        reset({
          name: data.name,
          gstNumber: data.gstNumber || '',
          address: data.address,
          phone: data.phone || '',
          email: data.email || '',
        });
      } else if (response.status === 404) {
        toast.error('Customer not found');
        router.push('/customers');
      } else {
        toast.error('Failed to load customer');
      }
    } catch (error) {
      toast.error('Error loading customer');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: CustomerFormData) => {
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/customers/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success('Customer updated successfully');
        router.push('/customers');
      } else {
        toast.error(result.error || 'Failed to update customer');
      }
    } catch (error) {
      toast.error('Error updating customer');
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

  if (!customer) {
    return null;
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <Link
          href="/customers"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Customers
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit Customer</h1>
        <p className="mt-2 text-sm text-gray-600">
          Update customer information
        </p>
      </div>

      {customer.invoiceCount > 0 && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800">
                This customer has {customer.invoiceCount} invoice{customer.invoiceCount > 1 ? 's' : ''}
              </h3>
              <p className="mt-1 text-sm text-yellow-700">
                Changes to customer information will not affect existing invoices. 
                Only new invoices will use the updated information.
              </p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Customer Information</h2>
          
          <div className="grid grid-cols-1 gap-6">
            {/* Customer Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Customer Name <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('name')}
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="ABC Enterprises or John Doe"
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            {/* Address */}
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                Address <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 pt-3 flex items-start pointer-events-none">
                  <MapPin className="h-5 w-5 text-gray-400" />
                </div>
                <textarea
                  {...register('address')}
                  rows={3}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="123 Main Street, City, State - 123456"
                />
              </div>
              {errors.address && (
                <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
              )}
            </div>

            {/* GST Number */}
            <div>
              <label htmlFor="gstNumber" className="block text-sm font-medium text-gray-700">
                GST Number (Optional)
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building2 className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('gstNumber')}
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="22AAAAA0000A1Z5"
                />
              </div>
              {errors.gstNumber && (
                <p className="mt-1 text-sm text-red-600">{errors.gstNumber.message}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Format: 2 digits state + 10 char PAN + 1 entity + Z + 1 check digit
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone Number (Optional)
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register('phone')}
                    type="tel"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="9876543210"
                  />
                </div>
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address (Optional)
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register('email')}
                    type="email"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="customer@example.com"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3">
          <Link
            href="/customers"
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Link>
          <button
            type="submit"
            disabled={!isDirty || isSubmitting}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Update Customer
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}