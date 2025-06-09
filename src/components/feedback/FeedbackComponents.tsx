// src/components/feedback/FeedbackComponents.tsx

'use client';

import { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Info, 
  X,
  WifiOff,
  Wifi
} from 'lucide-react';

// Success message component
export function SuccessMessage({ 
  title, 
  message, 
  onDismiss 
}: { 
  title: string; 
  message?: string; 
  onDismiss?: () => void;
}) {
  return (
    <div className="rounded-md bg-green-50 p-4 shadow-sm">
      <div className="flex">
        <div className="flex-shrink-0">
          <CheckCircle className="h-5 w-5 text-green-400" />
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-green-800">{title}</h3>
          {message && (
            <div className="mt-2 text-sm text-green-700">{message}</div>
          )}
        </div>
        {onDismiss && (
          <div className="ml-auto pl-3">
            <button
              onClick={onDismiss}
              className="inline-flex rounded-md bg-green-50 p-1.5 text-green-500 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 focus:ring-offset-green-50"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Error message component
export function ErrorMessage({ 
  title, 
  message, 
  onDismiss,
  action
}: { 
  title: string; 
  message?: string; 
  onDismiss?: () => void;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <div className="rounded-md bg-red-50 p-4 shadow-sm">
      <div className="flex">
        <div className="flex-shrink-0">
          <XCircle className="h-5 w-5 text-red-400" />
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-red-800">{title}</h3>
          {message && (
            <div className="mt-2 text-sm text-red-700">{message}</div>
          )}
          {action && (
            <div className="mt-3">
              <button
                onClick={action.onClick}
                className="text-sm font-medium text-red-800 hover:text-red-700"
              >
                {action.label} →
              </button>
            </div>
          )}
        </div>
        {onDismiss && (
          <div className="ml-auto pl-3">
            <button
              onClick={onDismiss}
              className="inline-flex rounded-md bg-red-50 p-1.5 text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-red-50"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Warning message component
export function WarningMessage({ 
  title, 
  message 
}: { 
  title: string; 
  message?: string; 
}) {
  return (
    <div className="rounded-md bg-yellow-50 p-4 shadow-sm">
      <div className="flex">
        <div className="flex-shrink-0">
          <AlertCircle className="h-5 w-5 text-yellow-400" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-yellow-800">{title}</h3>
          {message && (
            <div className="mt-2 text-sm text-yellow-700">{message}</div>
          )}
        </div>
      </div>
    </div>
  );
}

// Info message component
export function InfoMessage({ 
  title, 
  message 
}: { 
  title: string; 
  message?: string; 
}) {
  return (
    <div className="rounded-md bg-blue-50 p-4 shadow-sm">
      <div className="flex">
        <div className="flex-shrink-0">
          <Info className="h-5 w-5 text-blue-400" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-blue-800">{title}</h3>
          {message && (
            <div className="mt-2 text-sm text-blue-700">{message}</div>
          )}
        </div>
      </div>
    </div>
  );
}

// Network status indicator
export function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [showStatus, setShowStatus] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowStatus(true);
      setTimeout(() => setShowStatus(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowStatus(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check initial status
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showStatus && isOnline) return null;

  return (
    <div className={`fixed bottom-4 right-4 z-50 transition-all duration-300 ${
      showStatus ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
    }`}>
      <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg shadow-lg ${
        isOnline ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
      }`}>
        {isOnline ? (
          <>
            <Wifi className="h-5 w-5" />
            <span className="text-sm font-medium">Back online</span>
          </>
        ) : (
          <>
            <WifiOff className="h-5 w-5" />
            <span className="text-sm font-medium">No internet connection</span>
          </>
        )}
      </div>
    </div>
  );
}

// Form validation feedback
export function ValidationFeedback({ 
  errors, 
  touched 
}: { 
  errors: Record<string, string>; 
  touched: Record<string, boolean>;
}) {
  const visibleErrors = Object.entries(errors).filter(([field]) => touched[field]);

  if (visibleErrors.length === 0) return null;

  return (
    <div className="rounded-md bg-red-50 p-4 mb-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <XCircle className="h-5 w-5 text-red-400" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">
            Please correct the following errors:
          </h3>
          <div className="mt-2 text-sm text-red-700">
            <ul className="list-disc list-inside space-y-1">
              {visibleErrors.map(([field, error]) => (
                <li key={field}>{error}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// Progress indicator
export function ProgressIndicator({ 
  steps, 
  currentStep 
}: { 
  steps: string[]; 
  currentStep: number;
}) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center">
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
              ${index < currentStep 
                ? 'bg-indigo-600 text-white' 
                : index === currentStep 
                ? 'bg-indigo-600 text-white ring-2 ring-offset-2 ring-indigo-600' 
                : 'bg-gray-200 text-gray-500'
              }
            `}>
              {index < currentStep ? '✓' : index + 1}
            </div>
            {index < steps.length - 1 && (
              <div className={`
                h-0.5 w-full mx-2
                ${index < currentStep ? 'bg-indigo-600' : 'bg-gray-200'}
              `} />
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-2">
        {steps.map((step, index) => (
          <p key={index} className={`text-xs ${
            index <= currentStep ? 'text-gray-900 font-medium' : 'text-gray-500'
          }`}>
            {step}
          </p>
        ))}
      </div>
    </div>
  );
}