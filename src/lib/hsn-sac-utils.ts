// src/lib/hsn-sac-utils.ts
// Enhanced business logic utilities for HSN/SAC code processing

import { prisma } from '@/lib/prisma';
import { commonHsnSacCodes, searchHsnSacCodes, getHsnSacByCode } from '@/lib/hsn-sac-data';

export interface HsnSacCodeInfo {
  code: string;
  type: 'HSN' | 'SAC';
  description: string;
  category: string;
  subCategory?: string;
  recommendedGstRate?: number;
  unitOfMeasurement: string;
  isActive?: boolean;
}

export interface ItemSuggestion {
  itemName: string;
  hsnSacCode?: string;
  hsnSacType: 'HSN' | 'SAC';
  defaultRate?: number;
  defaultGstRate: number;
  unitOfMeasurement: string;
  category?: string;
  usageCount?: number;
  lastUsedAt?: Date;
  source: 'frequently_used' | 'hsn_sac_database';
}

export interface InvoiceItemWithHsnSac {
  description: string;
  quantity: number;
  rate: number;
  gstRate: number;
  hsnSacCode?: string;
  hsnSacType: 'HSN' | 'SAC';
  itemCategory?: string;
  itemSubCategory?: string;
  unitOfMeasurement: string;
  amount: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalAmount: number;
}

/**
 * Validates HSN/SAC code format and returns validation details
 */
