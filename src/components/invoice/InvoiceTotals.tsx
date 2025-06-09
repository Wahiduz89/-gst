// src/components/invoice/InvoiceTotals.tsx

'use client';

import { formatCurrency, numberToWords } from '@/lib/utils';
import { IndianRupee } from 'lucide-react';

interface InvoiceTotalsProps {
  subtotal: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalAmount: number;
  isInterState: boolean;
}

export default function InvoiceTotals({
  subtotal,
  cgst,
  sgst,
  igst,
  totalAmount,
  isInterState,
}: InvoiceTotalsProps) {
  const hasGST = cgst > 0 || sgst > 0 || igst > 0;

  return (
    <div className="bg-gray-50 rounded-lg p-6 space-y-3">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Invoice Summary</h3>
      
      {/* Subtotal */}
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600">Subtotal</span>
        <span className="text-sm font-medium text-gray-900">
          {formatCurrency(subtotal)}
        </span>
      </div>

      {/* GST Breakdown */}
      {hasGST && (
        <>
          {isInterState ? (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">IGST</span>
              <span className="text-sm font-medium text-gray-900">
                {formatCurrency(igst)}
              </span>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">CGST</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatCurrency(cgst)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">SGST</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatCurrency(sgst)}
                </span>
              </div>
            </>
          )}
        </>
      )}

      {/* Total Amount */}
      <div className="pt-3 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <span className="text-lg font-medium text-gray-900">Total Amount</span>
          <span className="text-2xl font-bold text-indigo-600 flex items-center">
            <IndianRupee className="h-6 w-6 mr-1" />
            {totalAmount.toLocaleString('en-IN', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        </div>
      </div>

      {/* Amount in Words */}
      <div className="pt-3 border-t border-gray-200">
        <p className="text-xs text-gray-500 uppercase">Amount in words</p>
        <p className="text-sm font-medium text-gray-900 mt-1">
          {numberToWords(totalAmount)}
        </p>
      </div>

      {/* GST Type Indicator */}
      <div className="mt-4 p-3 bg-white rounded border border-gray-200">
        <p className="text-xs text-gray-500">
          Transaction Type: <span className="font-medium text-gray-700">
            {isInterState ? 'Inter-state (IGST)' : 'Intra-state (CGST + SGST)'}
          </span>
        </p>
      </div>
    </div>
  );
}