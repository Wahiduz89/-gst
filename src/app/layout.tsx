import type { Metadata } from 'next';
import './globals.css';
import AuthProvider from '@/components/auth/AuthProvider';
import ToastProvider from '@/components/ToastProvider';
import ErrorBoundary from '@/components/ErrorBoundary';
import { NetworkStatus } from '@/components/feedback/FeedbackComponents';

export const metadata: Metadata = {
  title: 'GST Invoice Generator - Professional Invoicing for Indian Businesses',
  description: 'Create GST-compliant invoices, manage customers, and streamline your billing process with our easy-to-use invoice generator designed for Indian small businesses.',
  keywords: 'GST invoice, invoice generator, Indian business, billing software, tax invoice',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-inter">
        <ErrorBoundary>
          <AuthProvider>
            <ToastProvider />
            <NetworkStatus />
            {children}
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}