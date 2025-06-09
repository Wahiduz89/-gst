

import { requireAuth } from '@/lib/auth-utils';
import { DashboardCard } from '@/components/dashboard/DashboardCard';
import { 
  FileText, 
  Users, 
  TrendingUp, 
  Calendar,
  Plus
} from 'lucide-react';
import Link from 'next/link';

export default async function DashboardPage() {
  const session = await requireAuth();

  // Placeholder data - will be replaced with actual data in Part 2
  const stats = {
    totalInvoices: 0,
    thisMonthInvoices: 0,
    totalCustomers: 0,
    totalRevenue: 0,
  };

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {session.user.name || session.user.email}!
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Here's an overview of your business activity
        </p>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <div className="bg-indigo-600 rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium text-white">
                Ready to create your first invoice?
              </h2>
              <p className="mt-1 text-sm text-indigo-200">
                Start generating professional GST-compliant invoices in minutes
              </p>
            </div>
            <Link
              href="/invoices/new"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-indigo-600 focus:ring-white"
            >
              <Plus className="mr-2 h-5 w-5" />
              Create Invoice
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <DashboardCard
          title="Total Invoices"
          value={stats.totalInvoices}
          icon={<FileText className="h-6 w-6 text-indigo-600" />}
          subtitle="All time"
        />
        <DashboardCard
          title="This Month"
          value={stats.thisMonthInvoices}
          icon={<Calendar className="h-6 w-6 text-indigo-600" />}
          subtitle="Invoices created"
        />
        <DashboardCard
          title="Total Customers"
          value={stats.totalCustomers}
          icon={<Users className="h-6 w-6 text-indigo-600" />}
          subtitle="Active customers"
        />
        <DashboardCard
          title="Total Revenue"
          value={`₹${stats.totalRevenue}`}
          icon={<TrendingUp className="h-6 w-6 text-indigo-600" />}
          subtitle="All time revenue"
        />
      </div>

      {/* Recent Activity Section */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Recent Activity
          </h3>
          <div className="text-center py-12 text-gray-500">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-sm">No invoices yet. Create your first invoice to get started!</p>
            <Link
              href="/invoices/new"
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Create Your First Invoice
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}