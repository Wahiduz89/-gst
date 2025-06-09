'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Settings, 
  Building2,
  Plus,
  List
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Create Invoice', href: '/invoices/new', icon: Plus },
  { name: 'All Invoices', href: '/invoices', icon: FileText },
  { name: 'Customers', href: '/customers', icon: Users },
  { name: 'Business Settings', href: '/dashboard/settings', icon: Building2 },
];

export default function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col">
        <div className="flex flex-col flex-grow pt-5 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="flex-grow flex flex-col">
            <nav className="flex-1 px-2 pb-4 space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href || 
                  (item.href !== '/dashboard' && pathname.startsWith(item.href));
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`
                      group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
                      ${isActive
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }
                    `}
                  >
                    <item.icon
                      className={`
                        mr-3 h-5 w-5 flex-shrink-0
                        ${isActive
                          ? 'text-indigo-700'
                          : 'text-gray-400 group-hover:text-gray-500'
                        }
                      `}
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
          
          <div className="p-4 border-t border-gray-200">
            <div className="text-xs text-gray-500">
              <p className="font-medium">Quick Tips</p>
              <p className="mt-1">Press Ctrl+N to create a new invoice quickly</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div className="md:hidden fixed inset-0 flex z-40 pointer-events-none">
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            {/* Close button would go here when mobile menu is open */}
          </div>
          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            <nav className="mt-5 px-2 space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href || 
                  (item.href !== '/dashboard' && pathname.startsWith(item.href));
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`
                      group flex items-center px-3 py-2 text-base font-medium rounded-md
                      ${isActive
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }
                    `}
                  >
                    <item.icon
                      className={`
                        mr-4 h-6 w-6 flex-shrink-0
                        ${isActive
                          ? 'text-indigo-700'
                          : 'text-gray-400 group-hover:text-gray-500'
                        }
                      `}
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </div>
    </>
  );
}