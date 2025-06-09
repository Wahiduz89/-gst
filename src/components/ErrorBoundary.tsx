// src/components/ErrorBoundary.tsx

'use client';

import { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error caught by boundary:', error, errorInfo);
    // In production, this would send to error reporting service
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md w-full">
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Something went wrong
              </h1>
              
              <p className="text-gray-600 mb-6">
                We encountered an unexpected error. Our team has been notified and is working 
                to resolve the issue. Please try refreshing the page or return to the dashboard.
              </p>

              <div className="space-y-3">
                <button
                  onClick={this.handleReset}
                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh Page
                </button>
                
                <Link
                  href="/dashboard"
                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <Home className="mr-2 h-4 w-4" />
                  Return to Dashboard
                </Link>
              </div>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="mt-6 p-4 bg-gray-100 rounded text-left">
                  <p className="text-xs font-mono text-gray-700">
                    {this.state.error.toString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}