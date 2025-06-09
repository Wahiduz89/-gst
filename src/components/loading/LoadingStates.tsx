// src/components/loading/LoadingStates.tsx

'use client';

import { Loader2 } from 'lucide-react';

// Full page loading spinner
export function PageLoader({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mx-auto" />
        <p className="mt-4 text-sm text-gray-600">{message}</p>
      </div>
    </div>
  );
}

// Inline loading spinner
export function InlineLoader({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  return (
    <div className="flex items-center justify-center p-4">
      <Loader2 className={`animate-spin text-indigo-600 ${sizeClasses[size]}`} />
    </div>
  );
}

// Button loading state
export function ButtonLoader({ text = 'Processing...' }: { text?: string }) {
  return (
    <>
      <Loader2 className="h-4 w-4 animate-spin mr-2" />
      {text}
    </>
  );
}

// Table skeleton loader
export function TableSkeleton({ rows = 5, columns = 5 }: { rows?: number; columns?: number }) {
  return (
    <div className="animate-pulse">
      <div className="bg-gray-100 h-10 mb-4"></div>
      {[...Array(rows)].map((_, rowIndex) => (
        <div key={rowIndex} className="flex space-x-4 mb-2">
          {[...Array(columns)].map((_, colIndex) => (
            <div key={colIndex} className="flex-1 h-8 bg-gray-200 rounded"></div>
          ))}
        </div>
      ))}
    </div>
  );
}

// Card skeleton loader
export function CardSkeleton() {
  return (
    <div className="bg-white shadow rounded-lg p-6 animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        <div className="h-4 bg-gray-200 rounded w-4/6"></div>
      </div>
    </div>
  );
}

// Form skeleton loader
export function FormSkeleton({ fields = 4 }: { fields?: number }) {
  return (
    <div className="space-y-6 animate-pulse">
      {[...Array(fields)].map((_, index) => (
        <div key={index}>
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      ))}
      <div className="flex justify-end space-x-3 pt-4">
        <div className="h-10 bg-gray-200 rounded w-24"></div>
        <div className="h-10 bg-gray-300 rounded w-32"></div>
      </div>
    </div>
  );
}

// Loading overlay for sections
export function LoadingOverlay({ isLoading, children }: { isLoading: boolean; children: React.ReactNode }) {
  if (!isLoading) return <>{children}</>;

  return (
    <div className="relative">
      <div className="opacity-50 pointer-events-none">{children}</div>
      <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    </div>
  );
}