// src/app/not-found.tsx

import Link from 'next/link';
import { FileX, Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">
        <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-indigo-100 mb-8">
          <FileX className="h-12 w-12 text-indigo-600" />
        </div>
        
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          Page Not Found
        </h2>
        
        <p className="text-gray-600 mb-8 max-w-sm mx-auto">
          The page you are looking for does not exist or has been moved. 
          Please check the URL or navigate back to a known page.
        </p>

        <div className="space-y-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center w-full px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            <Home className="mr-2 h-5 w-5" />
            Go to Dashboard
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center w-full px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Go Back
          </button>
        </div>

        <div className="mt-12 text-sm text-gray-500">
          <p>Need assistance? Contact support at</p>
          <a href="mailto:support@gstinvoicegenerator.com" className="text-indigo-600 hover:text-indigo-500">
            support@gstinvoicegenerator.com
          </a>
        </div>
      </div>
    </div>
  );
}