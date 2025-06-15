// src/components/invoice/FrequentlyUsedItemsModal.tsx
// Modal component for selecting frequently used items with smart suggestions

'use client';

import { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { 
  X, 
  Search, 
  Clock, 
  Tag, 
  Package, 
  Wrench, 
  TrendingUp, 
  Filter,
  Plus,
  Loader2,
  Star,
  ChevronRight
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export interface FrequentlyUsedItemData {
  id: string;
  itemName: string;
  hsnSacCode?: string;
  hsnSacType: 'HSN' | 'SAC';
  defaultRate?: number;
  defaultGstRate: number;
  unitOfMeasurement: string;
  category?: string;
  usageCount: number;
  lastUsedAt: Date;
}

interface FrequentlyUsedItemsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectItem: (item: FrequentlyUsedItemData) => void;
}

export function FrequentlyUsedItemsModal({
  isOpen,
  onClose,
  onSelectItem,
}: FrequentlyUsedItemsModalProps) {
  const [items, setItems] = useState<FrequentlyUsedItemData[]>([]);
  const [filteredItems, setFilteredItems] = useState<FrequentlyUsedItemData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [sortBy, setSortBy] = useState<'usage' | 'recent' | 'alphabetical'>('usage');
  const [isLoading, setIsLoading] = useState(true);

  const categories = ['All', ...Array.from(new Set(items.map(item => item.category).filter(Boolean)))];

  useEffect(() => {
    if (isOpen) {
      fetchFrequentlyUsedItems();
    }
  }, [isOpen]);

  useEffect(() => {
    filterAndSortItems();
  }, [items, searchQuery, selectedCategory, sortBy]);

  const fetchFrequentlyUsedItems = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/frequently-used-items?limit=50');
      if (response.ok) {
        const data = await response.json();
        setItems(data.data || []);
      } else {
        console.error('Failed to fetch frequently used items');
      }
    } catch (error) {
      console.error('Error fetching frequently used items:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterAndSortItems = () => {
    let filtered = items;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.itemName.toLowerCase().includes(query) ||
        item.hsnSacCode?.toLowerCase().includes(query) ||
        item.category?.toLowerCase().includes(query)
      );
    }

    // Apply category filter
    if (selectedCategory && selectedCategory !== 'All') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    // Apply sorting
    switch (sortBy) {
      case 'usage':
        filtered.sort((a, b) => b.usageCount - a.usageCount);
        break;
      case 'recent':
        filtered.sort((a, b) => new Date(b.lastUsedAt).getTime() - new Date(a.lastUsedAt).getTime());
        break;
      case 'alphabetical':
        filtered.sort((a, b) => a.itemName.localeCompare(b.itemName));
        break;
    }

    setFilteredItems(filtered);
  };

  const handleSelectItem = (item: FrequentlyUsedItemData) => {
    onSelectItem(item);
    onClose();
  };

  const getUsageIndicator = (usageCount: number) => {
    if (usageCount >= 10) return { level: 'high', color: 'text-green-600', label: 'Frequently Used' };
    if (usageCount >= 5) return { level: 'medium', color: 'text-yellow-600', label: 'Often Used' };
    return { level: 'low', color: 'text-gray-500', label: 'Occasionally Used' };
  };

  const formatLastUsed = (date: Date) => {
    const now = new Date();
    const diffTime = now.getTime() - new Date(date).getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white shadow-xl transition-all">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                      <Clock className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div>
                      <Dialog.Title as="h3" className="text-lg font-medium text-gray-900">
                        Frequently Used Items
                      </Dialog.Title>
                      <p className="text-sm text-gray-600">
                        Select from your most used items to quickly add to the invoice
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                {/* Search and Filters */}
                <div className="p-6 border-b border-gray-200 bg-gray-50">
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search items, HSN/SAC codes..."
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>

                    {/* Category Filter */}
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                      {categories.map(category => (
                        <option key={category} value={category === 'All' ? '' : category}>
                          {category}
                        </option>
                      ))}
                    </select>

                    {/* Sort By */}
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                      <option value="usage">Most Used</option>
                      <option value="recent">Recently Used</option>
                      <option value="alphabetical">A-Z</option>
                    </select>
                  </div>
                </div>

                {/* Content */}
                <div className="max-h-96 overflow-y-auto">
                  {isLoading ? (
                    <div className="flex items-center justify-center p-12">
                      <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                    </div>
                  ) : filteredItems.length > 0 ? (
                    <div className="divide-y divide-gray-100">
                      {filteredItems.map((item) => {
                        const usage = getUsageIndicator(item.usageCount);
                        return (
                          <button
                            key={item.id}
                            onClick={() => handleSelectItem(item)}
                            className="w-full text-left p-4 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors group"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-3">
                                  <div className="flex-shrink-0">
                                    {item.hsnSacType === 'HSN' ? (
                                      <Package className="h-5 w-5 text-blue-500" />
                                    ) : (
                                      <Wrench className="h-5 w-5 text-green-500" />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                      {item.itemName}
                                    </p>
                                    <div className="flex items-center space-x-4 mt-1">
                                      {item.hsnSacCode && (
                                        <div className="flex items-center">
                                          <Tag className="h-3 w-3 text-gray-400 mr-1" />
                                          <span className="text-xs text-gray-600">
                                            {item.hsnSacCode}
                                          </span>
                                        </div>
                                      )}
                                      {item.category && (
                                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                          {item.category}
                                        </span>
                                      )}
                                      <span className="text-xs text-gray-500">
                                        {item.unitOfMeasurement}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center space-x-4 ml-4">
                                {/* Default Rate */}
                                {item.defaultRate && (
                                  <div className="text-right">
                                    <p className="text-sm font-medium text-gray-900">
                                      {formatCurrency(item.defaultRate)}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {item.defaultGstRate}% GST
                                    </p>
                                  </div>
                                )}

                                {/* Usage Statistics */}
                                <div className="text-right">
                                  <div className="flex items-center">
                                    <TrendingUp className={`h-4 w-4 mr-1 ${usage.color}`} />
                                    <span className="text-sm font-medium text-gray-900">
                                      {item.usageCount}
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-500">
                                    {formatLastUsed(item.lastUsedAt)}
                                  </p>
                                </div>

                                {/* Usage Level Indicator */}
                                <div className="flex items-center">
                                  <div className="flex space-x-1">
                                    {[...Array(3)].map((_, index) => (
                                      <div
                                        key={index}
                                        className={`w-1 h-4 rounded-full ${
                                          (usage.level === 'high' && index < 3) ||
                                          (usage.level === 'medium' && index < 2) ||
                                          (usage.level === 'low' && index < 1)
                                            ? usage.color.includes('green') ? 'bg-green-400' :
                                              usage.color.includes('yellow') ? 'bg-yellow-400' : 'bg-gray-300'
                                            : 'bg-gray-200'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                </div>

                                <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600" />
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-12 text-center">
                      <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <Package className="h-12 w-12 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {searchQuery || selectedCategory ? 'No items found' : 'No frequently used items yet'}
                      </h3>
                      <p className="text-gray-600 mb-6">
                        {searchQuery || selectedCategory 
                          ? 'Try adjusting your search or filters'
                          : 'Items you use in invoices will appear here for quick access'
                        }
                      </p>
                      {!searchQuery && !selectedCategory && (
                        <button
                          onClick={onClose}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Add Items to Invoice
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer */}
                {filteredItems.length > 0 && (
                  <div className="p-4 border-t border-gray-200 bg-gray-50">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>
                        Showing {filteredItems.length} of {items.length} items
                      </span>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <div className="flex space-x-1">
                            <div className="w-1 h-4 bg-green-400 rounded-full"></div>
                            <div className="w-1 h-4 bg-green-400 rounded-full"></div>
                            <div className="w-1 h-4 bg-green-400 rounded-full"></div>
                          </div>
                          <span className="text-xs">Frequently used</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="flex space-x-1">
                            <div className="w-1 h-4 bg-yellow-400 rounded-full"></div>
                            <div className="w-1 h-4 bg-yellow-400 rounded-full"></div>
                            <div className="w-1 h-4 bg-gray-200 rounded-full"></div>
                          </div>
                          <span className="text-xs">Often used</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}