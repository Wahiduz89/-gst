// src/components/customers/CustomerSelector.tsx

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
  Check
} from 'lucide-react';
import debounce from 'lodash/debounce';
import { CustomerFormData } from '@/types';

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
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false);

  // Fetch customer by ID if selectedCustomerId is provided
  useEffect(() => {
    if (selectedCustomerId) {
      fetchCustomerById(selectedCustomerId);
    }
  }, [selectedCustomerId]);

  const fetchCustomerById = async (customerId: string) => {
    try {
      const response = await fetch(`/api/customers/${customerId}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedCustomer(data);
        onCustomerSelect(data);
      }
    } catch (error) {
      console.error('Error fetching customer:', error);
    }
  };

  const searchCustomers = useCallback(async (query: string) => {
    if (!query) {
      setCustomers([]);
      return;
    }

    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        search: query,
        limit: '5'
      });

      const response = await fetch(`/api/customers?${params}`);
      if (response.ok) {
        const data = await response.json();
        setCustomers(data.customers);
      }
    } catch (error) {
      console.error('Error searching customers:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const debouncedSearch = useCallback(
    debounce((query: string) => {
      searchCustomers(query);
    }, 300),
    [searchCustomers]
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    setShowDropdown(true);
    debouncedSearch(query);
  };

  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    onCustomerSelect(customer);
    setSearchQuery('');
    setShowDropdown(false);
    setCustomers([]);
  };

  const handleClearSelection = () => {
    setSelectedCustomer(null);
    onCustomerSelect(null);
    setSearchQuery('');
  };

  const handleNewCustomerClick = () => {
    setShowDropdown(false);
    if (onNewCustomer) {
      onNewCustomer();
    } else {
      setShowNewCustomerForm(true);
    }
  };

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
              onFocus={() => setShowDropdown(true)}
              placeholder="Search for a customer by name, GST, email, or phone..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
            {isLoading && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
              </div>
            )}
          </div>

          {/* Search Results Dropdown */}
          {showDropdown && (searchQuery || customers.length > 0) && (
            <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 max-h-60 overflow-auto">
              {customers.length > 0 ? (
                <>
                  {customers.map((customer) => (
                    <button
                      key={customer.id}
                      onClick={() => handleSelectCustomer(customer)}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {customer.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {customer.gstNumber || 'No GST'} • {customer.address}
                          </p>
                        </div>
                        <Check className="h-4 w-4 text-green-600 opacity-0 group-hover:opacity-100" />
                      </div>
                    </button>
                  ))}
                  <button
                    onClick={handleNewCustomerClick}
                    className="w-full text-left px-4 py-3 hover:bg-indigo-50 focus:bg-indigo-50 focus:outline-none text-indigo-600 font-medium"
                  >
                    <div className="flex items-center">
                      <Plus className="mr-2 h-4 w-4" />
                      Add new customer
                    </div>
                  </button>
                </>
              ) : searchQuery && !isLoading ? (
                <div className="p-4">
                  <p className="text-sm text-gray-500 text-center mb-3">
                    No customers found
                  </p>
                  <button
                    onClick={handleNewCustomerClick}
                    className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add "{searchQuery}" as new customer
                  </button>
                </div>
              ) : null}
            </div>
          )}
        </div>
      )}

      {/* Quick Add Customer Form (if no onNewCustomer prop provided) */}
      {showNewCustomerForm && !onNewCustomer && (
        <QuickAddCustomerForm
          initialName={searchQuery}
          onSave={(customer) => {
            handleSelectCustomer(customer);
            setShowNewCustomerForm(false);
          }}
          onCancel={() => setShowNewCustomerForm(false)}
        />
      )}
    </div>
  );
}

// Quick Add Customer Form Component
interface QuickAddCustomerFormProps {
  initialName?: string;
  onSave: (customer: Customer) => void;
  onCancel: () => void;
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
    
    if (!formData.name || formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    
    if (!formData.address || formData.address.length < 5) {
      newErrors.address = 'Address must be at least 5 characters';
    }
    
    if (formData.gstNumber && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(formData.gstNumber)) {
      newErrors.gstNumber = 'Invalid GST number format';
    }
    
    if (formData.phone && !/^[6-9]\d{9}$/.test(formData.phone)) {
      newErrors.phone = 'Invalid phone number';
    }
    
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();
        onSave(result.customer);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create customer');
      }
    } catch (error) {
      alert('Error creating customer');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <h3 className="text-sm font-medium text-gray-900 mb-3">Quick Add Customer</h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Customer name *"
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
          {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
        </div>
        
        <div>
          <textarea
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="Address *"
            rows={2}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
          {errors.address && <p className="mt-1 text-xs text-red-600">{errors.address}</p>}
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <input
              type="text"
              value={formData.gstNumber}
              onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
              placeholder="GST Number (Optional)"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
            {errors.gstNumber && <p className="mt-1 text-xs text-red-600">{errors.gstNumber}</p>}
          </div>
          
          <div>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="Phone (Optional)"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
            {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
          </div>
        </div>
        
        <div className="flex justify-end space-x-2 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Add Customer'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}