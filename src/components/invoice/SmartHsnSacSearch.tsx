// src/components/invoice/SmartHsnSacSearch.tsx
// Intelligent HSN/SAC search with auto-complete and smart suggestions

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Search, 
  Tag, 
  Package, 
  Wrench, 
  Loader2,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  TrendingUp,
  Clock,
  Star
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
  source?: 'database' | 'static' | 'frequent';
  confidence?: number;
  usageCount?: number;
}

interface SmartHsnSacSearchProps {
  onSelect: (data: HsnSacData) => void;
  initialValue?: string;
  itemDescription?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  showSuggestions?: boolean;
  autoFocus?: boolean;
}

export default function SmartHsnSacSearch({
  onSelect,
  initialValue = '',
  itemDescription = '',
  placeholder = 'Search HSN/SAC codes...',
  className = '',
  disabled = false,
  showSuggestions = true,
  autoFocus = false
}: SmartHsnSacSearchProps) {
  const [searchQuery, setSearchQuery] = useState(initialValue);
  const [suggestions, setSuggestions] = useState<HsnSacData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [smartSuggestions, setSmartSuggestions] = useState<HsnSacData[]>([]);
  const [recentlyUsed, setRecentlyUsed] = useState<HsnSacData[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load smart suggestions based on item description
  useEffect(() => {
    if (itemDescription && showSuggestions) {
      generateSmartSuggestions(itemDescription);
    }
  }, [itemDescription, showSuggestions]);

  // Auto-focus if requested
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const searchHsnSacCodes = useCallback(
    debounce(async (query: string) => {
      if (query.length < 2) {
        setSuggestions([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/hsn-sac?query=${encodeURIComponent(query)}&limit=10`
        );
        
        if (response.ok) {
          const data = await response.json();
          setSuggestions(data.data || []);
        }
      } catch (error) {
        console.error('Error searching HSN/SAC codes:', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 300),
    []
  );

  const generateSmartSuggestions = useCallback(
    debounce(async (description: string) => {
      if (!description.trim()) return;

      try {
        // Use the description to get intelligent suggestions
        const keywords = description.toLowerCase();
        const response = await fetch(
          `/api/hsn-sac?query=${encodeURIComponent(keywords)}&limit=5`
        );
        
        if (response.ok) {
          const data = await response.json();
          setSmartSuggestions(data.data || []);
        }
      } catch (error) {
        console.error('Error generating smart suggestions:', error);
      }
    }, 500),
    []
  );

  const loadRecentlyUsed = useCallback(async () => {
    try {
      const response = await fetch('/api/frequently-used-items?limit=5');
      if (response.ok) {
        const data = await response.json();
        const recent = data.data
          .filter((item: any) => item.hsnSacCode)
          .map((item: any) => ({
            code: item.hsnSacCode,
            type: item.hsnSacType,
            description: item.itemName,
            category: item.category || 'Recent',
            gstRate: item.defaultGstRate,
            unitOfMeasurement: item.unitOfMeasurement,
            usageCount: item.usageCount,
            source: 'frequent',
          }));
        setRecentlyUsed(recent);
      }
    } catch (error) {
      console.error('Error loading recently used items:', error);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setSelectedIndex(-1);
    
    if (value.trim()) {
      searchHsnSacCodes(value);
      setShowDropdown(true);
    } else {
      setSuggestions([]);
      setShowDropdown(showSuggestions && (smartSuggestions.length > 0 || recentlyUsed.length > 0));
    }
  };

  const handleInputFocus = () => {
    if (!showDropdown) {
      loadRecentlyUsed();
      setShowDropdown(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const items = getAllSuggestionItems();
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < items.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && items[selectedIndex]) {
        handleSelectItem(items[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
      setSelectedIndex(-1);
    }
  };

  const handleSelectItem = (item: HsnSacData) => {
    setSearchQuery(`${item.code} - ${item.description}`);
    setShowDropdown(false);
    setSelectedIndex(-1);
    onSelect(item);
  };

  const getAllSuggestionItems = (): HsnSacData[] => {
    const items: HsnSacData[] = [];
    
    if (searchQuery.trim()) {
      items.push(...suggestions);
    } else {
      if (smartSuggestions.length > 0) {
        items.push(...smartSuggestions);
      }
      if (recentlyUsed.length > 0) {
        items.push(...recentlyUsed);
      }
    }
    
    return items;
  };

  const getConfidenceColor = (confidence?: number) => {
    if (!confidence) return 'text-gray-500';
    if (confidence > 0.8) return 'text-green-600';
    if (confidence > 0.6) return 'text-yellow-600';
    return 'text-orange-600';
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const allItems = getAllSuggestionItems();

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md shadow-sm 
            focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm
            ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
          `}
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          {isLoading && (
            <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
          )}
        </div>
      </div>

      {showDropdown && (
        <div 
          ref={dropdownRef}
          className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-hidden"
        >
          {allItems.length > 0 ? (
            <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
              {/* Smart Suggestions Section */}
              {!searchQuery.trim() && smartSuggestions.length > 0 && (
                <div>
                  <div className="px-4 py-2 bg-blue-50 border-b border-blue-100">
                    <div className="flex items-center text-sm font-medium text-blue-700">
                      <Lightbulb className="h-4 w-4 mr-2" />
                      Smart Suggestions for "{itemDescription?.slice(0, 30)}{itemDescription && itemDescription.length > 30 ? '...' : ''}"
                    </div>
                  </div>
                  {smartSuggestions.map((item, index) => (
                    <SuggestionItem
                      key={`smart-${item.code}`}
                      item={item}
                      isSelected={selectedIndex === index}
                      onClick={() => handleSelectItem(item)}
                      showConfidence
                    />
                  ))}
                </div>
              )}

              {/* Recently Used Section */}
              {!searchQuery.trim() && recentlyUsed.length > 0 && (
                <div>
                  <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                    <div className="flex items-center text-sm font-medium text-gray-700">
                      <Clock className="h-4 w-4 mr-2" />
                      Recently Used
                    </div>
                  </div>
                  {recentlyUsed.map((item, index) => (
                    <SuggestionItem
                      key={`recent-${item.code}`}
                      item={item}
                      isSelected={selectedIndex === (smartSuggestions.length + index)}
                      onClick={() => handleSelectItem(item)}
                      showUsage
                    />
                  ))}
                </div>
              )}

              {/* Search Results */}
              {searchQuery.trim() && suggestions.length > 0 && (
                <div>
                  {suggestions.map((item, index) => (
                    <SuggestionItem
                      key={`search-${item.code}`}
                      item={item}
                      isSelected={selectedIndex === index}
                      onClick={() => handleSelectItem(item)}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : searchQuery.trim() && !isLoading ? (
            <div className="p-4 text-center text-gray-500">
              <AlertCircle className="h-6 w-6 mx-auto mb-2" />
              <p className="text-sm">No HSN/SAC codes found for "{searchQuery}"</p>
              <p className="text-xs mt-1">Try different keywords or check the spelling</p>
            </div>
          ) : !searchQuery.trim() && allItems.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <Tag className="h-6 w-6 mx-auto mb-2" />
              <p className="text-sm">Start typing to search HSN/SAC codes</p>
              <p className="text-xs mt-1">HSN for goods, SAC for services</p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

// Individual suggestion item component
interface SuggestionItemProps {
  item: HsnSacData;
  isSelected: boolean;
  onClick: () => void;
  showConfidence?: boolean;
  showUsage?: boolean;
}

function SuggestionItem({ 
  item, 
  isSelected, 
  onClick, 
  showConfidence = false,
  showUsage = false 
}: SuggestionItemProps) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full text-left px-4 py-3 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none
        ${isSelected ? 'bg-indigo-50 border-l-4 border-indigo-500' : ''}
      `}
    >
      <div className="flex items-center justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-center">
            {item.type === 'HSN' ? (
              <Package className="h-4 w-4 text-blue-500 mr-3 flex-shrink-0" />
            ) : (
              <Wrench className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
            )}
            <span className="text-sm font-medium text-gray-900">{item.code}</span>
            <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
              {item.type}
            </span>
            {item.source === 'frequent' && (
              <Star className="h-3 w-3 text-yellow-500 ml-2" />
            )}
          </div>
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">{item.description}</p>
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
        <div className="ml-4 flex items-center space-x-2 flex-shrink-0">
          {item.gstRate !== undefined && (
            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded font-medium">
              {item.gstRate}% GST
            </span>
          )}
          {showConfidence && item.confidence && (
            <div className="flex items-center">
              <TrendingUp className={`h-3 w-3 mr-1 ${getConfidenceColor(item.confidence)}`} />
              <span className={`text-xs font-medium ${getConfidenceColor(item.confidence)}`}>
                {Math.round(item.confidence * 100)}%
              </span>
            </div>
          )}
          {showUsage && item.usageCount && (
            <div className="flex items-center">
              <span className="text-xs text-gray-500">
                Used {item.usageCount} times
              </span>
            </div>
          )}
          <CheckCircle className="h-4 w-4 text-green-600 opacity-0 group-hover:opacity-100" />
        </div>
      </div>
    </button>
  );
}

function getConfidenceColor(confidence: number) {
  if (confidence > 0.8) return 'text-green-600';
  if (confidence > 0.6) return 'text-yellow-600';
  return 'text-orange-600';
}