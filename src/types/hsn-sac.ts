// src/types/hsn-sac.ts
// Enhanced type definitions for HSN/SAC code functionality

import { 
    User as PrismaUser, 
    Customer as PrismaCustomer, 
    Invoice as PrismaInvoice, 
    InvoiceItem as PrismaInvoiceItem,
    HsnSacCode as PrismaHsnSacCode,
    FrequentlyUsedItem as PrismaFrequentlyUsedItem,
    HsnSacType
  } from '@prisma/client';
  
  // Core HSN/SAC types
  export type { HsnSacType };
  
  export interface HsnSacCode extends PrismaHsnSacCode {
    invoiceItems?: InvoiceItem[];
  }
  
  export interface FrequentlyUsedItem extends PrismaFrequentlyUsedItem {
    user?: User;
  }
  
  // Enhanced existing types with HSN/SAC support
  export type User = PrismaUser & {
    invoices?: Invoice[];
    customers?: Customer[];
    frequentlyUsedItems?: FrequentlyUsedItem[];
  };
  
  export type Customer = PrismaCustomer & {
    user?: User;
    invoices?: Invoice[];
  };
  
  export type Invoice = PrismaInvoice & {
    user?: User;
    customer?: Customer;
    items?: InvoiceItem[];
  };
  
  export type InvoiceItem = PrismaInvoiceItem & {
    invoice?: Invoice;
    hsnSacReference?: HsnSacCode;
  };
  
  // Form types with HSN/SAC support
  export interface InvoiceFormData {
    customerId?: string;
    customerName: string;
    customerGST?: string;
    customerAddress: string;
    customerPhone?: string;
    customerEmail?: string;
    invoiceDate: Date;
    dueDate?: Date;
    isInterState: boolean;
    termsConditions?: string;
    notes?: string;
    items: InvoiceItemFormData[];
  }
  
  export interface InvoiceItemFormData {
    description: string;
    quantity: number;
    rate: number;
    gstRate: number;
    hsnSacCode?: string;
    hsnSacType: HsnSacType;
    itemCategory?: string;
    itemSubCategory?: string;
    unitOfMeasurement: string;
  }
  
  export interface FrequentlyUsedItemFormData {
    itemName: string;
    hsnSacCode?: string;
    hsnSacType: HsnSacType;
    defaultRate?: number;
    defaultGstRate: number;
    unitOfMeasurement: string;
    category?: string;
  }
  
  // Search and suggestion types
  export interface HsnSacSearchParams {
    query: string;
    type?: HsnSacType;
    category?: string;
    limit?: number;
  }
  
  export interface HsnSacSearchResult {
    code: string;
    type: HsnSacType;
    description: string;
    category: string;
    subCategory?: string;
    gstRate?: number;
    unitOfMeasurement: string;
    isActive?: boolean;
    source: 'database' | 'static';
  }
  
  export interface ItemSuggestion {
    itemName: string;
    hsnSacCode?: string;
    hsnSacType: HsnSacType;
    defaultRate?: number;
    defaultGstRate: number;
    unitOfMeasurement: string;
    category?: string;
    usageCount?: number;
    lastUsedAt?: Date;
    source: 'frequently_used' | 'hsn_sac_database';
    confidence?: number; // 0-1 score for suggestion relevance
  }
  
  // Enhanced calculation types
  export interface InvoiceCalculationsWithHsnSac {
    subtotal: number;
    cgst: number;
    sgst: number;
    igst: number;
    totalAmount: number;
    items: InvoiceItemCalculation[];
    hsnSacSummary: HsnSacTaxSummary[];
  }
  
  export interface InvoiceItemCalculation {
    description: string;
    quantity: number;
    rate: number;
    amount: number;
    gstRate: number;
    cgst: number;
    sgst: number;
    igst: number;
    totalAmount: number;
    hsnSacCode?: string;
    hsnSacType: HsnSacType;
    itemCategory?: string;
    unitOfMeasurement: string;
  }
  
  export interface HsnSacTaxSummary {
    hsnSacCode: string;
    hsnSacType: HsnSacType;
    description: string;
    taxableAmount: number;
    gstRate: number;
    cgst: number;
    sgst: number;
    igst: number;
    totalTax: number;
  }
  
  // API response types
  export interface HsnSacSearchResponse {
    success: boolean;
    data: HsnSacSearchResult[];
    total: number;
    pagination?: {
      limit: number;
      total: number;
      hasMore: boolean;
    };
  }
  
  export interface FrequentlyUsedItemsResponse {
    success: boolean;
    data: FrequentlyUsedItem[];
    total: number;
    pagination: {
      limit: number;
      total: number;
      hasMore: boolean;
    };
  }
  
  export interface ItemSuggestionsResponse {
    success: boolean;
    data: ItemSuggestion[];
    total: number;
  }
  
  // Validation types
  export interface HsnSacValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    normalizedCode: string;
    suggestedCorrections?: string[];
  }
  
  export interface InvoiceItemValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    enhancedItem: InvoiceItemFormData;
    suggestions: {
      hsnSacCodes: HsnSacSearchResult[];
      gstRate?: number;
      unitOfMeasurement?: string;
    };
  }
  
  // Configuration types
  export interface HsnSacConfiguration {
    enableAutoSuggestions: boolean;
    enableGstRateOverride: boolean;
    enableUnitAutoDetection: boolean;
    requireHsnSacForGoods: boolean;
    requireSacForServices: boolean;
    maxSuggestions: number;
    cacheExpiryHours: number;
  }
  
  // Dashboard analytics types
  export interface HsnSacAnalytics {
    totalUniqueHsnSacCodes: number;
    mostUsedHsnSacCodes: Array<{
      code: string;
      type: HsnSacType;
      description: string;
      usageCount: number;
      totalRevenue: number;
    }>;
    gstRateDistribution: Array<{
      gstRate: number;
      invoiceCount: number;
      totalAmount: number;
      percentage: number;
    }>;
    hsnVsSacUsage: {
      hsnCount: number;
      sacCount: number;
      hsnRevenue: number;
      sacRevenue: number;
    };
    categoryWiseRevenue: Array<{
      category: string;
      totalAmount: number;
      invoiceCount: number;
      avgGstRate: number;
    }>;
  }
  
  // Export and compliance types
  export interface GstReturnData {
    b2b: Array<{
      ctin: string;
      inv: Array<{
        inum: string;
        idt: string;
        val: number;
        pos: string;
        rchrg: 'Y' | 'N';
        itms: Array<{
          num: number;
          itm_det: {
            hsn_sc: string;
            txval: number;
            irt: number;
            iamt: number;
            camt: number;
            samt: number;
            csamt: number;
          };
        }>;
      }>;
    }>;
    b2c: Array<{
      sply_ty: 'INTER' | 'INTRA';
      pos: string;
      hsn_sc: string;
      txval: number;
      irt: number;
      iamt: number;
      camt: number;
      samt: number;
    }>;
  }
  
  // Utility types
  export type UnitOfMeasurement = 
    | 'NOS' | 'KGS' | 'MTR' | 'LTR' | 'SQM' | 'CUM' 
    | 'HRS' | 'DAYS' | 'PAIRS' | 'SETS' | 'KMS' | 'TON' 
    | 'GMS' | 'ML' | 'BOXES' | 'CARTONS' | 'PACKETS' 
    | 'BUNDLES' | 'ROLLS' | 'SHEETS';
  
  export type GstRate = 0 | 5 | 12 | 18 | 28;
  
  export type ItemCategory = 
    | 'Agricultural Products' | 'Food Products' | 'Beverages' 
    | 'Textiles' | 'Apparel' | 'Footwear' | 'Electronics' 
    | 'Automobiles' | 'Furniture' | 'Pharmaceuticals' 
    | 'Cosmetics' | 'Plastics' | 'Metal Products' 
    | 'Paper Products' | 'IT Services' | 'Professional Services' 
    | 'Business Services' | 'Transportation' | 'Hospitality' 
    | 'Construction' | 'Financial Services' | 'Entertainment' 
    | 'Repair Services' | 'Personal Care' | 'Fuels' | 'Others';
  
  // Error types
  export class HsnSacError extends Error {
    constructor(
      message: string,
      public code: string,
      public details?: any
    ) {
      super(message);
      this.name = 'HsnSacError';
    }
  }
  
  export class ValidationError extends Error {
    constructor(
      message: string,
      public field: string,
      public code: string
    ) {
      super(message);
      this.name = 'ValidationError';
    }
  }