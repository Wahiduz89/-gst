// src/app/api/user/profile/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const profileUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  businessName: z.string().min(2).optional(),
  businessAddress: z.string().min(5).optional(),
  businessGST: z.string().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/).optional().nullable(),
  businessPhone: z.string().regex(/^[6-9]\d{9}$/).optional().nullable(),
  businessEmail: z.string().email().optional().nullable(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getAuthSession();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

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
        businessLogo: true,
        createdAt: true,
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
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
    const validatedData = profileUpdateSchema.parse(body);
    
    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: validatedData,
      select: {
        id: true,
        email: true,
        name: true,
        businessName: true,
        businessAddress: true,
        businessGST: true,
        businessPhone: true,
        businessEmail: true,
        businessLogo: true,
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}