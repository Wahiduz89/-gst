// src/app/api/customers/route.ts - Fixed version

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const customerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  gstNumber: z.string()
    .regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Invalid GST number')
    .optional()
    .nullable()
    .or(z.literal('')),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  phone: z.string()
    .regex(/^[6-9]\d{9}$/, 'Invalid phone number')
    .optional()
    .nullable()
    .or(z.literal('')),
  email: z.string().email('Invalid email').optional().nullable().or(z.literal('')),
  state: z.string().optional().default('Assam'),
});

// GET - Fetch customers with pagination and search
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Customer GET: Starting request...');
    
    const session = await getServerSession(authOptions);
    console.log('🔐 Session check:', session ? 'Found' : 'Not found');
    
    if (!session?.user?.id) {
      console.log('❌ No authenticated user');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';

    const skip = (page - 1) * limit;

    // Build where clause
    const where = {
      userId: session.user.id,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { gstNumber: { contains: search, mode: 'insensitive' as const } },
          { email: { contains: search, mode: 'insensitive' as const } },
          { phone: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    };

    // Fetch customers and count
    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          _count: {
            select: { invoices: true },
          },
        },
      }),
      prisma.customer.count({ where }),
    ]);

    console.log(`✅ Found ${customers.length} customers`);

    return NextResponse.json({
      customers: customers.map((customer: any) => ({
        ...customer,
        invoiceCount: customer._count.invoices,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('❌ Customers fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customers' },
      { status: 500 }
    );
  }
}

// POST - Create new customer
export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Customer POST: Starting creation...');
    
    const session = await getServerSession(authOptions);
    console.log('🔐 Session check:', session ? 'Found' : 'Not found');
    
    if (!session?.user?.id) {
      console.log('❌ No authenticated user');
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    let body;
    try {
      body = await request.json();
      console.log('📦 Request body received:', Object.keys(body));
    } catch (parseError) {
      console.error('❌ Failed to parse request body:', parseError);
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }
    
    // Validate input
    console.log('🔍 Validating input...');
    let validatedData;
    try {
      validatedData = customerSchema.parse(body);
      console.log('✅ Validation successful');
    } catch (validationError) {
      console.error('❌ Validation failed:', validationError);
      if (validationError instanceof z.ZodError) {
        return NextResponse.json(
          { 
            error: 'Validation failed', 
            details: validationError.errors.map(err => ({
              field: err.path.join('.'),
              message: err.message
            }))
          },
          { status: 400 }
        );
      }
      throw validationError;
    }
    
    // Extract state from GST number if available
    let state = validatedData.state;
    if (validatedData.gstNumber && validatedData.gstNumber.length >= 2) {
      const stateCode = validatedData.gstNumber.substring(0, 2);
      const detectedState = getStateFromCode(stateCode);
      if (detectedState) {
        state = detectedState;
      }
    }
    
    // Check if customer with same GST already exists (only if GST is provided)
    if (validatedData.gstNumber && validatedData.gstNumber.trim() !== '') {
      console.log('🔍 Checking for duplicate GST...');
      const existingCustomer = await prisma.customer.findFirst({
        where: {
          userId: session.user.id,
          gstNumber: validatedData.gstNumber,
        },
      });
      
      if (existingCustomer) {
        console.log('❌ Duplicate GST found');
        return NextResponse.json(
          { error: 'Customer with this GST number already exists' },
          { status: 400 }
        );
      }
    }
    
    // Create customer
    console.log('💾 Creating customer in database...');
    const customer = await prisma.customer.create({
      data: {
        userId: session.user.id,
        name: validatedData.name,
        gstNumber: validatedData.gstNumber && validatedData.gstNumber.trim() !== '' ? validatedData.gstNumber : null,
        address: validatedData.address,
        phone: validatedData.phone && validatedData.phone.trim() !== '' ? validatedData.phone : null,
        email: validatedData.email && validatedData.email.trim() !== '' ? validatedData.email : null,
        state: state || 'Assam',
      },
    });
    
    console.log('✅ Customer created successfully:', customer.id);
    
    return NextResponse.json(
      {
        success: true,
        message: 'Customer created successfully',
        customer,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('💥 Customer creation error:', error);
    
    // Handle specific database errors
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json(
          { error: 'Customer with this information already exists' },
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        { error: `Database error: ${error.message}` },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create customer' },
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