export function validateHsnSacCode(code: string, type: 'HSN' | 'SAC'): {
  isValid: boolean;
  errors: string[];
  normalizedCode: string;
} {
  const errors: string[] = [];
  const normalizedCode = code.trim().toUpperCase();

  if (!normalizedCode) {
    errors.push('HSN/SAC code cannot be empty');
    return { isValid: false, errors, normalizedCode };
  }

  if (type === 'HSN') {
    // HSN codes are typically 4, 6, or 8 digits
    if (!/^\d{4,8}$/.test(normalizedCode)) {
      errors.push('HSN code must be 4-8 digits');
    }
  } else if (type === 'SAC') {
    // SAC codes are typically 6 digits
    if (!/^\d{6}$/.test(normalizedCode)) {
      errors.push('SAC code must be exactly 6 digits');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    normalizedCode
  };
}

/**
 * Fetches HSN/SAC code details from database or static data
 */
export async function getHsnSacDetails(code: string): Promise<HsnSacCodeInfo | null> {
  try {
    // First check database
    const dbResult = await prisma.hsnSacCode.findUnique({
      where: { code: code.trim() }
    });

    if (dbResult && dbResult.isActive) {
      return {
        code: dbResult.code,
        type: dbResult.type as 'HSN' | 'SAC',
        description: dbResult.description,
        category: dbResult.category,
        subCategory: dbResult.subCategory || undefined,
        recommendedGstRate: dbResult.gstRate ? Number(dbResult.gstRate) : undefined,
        unitOfMeasurement: dbResult.unitOfMeasurement,
        isActive: dbResult.isActive,
      };
    }

    // Fallback to static data
    const staticResult = getHsnSacByCode(code.trim());
    if (staticResult) {
      return {
        code: staticResult.code,
        type: staticResult.type,
        description: staticResult.description,
        category: staticResult.category,
        subCategory: staticResult.subCategory,
        recommendedGstRate: staticResult.gstRate,
        unitOfMeasurement: staticResult.unitOfMeasurement,
        isActive: true,
      };
    }

    return null;
  } catch (error) {
    console.error('Error fetching HSN/SAC details:', error);
    return null;
  }
}

/**
 * Provides intelligent item suggestions based on user input
 */
export async function getItemSuggestions(
  userId: string,
  query: string,
  limit: number = 10
): Promise<ItemSuggestion[]> {
  try {
    const suggestions: ItemSuggestion[] = [];

    // Get frequently used items for this user
    const frequentlyUsedItems = await prisma.frequentlyUsedItem.findMany({
      where: {
        userId,
        OR: [
          { itemName: { contains: query, mode: 'insensitive' } },
          { hsnSacCode: { contains: query, mode: 'insensitive' } },
          { category: { contains: query, mode: 'insensitive' } },
        ]
      },
      orderBy: [
        { usageCount: 'desc' },
        { lastUsedAt: 'desc' }
      ],
      take: Math.floor(limit * 0.7) // Reserve 70% for frequently used items
    });

    // Add frequently used items to suggestions
    frequentlyUsedItems.forEach(item => {
      suggestions.push({
        itemName: item.itemName,
        hsnSacCode: item.hsnSacCode || undefined,
        hsnSacType: item.hsnSacType as 'HSN' | 'SAC',
        defaultRate: item.defaultRate ? Number(item.defaultRate) : undefined,
        defaultGstRate: Number(item.defaultGstRate),
        unitOfMeasurement: item.unitOfMeasurement,
        category: item.category || undefined,
        usageCount: item.usageCount,
        lastUsedAt: item.lastUsedAt,
        source: 'frequently_used'
      });
    });

    // Fill remaining slots with HSN/SAC database suggestions
    const remainingSlots = limit - suggestions.length;
    if (remainingSlots > 0) {
      const hsnSacSuggestions = searchHsnSacCodes(query).slice(0, remainingSlots);
      
      hsnSacSuggestions.forEach(hsnSac => {
        // Avoid duplicates
        const alreadyExists = suggestions.some(s => s.hsnSacCode === hsnSac.code);
        if (!alreadyExists) {
          suggestions.push({
            itemName: hsnSac.description,
            hsnSacCode: hsnSac.code,
            hsnSacType: hsnSac.type,
            defaultGstRate: hsnSac.gstRate,
            unitOfMeasurement: hsnSac.unitOfMeasurement,
            category: hsnSac.category,
            source: 'hsn_sac_database'
          });
        }
      });
    }

    return suggestions;
  } catch (error) {
    console.error('Error getting item suggestions:', error);
    return [];
  }
}

/**
 * Processes invoice items with HSN/SAC code validation and enhancement
 */
export async function processInvoiceItems(
  items: Array<{
    description: string;
    quantity: number;
    rate: number;
    gstRate?: number;
    hsnSacCode?: string;
    hsnSacType?: 'HSN' | 'SAC';
    unitOfMeasurement?: string;
  }>,
  isInterState: boolean
): Promise<InvoiceItemWithHsnSac[]> {
  const processedItems: InvoiceItemWithHsnSac[] = [];

  for (const item of items) {
    let finalGstRate = item.gstRate || 18;
    let finalUnitOfMeasurement = item.unitOfMeasurement || 'NOS';
    let itemCategory: string | undefined;
    let itemSubCategory: string | undefined;
    let hsnSacType: 'HSN' | 'SAC' = item.hsnSacType || 'HSN';

    // If HSN/SAC code is provided, fetch details and override defaults
    if (item.hsnSacCode) {
      const hsnSacDetails = await getHsnSacDetails(item.hsnSacCode);
      if (hsnSacDetails) {
        if (hsnSacDetails.recommendedGstRate !== undefined) {
          finalGstRate = hsnSacDetails.recommendedGstRate;
        }
        finalUnitOfMeasurement = hsnSacDetails.unitOfMeasurement;
        itemCategory = hsnSacDetails.category;
        itemSubCategory = hsnSacDetails.subCategory;
        hsnSacType = hsnSacDetails.type;
      }
    }

    // Calculate amounts
    const amount = item.quantity * item.rate;
    const gstAmount = (amount * finalGstRate) / 100;
    
    let cgst = 0;
    let sgst = 0;
    let igst = 0;
    
    if (isInterState) {
      igst = gstAmount;
    } else {
      cgst = gstAmount / 2;
      sgst = gstAmount / 2;
    }
    
    const totalAmount = amount + gstAmount;

    processedItems.push({
      description: item.description,
      quantity: item.quantity,
      rate: item.rate,
      gstRate: finalGstRate,
      hsnSacCode: item.hsnSacCode,
      hsnSacType,
      itemCategory,
      itemSubCategory,
      unitOfMeasurement: finalUnitOfMeasurement,
      amount,
      cgst,
      sgst,
      igst,
      totalAmount,
    });
  }

  return processedItems;
}

/**
 * Automatically detects appropriate HSN/SAC code based on item description
 */
export async function suggestHsnSacCode(
  itemDescription: string,
  itemCategory?: string
): Promise<HsnSacCodeInfo[]> {
  try {
    const suggestions: HsnSacCodeInfo[] = [];
    
    // Search in database first
    const dbResults = await prisma.hsnSacCode.findMany({
      where: {
        AND: [
          { isActive: true },
          {
            OR: [
              { description: { contains: itemDescription, mode: 'insensitive' } },
              { category: { contains: itemDescription, mode: 'insensitive' } },
              ...(itemCategory ? [{ category: { contains: itemCategory, mode: 'insensitive' } }] : [])
            ]
          }
        ]
      },
      take: 5,
      orderBy: { code: 'asc' }
    });

    // Add database results
    dbResults.forEach(result => {
      suggestions.push({
        code: result.code,
        type: result.type as 'HSN' | 'SAC',
        description: result.description,
        category: result.category,
        subCategory: result.subCategory || undefined,
        recommendedGstRate: result.gstRate ? Number(result.gstRate) : undefined,
        unitOfMeasurement: result.unitOfMeasurement,
        isActive: result.isActive,
      });
    });

    // Search in static data if we need more suggestions
    if (suggestions.length < 5) {
      const staticResults = searchHsnSacCodes(itemDescription)
        .slice(0, 5 - suggestions.length);
      
      staticResults.forEach(result => {
        // Avoid duplicates
        if (!suggestions.some(s => s.code === result.code)) {
          suggestions.push({
            code: result.code,
            type: result.type,
            description: result.description,
            category: result.category,
            subCategory: result.subCategory,
            recommendedGstRate: result.gstRate,
            unitOfMeasurement: result.unitOfMeasurement,
            isActive: true,
          });
        }
      });
    }

    return suggestions;
  } catch (error) {
    console.error('Error suggesting HSN/SAC codes:', error);
    return [];
  }
}

/**
 * Updates frequently used items based on invoice creation
 */
export async function updateFrequentlyUsedItems(
  userId: string,
  items: InvoiceItemWithHsnSac[]
): Promise<void> {
  try {
    for (const item of items) {
      if (item.hsnSacCode) {
        await prisma.frequentlyUsedItem.upsert({
          where: {
            userId_itemName: {
              userId,
              itemName: item.description,
            }
          },
          create: {
            userId,
            itemName: item.description,
            hsnSacCode: item.hsnSacCode,
            hsnSacType: item.hsnSacType,
            defaultRate: item.rate,
            defaultGstRate: item.gstRate,
            unitOfMeasurement: item.unitOfMeasurement,
            category: item.itemCategory,
            usageCount: 1,
            lastUsedAt: new Date(),
          },
          update: {
            hsnSacCode: item.hsnSacCode,
            hsnSacType: item.hsnSacType,
            defaultRate: item.rate,
            defaultGstRate: item.gstRate,
            unitOfMeasurement: item.unitOfMeasurement,
            category: item.itemCategory,
            usageCount: { increment: 1 },
            lastUsedAt: new Date(),
          },
        });
      }
    }
  } catch (error) {
    console.error('Error updating frequently used items:', error);
    // Don't throw error as this is not critical for invoice creation
  }
}