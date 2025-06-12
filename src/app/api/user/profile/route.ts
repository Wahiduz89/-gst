// src/app/api/user/profile/route.ts - Fixed version

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const profileUpdateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  businessName: z.string().min(2, 'Business name must be at least 2 characters').optional(),
  businessAddress: z.string().min(5, 'Business address must be at least 5 characters').optional(),
  businessState: z.string().min(1, 'Business state is required').optional(),
  businessGST: z.string()
    .refine(
      (val) => val === '' || /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(val),
      'Invalid GST number format'
    )
    .optional()
    .transform(val => val === '' ? null : val),
  businessPhone: z.string()
    .refine(
      (val) => val === '' || /^[6-9]\d{9}$/.test(val),
      'Invalid phone number format'
    )
    .optional()
    .transform(val => val === '' ? null : val),
  businessEmail: z.string()
    .refine(
      (val) => val === '' || z.string().email().safeParse(val).success,
      'Invalid email address'
    )
    .optional()
    .transform(val => val === '' ? null : val),
});

export async function GET(request: NextRequest) {
  try {
    console.log('Profile API: GET request received');
    
    const session = await getServerSession(authOptions);
    console.log('Profile API: Session retrieved', session ? 'Found' : 'Not found');
    
    if (!session?.user?.id) {
      console.log('Profile API: No session or user ID');
      return NextResponse.json(
        { error: 'Unauthorized access - Please sign in' },
        { status: 401 }
      );
    }

    console.log('Profile API: Looking up user with ID:', session.user.id);
    
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        businessName: true,
        businessAddress: true,
        businessGST: true,
        businessPhone: true,
        businessEmail: true,
        businessState: true,
        createdAt: true,
      }
    });

    console.log('Profile API: User lookup result', user ? 'Found' : 'Not found');

    if (!user) {
      console.log('Profile API: User not found in database');
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    console.log('Profile API: Returning user data');
    return NextResponse.json({ user });
  } catch (error) {
    console.error('Profile API: GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error occurred while fetching profile' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    console.log('Profile API: PATCH request received');
    
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      console.log('Profile API: No session for PATCH request');
      return NextResponse.json(
        { error: 'Unauthorized access - Please sign in' },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log('Profile API: Request body received');
    
    // Validate input with detailed error reporting
    const validationResult = profileUpdateSchema.safeParse(body);
    
    if (!validationResult.success) {
      const errorMessages = validationResult.error.errors.map(err => 
        `${err.path.join('.')}: ${err.message}`
      ).join(', ');
      
      console.error('Profile API: Validation errors:', validationResult.error.errors);
      
      return NextResponse.json(
        { error: `Validation failed: ${errorMessages}` },
        { status: 400 }
      );
    }
    
    const validatedData = validationResult.data;
    
    // Create update object with only defined values
    const updateData: any = {};
    Object.entries(validatedData).forEach(([key, value]) => {
      if (value !== undefined) {
        updateData[key] = value;
      }
    });
    
    console.log('Profile API: Updating user with data:', Object.keys(updateData));
    
    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        businessName: true,
        businessAddress: true,
        businessGST: true,
        businessPhone: true,
        businessEmail: true,
        businessState: true,
      }
    });

    console.log('Profile API: User updated successfully');
    
    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Profile API: PATCH error:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: `Database error: ${error.message}` },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error occurred while updating profile' },
      { status: 500 }
    );
  }
}