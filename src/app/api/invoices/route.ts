// src/app/api/invoices/route.ts - Production Ready API

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateInvoiceNumber } from '@/lib/invoice';
import { z } from 'zod';
import { Prisma } from '@prisma/client';

// Enhanced validation schema
const invoiceItemSchema = z.object({
  description: z.string().min(1, "Description is required"),
  quantity: z.number().positive("Quantity must be positive"),
  rate: z.number().min(0, "Rate cannot be negative"),
  amount: z.number().min(0),
  gstRate: z.number().min(0).max(100),
  cgst: z.number().min(0),
  sgst: z.number().min(0),
  igst: z.number().min(0),
  totalAmount: z.number().min(0),
});

const createInvoiceSchema = z.object({
  customerId: z.string().optional(),
  customerName: z.string().min(1, "Customer name is required"),
  customerGST: z.string().optional(),
  customerAddress: z.string().min(1, "Customer address is required"),
  customerPhone: z.string().optional(),
  customerEmail: z.string().email().optional().or(z.literal('')),
  customerState: z.string().min(1, "Customer state is required"),
  invoiceDate: z.string().datetime(),
  dueDate: z.string().datetime().optional(),
  items: z.array(invoiceItemSchema).min(1, "At least one item is required"),
  termsConditions: z.string().optional(),
  notes: z.string().optional(),
});

