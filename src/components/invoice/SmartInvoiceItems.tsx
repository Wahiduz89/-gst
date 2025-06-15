// src/components/invoice/SmartInvoiceItems.tsx
// Intelligent invoice items component with seamless HSN/SAC integration

'use client';

import { useEffect, useState, useCallback } from 'react';
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
  Lightbulb,
  TrendingUp,
  AlertCircle,
  Check,
  Loader2,
  ChevronDown,
  ChevronUp,
  Zap,
  BookOpen
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { debounce } from 'lodash';
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

interface SmartInvoiceItemsProps {
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

interface HsnSacSuggestion {
  code: string;
  type: 'HSN' | 'SAC';
  description: string;
  category: string;
  gstRate?: number;
  unitOfMeasurement: string;
  confidence: number;
}

interface SmartSuggestion {
  type: 'gst_rate' | 'hsn_sac' | 'unit' | 'frequently_used';
  message: string;
  action?: () => void;
  data?: any;
  confidence: number;
}

export default function SmartInvoiceItems({
  control,
  register,
  errors,
  isInterState,
  onTotalsChange,
}: SmartInvoiceItemsProps) {
  const { fields, append, remove, update } = useFieldArray({
    control,
    name: 'items',
  });

  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
  const [hsnSacSuggestions, setHsnSacSuggestions] = useState<Record<number, HsnSacSuggestion[]>>({});
  const [smartSuggestions, setSmartSuggestions] = useState<Record<number, SmartSuggestion[]>>({});
  const [loadingStates, setLoadingStates] = useState<Record<number, boolean>>({});
  const [frequentlyUsedItems, setFrequentlyUsedItems] = useState<any[]>([]);
  const [showFrequentItems, setShowFrequentItems] = useState<Record<number, boolean>>({});

  const watchedItems = useWatch({
    control,
    name: 'items',
  });

  // Calculate totals whenever items change
  useEffect(() => {
    calculateTotals();
  }, [watchedItems, isInterState]);

  // Generate smart suggestions for each item
  useEffect(() => {
    watchedItems?.forEach((item: InvoiceItem, index: number) => {
      if (item.description) {
        generateSmartSuggestions(item, index);
      }
    });
  }, [watchedItems]);

  const calculateTotals = () => {
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
  };

  const searchHsnSacCodes = useCallback(
    debounce(async (query: string, index: number) => {
      if (query.length < 2) {
        setHsnSacSuggestions(prev => ({ ...prev, [index]: [] }));
        return;
      }

      setLoadingStates(prev => ({ ...prev, [index]: true }));
      
      try {
        const response = await fetch(`/api/hsn-sac?query=${encodeURIComponent(query)}&limit=5`);
        if (response.ok) {
          const data = await response.json();
          const suggestions = data.data?.map((item: any) => ({
            ...item,
            confidence: calculateConfidence(item, query)
          })) || [];
          
          setHsnSacSuggestions(prev => ({ ...prev, [index]: suggestions }));
        }
      } catch (error) {
        console.error('Error searching HSN/SAC codes:', error);
      } finally {
        setLoadingStates(prev => ({ ...prev, [index]: false }));
      }
    }, 300),
    []
  );

  const calculateConfidence = (hsnSacItem: any, query: string): number => {
    const queryLower = query.toLowerCase();
    const description = hsnSacItem.description.toLowerCase();
    const category = hsnSacItem.category.toLowerCase();
    
    let confidence = 0.5; // Base confidence
    
    if (description.includes(queryLower)) confidence += 0.3;
    if (category.includes(queryLower)) confidence += 0.2;
    if (hsnSacItem.code.includes(query)) confidence += 0.4;
    
    return Math.min(confidence, 1);
  };

  const generateSmartSuggestions = async (item: InvoiceItem, index: number) => {
    const suggestions: SmartSuggestion[] = [];

    // Suggest HSN/SAC code if missing
    if (!item.hsnSacCode && item.description.length > 3) {
      suggestions.push({
        type: 'hsn_sac',
        message: 'Add HSN/SAC code for tax compliance',
        confidence: 0.8,
        action: () => toggleItemExpansion(index)
      });
    }

    // Suggest GST rate optimization
    if (item.hsnSacCode && item.gstRate === 18) {
      const hsnSacData = hsnSacSuggestions[index]?.find(s => s.code === item.hsnSacCode);
      if (hsnSacData?.gstRate && hsnSacData.gstRate !== 18) {
        suggestions.push({
          type: 'gst_rate',
          message: `Consider ${hsnSacData.gstRate}% GST rate for this item`,
          confidence: 0.9,
          data: { suggestedRate: hsnSacData.gstRate },
          action: () => applyGstRate(index, hsnSacData.gstRate)
        });
      }
    }

    // Suggest better unit of measurement
    const unitSuggestions = detectBetterUnit(item.description, item.unitOfMeasurement);
    if (unitSuggestions) {
      suggestions.push({
        type: 'unit',
        message: `Consider using ${unitSuggestions} as unit`,
        confidence: 0.7,
        data: { suggestedUnit: unitSuggestions },
        action: () => applyUnit(index, unitSuggestions)
      });
    }

    setSmartSuggestions(prev => ({ ...prev, [index]: suggestions }));
  };

  const detectBetterUnit = (description: string, currentUnit: string): string | null => {
    const desc = description.toLowerCase();
    
    if ((desc.includes('kg') || desc.includes('kilogram')) && currentUnit === 'NOS') return 'KGS';
    if ((desc.includes('liter') || desc.includes('litre')) && currentUnit === 'NOS') return 'LTR';
    if ((desc.includes('meter') || desc.includes('metre')) && currentUnit === 'NOS') return 'MTR';
    if (desc.includes('hour') && currentUnit === 'NOS') return 'HRS';
    if (desc.includes('day') && currentUnit === 'NOS') return 'DAYS';
    
    return null;
  };

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

  const handleRemoveItem = (index: number) => {
    remove(index);
    // Clean up related states
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      newSet.delete(index);
      return newSet;
    });
    setHsnSacSuggestions(prev => {
      const newSuggestions = { ...prev };
      delete newSuggestions[index];
      return newSuggestions;
    });
    setSmartSuggestions(prev => {
      const newSuggestions = { ...prev };
      delete newSuggestions[index];
      return newSuggestions;
    });
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

