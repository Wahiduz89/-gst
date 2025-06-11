// src/components/invoice/InvoiceItems.tsx

'use client';

import { useEffect } from 'react';
import { useFieldArray, useWatch, Control, UseFormRegister, FieldErrors } from 'react-hook-form';
import { 
  Plus, 
  Trash2, 
  Package,
  IndianRupee,
  Percent,
  Calculator
} from 'lucide-react';
import { formatCurrency, calculateInvoiceTotals } from '@/lib/utils';


interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
  gstRate: number;
}

interface InvoiceItemsProps {
  control: Control<any>;
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
  isInterState: boolean;
  onTotalsChange: (totals: {
    subtotal: number;
    cgst: number;
    sgst: number;
    igst: number;
    totalAmount: number;
  }) => void;
}

export default function InvoiceItems({
  control,
  register,
  errors,
  isInterState,
  onTotalsChange,
}: InvoiceItemsProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const watchedItems = useWatch({
    control,
    name: 'items',
  });

  // Calculate totals whenever items change
  useEffect(() => {
    if (!watchedItems || watchedItems.length === 0) {
      onTotalsChange({
        subtotal: 0,
        cgst: 0,
        sgst: 0,
        igst: 0,
        totalAmount: 0,
      });
      return;
    }

    let subtotal = 0;
    let totalCgst = 0;
    let totalSgst = 0;
    let totalIgst = 0;

    watchedItems.forEach((item: InvoiceItem) => {
      if (item.quantity && item.rate) {
        const amount = item.quantity * item.rate;
        subtotal += amount;

        if (item.gstRate) {
          const gst = calculateGST(amount, item.gstRate, isInterState);
          totalCgst += gst.cgst;
          totalSgst += gst.sgst;
          totalIgst += gst.igst;
        }
      }
    });

    const totalAmount = subtotal + totalCgst + totalSgst + totalIgst;

    onTotalsChange({
      subtotal,
      cgst: totalCgst,
      sgst: totalSgst,
      igst: totalIgst,
      totalAmount,
    });
  }, [watchedItems, isInterState, onTotalsChange]);

  const handleAddItem = () => {
    append({
      description: '',
      quantity: 1,
      rate: 0,
      gstRate: 18,
    });
  };

  const calculateItemTotal = (item: InvoiceItem) => {
    if (!item.quantity || !item.rate) return 0;
    const amount = item.quantity * item.rate;
    const gst = calculateGST(amount, item.gstRate || 0, isInterState);
    return gst.total;
  };

  const calculateItemGST = (item: InvoiceItem) => {
    if (!item.quantity || !item.rate || !item.gstRate) return null;
    const amount = item.quantity * item.rate;
    return calculateGST(amount, item.gstRate, isInterState);
  };

  return (
    <div className="space-y-4">
      {/* Table Header */}
      <div className="hidden sm:grid sm:grid-cols-12 gap-2 px-2 text-xs font-medium text-gray-700 uppercase tracking-wider">
        <div className="col-span-4">Description</div>
        <div className="col-span-2 text-right">Quantity</div>
        <div className="col-span-2 text-right">Rate</div>
        <div className="col-span-1 text-right">GST %</div>
        <div className="col-span-2 text-right">Total</div>
        <div className="col-span-1"></div>
      </div>

      {/* Invoice Items */}
      <div className="space-y-3">
        {fields.map((field, index) => {
          const item = watchedItems?.[index] || {};
          const itemGST = calculateItemGST(item);
          const itemTotal = calculateItemTotal(item);

          return (
            <div key={field.id} className="relative">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                {/* Mobile Layout */}
                <div className="sm:hidden space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <input
                      {...register(`items.${index}.description`)}
                      type="text"
                      placeholder="Item description"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                    {errors.items?.[index]?.description && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.items[index].description.message}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Qty
                      </label>
                      <input
                        {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                        type="number"
                        step="0.01"
                        placeholder="1"
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Rate
                      </label>
                      <input
                        {...register(`items.${index}.rate`, { valueAsNumber: true })}
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        GST %
                      </label>
                      <select
                        {...register(`items.${index}.gstRate`, { valueAsNumber: true })}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      >
                        <option value={0}>0%</option>
                        <option value={5}>5%</option>
                        <option value={12}>12%</option>
                        <option value={18}>18%</option>
                        <option value={28}>28%</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                    <div className="text-sm">
                      <span className="text-gray-500">Total:</span>
                      <span className="ml-2 font-medium text-gray-900">
                        {formatCurrency(itemTotal)}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="text-red-600 hover:text-red-800"
                      disabled={fields.length === 1}
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Desktop Layout */}
                <div className="hidden sm:grid sm:grid-cols-12 gap-2 items-start">
                  <div className="col-span-4">
                    <input
                      {...register(`items.${index}.description`)}
                      type="text"
                      placeholder="Item description"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                    {errors.items?.[index]?.description && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.items[index].description.message}
                      </p>
                    )}
                  </div>

                  <div className="col-span-2">
                    <input
                      {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                      type="number"
                      step="0.01"
                      placeholder="1"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-right"
                    />
                    {errors.items?.[index]?.quantity && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.items[index].quantity.message}
                      </p>
                    )}
                  </div>

                  <div className="col-span-2">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <IndianRupee className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        {...register(`items.${index}.rate`, { valueAsNumber: true })}
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        className="block w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-right"
                      />
                    </div>
                    {errors.items?.[index]?.rate && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.items[index].rate.message}
                      </p>
                    )}
                  </div>

                  <div className="col-span-1">
                    <select
                      {...register(`items.${index}.gstRate`, { valueAsNumber: true })}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                      <option value={0}>0%</option>
                      <option value={5}>5%</option>
                      <option value={12}>12%</option>
                      <option value={18}>18%</option>
                      <option value={28}>28%</option>
                    </select>
                  </div>

                  <div className="col-span-2 text-right">
                    <div className="py-2 pr-3">
                      <span className="text-sm font-medium text-gray-900">
                        {formatCurrency(itemTotal)}
                      </span>
                      {itemGST && item.gstRate > 0 && (
                        <div className="text-xs text-gray-500 mt-1">
                          {isInterState ? (
                            <span>IGST: {formatCurrency(itemGST.igst)}</span>
                          ) : (
                            <span>GST: {formatCurrency(itemGST.cgst + itemGST.sgst)}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="col-span-1 text-right">
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="p-2 text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={fields.length === 1}
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Item Button */}
      <button
        type="button"
        onClick={handleAddItem}
        className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:border-gray-400 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        <Plus className="inline-block w-5 h-5 mr-2" />
        Add Item
      </button>

      {/* GST Rate Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <Calculator className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">GST Rate Guidelines:</p>
            <ul className="space-y-1 text-blue-700">
              <li>• 0% - Exempted goods (basic necessities)</li>
              <li>• 5% - Essential items (packaged food, economy hotels)</li>
              <li>• 12% - Standard goods (processed food, business class hotels)</li>
              <li>• 18% - Most goods and services (default rate)</li>
              <li>• 28% - Luxury items (luxury hotels, cars)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}