// src/app/(dashboard)/invoices/page.tsx

'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  FileText, 
  Plus, 
  Search, 
  Calendar,
  Download,
  Eye,
  Edit,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Filter
} from 'lucide-react';
import toast from 'react-hot-toast';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import debounce from 'lodash/debounce';

interface Invoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  totalAmount: string;
  status: 'DRAFT' | 'GENERATED' | 'CANCELLED';
  createdAt: string;
  invoiceDate: string;
  customer?: {
    name: string;
    gstNumber: string | null;
  };
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function InvoicesPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchInvoices = useCallback(async (page: number, search: string, status: string) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        ...(search && { search }),
        ...(status && { status }),
      });

      const response = await fetch(`/api/invoices?${params}`);
      if (response.ok) {
        const data = await response.json();
        setInvoices(data.invoices);
        setPagination(data.pagination);
      } else {
        toast.error('Failed to load invoices');
      }
    } catch (error) {
      toast.error('Error loading invoices');
    } finally {
      setIsLoading(false);
    }
  }, [pagination.limit]);

  const debouncedSearch = useCallback(
    debounce((search: string) => {
      setPagination(prev => ({ ...prev, page: 1 }));
      fetchInvoices(1, search, statusFilter);
    }, 500),
    [fetchInvoices, statusFilter]
  );

  useEffect(() => {
    debouncedSearch(searchQuery);
  }, [searchQuery, debouncedSearch]);

  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchInvoices(1, searchQuery, statusFilter);
  }, [statusFilter]);

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    fetchInvoices(newPage, searchQuery, statusFilter);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      DRAFT: 'bg-yellow-100 text-yellow-800',
      GENERATED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
    };
    return statusConfig[status as keyof typeof statusConfig] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading && invoices.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
            <p className="mt-2 text-sm text-gray-600">
              Manage and track all your invoices in one place
            </p>
          </div>
          <Link
            href="/invoices/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Plus className="mr-2 h-5 w-5" />
            Create Invoice
          </Link>
        </div>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by invoice number or customer name..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
        </div>
        
        <div className="sm:w-48">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="">All Status</option>
            <option value="DRAFT">Draft</option>
            <option value="GENERATED">Generated</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {invoices.length === 0 && !searchQuery && !statusFilter ? (
        <div className="bg-white shadow rounded-lg p-6">
          <EmptyState
            title="No invoices yet"
            description="Create your first invoice to start managing your billing"
            icon={<FileText className="h-12 w-12" />}
            action={{
              label: "Create Your First Invoice",
              href: "/invoices/new"
            }}
          />
        </div>
      ) : invoices.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-sm font-medium text-gray-900">No invoices found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search or filters
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Invoice
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
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
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {invoice.invoiceNumber}
                      </div>
                      <div className="text-sm text-gray-500">
                        Created {format(new Date(invoice.createdAt), 'dd MMM yyyy')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {invoice.customerName}
                      </div>
                      {invoice.customer?.gstNumber && (
                        <div className="text-sm text-gray-500">
                          GST: {invoice.customer.gstNumber}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center">
                        <Calendar className="mr-1 h-4 w-4 text-gray-400" />
                        {format(new Date(invoice.invoiceDate), 'dd MMM yyyy')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(parseFloat(invoice.totalAmount))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex text-xs leading-5 font-semibold rounded-full px-2 py-1 ${getStatusBadge(invoice.status)}`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          href={`/invoices/${invoice.id}`}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="View invoice"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        {invoice.status === 'DRAFT' && (
                          <Link
                            href={`/invoices/${invoice.id}/edit`}
                            className="text-gray-600 hover:text-gray-900"
                            title="Edit invoice"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                        )}
                        {invoice.status === 'GENERATED' && (
                          <button
                            onClick={() => router.push(`/invoices/${invoice.id}?download=true`)}
                            className="text-gray-600 hover:text-gray-900"
                            title="Download PDF"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pagination.totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing{' '}
                    <span className="font-medium">
                      {(pagination.page - 1) * pagination.limit + 1}
                    </span>{' '}
                    to{' '}
                    <span className="font-medium">
                      {Math.min(pagination.page * pagination.limit, pagination.total)}
                    </span>{' '}
                    of <span className="font-medium">{pagination.total}</span> invoices
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                      Page {pagination.page} of {pagination.totalPages}
                    </span>
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}