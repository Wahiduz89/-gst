// src/app/(dashboard)/invoices/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Plus,
  Search,
  Filter,
  Download,
  Edit,
  Eye,
  MoreHorizontal,
  Calendar,
  FileText,
  Loader2,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import toast from 'react-hot-toast';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';

interface Invoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string | null;
  status: 'DRAFT' | 'GENERATED' | 'CANCELLED';
  customerName: string;
  customerGST: string | null;
  totalAmount: string;
  createdAt: string;
  updatedAt: string;
}

interface InvoicesResponse {
  invoices: Invoice[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

type StatusFilter = 'ALL' | 'DRAFT' | 'GENERATED' | 'CANCELLED';
type SortField = 'invoiceDate' | 'invoiceNumber' | 'customerName' | 'totalAmount' | 'createdAt';
type SortOrder = 'asc' | 'desc';

export default function InvoicesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);
  
  // Filter and search states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [showFilters, setShowFilters] = useState(false);
  
  // Date range filter
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    fetchInvoices();
  }, [currentPage, searchQuery, statusFilter, sortField, sortOrder, dateFrom, dateTo]);

  const fetchInvoices = async () => {
    try {
      setIsLoading(true);
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        search: searchQuery,
        status: statusFilter,
        sortField,
        sortOrder,
        ...(dateFrom && { dateFrom }),
        ...(dateTo && { dateTo }),
      });

      const response = await fetch(`/api/invoices?${params}`);
      
      if (response.ok) {
        const data: InvoicesResponse = await response.json();
        setInvoices(data.invoices);
        setTotalCount(data.totalCount);
        setCurrentPage(data.currentPage);
        setTotalPages(data.totalPages);
        setHasNextPage(data.hasNextPage);
        setHasPreviousPage(data.hasPreviousPage);
      } else {
        toast.error('Failed to load invoices');
      }
    } catch (error) {
      toast.error('Error loading invoices');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (status: StatusFilter) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('ALL');
    setDateFrom('');
    setDateTo('');
    setSortField('createdAt');
    setSortOrder('desc');
    setCurrentPage(1);
  };

  const getStatusBadge = (status: Invoice['status']) => {
    const statusConfig = {
      DRAFT: { 
        icon: Clock, 
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        label: 'Draft'
      },
      GENERATED: { 
        icon: CheckCircle, 
        className: 'bg-green-100 text-green-800 border-green-200',
        label: 'Generated'
      },
      CANCELLED: { 
        icon: XCircle, 
        className: 'bg-red-100 text-red-800 border-red-200',
        label: 'Cancelled'
      },
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.className}`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </span>
    );
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  if (isLoading && currentPage === 1) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
            <p className="mt-2 text-sm text-gray-600">
              Manage and track all your invoices
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

      {/* Filters and Search */}
      <div className="bg-white shadow rounded-lg mb-6">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search invoices by number, customer name..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="sm:w-48">
              <select
                value={statusFilter}
                onChange={(e) => handleStatusFilterChange(e.target.value as StatusFilter)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="ALL">All Status</option>
                <option value="DRAFT">Draft</option>
                <option value="GENERATED">Generated</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            {/* Advanced Filters Toggle */}
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date From</label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date To</label>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="w-full px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results Summary */}
      {!isLoading && (
        <div className="mb-4">
          <p className="text-sm text-gray-700">
            Showing {invoices.length} of {totalCount} invoices
          </p>
        </div>
      )}

      {/* Invoices Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
          </div>
        ) : invoices.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No invoices found</h3>
            <p className="text-sm text-gray-500 mb-6">
              {searchQuery || statusFilter !== 'ALL' || dateFrom || dateTo
                ? 'Try adjusting your search criteria'
                : 'Get started by creating your first invoice'}
            </p>
            <Link
              href="/invoices/new"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Plus className="mr-2 h-5 w-5" />
              Create Your First Invoice
            </Link>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('invoiceNumber')}
                    >
                      Invoice Number {getSortIcon('invoiceNumber')}
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('customerName')}
                    >
                      Customer {getSortIcon('customerName')}
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('invoiceDate')}
                    >
                      Date {getSortIcon('invoiceDate')}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Due Date
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('totalAmount')}
                    >
                      Amount {getSortIcon('totalAmount')}
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="relative px-6 py-3">
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
                        <div className="text-sm font-medium text-gray-900">
                          {invoice.customerName}
                        </div>
                        {invoice.customerGST && (
                          <div className="text-sm text-gray-500">
                            GST: {invoice.customerGST}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {format(new Date(invoice.invoiceDate), 'dd MMM yyyy')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {invoice.dueDate ? format(new Date(invoice.dueDate), 'dd MMM yyyy') : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(parseFloat(invoice.totalAmount))}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(invoice.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <Link
                            href={`/invoices/${invoice.id}`}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="View Invoice"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          {invoice.status === 'DRAFT' && (
                            <Link
                              href={`/invoices/${invoice.id}/edit`}
                              className="text-gray-600 hover:text-gray-900"
                              title="Edit Invoice"
                            >
                              <Edit className="h-4 w-4" />
                            </Link>
                          )}
                          {invoice.status === 'GENERATED' && (
                            <Link
                              href={`/invoices/${invoice.id}?download=true`}
                              className="text-green-600 hover:text-green-900"
                              title="Download PDF"
                            >
                              <Download className="h-4 w-4" />
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={!hasPreviousPage}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={!hasNextPage}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing{' '}
                      <span className="font-medium">{(currentPage - 1) * 10 + 1}</span>
                      {' '}to{' '}
                      <span className="font-medium">
                        {Math.min(currentPage * 10, totalCount)}
                      </span>
                      {' '}of{' '}
                      <span className="font-medium">{totalCount}</span>
                      {' '}results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={!hasPreviousPage}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNumber;
                        if (totalPages <= 5) {
                          pageNumber = i + 1;
                        } else if (currentPage <= 3) {
                          pageNumber = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNumber = totalPages - 4 + i;
                        } else {
                          pageNumber = currentPage - 2 + i;
                        }
                        
                        return (
                          <button
                            key={pageNumber}
                            onClick={() => handlePageChange(pageNumber)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              pageNumber === currentPage
                                ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {pageNumber}
                          </button>
                        );
                      })}
                      
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={!hasNextPage}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}