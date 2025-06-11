// src/app/(dashboard)/dashboard/settings/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  FileText,
  Save,
  Loader2,
  AlertCircle,
  Shield,
  CreditCard
} from 'lucide-react';
import Link from 'next/link';

const businessSchema = z.object({
  businessName: z.string().min(2, 'Business name must be at least 2 characters'),
  businessAddress: z.string().min(5, 'Address must be at least 5 characters'),
  businessState: z.string().min(1, 'State is required'),
  businessGST: z.string()
    .refine(
      (val) => val === '' || /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(val),
      'Invalid GST number format'
    )
    .optional(),
  businessPhone: z.string()
    .refine(
      (val) => val === '' || /^[6-9]\d{9}$/.test(val),
      'Invalid phone number format'
    )
    .optional(),
  businessEmail: z.string()
    .refine(
      (val) => val === '' || z.string().email().safeParse(val).success,
      'Invalid email address'
    )
    .optional(),
});

type BusinessFormData = z.infer<typeof businessSchema>;

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

export default function BusinessSettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'business' | 'preferences' | 'billing'>('business');

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    watch,
    setValue,
  } = useForm<BusinessFormData>({
    resolver: zodResolver(businessSchema),
    defaultValues: {
      businessState: 'Assam',
      businessGST: '',
      businessPhone: '',
      businessEmail: '',
    },
  });

  const watchGSTNumber = watch('businessGST');

  useEffect(() => {
    fetchBusinessInfo();
  }, []);

  const fetchBusinessInfo = async () => {
    try {
      const response = await fetch('/api/user/profile');
      
      if (response.ok) {
        const data = await response.json();
        const { user } = data;
        
        reset({
          businessName: user.businessName || '',
          businessAddress: user.businessAddress || '',
          businessGST: user.businessGST || '',
          businessPhone: user.businessPhone || '',
          businessEmail: user.businessEmail || '',
          businessState: user.businessState || 'Assam',
        });
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to load business information');
      }
    } catch (error) {
      console.error('Error loading business information:', error);
      toast.error('Network error occurred while loading business information');
    } finally {
      setIsLoading(false);
    }
  };

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
        setValue('businessState', detectedState);
      }
    }
  };

  const onSubmit = async (data: BusinessFormData) => {
    setIsSaving(true);
    
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success('Business settings updated successfully');
        reset(data);
      } else {
        console.error('Update failed:', result);
        toast.error(result.error || 'Failed to update business settings');
      }
    } catch (error) {
      console.error('Network error:', error);
      toast.error('Network error occurred. Please check your connection.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-2 text-sm text-gray-600">
          Manage your business settings and preferences
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('business')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'business'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Building2 className="inline-block h-5 w-5 mr-2" />
            Business Information
          </button>
          <button
            onClick={() => setActiveTab('preferences')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'preferences'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Shield className="inline-block h-5 w-5 mr-2" />
            Preferences
          </button>
          <button
            onClick={() => setActiveTab('billing')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'billing'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <CreditCard className="inline-block h-5 w-5 mr-2" />
            Billing
          </button>
        </nav>
      </div>

      {activeTab === 'business' && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-yellow-800">
                  Complete Your Business Information
                </h3>
                <p className="mt-1 text-sm text-yellow-700">
                  This information will appear on all your invoices. Make sure it is accurate and up-to-date.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Business Details</h2>
            
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label htmlFor="businessName" className="block text-sm font-medium text-gray-700">
                  Business Name <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building2 className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register('businessName')}
                    type="text"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="ABC Enterprises"
                  />
                </div>
                {errors.businessName && (
                  <p className="mt-1 text-sm text-red-600">{errors.businessName.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="businessAddress" className="block text-sm font-medium text-gray-700">
                  Business Address <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-gray-400" />
                  </div>
                  <textarea
                    {...register('businessAddress')}
                    rows={3}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="123 Business Street, City, State 123456"
                  />
                </div>
                {errors.businessAddress && (
                  <p className="mt-1 text-sm text-red-600">{errors.businessAddress.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="businessGST" className="block text-sm font-medium text-gray-700">
                  GST Number
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FileText className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register('businessGST')}
                    type="text"
                    onChange={(e) => {
                      register('businessGST').onChange(e);
                      detectStateFromGST(e.target.value);
                    }}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="22AAAAA0000A1Z5"
                  />
                </div>
                {errors.businessGST && (
                  <p className="mt-1 text-sm text-red-600">{errors.businessGST.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="businessState" className="block text-sm font-medium text-gray-700">
                  State <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <select
                    {...register('businessState')}
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  >
                    {indianStates.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                </div>
                {watchGSTNumber && (
                  <p className="mt-1 text-xs text-gray-500">
                    State auto-detected from GST number
                  </p>
                )}
                {errors.businessState && (
                  <p className="mt-1 text-sm text-red-600">{errors.businessState.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="businessPhone" className="block text-sm font-medium text-gray-700">
                    Business Phone
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      {...register('businessPhone')}
                      type="tel"
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="9876543210"
                    />
                  </div>
                  {errors.businessPhone && (
                    <p className="mt-1 text-sm text-red-600">{errors.businessPhone.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="businessEmail" className="block text-sm font-medium text-gray-700">
                    Business Email
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      {...register('businessEmail')}
                      type="email"
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="business@example.com"
                    />
                  </div>
                  {errors.businessEmail && (
                    <p className="mt-1 text-sm text-red-600">{errors.businessEmail.message}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!isDirty || isSaving}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <Save className="h-5 w-5 mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {activeTab === 'preferences' && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Invoice Preferences</h2>
          <p className="text-sm text-gray-600">
            Invoice preferences and customization options will be available soon.
          </p>
        </div>
      )}

      {activeTab === 'billing' && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Billing & Subscription</h2>
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="text-sm font-medium text-green-800">Free Plan</h3>
              <p className="mt-1 text-sm text-green-700">
                You are currently on the free plan with up to 10 invoices per month.
              </p>
            </div>
            <p className="text-sm text-gray-600">
              Premium plans with unlimited invoices and advanced features coming soon.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}