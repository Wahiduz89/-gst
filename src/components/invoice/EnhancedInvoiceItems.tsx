// src/components/invoice/EnhancedInvoiceItems.tsx
// Enhanced invoice items component with integrated HSN/SAC code functionality

'use client';

import { useEffect, useState } from 'react';
import { useFieldArray, useWatch, Control, UseFormRegister, FieldErrors } from 'react-hook-form';
import { 
  Plus, 
  Trash2, 
  Search,
  Package,
  IndianRupee,
  Percent,
  Calculator,
  Tag,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { formatCurrency, calculateInvoiceTotals } from '@/lib/utils';
import { HsnSacSelector } from './HsnSacSelector';
import { FrequentlyUsedItemsModal } from './FrequentlyUsedItemsModal';

interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
  gstRate: number;
  hsnSacCode?: string;
  hsnSacType: 'HSN' | 'SAC';
  itemCategory?: string;
  itemSubCategory?: string;
  unitOfMeasurement: string;
}

interface EnhancedInvoiceItemsProps {
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

export default function EnhancedInvoiceItems({
  control,
  register,
  errors,
  isInterState,
  onTotalsChange,
}: EnhancedInvoiceItemsProps) {
  const { fields, append, remove, update } = useFieldArray({
    control,
    name: 'items',
  });

  const [showFrequentItems, setShowFrequentItems] = useState(false);
  const [loadingHsnSac, setLoadingHsnSac] = useState<Record<number, boolean>>({});
  const [hsnSacSuggestions, setHsnSacSuggestions] = useState<Record<number, any[]>>({});

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
          const gstAmount = (amount * item.gstRate) / 100;
          if (isInterState) {
            totalIgst += gstAmount;
          } else {
            totalCgst += gstAmount / 2;
            totalSgst += gstAmount / 2;
          }
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
      hsnSacCode: '',
      hsnSacType: 'HSN',
      itemCategory: '',
      itemSubCategory: '',
      unitOfMeasurement: 'NOS',
    });
  };

  const handleHsnSacSelect = (index: number, hsnSacData: any) => {
    const currentItem = watchedItems[index];
    const updatedItem = {
      ...currentItem,
      hsnSacCode: hsnSacData.code,
      hsnSacType: hsnSacData.type,
      gstRate: hsnSacData.gstRate || currentItem.gstRate,
      unitOfMeasurement: hsnSacData.unitOfMeasurement || currentItem.unitOfMeasurement,
      itemCategory: hsnSacData.category || currentItem.itemCategory,
      itemSubCategory: hsnSacData.subCategory || currentItem.itemSubCategory,
    };
    update(index, updatedItem);
  };

  const handleFrequentItemSelect = (itemData: any) => {
    append({
      description: itemData.itemName,
      quantity: 1,
      rate: itemData.defaultRate || 0,
      gstRate: itemData.defaultGstRate || 18,
      hsnSacCode: itemData.hsnSacCode || '',
      hsnSacType: itemData.hsnSacType || 'HSN',
      itemCategory: itemData.category || '',
      itemSubCategory: '',
      unitOfMeasurement: itemData.unitOfMeasurement || 'NOS',
    });
  };

  const searchHsnSacCodes = async (query: string, index: number) => {
    if (query.length < 2) {
      setHsnSacSuggestions(prev => ({ ...prev, [index]: [] }));
      return;
    }

    setLoadingHsnSac(prev => ({ ...prev, [index]: true }));
    
    try {
      const response = await fetch(`/api/hsn-sac?query=${encodeURIComponent(query)}&limit=5`);
      if (response.ok) {
        const data = await response.json();
        setHsnSacSuggestions(prev => ({ ...prev, [index]: data.data || [] }));
      }
    } catch (error) {
      console.error('Error searching HSN/SAC codes:', error);
    } finally {
      setLoadingHsnSac(prev => ({ ...prev, [index]: false }));
    }
  };

  const calculateItemTotal = (item: InvoiceItem) => {
    if (!item.quantity || !item.rate) return 0;
    const amount = item.quantity * item.rate;
    const gstAmount = (amount * (item.gstRate || 0)) / 100;
    return amount + gstAmount;
  };

  const calculateItemGST = (item: InvoiceItem) => {
    if (!item.quantity || !item.rate || !item.gstRate) return null;
    const amount = item.quantity * item.rate;
    const gstAmount = (amount * item.gstRate) / 100;
    
    if (isInterState) {
      return { cgst: 0, sgst: 0, igst: gstAmount };
    } else {
      return { cgst: gstAmount / 2, sgst: gstAmount / 2, igst: 0 };
    }
  };

  return (
    <div className="space-y-4">
      {/* Header with Quick Actions */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Invoice Items</h3>
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={() => setShowFrequentItems(true)}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Clock className="h-4 w-4 mr-1" />
            Quick Add
          </button>
        </div>
      </div>

      {/* Table Header - Desktop */}
      <div className="hidden lg:grid lg:grid-cols-12 gap-2 px-2 text-xs font-medium text-gray-700 uppercase tracking-wider">
        <div className="col-span-3">Description & HSN/SAC</div>
        <div className="col-span-1 text-right">Qty</div>
        <div className="col-span-1 text-right">Rate</div>
        <div className="col-span-1 text-center">UOM</div>
        <div className="col-span-1 text-right">GST %</div>
        <div className="col-span-2 text-right">Amount</div>
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
                <div className="lg:hidden space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Item Description
                    </label>
                    <input
                      {...register(`items.${index}.description`)}
                      type="text"
                      placeholder="Enter item description"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      onChange={(e) => {
                        register(`items.${index}.description`).onChange(e);
                        searchHsnSacCodes(e.target.value, index);
                      }}
                    />
                    {errors.items?.[index]?.description && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.items[index].description.message}
                      </p>
                    )}
                  </div>

                  {/* HSN/SAC Code Selection */}
                  <HsnSacSelector
                    selectedCode={item.hsnSacCode}
                    selectedType={item.hsnSacType}
                    onSelect={(hsnSacData) => handleHsnSacSelect(index, hsnSacData)}
                    suggestions={hsnSacSuggestions[index] || []}
                    isLoading={loadingHsnSac[index] || false}
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Quantity
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
                        Unit
                      </label>
                      <select
                        {...register(`items.${index}.unitOfMeasurement`)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      >
                        <option value="NOS">Numbers</option>
                        <option value="KGS">Kilograms</option>
                        <option value="MTR">Meters</option>
                        <option value="LTR">Liters</option>
                        <option value="SQM">Square Meters</option>
                        <option value="HRS">Hours</option>
                        <option value="DAYS">Days</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
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
                      {itemGST && item.gstRate > 0 && (
                        <div className="text-xs text-gray-500 mt-1">
                          {isInterState ? (
                            <span>IGST: {formatCurrency(itemGST.igst)}</span>
                          ) : (
                            <span>CGST: {formatCurrency(itemGST.cgst)} + SGST: {formatCurrency(itemGST.sgst)}</span>
                          )}
                        </div>
                      )}
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
                <div className="hidden lg:grid lg:grid-cols-12 gap-2 items-start">
                  <div className="col-span-3 space-y-2">
                    <input
                      {...register(`items.${index}.description`)}
                      type="text"
                      placeholder="Item description"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      onChange={(e) => {
                        register(`items.${index}.description`).onChange(e);
                        searchHsnSacCodes(e.target.value, index);
                      }}
                    />
                    <HsnSacSelector
                      selectedCode={item.hsnSacCode}
                      selectedType={item.hsnSacType}
                      onSelect={(hsnSacData) => handleHsnSacSelect(index, hsnSacData)}
                      suggestions={hsnSacSuggestions[index] || []}
                      isLoading={loadingHsnSac[index] || false}
                      compact={true}
                    />
                    {errors.items?.[index]?.description && (
                      <p className="text-xs text-red-600">
                        {errors.items[index].description.message}
                      </p>
                    )}
                  </div>

                  <div className="col-span-1">
                    <input
                      {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                      type="number"
                      step="0.01"
                      placeholder="1"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-right"
                    />
                  </div>

                  <div className="col-span-1">
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
                  </div>

                  <div className="col-span-1">
                    <select
                      {...register(`items.${index}.unitOfMeasurement`)}
                      className="block w-full px-2 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-xs"
                    >
                      <option value="NOS">NOS</option>
                      <option value="KGS">KGS</option>
                      <option value="MTR">MTR</option>
                      <option value="LTR">LTR</option>
                      <option value="SQM">SQM</option>
                      <option value="HRS">HRS</option>
                    </select>
                  </div>

                  <div className="col-span-1">
                    <select
                      {...register(`items.${index}.gstRate`, { valueAsNumber: true })}
                      className="block w-full px-2 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
                        {formatCurrency(item.quantity * item.rate || 0)}
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

                  <div className="col-span-2 text-right">
                    <div className="py-2 pr-3">
                      <span className="text-sm font-bold text-gray-900">
                        {formatCurrency(itemTotal)}
                      </span>
                      {item.hsnSacCode && (
                        <div className="text-xs text-gray-500 mt-1 flex items-center justify-end">
                          <Tag className="h-3 w-3 mr-1" />
                          {item.hsnSacCode}
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

      {/* Frequently Used Items Modal */}
      {showFrequentItems && (
        <FrequentlyUsedItemsModal
          isOpen={showFrequentItems}
          onClose={() => setShowFrequentItems(false)}
          onSelectItem={handleFrequentItemSelect}
        />
      )}

      {/* HSN/SAC Information Panel */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <Calculator className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-2">HSN/SAC Code Guidelines:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-blue-700">
              <div>
                <p className="font-medium">HSN (Goods):</p>
                <ul className="text-xs space-y-1 mt-1">
                  <li>• 4-8 digit classification codes</li>
                  <li>• Required for goods transactions</li>
                  <li>• Auto-suggests GST rates</li>
                </ul>
              </div>
              <div>
                <p className="font-medium">SAC (Services):</p>
                <ul className="text-xs space-y-1 mt-1">
                  <li>• 6 digit classification codes</li>
                  <li>• Required for service transactions</li>
                  <li>• Ensures proper tax classification</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}