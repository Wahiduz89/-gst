// src/components/invoice/HsnSacSelector.tsx
// Intelligent HSN/SAC code selector with auto-suggestions and validation

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Search, 
  Tag, 
  Package, 
  Wrench, 
  ChevronDown, 
  Check, 
  AlertCircle, 
  Loader2,
  Info,
  X
} from 'lucide-react';
import { debounce } from 'lodash';

export interface HsnSacData {
  code: string;
  type: 'HSN' | 'SAC';
  description: string;
  category: string;
  subCategory?: string;
  gstRate?: number;
  unitOfMeasurement: string;
  isActive?: boolean;
  source?: 'database' | 'static';
}

interface HsnSacSelectorProps {
  selectedCode?: string;
  selectedType?: 'HSN' | 'SAC';
  onSelect: (hsnSacData: HsnSacData) => void;
  suggestions?: HsnSacData[];
  isLoading?: boolean;
  compact?: boolean;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export function HsnSacSelector({
  selectedCode = '',
  selectedType = 'HSN',
  onSelect,
  suggestions = [],
  isLoading = false,
  compact = false,
  disabled = false,
  placeholder = 'Search HSN/SAC code...',
  className = '',
}: HsnSacSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [localSuggestions, setLocalSuggestions] = useState<HsnSacData[]>(suggestions);
  const [selectedData, setSelectedData] = useState<HsnSacData | null>(null);
  const [validationMessage, setValidationMessage] = useState<string>('');
  const [searchLoading, setSearchLoading] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize selected data if code is provided
  useEffect(() => {
    if (selectedCode && !selectedData) {
      const existingData = suggestions.find(s => s.code === selectedCode);
      if (existingData) {
        setSelectedData(existingData);
      } else {
        // Fetch details for the selected code
        fetchCodeDetails(selectedCode);
      }
    }
  }, [selectedCode, suggestions, selectedData]);

  const fetchCodeDetails = async (code: string) => {
    try {
      const response = await fetch(`/api/hsn-sac?query=${encodeURIComponent(code)}&limit=1`);
      if (response.ok) {
        const data = await response.json();
        if (data.data && data.data.length > 0) {
          setSelectedData(data.data[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching HSN/SAC details:', error);
    }
  };

  const searchHsnSacCodes = useCallback(
    debounce(async (query: string) => {
      if (query.length < 2) {
        setLocalSuggestions([]);
        setSearchLoading(false);
        return;
      }

      setSearchLoading(true);
      try {
        const response = await fetch(
          `/api/hsn-sac?query=${encodeURIComponent(query)}&limit=10`
        );
        if (response.ok) {
          const data = await response.json();
          setLocalSuggestions(data.data || []);
        }
      } catch (error) {
        console.error('Error searching HSN/SAC codes:', error);
        setLocalSuggestions([]);
      } finally {
        setSearchLoading(false);
      }
    }, 300),
    []
  );

  const validateHsnSacCode = (code: string, type: 'HSN' | 'SAC'): string => {
    if (!code.trim()) return '';

    if (type === 'HSN') {
      if (!/^\d{4,8}$/.test(code)) {
        return 'HSN code must be 4-8 digits';
      }
    } else if (type === 'SAC') {
      if (!/^\d{6}$/.test(code)) {
        return 'SAC code must be exactly 6 digits';
      }
    }

    return '';
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setValidationMessage('');
    
    if (value) {
      searchHsnSacCodes(value);
      setShowDropdown(true);
    } else {
      setLocalSuggestions([]);
      setShowDropdown(false);
    }
  };

  const handleSelectCode = (hsnSacData: HsnSacData) => {
    setSelectedData(hsnSacData);
    setSearchQuery('');
    setShowDropdown(false);
    setValidationMessage('');
    onSelect(hsnSacData);
  };

  const handleManualCodeEntry = () => {
    if (!searchQuery.trim()) return;

    const type = searchQuery.length === 6 ? 'SAC' : 'HSN';
    const validation = validateHsnSacCode(searchQuery, type);
    
    if (validation) {
      setValidationMessage(validation);
      return;
    }

    // Create manual entry
    const manualData: HsnSacData = {
      code: searchQuery.trim(),
      type,
      description: `${type} Code: ${searchQuery.trim()}`,
      category: 'Manual Entry',
      unitOfMeasurement: 'NOS',
    };

    handleSelectCode(manualData);
  };

  const handleClearSelection = () => {
    setSelectedData(null);
    setSearchQuery('');
    setValidationMessage('');
    // Call onSelect with empty data to clear parent state
    onSelect({
      code: '',
      type: selectedType,
      description: '',
      category: '',
      unitOfMeasurement: 'NOS',
    });
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setShowDropdown(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update local suggestions when props change
  useEffect(() => {
    setLocalSuggestions(suggestions);
  }, [suggestions]);

  const combinedSuggestions = localSuggestions.length > 0 ? localSuggestions : suggestions;
  const showLoading = isLoading || searchLoading;

  if (compact) {
    return (
      <div className={`relative ${className}`} ref={dropdownRef}>
        <div className="flex items-center space-x-2">
          {selectedData ? (
            <div className="flex items-center bg-indigo-50 border border-indigo-200 rounded px-2 py-1 text-xs">
              <Tag className="h-3 w-3 text-indigo-600 mr-1" />
              <span className="text-indigo-700 font-medium">{selectedData.code}</span>
              <button
                onClick={handleClearSelection}
                className="ml-1 text-indigo-500 hover:text-indigo-700"
                disabled={disabled}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => !disabled && setShowDropdown(true)}
              className="flex items-center text-xs text-gray-500 hover:text-gray-700 disabled:opacity-50"
              disabled={disabled}
            >
              <Tag className="h-3 w-3 mr-1" />
              Add HSN/SAC
            </button>
          )}
        </div>

        {showDropdown && (
          <div className="absolute z-50 mt-1 w-80 bg-white border border-gray-200 rounded-lg shadow-lg">
            <div className="p-3">
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder={placeholder}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-indigo-500 focus:border-indigo-500"
                autoFocus
              />
              {validationMessage && (
                <p className="mt-1 text-xs text-red-600">{validationMessage}</p>
              )}
            </div>
            
            {showLoading && (
              <div className="p-3 text-center">
                <Loader2 className="h-4 w-4 animate-spin text-indigo-600 mx-auto" />
              </div>
            )}

            {combinedSuggestions.length > 0 && (
              <div className="border-t border-gray-100 max-h-48 overflow-y-auto">
                {combinedSuggestions.map((item, index) => (
                  <button
                    key={`${item.code}-${index}`}
                    onClick={() => handleSelectCode(item)}
                    className="w-full text-left px-3 py-2 hover:bg-gray-50 border-b border-gray-50 last:border-b-0"
                  >
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center">
                          {item.type === 'HSN' ? (
                            <Package className="h-3 w-3 text-blue-500 mr-2" />
                          ) : (
                            <Wrench className="h-3 w-3 text-green-500 mr-2" />
                          )}
                          <span className="text-xs font-medium">{item.code}</span>
                          <span className="ml-2 text-xs text-gray-500">({item.type})</span>
                        </div>
                        <p className="text-xs text-gray-600 truncate mt-1">{item.description}</p>
                      </div>
                      {item.gstRate !== undefined && (
                        <span className="text-xs text-indigo-600 font-medium">
                          {item.gstRate}%
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {searchQuery && combinedSuggestions.length === 0 && !showLoading && (
              <div className="p-3 border-t border-gray-100">
                <button
                  onClick={handleManualCodeEntry}
                  className="w-full text-left text-sm text-gray-600 hover:text-gray-800"
                >
                  Use "{searchQuery}" as {searchQuery.length === 6 ? 'SAC' : 'HSN'} code
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`} ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700">
        HSN/SAC Code (Optional)
      </label>
      
      {selectedData ? (
        <div className="relative">
          <div className="flex items-center justify-between p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
            <div className="flex items-center space-x-3">
              {selectedData.type === 'HSN' ? (
                <Package className="h-5 w-5 text-blue-600" />
              ) : (
                <Wrench className="h-5 w-5 text-green-600" />
              )}
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-indigo-900">{selectedData.code}</span>
                  <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded">
                    {selectedData.type}
                  </span>
                  {selectedData.gstRate !== undefined && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                      {selectedData.gstRate}% GST
                    </span>
                  )}
                </div>
                <p className="text-sm text-indigo-700 mt-1">{selectedData.description}</p>
                <p className="text-xs text-indigo-600">
                  Category: {selectedData.category} • Unit: {selectedData.unitOfMeasurement}
                </p>
              </div>
            </div>
            <button
              onClick={handleClearSelection}
              className="text-indigo-500 hover:text-indigo-700"
              disabled={disabled}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      ) : (
        <div className="relative">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => setShowDropdown(true)}
              placeholder={placeholder}
              className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              disabled={disabled}
            />
            <div className="absolute inset-y-0 right-0 flex items-center">
              {showLoading && (
                <Loader2 className="h-5 w-5 text-gray-400 animate-spin mr-2" />
              )}
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="pr-3 flex items-center"
                disabled={disabled}
              >
                <ChevronDown className="h-5 w-5 text-gray-400" />
              </button>
            </div>
          </div>

          {validationMessage && (
            <div className="mt-1 flex items-center">
              <AlertCircle className="h-4 w-4 text-red-500 mr-1" />
              <p className="text-sm text-red-600">{validationMessage}</p>
            </div>
          )}

          {showDropdown && (
            <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-hidden">
              {combinedSuggestions.length > 0 ? (
                <div className="divide-y divide-gray-100 max-h-60 overflow-y-auto">
                  {combinedSuggestions.map((item, index) => (
                    <button
                      key={`${item.code}-${index}`}
                      onClick={() => handleSelectCode(item)}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                    >
                      <div className="flex items-center justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center">
                            {item.type === 'HSN' ? (
                              <Package className="h-4 w-4 text-blue-500 mr-3" />
                            ) : (
                              <Wrench className="h-4 w-4 text-green-500 mr-3" />
                            )}
                            <span className="text-sm font-medium text-gray-900">{item.code}</span>
                            <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                              {item.type}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                          <div className="flex items-center mt-1 text-xs text-gray-500">
                            <span>{item.category}</span>
                            {item.subCategory && (
                              <>
                                <span className="mx-1">•</span>
                                <span>{item.subCategory}</span>
                              </>
                            )}
                            <span className="mx-1">•</span>
                            <span>{item.unitOfMeasurement}</span>
                          </div>
                        </div>
                        <div className="ml-4 flex items-center space-x-2">
                          {item.gstRate !== undefined && (
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded font-medium">
                              {item.gstRate}% GST
                            </span>
                          )}
                          <Check className="h-4 w-4 text-green-600 opacity-0 group-hover:opacity-100" />
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : searchQuery && !showLoading ? (
                <div className="p-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-500 mb-3">
                      No HSN/SAC codes found for "{searchQuery}"
                    </p>
                    <button
                      onClick={handleManualCodeEntry}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <Tag className="mr-2 h-4 w-4" />
                      Use "{searchQuery}" as {searchQuery.length === 6 ? 'SAC' : 'HSN'} code
                    </button>
                  </div>
                </div>
              ) : !searchQuery ? (
                <div className="p-4">
                  <div className="text-center text-sm text-gray-500">
                    <Info className="h-5 w-5 mx-auto mb-2" />
                    <p>Start typing to search HSN/SAC codes</p>
                    <p className="text-xs mt-1">HSN for goods, SAC for services</p>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>
      )}

      <div className="text-xs text-gray-500">
        <p>HSN (4-8 digits) for goods, SAC (6 digits) for services</p>
      </div>
    </div>
  );
}