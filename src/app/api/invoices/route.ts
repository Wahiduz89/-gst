// src/app/api/invoices/route.ts - Fixed version

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
    console.log('🚀 Invoice API: Starting invoice creation...');
    
    // Check authentication
    const session = await getAuthSession();
    console.log('📝 Session check:', session ? 'Authenticated' : 'Not authenticated');
    
    if (!session?.user?.id) {
      console.log('❌ No user session found');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    let body;
    try {
      body = await request.json();
      console.log('📦 Request body parsed successfully');
    } catch (parseError) {
      console.error('❌ Failed to parse request body:', parseError);
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }
    
    // Validate input
    console.log('🔍 Validating input data...');
    let validatedData;
    try {
      validatedData = invoiceSchema.parse(body);
      console.log('✅ Input validation successful');
    } catch (validationError) {
      console.error('❌ Validation error:', validationError);
      if (validationError instanceof z.ZodError) {
        return NextResponse.json(
          { error: 'Validation failed', details: validationError.errors },
          { status: 400 }
        );
      }
      throw validationError;
    }
    
    // Verify business information is complete
    console.log('🏢 Checking business information...');
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        businessName: true,
        businessAddress: true,
        businessState: true,
      },
    });

    if (!user) {
      console.log('❌ User not found in database');
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (!user?.businessName || !user?.businessAddress) {
      console.log('❌ Incomplete business information:', { 
        hasName: !!user?.businessName, 
        hasAddress: !!user?.businessAddress 
      });
      return NextResponse.json(
        { error: 'Please complete your business settings before creating invoices' },
        { status: 400 }
      );
    }

    console.log('✅ Business information verified');

    // Generate invoice number
    const invoiceCount = await prisma.invoice.count({
      where: { userId: session.user.id },
    });
    const invoiceNumber = generateInvoiceNumber('INV', invoiceCount);
    console.log('📋 Generated invoice number:', invoiceNumber);

    // Check if invoice number already exists (race condition check)
    const existingInvoice = await prisma.invoice.findFirst({
      where: {
        userId: session.user.id,
        invoiceNumber,
      },
    });

    if (existingInvoice) {
      console.log('❌ Invoice number collision detected');
      return NextResponse.json(
        { error: 'Invoice number already exists. Please try again.' },
        { status: 400 }
      );
    }

    // Calculate totals
    console.log('🧮 Calculating invoice totals...');
    let calculations;
    try {
      calculations = calculateInvoiceTotals(
        validatedData.items,
        validatedData.isInterState
      );
      console.log('✅ Calculations complete:', {
        subtotal: calculations.subtotal,
        totalAmount: calculations.totalAmount
      });
    } catch (calculationError) {
      console.error('❌ Calculation error:', calculationError);
      return NextResponse.json(
        { error: 'Failed to calculate invoice totals' },
        { status: 500 }
      );
    }

    // Determine customer state from GST if available
    let customerState = user.businessState || 'Assam';
    if (validatedData.customerGST) {
      customerState = getStateFromGSTCode(validatedData.customerGST.substring(0, 2));
    }

    // Create invoice with items in a transaction
    console.log('💾 Creating invoice in database...');
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

      // Create invoice items
      await tx.invoiceItem.createMany({
        data: calculations.items.map((item, index) => ({
          invoiceId: newInvoice.id,
          description: validatedData.items[index].description,
          quantity: new Decimal(validatedData.items[index].quantity),
          rate: new Decimal(validatedData.items[index].rate),
          gstRate: new Decimal(validatedData.items[index].gstRate),
          amount: new Decimal(item.amount),
          cgst: new Decimal(item.cgst),
          sgst: new Decimal(item.sgst),
          igst: new Decimal(item.igst),
          totalAmount: new Decimal(item.totalAmount),
        })),
      });

      return newInvoice;
    });

    console.log('✅ Invoice created successfully:', invoice.id);

    return NextResponse.json(
      {
        success: true,
        message: 'Invoice created successfully',
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
    console.error('💥 Unexpected error in invoice creation:', error);
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
    
    return NextResponse.json(
      { error: 'Internal server error occurred while creating invoice' },
      { status: 500 }
    );
  }
}

// GET endpoint for fetching invoices
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

    // Build where clause
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

    // Fetch invoices and count
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
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Invoices fetch error:', error);
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