  const handleHsnSacSelect = (index: number, hsnSacData: HsnSacSuggestion) => {
    const currentItem = watchedItems[index];
    const updatedItem = {
      ...currentItem,
      hsnSacCode: hsnSacData.code,
      hsnSacType: hsnSacData.type,
      gstRate: hsnSacData.gstRate || currentItem.gstRate,
      unitOfMeasurement: hsnSacData.unitOfMeasurement || currentItem.unitOfMeasurement,
      itemCategory: hsnSacData.category || currentItem.itemCategory,
    };
    
    update(index, updatedItem);
    toast.success(`Applied ${hsnSacData.type} code: ${hsnSacData.code}`);
  };

  const applyGstRate = (index: number, gstRate: number) => {
    const currentItem = watchedItems[index];
    update(index, { ...currentItem, gstRate });
    toast.success(`Updated GST rate to ${gstRate}%`);
  };

  const applyUnit = (index: number, unit: string) => {
    const currentItem = watchedItems[index];
    update(index, { ...currentItem, unitOfMeasurement: unit });
    toast.success(`Updated unit to ${unit}`);
  };

  const loadFrequentlyUsedItems = async () => {
    try {
      const response = await fetch('/api/frequently-used-items?limit=10');
      if (response.ok) {
        const data = await response.json();
        setFrequentlyUsedItems(data.data || []);
      }
    } catch (error) {
      console.error('Error loading frequently used items:', error);
    }
  };

