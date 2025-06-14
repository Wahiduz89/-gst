// src/app/api/invoices/route.ts - Updated to support HSN/SAC codes
// Enhanced invoice API with comprehensive HSN/SAC code support

import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { generateInvoiceNumber, calculateInvoiceTotals } from '@/lib/utils';
import { Decimal } from '@prisma/client/runtime/library';

const invoiceItemSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  quantity: z.number().positive('Quantity must be positive'),
  rate: z.number().positive('Rate must be positive'),
  gstRate: z.number().min(0).max(28),
  hsnSacCode: z.string().optional(),
  hsnSacType: z.enum(['HSN', 'SAC']).default('HSN'),
  itemCategory: z.string().optional(),
  itemSubCategory: z.string().optional(),
  unitOfMeasurement: z.string().default('NOS'),
});

const invoiceSchema = z.object({
  customerId: z.string().optional(),
  customerName: z.string().min(2, 'Customer name is required'),
  customerGST: z.string()
    .regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Invalid GST number')
    .optional()
    .nullable()
    .or(z.literal('')),
  customerAddress: z.string().min(5, 'Customer address is required'),
  customerPhone: z.string()
    .regex(/^[6-9]\d{9}$/, 'Invalid phone number')
    .optional()
    .nullable()
    .or(z.literal('')),
  customerEmail: z.string().email('Invalid email').optional().nullable().or(z.literal('')),
  invoiceDate: z.string().datetime(),
  dueDate: z.string().datetime().optional().nullable(),
  isInterState: z.boolean(),
  termsConditions: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  items: z.array(invoiceItemSchema).min(1, 'At least one item is required'),
  status: z.enum(['DRAFT', 'GENERATED']).optional(),
});

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Enhanced Invoice API: Starting invoice creation with HSN/SAC support...');
    
    const session = await getAuthSession();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = invoiceSchema.parse(body);
    
    // Verify business information is complete
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        businessName: true,
        businessAddress: true,
        businessState: true,
      },
    });

    if (!user?.businessName || !user?.businessAddress) {
      return NextResponse.json(
        { error: 'Please complete your business settings before creating invoices' },
        { status: 400 }
      );
    }

    // Generate invoice number
    const invoiceCount = await prisma.invoice.count({
      where: { userId: session.user.id },
    });
    const invoiceNumber = generateInvoiceNumber('INV', invoiceCount);

    // Calculate totals with enhanced item processing
    const calculations = calculateInvoiceTotals(
      validatedData.items,
      validatedData.isInterState
    );

    // Process items with HSN/SAC code validation and auto-suggestions
    const processedItems = await Promise.all(
      validatedData.items.map(async (item, index) => {
        let hsnSacData = null;
        
        // If HSN/SAC code is provided, validate and fetch details
        if (item.hsnSacCode) {
          hsnSacData = await prisma.hsnSacCode.findUnique({
            where: { code: item.hsnSacCode }
          });
          
          // If not found in database, check static data
          if (!hsnSacData) {
            const { getHsnSacByCode } = await import('@/lib/hsn-sac-data');
            const staticData = getHsnSacByCode(item.hsnSacCode);
            if (staticData) {
              hsnSacData = staticData;
            }
          }
        }

        // Auto-detect GST rate from HSN/SAC code if not provided or if code suggests different rate
        let finalGstRate = item.gstRate;
        if (hsnSacData?.gstRate !== null && hsnSacData?.gstRate !== undefined) {
          finalGstRate = hsnSacData.gstRate;
        }

        // Auto-detect unit of measurement
        let finalUnitOfMeasurement = item.unitOfMeasurement;
        if (hsnSacData?.unitOfMeasurement) {
          finalUnitOfMeasurement = hsnSacData.unitOfMeasurement;
        }

        // Auto-detect category information
        let finalCategory = item.itemCategory;
        let finalSubCategory = item.itemSubCategory;
        if (hsnSacData) {
          finalCategory = finalCategory || hsnSacData.category;
          finalSubCategory = finalSubCategory || hsnSacData.subCategory;
        }

        return {
          ...item,
          gstRate: finalGstRate,
          unitOfMeasurement: finalUnitOfMeasurement,
          itemCategory: finalCategory,
          itemSubCategory: finalSubCategory,
          calculatedAmounts: calculations.items[index],
        };
      })
    );

    // Determine customer state from GST if available
    let customerState = user.businessState || 'Assam';
    if (validatedData.customerGST) {
      customerState = getStateFromGSTCode(validatedData.customerGST.substring(0, 2));
    }

    // Create invoice with items in a transaction
    const invoice = await prisma.$transaction(async (tx) => {
      // Create invoice
      const newInvoice = await tx.invoice.create({
        data: {
          userId: session.user.id,
          customerId: validatedData.customerId || null,
          invoiceNumber,
          invoiceDate: new Date(validatedData.invoiceDate),
          dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : null,
          status: validatedData.status || 'DRAFT',
          customerName: validatedData.customerName,
          customerGST: validatedData.customerGST || null,
          customerAddress: validatedData.customerAddress,
          customerPhone: validatedData.customerPhone || null,
          customerEmail: validatedData.customerEmail || null,
          businessState: user.businessState || 'Assam',
          customerState,
          subtotal: new Decimal(calculations.subtotal),
          cgst: new Decimal(calculations.cgst),
          sgst: new Decimal(calculations.sgst),
          igst: new Decimal(calculations.igst),
          totalAmount: new Decimal(calculations.totalAmount),
          isInterState: validatedData.isInterState,
          termsConditions: validatedData.termsConditions || null,
          notes: validatedData.notes || null,
        },
      });

      // Create invoice items with HSN/SAC data
      await tx.invoiceItem.createMany({
        data: processedItems.map((item) => ({
          invoiceId: newInvoice.id,
          description: item.description,
          quantity: new Decimal(item.quantity),
          rate: new Decimal(item.rate),
          gstRate: new Decimal(item.gstRate),
          amount: new Decimal(item.calculatedAmounts.amount),
          cgst: new Decimal(item.calculatedAmounts.cgst),
          sgst: new Decimal(item.calculatedAmounts.sgst),
          igst: new Decimal(item.calculatedAmounts.igst),
          totalAmount: new Decimal(item.calculatedAmounts.totalAmount),
          hsnSacCode: item.hsnSacCode || null,
          hsnSacType: item.hsnSacType,
          itemCategory: item.itemCategory || null,
          itemSubCategory: item.itemSubCategory || null,
          unitOfMeasurement: item.unitOfMeasurement,
        })),
      });

      // Update frequently used items for each invoice item
      await Promise.all(
        processedItems.map(async (item) => {
          if (item.hsnSacCode) {
            await tx.frequentlyUsedItem.upsert({
              where: {
                userId_itemName: {
                  userId: session.user.id,
                  itemName: item.description,
                }
              },
              create: {
                userId: session.user.id,
                itemName: item.description,
                hsnSacCode: item.hsnSacCode,
                hsnSacType: item.hsnSacType,
                defaultRate: new Decimal(item.rate),
                defaultGstRate: new Decimal(item.gstRate),
                unitOfMeasurement: item.unitOfMeasurement,
                category: item.itemCategory,
                usageCount: 1,
                lastUsedAt: new Date(),
              },
              update: {
                hsnSacCode: item.hsnSacCode,
                hsnSacType: item.hsnSacType,
                defaultRate: new Decimal(item.rate),
                defaultGstRate: new Decimal(item.gstRate),
                unitOfMeasurement: item.unitOfMeasurement,
                category: item.itemCategory,
                usageCount: { increment: 1 },
                lastUsedAt: new Date(),
              },
            });
          }
        })
      );

      return newInvoice;
    });

    console.log('✅ Enhanced invoice created successfully with HSN/SAC support:', invoice.id);

    return NextResponse.json(
      {
        success: true,
        message: 'Invoice created successfully with HSN/SAC codes',
        invoice: {
          ...invoice,
          subtotal: invoice.subtotal.toString(),
          cgst: invoice.cgst.toString(),
          sgst: invoice.sgst.toString(),
          igst: invoice.igst.toString(),
          totalAmount: invoice.totalAmount.toString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('💥 Enhanced invoice creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error occurred while creating invoice' },
      { status: 500 }
    );
  }
}

