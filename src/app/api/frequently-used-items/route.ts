// src/app/api/frequently-used-items/route.ts
// API endpoints for managing frequently used items with HSN/SAC codes

import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const frequentlyUsedItemSchema = z.object({
  itemName: z.string().min(2, 'Item name must be at least 2 characters'),
  hsnSacCode: z.string().optional(),
  hsnSacType: z.enum(['HSN', 'SAC']).default('HSN'),
  defaultRate: z.number().positive().optional(),
  defaultGstRate: z.number().min(0).max(28).default(18),
  unitOfMeasurement: z.string().default('NOS'),
  category: z.string().optional(),
});

// GET - Fetch user's frequently used items
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
    const search = searchParams.get('search') || '';
    const limit = parseInt(searchParams.get('limit') || '20');
    const category = searchParams.get('category');

    const where = {
      userId: session.user.id,
      ...(search && {
        OR: [
          { itemName: { contains: search, mode: 'insensitive' as const } },
          { hsnSacCode: { contains: search, mode: 'insensitive' as const } },
          { category: { contains: search, mode: 'insensitive' as const } },
        ]
      }),
      ...(category && { category: { contains: category, mode: 'insensitive' as const } }),
    };

    const items = await prisma.frequentlyUsedItem.findMany({
      where,
      take: limit,
      orderBy: [
        { usageCount: 'desc' },
        { lastUsedAt: 'desc' },
        { itemName: 'asc' }
      ]
    });

    const total = await prisma.frequentlyUsedItem.count({ where });

    return NextResponse.json({
      success: true,
      data: items,
      total,
      pagination: {
        limit,
        total,
        hasMore: total > limit
      }
    });

  } catch (error) {
    console.error('Frequently used items fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch frequently used items' },
      { status: 500 }
    );
  }
}

// POST - Add or update frequently used item
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
    const validatedData = frequentlyUsedItemSchema.parse(body);

    // Check if item already exists for this user
    const existingItem = await prisma.frequentlyUsedItem.findFirst({
      where: {
        userId: session.user.id,
        itemName: { equals: validatedData.itemName, mode: 'insensitive' },
      }
    });

    let result;

    if (existingItem) {
      // Update existing item - increment usage count and update details
      result = await prisma.frequentlyUsedItem.update({
        where: { id: existingItem.id },
        data: {
          ...validatedData,
          usageCount: existingItem.usageCount + 1,
          lastUsedAt: new Date(),
        }
      });
    } else {
      // Create new frequently used item
      result = await prisma.frequentlyUsedItem.create({
        data: {
          userId: session.user.id,
          ...validatedData,
          usageCount: 1,
          lastUsedAt: new Date(),
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: existingItem ? 'Item updated successfully' : 'Item added to frequently used',
      data: result
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Frequently used item creation error:', error);
    return NextResponse.json(
      { error: 'Failed to save frequently used item' },
      { status: 500 }
    );
  }
}

// src/app/api/frequently-used-items/[id]/route.ts
// Individual frequently used item management

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
    const updateData = frequentlyUsedItemSchema.partial().parse(body);

    // Verify item belongs to user
    const existingItem = await prisma.frequentlyUsedItem.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      }
    });

    if (!existingItem) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }

    const updatedItem = await prisma.frequentlyUsedItem.update({
      where: { id: params.id },
      data: updateData
    });

    return NextResponse.json({
      success: true,
      message: 'Item updated successfully',
      data: updatedItem
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Frequently used item update error:', error);
    return NextResponse.json(
      { error: 'Failed to update item' },
      { status: 500 }
    );
  }
}

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

    // Verify item belongs to user
    const existingItem = await prisma.frequentlyUsedItem.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      }
    });

    if (!existingItem) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }

    await prisma.frequentlyUsedItem.delete({
      where: { id: params.id }
    });

    return NextResponse.json({
      success: true,
      message: 'Item deleted successfully'
    });

  } catch (error) {
    console.error('Frequently used item deletion error:', error);
    return NextResponse.json(
      { error: 'Failed to delete item' },
      { status: 500 }
    );
  }
}