// src/app/(dashboard)/customers/[id]/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  User, 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  FileText,
  Edit,
  ArrowLeft,
  Calendar,
  TrendingUp,
  Loader2,
  Eye,
  Plus
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { EmptyState } from '@/components/dashboard/EmptyState';

interface CustomerDetails {
  id: string;
  name: string;
  gstNumber: string | null;
  address: string;
  phone: string | null;
  email: string | null;
  createdAt: string;
  invoiceCount: number;
  invoices: Array<{
    id: string;
    invoiceNumber: string;
    totalAmount: number;
    status: string;
    createdAt: string;
  }>;
}

export default function CustomerDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [customer, setCustomer] = useState<CustomerDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCustomerDetails();
  }, [params.id]);

  const fetchCustomerDetails = async () => {
    try {
      const response = await fetch(`/api/customers/${params.id}`);
      
      if (response.ok) {
        const data = await response.json();
        setCustomer(data);
      } else if (response.status === 404) {
        toast.error('Customer not found');
        router.push('/customers');
      } else {
        toast.error('Failed to load customer details');
      }
    } catch (error) {
      toast.error('Error loading customer details');
    } finally {
      setIsLoading(false);
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

  // Calculate total revenue from customer
  const totalRevenue = customer.invoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0);

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <Link
          href="/customers"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Customers
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{customer.name}</h1>
            <p className="mt-1 text-sm text-gray-600">
              Customer since {format(new Date(customer.createdAt), 'MMMM yyyy')}
            </p>
          </div>
          <div className="flex space-x-3">
            <Link
              href={`/invoices/new?customerId=${customer.id}`}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Plus className="mr-2 h-4 w-4" />
              New Invoice
            </Link>
            <Link
              href={`/customers/${customer.id}/edit`}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </div>
        </div>
      </div>

      {/* Customer Information */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 mb-8">
        <div className="lg:col-span-2">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Customer Information</h2>
            
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  Name
                </dt>
                <dd className="mt-1 text-sm text-gray-900">{customer.name}</dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <Building2 className="mr-2 h-4 w-4" />
                  GST Number
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {customer.gstNumber || 'Not provided'}
                </dd>
              </div>
              
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <MapPin className="mr-2 h-4 w-4" />
                  Address
                </dt>
                <dd className="mt-1 text-sm text-gray-900">{customer.address}</dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <Phone className="mr-2 h-4 w-4" />
                  Phone
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {customer.phone || 'Not provided'}
                </dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-gray-500 flex items-center">
                  <Mail className="mr-2 h-4 w-4" />
                  Email
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {customer.email || 'Not provided'}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Customer Stats */}
        <div className="space-y-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Revenue</h3>
            <p className="text-2xl font-semibold text-gray-900">
              {formatCurrency(totalRevenue)}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              From {customer.invoiceCount} invoice{customer.invoiceCount !== 1 ? 's' : ''}
            </p>
          </div>
          
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Average Invoice Value</h3>
            <p className="text-2xl font-semibold text-gray-900">
              {customer.invoiceCount > 0 
                ? formatCurrency(totalRevenue / customer.invoiceCount)
                : formatCurrency(0)
              }
            </p>
          </div>
          
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Customer Type</h3>
            <p className="text-lg font-medium text-gray-900">
              {customer.gstNumber ? 'B2B (Business)' : 'B2C (Individual)'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {customer.gstNumber ? 'GST registered' : 'Non-GST'}
            </p>
          </div>
        </div>
      </div>

      {/* Invoice History */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-5 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Invoice History</h2>
        </div>
        
        {customer.invoices.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title="No invoices yet"
              description="Create the first invoice for this customer"
              icon={<FileText className="h-12 w-12" />}
              action={{
                label: "Create Invoice",
                href: `/invoices/new?customerId=${customer.id}`
              }}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Invoice Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {customer.invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {invoice.invoiceNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="mr-1 h-4 w-4" />
                        {format(new Date(invoice.createdAt), 'dd MMM yyyy')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(invoice.totalAmount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex text-xs leading-5 font-semibold rounded-full px-2 py-1 ${
                        invoice.status === 'GENERATED' 
                          ? 'bg-green-100 text-green-800' 
                          : invoice.status === 'DRAFT'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        href={`/invoices/${invoice.id}`}
                        className="text-indigo-600 hover:text-indigo-900 inline-flex items-center"
                      >
                        <Eye className="mr-1 h-4 w-4" />
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {customer.invoices.length > 5 && (
          <div className="bg-gray-50 px-6 py-3 text-center">
            <Link
              href={`/invoices?customerId=${customer.id}`}
              className="text-sm text-indigo-600 hover:text-indigo-900 font-medium"
            >
              View all invoices →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}