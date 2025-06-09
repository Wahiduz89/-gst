// src/app/api/invoices/route.ts

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

// GET - Fetch invoices with pagination and filters
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
    const customerId = searchParams.get('customerId') || '';

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
      ...(customerId && { customerId }),
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

// POST - Create new invoice
export async function POST(request: NextRequest) {
  try {
    const session = await getAuthSession();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Validate input
    const validatedData = invoiceSchema.parse(body);
    
    // Verify business information is complete
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        businessName: true,
        businessAddress: true,
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
    const invoiceNumber = generateInvoiceNumber(session.user.id, invoiceCount);

    // Check if invoice number already exists (race condition check)
    const existingInvoice = await prisma.invoice.findFirst({
      where: {
        userId: session.user.id,
        invoiceNumber,
      },
    });

    if (existingInvoice) {
      return NextResponse.json(
        { error: 'Invoice number already exists. Please try again.' },
        { status: 400 }
      );
    }

    // Calculate totals
    const calculations = calculateInvoiceTotals(
      validatedData.items,
      validatedData.isInterState
    );

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
        data: calculations.items.map(item => ({
          invoiceId: newInvoice.id,
          description: item.description,
          quantity: new Decimal(item.quantity),
          rate: new Decimal(item.rate),
          gstRate: new Decimal(item.gstRate),
          amount: new Decimal(item.amount),
          cgst: new Decimal(item.cgst),
          sgst: new Decimal(item.sgst),
          igst: new Decimal(item.igst),
          totalAmount: new Decimal(item.totalAmount),
        })),
      });

      return newInvoice;
    });

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
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Invoice creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create invoice' },
      { status: 500 }
    );
  }
}