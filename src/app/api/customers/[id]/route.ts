// src/app/api/customers/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const customerUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  gstNumber: z.string()
    .regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/)
    .optional()
    .nullable()
    .or(z.literal('')),
  address: z.string().min(5).optional(),
  phone: z.string()
    .regex(/^[6-9]\d{9}$/)
    .optional()
    .nullable()
    .or(z.literal('')),
  email: z.string().email().optional().nullable().or(z.literal('')),
  state: z.string().optional(),
});

// GET - Fetch single customer with invoice details
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

    const customer = await prisma.customer.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      include: {
        invoices: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
          select: {
            id: true,
            invoiceNumber: true,
            totalAmount: true,
            status: true,
            createdAt: true,
          },
        },
        _count: {
          select: { invoices: true },
        },
      },
    });

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Calculate total revenue from customer
    const totalRevenue = await prisma.invoice.aggregate({
      where: {
        customerId: params.id,
        userId: session.user.id,
      },
      _sum: {
        totalAmount: true,
      },
    });

    return NextResponse.json({
      ...customer,
      invoiceCount: customer._count.invoices,
      totalRevenue: Number(totalRevenue._sum.totalAmount || 0),
      invoices: customer.invoices.map(invoice => ({
        ...invoice,
        totalAmount: Number(invoice.totalAmount),
      })),
    });
  } catch (error) {
    console.error('Customer fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customer' },
      { status: 500 }
    );
  }
}

// PATCH - Update customer
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
    const validatedData = customerUpdateSchema.parse(body);
    
    // Check if customer exists and belongs to user
    const existingCustomer = await prisma.customer.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });
    
    if (!existingCustomer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }
    
    // If GST number is being updated, check for duplicates
    if (validatedData.gstNumber && validatedData.gstNumber !== existingCustomer.gstNumber) {
      const duplicateCustomer = await prisma.customer.findFirst({
        where: {
          userId: session.user.id,
          gstNumber: validatedData.gstNumber,
          id: { not: params.id },
        },
      });
      
      if (duplicateCustomer) {
        return NextResponse.json(
          { error: 'Another customer with this GST number already exists' },
          { status: 400 }
        );
      }
    }
    
    // Extract state from GST if GST is updated and state is not provided
    let state = validatedData.state;
    if (validatedData.gstNumber && !state) {
      const stateCode = validatedData.gstNumber.substring(0, 2);
      state = getStateFromCode(stateCode);
    }
    
    // Update customer
    const updatedCustomer = await prisma.customer.update({
      where: { id: params.id },
      data: {
        ...(validatedData.name && { name: validatedData.name }),
        ...(validatedData.address && { address: validatedData.address }),
        ...(validatedData.gstNumber !== undefined && { gstNumber: validatedData.gstNumber || null }),
        ...(validatedData.phone !== undefined && { phone: validatedData.phone || null }),
        ...(validatedData.email !== undefined && { email: validatedData.email || null }),
        ...(state && { state }),
      },
    });
    
    return NextResponse.json({
      success: true,
      message: 'Customer updated successfully',
      customer: updatedCustomer,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Customer update error:', error);
    return NextResponse.json(
      { error: 'Failed to update customer' },
      { status: 500 }
    );
  }
}

// DELETE - Delete customer (only if no invoices)
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

    // Check if customer exists and has invoices
    const customer = await prisma.customer.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      include: {
        _count: {
          select: { invoices: true },
        },
      },
    });
    
    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }
    
    if (customer._count.invoices > 0) {
      return NextResponse.json(
        { error: 'Cannot delete customer with existing invoices' },
        { status: 400 }
      );
    }
    
    // Delete customer
    await prisma.customer.delete({
      where: { id: params.id },
    });
    
    return NextResponse.json({
      success: true,
      message: 'Customer deleted successfully',
    });
  } catch (error) {
    console.error('Customer deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete customer' },
      { status: 500 }
    );
  }
}

// Helper function to map GST state codes to state names
function getStateFromCode(code: string): string {
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
    '37': 'Andhra Pradesh (New)',
    '38': 'Ladakh',
  };
  
  return stateMap[code] || '';
}