// GET endpoint remains largely the same but includes HSN/SAC data in response
export async function GET(request: NextRequest) {
  try {
    const session = await getAuthSession();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';

    const skip = (page - 1) * limit;

    const where = {
      userId: session.user.id,
      ...(search && {
        OR: [
          { invoiceNumber: { contains: search, mode: 'insensitive' as const } },
          { customerName: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
      ...(status && { status }),
    };

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          customer: {
            select: {
              name: true,
              gstNumber: true,
            },
          },
          items: {
            select: {
              hsnSacCode: true,
              hsnSacType: true,
              itemCategory: true,
              unitOfMeasurement: true,
            },
            take: 1, // Just to check if invoice has HSN/SAC codes
          },
        },
      }),
      prisma.invoice.count({ where }),
    ]);

    return NextResponse.json({
      invoices: invoices.map(invoice => ({
        ...invoice,
        subtotal: invoice.subtotal.toString(),
        cgst: invoice.cgst.toString(),
        sgst: invoice.sgst.toString(),
        igst: invoice.igst.toString(),
        totalAmount: invoice.totalAmount.toString(),
        hasHsnSacCodes: invoice.items.some(item => item.hsnSacCode),
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Enhanced invoices fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
}

// Helper function to get state from GST code
function getStateFromGSTCode(code: string): string {
  const stateMap: Record<string, string> = {
    '01': 'Jammu and Kashmir',
    '02': 'Himachal Pradesh',
    '03': 'Punjab',
    '04': 'Chandigarh',
    '05': 'Uttarakhand',
    '06': 'Haryana',
    '07': 'Delhi',
    '08': 'Rajasthan',
    '09': 'Uttar Pradesh',
    '10': 'Bihar',
    '11': 'Sikkim',
    '12': 'Arunachal Pradesh',
    '13': 'Nagaland',
    '14': 'Manipur',
    '15': 'Mizoram',
    '16': 'Tripura',
    '17': 'Meghalaya',
    '18': 'Assam',
    '19': 'West Bengal',
    '20': 'Jharkhand',
    '21': 'Odisha',
    '22': 'Chhattisgarh',
    '23': 'Madhya Pradesh',
    '24': 'Gujarat',
    '26': 'Dadra and Nagar Haveli and Daman and Diu',
    '27': 'Maharashtra',
    '28': 'Andhra Pradesh',
    '29': 'Karnataka',
    '30': 'Goa',
    '31': 'Lakshadweep',
    '32': 'Kerala',
    '33': 'Tamil Nadu',
    '34': 'Puducherry',
    '35': 'Andaman and Nicobar Islands',
    '36': 'Telangana',
    '38': 'Ladakh',
  };
  
  return stateMap[code] || 'Unknown';
}