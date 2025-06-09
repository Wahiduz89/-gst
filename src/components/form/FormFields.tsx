// src/components/form/FormFields.tsx

'use client';

import { forwardRef } from 'react';
import { AlertCircle } from 'lucide-react';

interface BaseFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  helpText?: string;
}

interface InputFieldProps extends BaseFieldProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'date';
  placeholder?: string;
  icon?: React.ReactNode;
}

// Text input field with validation
export const InputField = forwardRef<HTMLInputElement, InputFieldProps & React.InputHTMLAttributes<HTMLInputElement>>(
  ({ label, error, required, helpText, icon, className = '', ...props }, ref) => {
    return (
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={`
              block w-full rounded-md shadow-sm
              ${icon ? 'pl-10' : 'pl-3'} pr-3 py-2
              ${error 
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
              }
              ${className}
            `}
            aria-invalid={!!error}
            aria-describedby={error ? `${props.id}-error` : undefined}
            {...props}
          />
          {error && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <AlertCircle className="h-5 w-5 text-red-500" />
            </div>
          )}
        </div>
        {error && (
          <p className="text-sm text-red-600" id={`${props.id}-error`}>
            {error}
          </p>
        )}
        {helpText && !error && (
          <p className="text-sm text-gray-500">{helpText}</p>
        )}
      </div>
    );
  }
);

InputField.displayName = 'InputField';

// Textarea field with validation
export const TextareaField = forwardRef<HTMLTextAreaElement, BaseFieldProps & React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ label, error, required, helpText, className = '', ...props }, ref) => {
    return (
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <textarea
          ref={ref}
          className={`
            block w-full rounded-md shadow-sm px-3 py-2
            ${error 
              ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
              : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
            }
            ${className}
          `}
          aria-invalid={!!error}
          aria-describedby={error ? `${props.id}-error` : undefined}
          {...props}
        />
        {error && (
          <p className="text-sm text-red-600" id={`${props.id}-error`}>
            {error}
          </p>
        )}
        {helpText && !error && (
          <p className="text-sm text-gray-500">{helpText}</p>
        )}
      </div>
    );
  }
);

TextareaField.displayName = 'TextareaField';

// Select field with validation
export const SelectField = forwardRef<HTMLSelectElement, BaseFieldProps & React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ label, error, required, helpText, children, className = '', ...props }, ref) => {
    return (
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <select
          ref={ref}
          className={`
            block w-full rounded-md shadow-sm px-3 py-2
            ${error 
              ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
              : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
            }
            ${className}
          `}
          aria-invalid={!!error}
          aria-describedby={error ? `${props.id}-error` : undefined}
          {...props}
        >
          {children}
        </select>
        {error && (
          <p className="text-sm text-red-600" id={`${props.id}-error`}>
            {error}
          </p>
        )}
        {helpText && !error && (
          <p className="text-sm text-gray-500">{helpText}</p>
        )}
      </div>
    );
  }
);

SelectField.displayName = 'SelectField';

// Checkbox field
export function CheckboxField({
  label,
  helpText,
  error,
  ...props
}: {
  label: string;
  helpText?: string;
  error?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-1">
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            type="checkbox"
            className={`
              h-4 w-4 rounded
              ${error 
                ? 'text-red-600 focus:ring-red-500 border-red-300' 
                : 'text-indigo-600 focus:ring-indigo-500 border-gray-300'
              }
            `}
            {...props}
          />
        </div>
        <div className="ml-3">
          <label htmlFor={props.id} className="text-sm font-medium text-gray-700">
            {label}
          </label>
          {helpText && (
            <p className="text-sm text-gray-500">{helpText}</p>
          )}
        </div>
      </div>
      {error && (
        <p className="text-sm text-red-600 ml-7">{error}</p>
      )}
    </div>
  );
}

// Field group for organizing form sections
export function FieldGroup({ 
  title, 
  description, 
  children 
}: { 
  title: string; 
  description?: string; 
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        {description && (
          <p className="mt-1 text-sm text-gray-500">{description}</p>
        )}
      </div>
      <div className="space-y-6">
        {children}
      </div>
    </div>
  );
}