  const handleFrequentItemSelect = (itemData: any, index: number) => {
    const updatedItem = {
      description: itemData.itemName,
      quantity: 1,
      rate: itemData.defaultRate || 0,
      gstRate: itemData.defaultGstRate || 18,
      hsnSacCode: itemData.hsnSacCode || '',
      hsnSacType: itemData.hsnSacType || 'HSN',
      itemCategory: itemData.category || '',
      itemSubCategory: '',
      unitOfMeasurement: itemData.unitOfMeasurement || 'NOS',
    };
    
    update(index, updatedItem);
    setShowFrequentItems(prev => ({ ...prev, [index]: false }));
    toast.success(`Applied ${itemData.itemName} from frequently used items`);
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
    <div className="space-y-6">
      {/* Header with Quick Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <Package className="h-5 w-5 mr-2 text-indigo-600" />
            Invoice Items
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Add items with intelligent HSN/SAC code suggestions for GST compliance
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={loadFrequentlyUsedItems}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Clock className="h-4 w-4 mr-1" />
            Quick Add
          </button>
          <div className="text-xs text-gray-500">
            {fields.length} item{fields.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Enhanced Table Header - Desktop */}
      <div className="hidden lg:grid lg:grid-cols-12 gap-4 px-4 py-3 bg-gray-50 rounded-lg border">
        <div className="col-span-4 text-xs font-medium text-gray-700 uppercase tracking-wider">
          Item Description & HSN/SAC Code
        </div>
        <div className="col-span-1 text-xs font-medium text-gray-700 uppercase tracking-wider text-center">
          Qty
        </div>
        <div className="col-span-1 text-xs font-medium text-gray-700 uppercase tracking-wider text-right">
          Rate
        </div>
        <div className="col-span-1 text-xs font-medium text-gray-700 uppercase tracking-wider text-center">
          Unit
        </div>
        <div className="col-span-1 text-xs font-medium text-gray-700 uppercase tracking-wider text-center">
          GST %
        </div>
        <div className="col-span-2 text-xs font-medium text-gray-700 uppercase tracking-wider text-right">
          Amount
        </div>
        <div className="col-span-2 text-xs font-medium text-gray-700 uppercase tracking-wider text-right">
          Total
        </div>
        <div className="col-span-1 text-xs font-medium text-gray-700 uppercase tracking-wider text-center">
          Actions
        </div>
      </div>

      {/* Enhanced Invoice Items */}
      <div className="space-y-4">
        {fields.map((field, index) => {
          const item = watchedItems?.[index] || {};
          const itemGST = calculateItemGST(item);
          const itemTotal = calculateItemTotal(item);
          const suggestions = smartSuggestions[index] || [];
          const isExpanded = expandedItems.has(index);
          const isLoading = loadingStates[index] || false;

          return (
            <div key={field.id} className="bg-white border-2 border-gray-200 rounded-lg hover:border-indigo-300 transition-all duration-200">
              {/* Mobile Layout */}
              <div className="lg:hidden p-4 space-y-4">
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
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Item Description with Smart Search */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Item Description
                  </label>
                  <div className="relative">
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
                    {frequentlyUsedItems.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setShowFrequentItems(prev => ({ ...prev, [index]: !prev[index] }))}
                        className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
                      >
                        <BookOpen className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  {errors.items?.[index]?.description && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.items[index].description.message}
                    </p>
                  )}

                  {/* Frequently Used Items Dropdown */}
                  {showFrequentItems[index] && frequentlyUsedItems.length > 0 && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                      {frequentlyUsedItems.map((freq, freqIndex) => (
                        <button
                          key={freqIndex}
                          type="button"
                          onClick={() => handleFrequentItemSelect(freq, index)}
                          className="w-full text-left px-3 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                        >
                          <div className="text-sm font-medium text-gray-900">{freq.itemName}</div>
                          <div className="text-xs text-gray-500">
                            {freq.hsnSacCode && `${freq.hsnSacCode} • `}
                            {freq.defaultGstRate}% GST • {freq.unitOfMeasurement}
                          </div>
                        </button>
                      ))}
                    </div>
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
                      {suggestions.slice(0, 2).map((suggestion, idx) => (
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

                {/* HSN/SAC Code Section - Expanded */}
                {isExpanded && (
                  <div className="border-t border-gray-200 pt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      HSN/SAC Code (Optional)
                    </label>
                    <div className="space-y-2">
                      <input
                        {...register(`items.${index}.hsnSacCode`)}
                        type="text"
                        placeholder="Search or enter HSN/SAC code"
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        onChange={(e) => {
                          register(`items.${index}.hsnSacCode`).onChange(e);
                          searchHsnSacCodes(e.target.value, index);
                        }}
                      />
                      
                      {isLoading && (
                        <div className="flex items-center text-xs text-gray-500">
                          <Loader2 className="h-3 w-3 animate-spin mr-1" />
                          Searching HSN/SAC codes...
                        </div>
                      )}

                      {hsnSacSuggestions[index] && hsnSacSuggestions[index].length > 0 && (
                        <div className="border border-gray-200 rounded-md max-h-32 overflow-y-auto">
                          {hsnSacSuggestions[index].map((suggestion, suggestionIndex) => (
                            <button
                              key={suggestionIndex}
                              type="button"
                              onClick={() => handleHsnSacSelect(index, suggestion)}
                              className="w-full text-left px-3 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="text-sm font-medium text-gray-900 flex items-center">
                                    {suggestion.type === 'HSN' ? (
                                      <Package className="h-3 w-3 text-blue-500 mr-1" />
                                    ) : (
                                      <Calculator className="h-3 w-3 text-green-500 mr-1" />
                                    )}
                                    {suggestion.code}
                                  </div>
                                  <div className="text-xs text-gray-600">{suggestion.description}</div>
                                </div>
                                <div className="flex items-center space-x-1">
                                  {suggestion.gstRate && (
                                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                                      {suggestion.gstRate}%
                                    </span>
                                  )}
                                  <TrendingUp className={`h-3 w-3 ${
                                    suggestion.confidence > 0.8 ? 'text-green-500' :
                                    suggestion.confidence > 0.6 ? 'text-yellow-500' : 'text-gray-400'
                                  }`} />
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Quantity, Rate, Unit, GST Grid */}
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

                {/* Item Total and Actions */}
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
                    onClick={() => handleRemoveItem(index)}
                    className="text-red-600 hover:text-red-800 p-2 rounded-md hover:bg-red-50"
                    disabled={fields.length === 1}
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Desktop Layout - Similar structure but in grid format */}
              <div className="hidden lg:grid lg:grid-cols-12 gap-4 items-start p-4">
                {/* Description and HSN/SAC Code Column */}
                <div className="col-span-4 space-y-2">
                  <div className="relative">
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
                    {frequentlyUsedItems.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setShowFrequentItems(prev => ({ ...prev, [index]: !prev[index] }))}
                        className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
                      >
                        <BookOpen className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  
                  {/* HSN/SAC Code Input */}
                  <input
                    {...register(`items.${index}.hsnSacCode`)}
                    type="text"
                    placeholder="HSN/SAC code"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-xs"
                    onChange={(e) => {
                      register(`items.${index}.hsnSacCode`).onChange(e);
                      searchHsnSacCodes(e.target.value, index);
                    }}
                  />
                  
                  {errors.items?.[index]?.description && (
                    <p className="text-xs text-red-600">
                      {errors.items[index].description.message}
                    </p>
                  )}
                  
                  {/* Smart Suggestions - Compact */}
                  {suggestions.length > 0 && (
                    <div className="text-xs text-blue-600">
                      <Zap className="inline h-3 w-3 mr-1" />
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

                {/* Quantity */}
                <div className="col-span-1">
                  <input
                    {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    placeholder="1"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-center"
                  />
                </div>

                {/* Rate */}
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

                {/* Unit */}
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

                {/* GST Rate */}
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

                {/* Taxable Amount */}
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

                {/* Total Amount */}
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

                {/* Actions */}
                <div className="col-span-1 text-center">
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(index)}
                    className="p-2 text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-md hover:bg-red-50"
                    disabled={fields.length === 1}
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
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
        className="w-full py-4 border-2 border-dashed border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:border-indigo-400 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 group"
      >
        <Plus className="inline-block w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
        Add Another Item
      </button>

      {/* Enhanced Information Panel */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <Calculator className="h-5 w-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <h4 className="font-medium mb-2">Smart GST Compliance Features</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-blue-700">
              <div>
                <p className="font-medium flex items-center">
                  <Zap className="h-3 w-3 mr-1" />
                  Smart Suggestions:
                </p>
                <ul className="text-xs space-y-1 mt-1">
                  <li>• Auto-complete HSN/SAC codes</li>
                  <li>• Intelligent GST rate detection</li>
                  <li>• Unit optimization suggestions</li>
                </ul>
              </div>
              <div>
                <p className="font-medium flex items-center">
                  <Check className="h-3 w-3 mr-1" />
                  Compliance Benefits:
                </p>
                <ul className="text-xs space-y-1 mt-1">
                  <li>• Accurate tax calculations</li>
                  <li>• GST return ready data</li>
                  <li>• Audit trail maintenance</li>
                </ul>
              </div>
              <div>
                <p className="font-medium flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Efficiency Gains:
                </p>
                <ul className="text-xs space-y-1 mt-1">
                  <li>• Frequently used items</li>
                  <li>• Quick code lookup</li>
                  <li>• Error prevention</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}