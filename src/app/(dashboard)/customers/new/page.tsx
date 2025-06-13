// src/app/(dashboard)/customers/new/page.tsx - Fixed version

'use client';

import { useState } from 'react';
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
    .refine(
      (val) => val === '' || /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(val),
      'Invalid GST number format'
    )
    .optional()
    .transform(val => val === '' ? '' : val),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  phone: z.string()
    .refine(
      (val) => val === '' || /^[6-9]\d{9}$/.test(val),
      'Invalid phone number format'
    )
    .optional()
    .transform(val => val === '' ? '' : val),
  email: z.string()
    .refine(
      (val) => val === '' || z.string().email().safeParse(val).success,
      'Invalid email address'
    )
    .optional()
    .transform(val => val === '' ? '' : val),
  state: z.string().min(1, 'State is required'),
});

type CustomerFormData = z.infer<typeof customerSchema>;

const indianStates = [
  'Andaman and Nicobar Islands',
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chandigarh',
  'Chhattisgarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jammu and Kashmir',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Ladakh',
  'Lakshadweep',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Puducherry',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
];

export default function NewCustomerPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    setError,
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      state: 'Assam',
      gstNumber: '',
      phone: '',
      email: '',
    },
  });

  const watchGSTNumber = watch('gstNumber');

  const detectStateFromGST = (gstNumber: string) => {
    if (gstNumber && gstNumber.length >= 2) {
      const stateCode = gstNumber.substring(0, 2);
      const stateMap: Record<string, string> = {
        '01': 'Jammu and Kashmir',
        '02': 'Himachal Pradesh',
        '03': 'Punjab',
        '04': 'Chandigarh',
        '05': 'Uttarakhand',
        '06': 'Haryana',
        '07': 'Delhi',
        '08': 'Rajasthan',
        '09': 'Uttar Pradesh',
        '10': 'Bihar',
        '11': 'Sikkim',
        '12': 'Arunachal Pradesh',
        '13': 'Nagaland',
        '14': 'Manipur',
        '15': 'Mizoram',
        '16': 'Tripura',
        '17': 'Meghalaya',
        '18': 'Assam',
        '19': 'West Bengal',
        '20': 'Jharkhand',
        '21': 'Odisha',
        '22': 'Chhattisgarh',
        '23': 'Madhya Pradesh',
        '24': 'Gujarat',
        '26': 'Dadra and Nagar Haveli and Daman and Diu',
        '27': 'Maharashtra',
        '28': 'Andhra Pradesh',
        '29': 'Karnataka',
        '30': 'Goa',
        '31': 'Lakshadweep',
        '32': 'Kerala',
        '33': 'Tamil Nadu',
        '34': 'Puducherry',
        '35': 'Andaman and Nicobar Islands',
        '36': 'Telangana',
        '38': 'Ladakh',
      };
      
      const detectedState = stateMap[stateCode];
      if (detectedState) {
        setValue('state', detectedState);
      }
    }
  };

  const onSubmit = async (data: CustomerFormData) => {
    setIsSubmitting(true);

    try {
      console.log('🚀 Creating new customer...');
      
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      console.log('📡 Response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Customer created successfully:', result.customer?.id);
        toast.success('Customer created successfully');
        router.push('/customers');
      } else {
        const errorData = await response.json();
        console.error('❌ API Error:', errorData);
        
        if (errorData.details && Array.isArray(errorData.details)) {
          // Handle field-specific validation errors
          errorData.details.forEach((detail: any) => {
            if (detail.field && detail.message) {
              setError(detail.field as keyof CustomerFormData, {
                type: 'server',
                message: detail.message
              });
            }
          });
          toast.error('Please fix the validation errors');
        } else {
          toast.error(errorData.error || 'Failed to create customer');
        }
      }
    } catch (error) {
      console.error('💥 Network error:', error);
      toast.error('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <Link
          href="/customers"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Customers
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Add New Customer</h1>
        <p className="mt-2 text-sm text-gray-600">
          Create a new customer profile for your invoices
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Customer Information</h2>
          
          <div className="grid grid-cols-1 gap-6">
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
                  className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="ABC Enterprises or John Doe"
                  disabled={isSubmitting}
                />
              </div>
              {errors.name && (
                <div className="mt-1 flex items-center">
                  <AlertCircle className="h-4 w-4 text-red-500 mr-1" />
                  <p className="text-sm text-red-600">{errors.name.message}</p>
                </div>
              )}
            </div>

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
                  className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                    errors.address ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="123 Main Street, City, State - 123456"
                  disabled={isSubmitting}
                />
              </div>
              {errors.address && (
                <div className="mt-1 flex items-center">
                  <AlertCircle className="h-4 w-4 text-red-500 mr-1" />
                  <p className="text-sm text-red-600">{errors.address.message}</p>
                </div>
              )}
            </div>

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
                  onChange={(e) => {
                    const value = e.target.value.toUpperCase();
                    e.target.value = value;
                    register('gstNumber').onChange(e);
                    detectStateFromGST(value);
                  }}
                  className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                    errors.gstNumber ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="22AAAAA0000A1Z5"
                  disabled={isSubmitting}
                />
              </div>
              {errors.gstNumber && (
                <div className="mt-1 flex items-center">
                  <AlertCircle className="h-4 w-4 text-red-500 mr-1" />
                  <p className="text-sm text-red-600">{errors.gstNumber.message}</p>
                </div>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Format: 2 digits state code + 10 char PAN + 1 entity + Z + 1 check digit
              </p>
            </div>

            <div>
              <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                State <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <select
                  {...register('state')}
                  className={`block w-full pl-3 pr-10 py-2 text-base border rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                    errors.state ? 'border-red-300' : 'border-gray-300'
                  }`}
                  disabled={isSubmitting}
                >
                  {indianStates.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </div>
              {watchGSTNumber && watchGSTNumber.length >= 2 && (
                <p className="mt-1 text-xs text-gray-500">
                  State auto-detected from GST number
                </p>
              )}
              {errors.state && (
                <div className="mt-1 flex items-center">
                  <AlertCircle className="h-4 w-4 text-red-500 mr-1" />
                  <p className="text-sm text-red-600">{errors.state.message}</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
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
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                      e.target.value = value;
                      register('phone').onChange(e);
                    }}
                    className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                      errors.phone ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="9876543210"
                    disabled={isSubmitting}
                  />
                </div>
                {errors.phone && (
                  <div className="mt-1 flex items-center">
                    <AlertCircle className="h-4 w-4 text-red-500 mr-1" />
                    <p className="text-sm text-red-600">{errors.phone.message}</p>
                  </div>
                )}
              </div>

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
                    className={`block w-full pl-10 pr-3 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                      errors.email ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="customer@example.com"
                    disabled={isSubmitting}
                  />
                </div>
                {errors.email && (
                  <div className="mt-1 flex items-center">
                    <AlertCircle className="h-4 w-4 text-red-500 mr-1" />
                    <p className="text-sm text-red-600">{errors.email.message}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <h3 className="font-medium mb-1">Customer Types</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>B2B (Business):</strong> Customers with GST numbers - GST will be applied on invoices</li>
                <li><strong>B2C (Individual):</strong> Customers without GST numbers - No GST details shown on invoices</li>
              </ul>
            </div>
          </div>
        </div>

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
            disabled={isSubmitting}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Creating Customer...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Customer
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}