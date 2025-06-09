// src/components/invoice/InvoiceTemplate.tsx

'use client';

import { formatCurrency, formatDate, numberToWords } from '@/lib/utils';
import { Invoice, InvoiceItem, Customer } from '@/types';

interface InvoiceTemplateProps {
  invoice: Invoice & {
    customer: Customer;
    items: InvoiceItem[];
  };
  businessDetails?: {
    businessName: string;
    businessAddress: string;
    businessGST?: string;
    businessPhone?: string;
    businessEmail?: string;
  };
}

export default function InvoiceTemplate({ 
  invoice, 
  businessDetails = {
    businessName: 'Your Business Name',
    businessAddress: '123 Business Street, City, State - 123456',
    businessGST: '',
    businessPhone: '',
    businessEmail: '',
  }
}: InvoiceTemplateProps) {
  const isInterState = invoice.customerState !== invoice.businessState;
  
  return (
    <div className="bg-white p-8 max-w-4xl mx-auto" id="invoice-template">
      {/* Header */}
      <div className="border-b-2 border-gray-300 pb-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{businessDetails.businessName}</h1>
            <p className="text-sm text-gray-600 mt-1">{businessDetails.businessAddress}</p>
            {businessDetails.businessGST && (
              <p className="text-sm text-gray-600">GSTIN: {businessDetails.businessGST}</p>
            )}
            {businessDetails.businessPhone && (
              <p className="text-sm text-gray-600">Phone: {businessDetails.businessPhone}</p>
            )}
            {businessDetails.businessEmail && (
              <p className="text-sm text-gray-600">Email: {businessDetails.businessEmail}</p>
            )}
          </div>
          <div className="text-right">
            <h2 className="text-3xl font-bold text-gray-900">TAX INVOICE</h2>
            <p className="text-sm text-gray-600 mt-2">Invoice No: {invoice.invoiceNumber}</p>
            <p className="text-sm text-gray-600">Date: {formatDate(invoice.createdAt)}</p>
            {invoice.dueDate && (
              <p className="text-sm text-gray-600">Due Date: {formatDate(invoice.dueDate)}</p>
            )}
          </div>
        </div>
      </div>

      {/* Bill To Section */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Bill To:</h3>
          <p className="font-medium text-gray-900">{invoice.customer.name}</p>
          <p className="text-sm text-gray-600">{invoice.customer.address}</p>
          {invoice.customer.gstNumber && (
            <p className="text-sm text-gray-600">GSTIN: {invoice.customer.gstNumber}</p>
          )}
          {invoice.customer.phone && (
            <p className="text-sm text-gray-600">Phone: {invoice.customer.phone}</p>
          )}
          {invoice.customer.email && (
            <p className="text-sm text-gray-600">Email: {invoice.customer.email}</p>
          )}
        </div>
        
        {/* Place of Supply */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Supply Details:</h3>
          <p className="text-sm text-gray-600">Place of Supply: {invoice.customerState || 'Not specified'}</p>
          <p className="text-sm text-gray-600">
            Transaction Type: {isInterState ? 'Inter-state' : 'Intra-state'}
          </p>
        </div>
      </div>

      {/* Items Table */}
      <div className="mb-8">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold text-gray-900">S.No</th>
              <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold text-gray-900">Description</th>
              <th className="border border-gray-300 px-4 py-2 text-right text-sm font-semibold text-gray-900">Qty</th>
              <th className="border border-gray-300 px-4 py-2 text-right text-sm font-semibold text-gray-900">Rate</th>
              <th className="border border-gray-300 px-4 py-2 text-right text-sm font-semibold text-gray-900">Amount</th>
              {isInterState ? (
                <>
                  <th className="border border-gray-300 px-4 py-2 text-right text-sm font-semibold text-gray-900">IGST %</th>
                  <th className="border border-gray-300 px-4 py-2 text-right text-sm font-semibold text-gray-900">IGST Amt</th>
                </>
              ) : (
                <>
                  <th className="border border-gray-300 px-4 py-2 text-right text-sm font-semibold text-gray-900">CGST %</th>
                  <th className="border border-gray-300 px-4 py-2 text-right text-sm font-semibold text-gray-900">CGST Amt</th>
                  <th className="border border-gray-300 px-4 py-2 text-right text-sm font-semibold text-gray-900">SGST %</th>
                  <th className="border border-gray-300 px-4 py-2 text-right text-sm font-semibold text-gray-900">SGST Amt</th>
                </>
              )}
              <th className="border border-gray-300 px-4 py-2 text-right text-sm font-semibold text-gray-900">Total</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, index) => (
              <tr key={item.id}>
                <td className="border border-gray-300 px-4 py-2 text-sm">{index + 1}</td>
                <td className="border border-gray-300 px-4 py-2 text-sm">{item.description}</td>
                <td className="border border-gray-300 px-4 py-2 text-sm text-right">{item.quantity}</td>
                <td className="border border-gray-300 px-4 py-2 text-sm text-right">{formatCurrency(Number(item.rate))}</td>
                <td className="border border-gray-300 px-4 py-2 text-sm text-right">{formatCurrency(Number(item.amount))}</td>
                {isInterState ? (
                  <>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-right">{Number(item.gstRate)}%</td>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-right">{formatCurrency(Number(item.igst))}</td>
                  </>
                ) : (
                  <>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-right">{Number(item.gstRate) / 2}%</td>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-right">{formatCurrency(Number(item.cgst))}</td>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-right">{Number(item.gstRate) / 2}%</td>
                    <td className="border border-gray-300 px-4 py-2 text-sm text-right">{formatCurrency(Number(item.sgst))}</td>
                  </>
                )}
                <td className="border border-gray-300 px-4 py-2 text-sm text-right font-medium">{formatCurrency(Number(item.totalAmount))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals Section */}
      <div className="flex justify-end mb-8">
        <div className="w-80">
          <div className="flex justify-between py-2 border-b border-gray-200">
            <span className="text-sm text-gray-600">Subtotal</span>
            <span className="text-sm font-medium">{formatCurrency(Number(invoice.subtotal))}</span>
          </div>
          {isInterState ? (
            <div className="flex justify-between py-2 border-b border-gray-200">
              <span className="text-sm text-gray-600">IGST</span>
              <span className="text-sm font-medium">{formatCurrency(Number(invoice.igst))}</span>
            </div>
          ) : (
            <>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-sm text-gray-600">CGST</span>
                <span className="text-sm font-medium">{formatCurrency(Number(invoice.cgst))}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200">
                <span className="text-sm text-gray-600">SGST</span>
                <span className="text-sm font-medium">{formatCurrency(Number(invoice.sgst))}</span>
              </div>
            </>
          )}
          <div className="flex justify-between py-3 border-b-2 border-gray-300">
            <span className="text-base font-semibold">Total Amount</span>
            <span className="text-base font-bold">{formatCurrency(Number(invoice.totalAmount))}</span>
          </div>
        </div>
      </div>

      {/* Amount in Words */}
      <div className="mb-8 p-4 bg-gray-50 rounded">
        <p className="text-sm text-gray-600">Amount in words:</p>
        <p className="text-sm font-medium text-gray-900">{numberToWords(Number(invoice.totalAmount))}</p>
      </div>

      {/* Terms and Notes */}
      {(invoice.termsConditions || invoice.notes) && (
        <div className="grid grid-cols-2 gap-8 mb-8">
          {invoice.termsConditions && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Terms & Conditions:</h3>
              <p className="text-xs text-gray-600 whitespace-pre-wrap">{invoice.termsConditions}</p>
            </div>
          )}
          {invoice.notes && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Notes:</h3>
              <p className="text-xs text-gray-600 whitespace-pre-wrap">{invoice.notes}</p>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="mt-12 pt-8 border-t border-gray-200">
        <div className="flex justify-between items-end">
          <div>
            <p className="text-xs text-gray-500">This is a computer generated invoice</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-900 mb-8">For {businessDetails.businessName}</p>
            <div className="mt-8 pt-8 border-t border-gray-300 w-48">
              <p className="text-sm text-gray-600">Authorized Signatory</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}