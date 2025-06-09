// src/app/(dashboard)/dashboard/profile/page.tsx

'use client';

import { useState, useEffect } from 'react';
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
  FileText,
  Save,
  Loader2
} from 'lucide-react';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  businessName: z.string().min(2, 'Business name must be at least 2 characters').optional().or(z.literal('')),
  businessAddress: z.string().min(5, 'Address must be at least 5 characters').optional().or(z.literal('')),
  businessGST: z.string()
    .regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Invalid GST number format')
    .optional()
    .or(z.literal('')),
  businessPhone: z.string()
    .regex(/^[6-9]\d{9}$/, 'Invalid phone number')
    .optional()
    .or(z.literal('')),
  businessEmail: z.string().email('Invalid email').optional().or(z.literal('')),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/user/profile');
      const data = await response.json();
      
      if (response.ok) {
        const { user } = data;
        setUserEmail(user.email);
        reset({
          name: user.name || '',
          businessName: user.businessName || '',
          businessAddress: user.businessAddress || '',
          businessGST: user.businessGST || '',
          businessPhone: user.businessPhone || '',
          businessEmail: user.businessEmail || '',
        });
      } else {
        toast.error('Failed to load profile');
      }
    } catch (error) {
      toast.error('Error loading profile');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
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
        toast.success('Profile updated successfully');
        reset(data);
      } else {
        toast.error(result.error || 'Failed to update profile');
      }
    } catch (error) {
      toast.error('Error updating profile');
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
        <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
        <p className="mt-2 text-sm text-gray-600">
          Manage your personal and business information
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Personal Information */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h2>
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('name')}
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="John Doe"
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  value={userEmail}
                  disabled
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 sm:text-sm"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
            </div>
          </div>
        </div>

        {/* Business Information */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Business Information</h2>
          
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label htmlFor="businessName" className="block text-sm font-medium text-gray-700">
                Business Name
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
                Business Address
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

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
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
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="22AAAAA0000A1Z5"
                  />
                </div>
                {errors.businessGST && (
                  <p className="mt-1 text-sm text-red-600">{errors.businessGST.message}</p>
                )}
              </div>

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

        {/* Submit Button */}
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
    </div>
  );
}