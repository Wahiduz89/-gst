import { Metadata } from 'next';
import { requireNoAuth } from '@/lib/auth-utils';

export const metadata: Metadata = {
  title: 'Authentication - GST Invoice Generator',
  description: 'Sign in or create an account to manage your GST invoices',
};

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Redirect to dashboard if already authenticated
  await requireNoAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="fixed top-0 left-0 w-full bg-white shadow-sm z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-indigo-600">GST Invoice Generator</h1>
            </div>
            <div className="text-sm text-gray-600">
              Professional invoicing for Indian businesses
            </div>
          </div>
        </div>
      </div>
      <div className="pt-16">
        {children}
      </div>
    </div>
  );
}