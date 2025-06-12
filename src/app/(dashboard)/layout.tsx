// src/app/(dashboard)/layout.tsx - Fixed version

import { requireAuth } from '@/lib/auth-utils';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { redirect } from 'next/navigation';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const session = await requireAuth();

  if (!session?.user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Use Client Component for interactive header */}
      <DashboardHeader user={session.user} />

      {/* Main Content */}
      <div className="flex h-screen pt-16">
        {/* Sidebar */}
        <DashboardSidebar />
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">
          <div className="py-6 px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}