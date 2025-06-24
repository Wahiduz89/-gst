// src/app/api/user/profile/route.ts - Updated Profile API with PAN support

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Validation schema for profile updates
const updateProfileSchema = z.object({
  name: z.string().min(1).optional(),
  businessName: z.string().min(1, "Business name is required"),
  businessAddress: z.string().min(1, "Business address is required"),
  businessGST: z.string()
    .regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, "Invalid GST format")
    .optional()
    .nullable(),
  businessPAN: z.string()
    .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN format")
    .optional()
    .nullable(),
  businessPhone: z.string()
    .regex(/^[6-9]\d{9}$/, "Invalid phone number")
    .optional()
    .nullable(),
  businessEmail: z.string().email("Invalid email format").optional().nullable(),
  businessState: z.string().min(1, "Business state is required"),
});

export async function GET(request: NextRequest) {
  try {
    console.log('Profile API: GET request received');
    
    const session = await getServerSession(authOptions);
    console.log('Profile API: Session retrieved', session ? 'Found' : 'Not found');
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Profile API: Looking up user with ID:', session.user.id);
    
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        businessName: true,
        businessAddress: true,
        businessGST: true,
        businessPAN: true,
        businessPhone: true,
        businessEmail: true,
        businessState: true,
        businessLogo: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    console.log('Profile API: User lookup result', user ? 'Found' : 'Not found');

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    console.log('Profile API: Returning user data');
    return NextResponse.json(user);
  } catch (error) {
    console.error('Profile API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // Remove fields that shouldn't be updated directly
    const { id, email, createdAt, updatedAt, ...updateData } = body;

    // Validate the update data
    const validatedData = updateProfileSchema.parse(updateData);

    // Check if business name is unique (if changed)
    if (validatedData.businessName) {
      const existingBusiness = await prisma.user.findFirst({
        where: {
          businessName: validatedData.businessName,
          id: { not: session.user.id },
        },
      });

      if (existingBusiness) {
        return NextResponse.json(
          { error: 'Business name already exists' },
          { status: 409 }
        );
      }
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...validatedData,
        // Ensure empty strings are converted to null for optional fields
        businessGST: validatedData.businessGST || null,
        businessPAN: validatedData.businessPAN || null,
        businessPhone: validatedData.businessPhone || null,
        businessEmail: validatedData.businessEmail || null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        businessName: true,
        businessAddress: true,
        businessGST: true,
        businessPAN: true,
        businessPhone: true,
        businessEmail: true,
        businessState: true,
        businessLogo: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Profile update error:', error);
    
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

    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}

// Additional endpoint to check business settings completion
export async function HEAD(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse(null, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        businessName: true,
        businessAddress: true,
        businessState: true,
      },
    });

    if (!user || !user.businessName || !user.businessAddress || !user.businessState) {
      return new NextResponse(null, { status: 428 }); // Precondition Required
    }

    return new NextResponse(null, { status: 200 });
  } catch (error) {
    return new NextResponse(null, { status: 500 });
  }
}