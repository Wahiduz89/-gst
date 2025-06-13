// src/components/customers/CustomerSelector.tsx - Fixed version

'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Search, 
  User, 
  Building2, 
  MapPin,
  Plus,
  X,
  Loader2,
  Check,
  ChevronDown,
  AlertCircle
} from 'lucide-react';
import debounce from 'lodash/debounce';
import toast from 'react-hot-toast';

interface Customer {
  id: string;
  name: string;
  gstNumber: string | null;
  address: string;
  phone: string | null;
  email: string | null;
}

interface CustomerSelectorProps {
  selectedCustomerId?: string;
  onCustomerSelect: (customer: Customer | null) => void;
  onNewCustomer?: () => void;
}

export default function CustomerSelector({ 
  selectedCustomerId, 
  onCustomerSelect,
  onNewCustomer 
}: CustomerSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [allCustomers, setAllCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Load initial customers and fetch customer by ID if provided
  useEffect(() => {
    const initializeCustomers = async () => {
      await loadInitialCustomers();
      if (selectedCustomerId) {
        await fetchCustomerById(selectedCustomerId);
      }
      setIsInitialLoad(false);
    };
    
    initializeCustomers();
  }, [selectedCustomerId]);

  const loadInitialCustomers = async () => {
    setIsLoading(true);
    try {
      console.log('🔄 Loading initial customers...');
      const response = await fetch('/api/customers?limit=50');
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Loaded ${data.customers?.length || 0} customers`);
        setAllCustomers(data.customers || []);
        setCustomers(data.customers || []);
      } else {
        const errorData = await response.json();
        console.error('❌ Failed to load customers:', response.status, errorData);
        toast.error(errorData.error || 'Failed to load customers');
      }
    } catch (error) {
      console.error('❌ Error loading customers:', error);
      toast.error('Error loading customers');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCustomerById = async (customerId: string) => {
    try {
      console.log('🔍 Fetching customer by ID:', customerId);
      const response = await fetch(`/api/customers/${customerId}`);
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Customer fetched successfully');
        setSelectedCustomer(data);
        onCustomerSelect(data);
      } else {
        console.error('❌ Failed to fetch customer:', response.status);
      }
    } catch (error) {
      console.error('❌ Error fetching customer:', error);
    }
  };

  const searchCustomers = useCallback(async (query: string) => {
    if (!query.trim()) {
      setCustomers(allCustomers);
      return;
    }

    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        search: query,
        limit: '20'
      });

      const response = await fetch(`/api/customers?${params}`);
      if (response.ok) {
        const data = await response.json();
        setCustomers(data.customers || []);
      } else {
        console.error('❌ Search failed:', response.status);
        toast.error('Search failed');
      }
    } catch (error) {
      console.error('❌ Error searching customers:', error);
      toast.error('Error searching customers');
    } finally {
      setIsLoading(false);
    }
  }, [allCustomers]);

  const debouncedSearch = useCallback(
    debounce((query: string) => {
      searchCustomers(query);
    }, 300),
    [searchCustomers]
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    debouncedSearch(query);
  };

  const handleInputFocus = () => {
    setShowDropdown(true);
    if (!searchQuery && customers.length === 0) {
      setCustomers(allCustomers);
    }
  };

  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    onCustomerSelect(customer);
    setSearchQuery('');
    setShowDropdown(false);
  };

  const handleClearSelection = () => {
    setSelectedCustomer(null);
    onCustomerSelect(null);
    setSearchQuery('');
    setCustomers(allCustomers);
  };

  const handleNewCustomerClick = () => {
    setShowDropdown(false);
    if (onNewCustomer) {
      onNewCustomer();
    } else {
      setShowNewCustomerForm(true);
    }
  };

  const handleClickOutside = () => {
    setShowDropdown(false);
  };

  const handleCustomerClick = (customer: Customer, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleSelectCustomer(customer);
  };

  // Filter customers locally for faster response
  const filteredCustomers = searchQuery 
    ? customers.filter(customer => 
        customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.gstNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.phone?.includes(searchQuery)
      )
    : customers;

  if (isInitialLoad) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
        <span className="ml-2 text-sm text-gray-600">Loading customers...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Selected Customer Display */}
      {selectedCustomer ? (
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-900 flex items-center">
                <User className="mr-2 h-4 w-4 text-gray-400" />
                {selectedCustomer.name}
              </h3>
              <div className="mt-2 text-sm text-gray-600 space-y-1">
                <p className="flex items-center">
                  <MapPin className="mr-2 h-4 w-4 text-gray-400" />
                  {selectedCustomer.address}
                </p>
                {selectedCustomer.gstNumber && (
                  <p className="flex items-center">
                    <Building2 className="mr-2 h-4 w-4 text-gray-400" />
                    GST: {selectedCustomer.gstNumber}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={handleClearSelection}
              className="ml-4 text-gray-400 hover:text-gray-500"
              title="Clear selection"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      ) : (
        <div className="relative">
          {/* Search Input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={handleInputFocus}
              onBlur={() => setTimeout(handleClickOutside, 200)}
              placeholder="Search for a customer or click to see all customers..."
              className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
            <div className="absolute inset-y-0 right-0 flex items-center">
              {isLoading && (
                <Loader2 className="h-5 w-5 text-gray-400 animate-spin mr-2" />
              )}
              <button
                onClick={handleInputFocus}
                className="pr-3 flex items-center"
              >
                <ChevronDown className="h-5 w-5 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Search Results Dropdown */}
          {showDropdown && (
            <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 max-h-60 overflow-auto">
              {filteredCustomers.length > 0 ? (
                <>
                  {filteredCustomers.map((customer) => (
                    <button
                      key={customer.id}
                      onClick={(e) => handleCustomerClick(customer, e)}
                      onMouseDown={(e) => e.preventDefault()}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex items-center justify-between">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {customer.name}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            {customer.gstNumber ? `GST: ${customer.gstNumber}` : 'No GST'} • {customer.address}
                          </p>
                          {(customer.phone || customer.email) && (
                            <p className="text-xs text-gray-400 truncate">
                              {customer.phone && `📞 ${customer.phone}`}
                              {customer.phone && customer.email && ' • '}
                              {customer.email && `✉️ ${customer.email}`}
                            </p>
                          )}
                        </div>
                        <Check className="h-4 w-4 text-green-600 opacity-0 group-hover:opacity-100" />
                      </div>
                    </button>
                  ))}
                  
                  <div className="border-t border-gray-100">
                    <button
                      onClick={handleNewCustomerClick}
                      className="w-full text-left px-4 py-3 hover:bg-indigo-50 focus:bg-indigo-50 focus:outline-none text-indigo-600 font-medium"
                    >
                      <div className="flex items-center">
                        <Plus className="mr-2 h-4 w-4" />
                        Add new customer
                      </div>
                    </button>
                  </div>
                </>
              ) : isLoading ? (
                <div className="p-4 text-center">
                  <Loader2 className="h-6 w-6 animate-spin text-indigo-600 mx-auto" />
                  <p className="text-sm text-gray-500 mt-2">Loading customers...</p>
                </div>
              ) : allCustomers.length === 0 ? (
                <div className="p-4 text-center">
                  <p className="text-sm text-gray-500 mb-3">
                    No customers found. Add your first customer to get started.
                  </p>
                  <button
                    onClick={handleNewCustomerClick}
                    className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add your first customer
                  </button>
                </div>
              ) : (
                <div className="p-4 text-center">
                  <p className="text-sm text-gray-500 mb-3">
                    No customers match "{searchQuery}"
                  </p>
                  <button
                    onClick={handleNewCustomerClick}
                    className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add "{searchQuery}" as new customer
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Quick Add Customer Form */}
      {showNewCustomerForm && !onNewCustomer && (
        <QuickAddCustomerForm
          initialName={searchQuery}
          onSave={async (customer) => {
            handleSelectCustomer(customer);
            setShowNewCustomerForm(false);
            await loadInitialCustomers();
            toast.success('Customer added successfully!');
          }}
          onCancel={() => setShowNewCustomerForm(false)}
        />
      )}
    </div>
  );
}

// Enhanced Quick Add Customer Form
interface QuickAddCustomerFormProps {
  initialName?: string;
  onSave: (customer: Customer) => void;
  onCancel: () => void;
}

interface CustomerFormData {
  name: string;
  address: string;
  gstNumber: string;
  phone: string;
  email: string;
}

function QuickAddCustomerForm({ 
  initialName = '', 
  onSave, 
  onCancel 
}: QuickAddCustomerFormProps) {
  const [formData, setFormData] = useState<CustomerFormData>({
    name: initialName,
    address: '',
    gstNumber: '',
    phone: '',
    email: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<CustomerFormData>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<CustomerFormData> = {};
    
    if (!formData.name || formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    
    if (!formData.address || formData.address.trim().length < 5) {
      newErrors.address = 'Address must be at least 5 characters';
    }
    
    if (formData.gstNumber && formData.gstNumber.trim() !== '') {
      if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(formData.gstNumber.trim())) {
        newErrors.gstNumber = 'Invalid GST number format';
      }
    }
    
    if (formData.phone && formData.phone.trim() !== '') {
      if (!/^[6-9]\d{9}$/.test(formData.phone.trim())) {
        newErrors.phone = 'Invalid phone number (must be 10 digits starting with 6-9)';
      }
    }
    
    if (formData.email && formData.email.trim() !== '') {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
        newErrors.email = 'Invalid email address';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the form errors');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log('🚀 Submitting customer form...');
      
      // Prepare data for submission
      const submitData = {
        name: formData.name.trim(),
        address: formData.address.trim(),
        gstNumber: formData.gstNumber.trim() || '',
        phone: formData.phone.trim() || '',
        email: formData.email.trim() || '',
      };

      console.log('📦 Form data:', submitData);

      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      console.log('📡 Response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Customer created successfully:', result.customer?.id);
        onSave(result.customer);
      } else {
        const errorData = await response.json();
        console.error('❌ API Error:', errorData);
        
        if (errorData.details && Array.isArray(errorData.details)) {
          // Handle validation errors from API
          const fieldErrors: Partial<CustomerFormData> = {};
          errorData.details.forEach((detail: any) => {
            if (detail.field && detail.message) {
              fieldErrors[detail.field as keyof CustomerFormData] = detail.message;
            }
          });
          setErrors(fieldErrors);
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
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-900">Quick Add Customer</h3>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-500"
          disabled={isSubmitting}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Customer name *"
            className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
              errors.name ? 'border-red-300' : 'border-gray-300'
            }`}
            disabled={isSubmitting}
          />
          {errors.name && (
            <div className="mt-1 flex items-center">
              <AlertCircle className="h-4 w-4 text-red-500 mr-1" />
              <p className="text-xs text-red-600">{errors.name}</p>
            </div>
          )}
        </div>
        
        <div>
          <textarea
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="Address *"
            rows={2}
            className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
              errors.address ? 'border-red-300' : 'border-gray-300'
            }`}
            disabled={isSubmitting}
          />
          {errors.address && (
            <div className="mt-1 flex items-center">
              <AlertCircle className="h-4 w-4 text-red-500 mr-1" />
              <p className="text-xs text-red-600">{errors.address}</p>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <input
              type="text"
              value={formData.gstNumber}
              onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value.toUpperCase() })}
              placeholder="GST Number (Optional)"
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                errors.gstNumber ? 'border-red-300' : 'border-gray-300'
              }`}
              disabled={isSubmitting}
            />
            {errors.gstNumber && (
              <div className="mt-1 flex items-center">
                <AlertCircle className="h-4 w-4 text-red-500 mr-1" />
                <p className="text-xs text-red-600">{errors.gstNumber}</p>
              </div>
            )}
          </div>
          
          <div>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
              placeholder="Phone (Optional)"
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                errors.phone ? 'border-red-300' : 'border-gray-300'
              }`}
              disabled={isSubmitting}
            />
            {errors.phone && (
              <div className="mt-1 flex items-center">
                <AlertCircle className="h-4 w-4 text-red-500 mr-1" />
                <p className="text-xs text-red-600">{errors.phone}</p>
              </div>
            )}
          </div>
        </div>
        
        <div>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="Email (Optional)"
            className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
              errors.email ? 'border-red-300' : 'border-gray-300'
            }`}
            disabled={isSubmitting}
          />
          {errors.email && (
            <div className="mt-1 flex items-center">
              <AlertCircle className="h-4 w-4 text-red-500 mr-1" />
              <p className="text-xs text-red-600">{errors.email}</p>
            </div>
          )}
        </div>
        
        <div className="flex justify-end space-x-2 pt-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
                Creating...
              </div>
            ) : (
              'Add Customer'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}