// src/app/dashboard/settings/page.tsx - Production Ready Business Settings

'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Camera, Upload, X, Check, AlertCircle } from 'lucide-react';
import Image from 'next/image';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  businessName: string;
  businessAddress: string;
  businessGST: string | null;
  businessPAN: string | null;
  businessPhone: string | null;
  businessEmail: string | null;
  businessState: string;
  businessLogo: string | null;
}

interface FormErrors {
  [key: string]: string;
}

export default function BusinessSettings() {
  const { data: session } = useSession();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [successMessage, setSuccessMessage] = useState('');
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
    'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu'
  ];

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/user/profile');
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        setLogoPreview(data.businessLogo);
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!profile?.businessName?.trim()) {
      newErrors.businessName = 'Business name is required';
    }

    if (!profile?.businessAddress?.trim()) {
      newErrors.businessAddress = 'Business address is required';
    }

    if (profile?.businessGST && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(profile.businessGST)) {
      newErrors.businessGST = 'Invalid GST format (e.g., 27AAAPA1234A1Z5)';
    }

    if (profile?.businessPAN && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(profile.businessPAN)) {
      newErrors.businessPAN = 'Invalid PAN format (e.g., ABCDE1234F)';
    }

    if (profile?.businessEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.businessEmail)) {
      newErrors.businessEmail = 'Invalid email format';
    }

    if (profile?.businessPhone && !/^[6-9]\d{9}$/.test(profile.businessPhone.replace(/\D/g, ''))) {
      newErrors.businessPhone = 'Invalid phone number (10 digits required)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type and size
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setErrors({ logo: 'Please upload a valid image file (JPG, PNG, GIF, or WebP)' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      setErrors({ logo: 'Image size must be less than 5MB' });
      return;
    }

    setUploadingLogo(true);
    setErrors({});

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to server
    try {
      const formData = new FormData();
      formData.append('logo', file);

      const response = await fetch('/api/user/logo', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const { logoUrl } = await response.json();
        setProfile(prev => prev ? { ...prev, businessLogo: logoUrl } : null);
        setSuccessMessage('Logo uploaded successfully');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        throw new Error('Failed to upload logo');
      }
    } catch (error) {
      console.error('Logo upload error:', error);
      setErrors({ logo: 'Failed to upload logo. Please try again.' });
      setLogoPreview(profile?.businessLogo || null);
    } finally {
      setUploadingLogo(false);
    }
  };

  const removeLogo = async () => {
    if (!confirm('Are you sure you want to remove your business logo?')) return;

    try {
      const response = await fetch('/api/user/logo', {
        method: 'DELETE',
      });

      if (response.ok) {
        setProfile(prev => prev ? { ...prev, businessLogo: null } : null);
        setLogoPreview(null);
        setSuccessMessage('Logo removed successfully');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      console.error('Failed to remove logo:', error);
      setErrors({ logo: 'Failed to remove logo' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setSaving(true);
    setErrors({});
    setSuccessMessage('');

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });

      if (response.ok) {
        setSuccessMessage('Business settings updated successfully!');
        setTimeout(() => setSuccessMessage(''), 5000);
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update settings');
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      setErrors({ general: 'Failed to update settings. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Business Settings</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage your business information that appears on invoices
          </p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
            <Check className="h-5 w-5 text-green-600 mr-2" />
            <span className="text-green-800">{successMessage}</span>
          </div>
        )}

        {/* Error Message */}
        {errors.general && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
            <span className="text-red-800">{errors.general}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Logo Upload Section */}
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Business Logo</h2>
            
            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
              {/* Logo Preview */}
              <div className="relative">
                <div className="w-32 h-32 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50">
                  {logoPreview ? (
                    <Image
                      src={logoPreview}
                      alt="Business Logo"
                      width={128}
                      height={128}
                      className="object-contain w-full h-full"
                    />
                  ) : (
                    <Camera className="w-12 h-12 text-gray-400" />
                  )}
                </div>
                {logoPreview && (
                  <button
                    type="button"
                    onClick={removeLogo}
                    className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Upload Button */}
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingLogo}
                  className="flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  {uploadingLogo ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Logo
                    </>
                  )}
                </button>
                <p className="mt-2 text-xs text-gray-500">
                  JPG, PNG, GIF or WebP. Max 5MB. Recommended: 300x300px
                </p>
                {errors.logo && (
                  <p className="mt-1 text-sm text-red-600">{errors.logo}</p>
                )}
              </div>
            </div>
          </div>

          {/* Business Information */}
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Business Information</h2>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {/* Business Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={profile?.businessName || ''}
                  onChange={(e) => setProfile(prev => prev ? { ...prev, businessName: e.target.value } : null)}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                    errors.businessName ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter your business name"
                />
                {errors.businessName && (
                  <p className="mt-1 text-sm text-red-600">{errors.businessName}</p>
                )}
              </div>

              {/* Business Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business Email
                </label>
                <input
                  type="email"
                  value={profile?.businessEmail || ''}
                  onChange={(e) => setProfile(prev => prev ? { ...prev, businessEmail: e.target.value } : null)}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                    errors.businessEmail ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="business@example.com"
                />
                {errors.businessEmail && (
                  <p className="mt-1 text-sm text-red-600">{errors.businessEmail}</p>
                )}
              </div>

              {/* Business Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business Phone
                </label>
                <input
                  type="tel"
                  value={profile?.businessPhone || ''}
                  onChange={(e) => setProfile(prev => prev ? { ...prev, businessPhone: e.target.value } : null)}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                    errors.businessPhone ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="9876543210"
                />
                {errors.businessPhone && (
                  <p className="mt-1 text-sm text-red-600">{errors.businessPhone}</p>
                )}
              </div>

              {/* Business State */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business State <span className="text-red-500">*</span>
                </label>
                <select
                  value={profile?.businessState || ''}
                  onChange={(e) => setProfile(prev => prev ? { ...prev, businessState: e.target.value } : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select State</option>
                  {indianStates.map((state) => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>

              {/* Business Address */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={profile?.businessAddress || ''}
                  onChange={(e) => setProfile(prev => prev ? { ...prev, businessAddress: e.target.value } : null)}
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                    errors.businessAddress ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter your complete business address"
                />
                {errors.businessAddress && (
                  <p className="mt-1 text-sm text-red-600">{errors.businessAddress}</p>
                )}
              </div>
            </div>
          </div>

          {/* Tax Information */}
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Tax Information</h2>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {/* GST Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  GST Number
                </label>
                <input
                  type="text"
                  value={profile?.businessGST || ''}
                  onChange={(e) => setProfile(prev => prev ? { ...prev, businessGST: e.target.value.toUpperCase() } : null)}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                    errors.businessGST ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="27AAAPA1234A1Z5"
                  maxLength={15}
                />
                {errors.businessGST && (
                  <p className="mt-1 text-sm text-red-600">{errors.businessGST}</p>
                )}
              </div>

              {/* PAN Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  PAN Number
                </label>
                <input
                  type="text"
                  value={profile?.businessPAN || ''}
                  onChange={(e) => setProfile(prev => prev ? { ...prev, businessPAN: e.target.value.toUpperCase() } : null)}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                    errors.businessPAN ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="ABCDE1234F"
                  maxLength={10}
                />
                {errors.businessPAN && (
                  <p className="mt-1 text-sm text-red-600">{errors.businessPAN}</p>
                )}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3">
            <button
              type="button"
              onClick={() => router.push('/dashboard')}
              className="w-full sm:w-auto px-6 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </span>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}