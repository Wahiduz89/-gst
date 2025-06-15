// src/components/invoice/EnhancedInvoiceItems.tsx
// Complete implementation of enhanced invoice items with HSN/SAC integration

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
  Loader2,
  Info,
  Lightbulb,
  TrendingUp
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { HsnSacSelector } from './HsnSacSelector';
import { FrequentlyUsedItemsModal } from './FrequentlyUsedItemsModal';
import toast from 'react-hot-toast';

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

interface SmartSuggestion {
  type: 'gst_rate' | 'unit' | 'hsn_sac' | 'category';
  message: string;
  action?: () => void;
  confidence: number;
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
  const [smartSuggestions, setSmartSuggestions] = useState<Record<number, SmartSuggestion[]>>({});
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

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

  // Generate smart suggestions for each item
  useEffect(() => {
    watchedItems?.forEach((item: InvoiceItem, index: number) => {
      generateSmartSuggestions(item, index);
    });
  }, [watchedItems]);

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

  const handleHsnSacSelect = async (index: number, hsnSacData: any) => {
    const currentItem = watchedItems[index];
    
    // Show loading state
    setLoadingHsnSac(prev => ({ ...prev, [index]: true }));
    
    try {
      // Apply HSN/SAC data to item
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
      
      // Add to frequently used items if rate is provided
      if (currentItem.rate > 0) {
        await saveToFrequentlyUsed(updatedItem);
      }
      
      toast.success(`Applied ${hsnSacData.type} code: ${hsnSacData.code}`);
    } catch (error) {
      toast.error('Failed to apply HSN/SAC code');
    } finally {
      setLoadingHsnSac(prev => ({ ...prev, [index]: false }));
    }
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
    
    toast.success(`Added ${itemData.itemName} from frequently used items`);
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

  const saveToFrequentlyUsed = async (item: InvoiceItem) => {
    try {
      await fetch('/api/frequently-used-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemName: item.description,
          hsnSacCode: item.hsnSacCode,
          hsnSacType: item.hsnSacType,
          defaultRate: item.rate,
          defaultGstRate: item.gstRate,
          unitOfMeasurement: item.unitOfMeasurement,
          category: item.itemCategory,
        }),
      });
    } catch (error) {
      console.error('Error saving to frequently used items:', error);
    }
  };

  const generateSmartSuggestions = (item: InvoiceItem, index: number) => {
    const suggestions: SmartSuggestion[] = [];

    // Suggest HSN/SAC code if missing
    if (item.description && !item.hsnSacCode) {
      suggestions.push({
        type: 'hsn_sac',
        message: 'Add HSN/SAC code for better tax compliance',
        confidence: 0.8,
        action: () => setExpandedItems(prev => new Set(prev).add(index))
      });
    }

    // Suggest GST rate optimization
    if (item.hsnSacCode && item.gstRate === 18) {
      suggestions.push({
        type: 'gst_rate',
        message: 'Consider checking if a different GST rate applies',
        confidence: 0.6,
      });
    }

    // Suggest better unit of measurement
    if (item.description.toLowerCase().includes('kg') && item.unitOfMeasurement === 'NOS') {
      suggestions.push({
        type: 'unit',
        message: 'Consider using KGS as unit of measurement',
        confidence: 0.9,
        action: () => {
          const updatedItem = { ...item, unitOfMeasurement: 'KGS' };
          update(index, updatedItem);
        }
      });
    }

    setSmartSuggestions(prev => ({ ...prev, [index]: suggestions }));
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

  const toggleItemExpansion = (index: number) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  return (
    <div className="space-y-4">
      {/* Header with Smart Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Invoice Items</h3>
          <p className="text-sm text-gray-500">Add items with HSN/SAC codes for GST compliance</p>
        </div>
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

      {/* Enhanced Table Header - Desktop */}
      <div className="hidden lg:grid lg:grid-cols-12 gap-2 px-4 py-2 bg-gray-50 rounded-lg text-xs font-medium text-gray-700 uppercase tracking-wider">
        <div className="col-span-3">Item Description & Code</div>
        <div className="col-span-1 text-center">Qty</div>
        <div className="col-span-1 text-right">Rate</div>
        <div className="col-span-1 text-center">Unit</div>
        <div className="col-span-1 text-center">GST %</div>
        <div className="col-span-2 text-right">Taxable Amount</div>
        <div className="col-span-2 text-right">Total Amount</div>
        <div className="col-span-1 text-center">Actions</div>
      </div>

      {/* Enhanced Invoice Items */}
      <div className="space-y-4">
        {fields.map((field, index) => {
          const item = watchedItems?.[index] || {};
          const itemGST = calculateItemGST(item);
          const itemTotal = calculateItemTotal(item);
          const suggestions = smartSuggestions[index] || [];
          const isExpanded = expandedItems.has(index);

          return (
            <div key={field.id} className="relative">
              <div className="bg-white border-2 border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-colors">
                {/* Mobile Layout */}
                <div className="lg:hidden space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-500">Item #{index + 1}</span>
                    <div className="flex items-center space-x-2">
                      {item.hsnSacCode && (
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-indigo-100 text-indigo-700">
                          <Tag className="h-3 w-3 mr-1" />
                          {item.hsnSacCode}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => toggleItemExpansion(index)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <Info className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

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

                  {/* Smart Suggestions */}
                  {suggestions.length > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex items-center mb-2">
                        <Lightbulb className="h-4 w-4 text-blue-500 mr-2" />
                        <span className="text-sm font-medium text-blue-700">Smart Suggestions</span>
                      </div>
                      <div className="space-y-2">
                        {suggestions.map((suggestion, idx) => (
                          <div key={idx} className="flex items-center justify-between">
                            <span className="text-xs text-blue-600">{suggestion.message}</span>
                            {suggestion.action && (
                              <button
                                type="button"
                                onClick={suggestion.action}
                                className="text-xs text-blue-700 hover:text-blue-800 font-medium"
                              >
                                Apply
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* HSN/SAC Code Selection */}
                  {isExpanded && (
                    <div className="border-t border-gray-200 pt-4">
                      <HsnSacSelector
                        selectedCode={item.hsnSacCode}
                        selectedType={item.hsnSacType}
                        onSelect={(hsnSacData) => handleHsnSacSelect(index, hsnSacData)}
                        suggestions={hsnSacSuggestions[index] || []}
                        isLoading={loadingHsnSac[index] || false}
                      />
                    </div>
                  )}

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
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <IndianRupee className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                          {...register(`items.${index}.rate`, { valueAsNumber: true })}
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          className="block w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                      </div>
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

                  <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                    <div className="text-sm">
                      <div className="flex items-center">
                        <span className="text-gray-500 mr-2">Total:</span>
                        <span className="text-lg font-semibold text-gray-900">
                          {formatCurrency(itemTotal)}
                        </span>
                      </div>
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
                      className="text-red-600 hover:text-red-800 p-2"
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
                    
                    {/* Compact HSN/SAC Selector */}
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
                    
                    {/* Smart Suggestions */}
                    {suggestions.length > 0 && (
                      <div className="text-xs text-blue-600">
                        {suggestions[0].message}
                        {suggestions[0].action && (
                          <button
                            type="button"
                            onClick={suggestions[0].action}
                            className="ml-1 underline hover:no-underline"
                          >
                            Apply
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="col-span-1">
                    <input
                      {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                      type="number"
                      step="0.01"
                      placeholder="1"
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-center"
                    />
                  </div>

                  <div className="col-span-1">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                        <IndianRupee className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        {...register(`items.${index}.rate`, { valueAsNumber: true })}
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        className="block w-full pl-6 pr-2 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-right"
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
                      className="block w-full px-2 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-center"
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
                      <span className="text-sm font-bold text-indigo-600">
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

                  <div className="col-span-1 text-center">
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
        className="w-full py-4 border-2 border-dashed border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:border-indigo-400 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
      >
        <Plus className="inline-block w-5 h-5 mr-2" />
        Add Another Item
      </button>

      {/* Frequently Used Items Modal */}
      {showFrequentItems && (
        <FrequentlyUsedItemsModal
          isOpen={showFrequentItems}
          onClose={() => setShowFrequentItems(false)}
          onSelectItem={handleFrequentItemSelect}
        />
      )}

      {/* Enhanced Information Panel */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <Calculator className="h-5 w-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <h4 className="font-medium mb-2">Enhanced GST Compliance Features</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-blue-700">
              <div>
                <p className="font-medium">Smart Suggestions:</p>
                <ul className="text-xs space-y-1 mt-1">
                  <li>• Auto-complete HSN/SAC codes</li>
                  <li>• Intelligent GST rate detection</li>
                  <li>• Unit of measurement optimization</li>
                </ul>
              </div>
              <div>
                <p className="font-medium">Compliance Benefits:</p>
                <ul className="text-xs space-y-1 mt-1">
                  <li>• Accurate tax calculations</li>
                  <li>• GST return ready data</li>
                  <li>• Audit trail maintenance</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}