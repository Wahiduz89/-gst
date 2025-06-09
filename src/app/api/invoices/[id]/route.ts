// src/app/api/invoices/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { calculateInvoiceTotals } from '@/lib/utils';
import { Decimal } from '@prisma/client/runtime/library';

const invoiceUpdateSchema = z.object({
  customerName: z.string().min(2).optional(),
  customerGST: z.string()
    .regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Invalid GST number')
    .optional()
    .nullable()
    .or(z.literal('')),
  customerAddress: z.string().min(5).optional(),
  customerPhone: z.string()
    .regex(/^[6-9]\d{9}$/, 'Invalid phone number')
    .optional()
    .nullable()
    .or(z.literal('')),
  customerEmail: z.string().email('Invalid email').optional().nullable().or(z.literal('')),
  invoiceDate: z.string().datetime().optional(),
  dueDate: z.string().datetime().optional().nullable(),
  isInterState: z.boolean().optional(),
  termsConditions: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  items: z.array(z.object({
    description: z.string().min(1),
    quantity: z.number().positive(),
    rate: z.number().positive(),
    gstRate: z.number().min(0).max(28),
  })).optional(),
  status: z.enum(['DRAFT', 'GENERATED', 'CANCELLED']).optional(),
});

// GET - Fetch single invoice with items
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getAuthSession();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const invoice = await prisma.invoice.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      include: {
        items: {
          orderBy: {
            id: 'asc',
          },
        },
        customer: true,
        user: {
          select: {
            businessName: true,
            businessAddress: true,
            businessGST: true,
            businessPhone: true,
            businessEmail: true,
          },
        },
      },
    });

    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    // Convert Decimal values to strings for JSON serialization
    const serializedInvoice = {
      ...invoice,
      subtotal: invoice.subtotal.toString(),
      cgst: invoice.cgst.toString(),
      sgst: invoice.sgst.toString(),
      igst: invoice.igst.toString(),
      totalAmount: invoice.totalAmount.toString(),
      items: invoice.items.map(item => ({
        ...item,
        quantity: item.quantity.toString(),
        rate: item.rate.toString(),
        gstRate: item.gstRate.toString(),
        amount: item.amount.toString(),
        cgst: item.cgst.toString(),
        sgst: item.sgst.toString(),
        igst: item.igst.toString(),
        totalAmount: item.totalAmount.toString(),
      })),
    };

    return NextResponse.json(serializedInvoice);
  } catch (error) {
    console.error('Invoice fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoice' },
      { status: 500 }
    );
  }
}

// PATCH - Update invoice (only if status is DRAFT)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const validatedData = invoiceUpdateSchema.parse(body);
    
    // Check if invoice exists and is in DRAFT status
    const existingInvoice = await prisma.invoice.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });
    
    if (!existingInvoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }
    
    // Only allow editing DRAFT invoices (unless just changing status)
    if (existingInvoice.status !== 'DRAFT' && !validatedData.status) {
      return NextResponse.json(
        { error: 'Only draft invoices can be edited' },
        { status: 400 }
      );
    }
    
    // If updating items, recalculate totals
    let calculations;
    if (validatedData.items) {
      calculations = calculateInvoiceTotals(
        validatedData.items,
        validatedData.isInterState ?? existingInvoice.isInterState
      );
    }
    
    // Update invoice in a transaction
    const updatedInvoice = await prisma.$transaction(async (tx) => {
      // Update invoice
      const invoice = await tx.invoice.update({
        where: { id: params.id },
        data: {
          ...(validatedData.customerName && { customerName: validatedData.customerName }),
          ...(validatedData.customerAddress && { customerAddress: validatedData.customerAddress }),
          ...(validatedData.customerGST !== undefined && { customerGST: validatedData.customerGST || null }),
          ...(validatedData.customerPhone !== undefined && { customerPhone: validatedData.customerPhone || null }),
          ...(validatedData.customerEmail !== undefined && { customerEmail: validatedData.customerEmail || null }),
          ...(validatedData.invoiceDate && { invoiceDate: new Date(validatedData.invoiceDate) }),
          ...(validatedData.dueDate !== undefined && { dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : null }),
          ...(validatedData.isInterState !== undefined && { isInterState: validatedData.isInterState }),
          ...(validatedData.termsConditions !== undefined && { termsConditions: validatedData.termsConditions || null }),
          ...(validatedData.notes !== undefined && { notes: validatedData.notes || null }),
          ...(validatedData.status && { status: validatedData.status }),
          ...(calculations && {
            subtotal: new Decimal(calculations.subtotal),
            cgst: new Decimal(calculations.cgst),
            sgst: new Decimal(calculations.sgst),
            igst: new Decimal(calculations.igst),
            totalAmount: new Decimal(calculations.totalAmount),
          }),
        },
      });
      
      // If items were updated, replace them
      if (validatedData.items && calculations) {
        // Delete existing items
        await tx.invoiceItem.deleteMany({
          where: { invoiceId: params.id },
        });
        
        // Create new items
        await tx.invoiceItem.createMany({
          data: calculations.items.map(item => ({
            invoiceId: params.id,
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
      }
      
      return invoice;
    });
    
    return NextResponse.json({
      success: true,
      message: 'Invoice updated successfully',
      invoice: {
        ...updatedInvoice,
        subtotal: updatedInvoice.subtotal.toString(),
        cgst: updatedInvoice.cgst.toString(),
        sgst: updatedInvoice.sgst.toString(),
        igst: updatedInvoice.igst.toString(),
        totalAmount: updatedInvoice.totalAmount.toString(),
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Invoice update error:', error);
    return NextResponse.json(
      { error: 'Failed to update invoice' },
      { status: 500 }
    );
  }
}

// DELETE - Delete invoice (only if status is DRAFT)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getAuthSession();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if invoice exists and belongs to user
    const invoice = await prisma.invoice.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });
    
    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }
    
    // Only allow deleting DRAFT invoices
    if (invoice.status !== 'DRAFT') {
      return NextResponse.json(
        { error: 'Only draft invoices can be deleted' },
        { status: 400 }
      );
    }
    
    // Delete invoice (items will be cascade deleted)
    await prisma.invoice.delete({
      where: { id: params.id },
    });
    
    return NextResponse.json({
      success: true,
      message: 'Invoice deleted successfully',
    });
  } catch (error) {
    console.error('Invoice deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete invoice' },
      { status: 500 }
    );
  }
}