// GET endpoint with proper error handling
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10')));
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'ALL';
    const paymentStatus = searchParams.get('paymentStatus') || 'ALL';
    const sortField = searchParams.get('sortField') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const skip = (page - 1) * limit;

    // Build where clause with proper typing
    const where: Prisma.InvoiceWhereInput = {
      userId: session.user.id,
    };

    // Handle status filter
    if (status !== 'ALL' && ['DRAFT', 'GENERATED', 'CANCELLED'].includes(status)) {
      where.status = status as Prisma.EnumInvoiceStatusFilter;
    }

    // Handle payment status filter (if implemented)
    if (paymentStatus !== 'ALL' && ['PENDING', 'PARTIAL', 'PAID'].includes(paymentStatus)) {
      where.paymentStatus = paymentStatus as any; // Add proper typing when payment status is implemented
    }

    // Add search filter
    if (search.trim()) {
      where.OR = [
        { invoiceNumber: { contains: search, mode: 'insensitive' } },
        { customerName: { contains: search, mode: 'insensitive' } },
        { customerGST: { contains: search, mode: 'insensitive' } },
        { customerEmail: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Build orderBy with validation
    const validSortFields = ['invoiceNumber', 'customerName', 'totalAmount', 'createdAt', 'status', 'invoiceDate'];
    const orderBy: Prisma.InvoiceOrderByWithRelationInput = validSortFields.includes(sortField)
      ? { [sortField]: sortOrder === 'asc' ? 'asc' : 'desc' }
      : { createdAt: 'desc' };

    // Execute queries with error handling
    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          customer: {
            select: {
              name: true,
              gstNumber: true,
              email: true,
              phone: true,
            },
          },
          items: {
            select: {
              id: true,
              description: true,
              quantity: true,
              rate: true,
              amount: true,
              gstRate: true,
              totalAmount: true,
            },
            orderBy: { createdAt: 'asc' },
          },
          _count: {
            select: { items: true },
          },
        },
      }),
      prisma.invoice.count({ where }),
    ]);

    // Format response with proper decimal handling
    const formattedInvoices = invoices.map(invoice => ({
      ...invoice,
      subtotal: invoice.subtotal.toString(),
      cgst: invoice.cgst.toString(),
      sgst: invoice.sgst.toString(),
      igst: invoice.igst.toString(),
      totalAmount: invoice.totalAmount.toString(),
      paidAmount: invoice.paidAmount?.toString() || '0',
      items: invoice.items.map(item => ({
        ...item,
        quantity: item.quantity.toString(),
        rate: item.rate.toString(),
        amount: item.amount.toString(),
        gstRate: item.gstRate.toString(),
        totalAmount: item.totalAmount.toString(),
      })),
    }));

    return NextResponse.json({
      invoices: formattedInvoices,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
        hasMore: skip + limit < total,
      },
    });
  } catch (error) {
    console.error('Invoice fetch error:', error);
    
    // Detailed error response for debugging (remove in production)
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json(
        { 
          error: 'Failed to fetch invoices',
          details: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
}

// POST endpoint for creating invoices
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // Validate request body
    const validatedData = createInvoiceSchema.parse(body);

    // Fetch user details with new fields
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        businessState: true,
        businessName: true,
        businessGST: true,
        businessPAN: true,
        businessAddress: true,
        businessPhone: true,
        businessEmail: true,
        businessLogo: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Validate business details
    if (!user.businessName || !user.businessAddress) {
      return NextResponse.json(
        { error: 'Please complete your business settings before creating invoices' },
        { status: 400 }
      );
    }

    // Generate invoice number
    const invoiceNumber = await generateInvoiceNumber();

    // Calculate totals with proper decimal handling
    const subtotal = validatedData.items.reduce((sum, item) => sum + item.amount, 0);
    const cgst = validatedData.items.reduce((sum, item) => sum + item.cgst, 0);
    const sgst = validatedData.items.reduce((sum, item) => sum + item.sgst, 0);
    const igst = validatedData.items.reduce((sum, item) => sum + item.igst, 0);
    const totalAmount = validatedData.items.reduce((sum, item) => sum + item.totalAmount, 0);

    const isInterState = user.businessState.toLowerCase() !== validatedData.customerState.toLowerCase();

    // Create invoice with transaction for data integrity
    const invoice = await prisma.$transaction(async (tx) => {
      return await tx.invoice.create({
        data: {
          invoiceNumber,
          invoiceDate: new Date(validatedData.invoiceDate),
          dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : null,
          userId: session.user.id,
          customerId: validatedData.customerId || null,
          customerName: validatedData.customerName,
          customerGST: validatedData.customerGST || null,
          customerAddress: validatedData.customerAddress,
          customerPhone: validatedData.customerPhone || null,
          customerEmail: validatedData.customerEmail || null,
          businessState: user.businessState,
          customerState: validatedData.customerState,
          subtotal: new Prisma.Decimal(subtotal),
          cgst: new Prisma.Decimal(cgst),
          sgst: new Prisma.Decimal(sgst),
          igst: new Prisma.Decimal(igst),
          totalAmount: new Prisma.Decimal(totalAmount),
          isInterState,
          status: 'GENERATED',
          termsConditions: validatedData.termsConditions || null,
          notes: validatedData.notes || null,
          paymentStatus: 'PENDING',
          items: {
            create: validatedData.items.map(item => ({
              description: item.description,
              quantity: new Prisma.Decimal(item.quantity),
              rate: new Prisma.Decimal(item.rate),
              amount: new Prisma.Decimal(item.amount),
              gstRate: new Prisma.Decimal(item.gstRate),
              cgst: new Prisma.Decimal(item.cgst),
              sgst: new Prisma.Decimal(item.sgst),
              igst: new Prisma.Decimal(item.igst),
              totalAmount: new Prisma.Decimal(item.totalAmount),
            })),
          },
        },
        include: {
          items: true,
          customer: true,
        },
      });
    });

    // Format response
    const formattedInvoice = {
      ...invoice,
      subtotal: invoice.subtotal.toString(),
      cgst: invoice.cgst.toString(),
      sgst: invoice.sgst.toString(),
      igst: invoice.igst.toString(),
      totalAmount: invoice.totalAmount.toString(),
      paidAmount: invoice.paidAmount.toString(),
      items: invoice.items.map(item => ({
        ...item,
        quantity: item.quantity.toString(),
        rate: item.rate.toString(),
        amount: item.amount.toString(),
        gstRate: item.gstRate.toString(),
        cgst: item.cgst.toString(),
        sgst: item.sgst.toString(),
        igst: item.igst.toString(),
        totalAmount: item.totalAmount.toString(),
      })),
    };

    return NextResponse.json(formattedInvoice, { status: 201 });
  } catch (error) {
    console.error('Invoice creation error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Validation error', 
          details: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return NextResponse.json(
          { error: 'Invoice number already exists' },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to create invoice' },
      { status: 500 }
    );
  }
}