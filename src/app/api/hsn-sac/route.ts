// src/app/api/hsn-sac/route.ts
// API endpoints for HSN/SAC code search and management

import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { commonHsnSacCodes, searchHsnSacCodes, getHsnSacByCode } from '@/lib/hsn-sac-data';

const searchSchema = z.object({
  query: z.string().min(1, 'Search query is required'),
  type: z.enum(['HSN', 'SAC']).optional(),
  category: z.string().optional(),
  limit: z.string().transform(val => parseInt(val)).optional(),
});

// GET - Search HSN/SAC codes
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
    const query = searchParams.get('query');
    const type = searchParams.get('type') as 'HSN' | 'SAC' | null;
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!query) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    // Search in database first for user-specific and custom codes
    const dbResults = await prisma.hsnSacCode.findMany({
      where: {
        AND: [
          { isActive: true },
          ...(type ? [{ type }] : []),
          ...(category ? [{ category: { contains: category, mode: 'insensitive' as const } }] : []),
          {
            OR: [
              { code: { contains: query, mode: 'insensitive' as const } },
              { description: { contains: query, mode: 'insensitive' as const } },
              { category: { contains: query, mode: 'insensitive' as const } },
              { subCategory: { contains: query, mode: 'insensitive' as const } },
            ]
          }
        ]
      },
      take: limit,
      orderBy: [
        { code: 'asc' },
        { description: 'asc' }
      ]
    });

    // Search in static data as fallback
    const staticResults = searchHsnSacCodes(query, type).slice(0, limit - dbResults.length);

    // Combine and deduplicate results
    const allResults = [...dbResults, ...staticResults];
    const uniqueResults = allResults.filter((item, index, self) => 
      index === self.findIndex(t => t.code === item.code)
    );

    return NextResponse.json({
      success: true,
      data: uniqueResults.slice(0, limit),
      total: uniqueResults.length,
    });

  } catch (error) {
    console.error('HSN/SAC search error:', error);
    return NextResponse.json(
      { error: 'Failed to search HSN/SAC codes' },
      { status: 500 }
    );
  }
}

// POST - Add custom HSN/SAC code (for admin or future feature)
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
    
    const hsnSacSchema = z.object({
      code: z.string().min(4, 'Code must be at least 4 characters'),
      type: z.enum(['HSN', 'SAC']),
      description: z.string().min(5, 'Description must be at least 5 characters'),
      category: z.string().min(2, 'Category is required'),
      subCategory: z.string().optional(),
      gstRate: z.number().min(0).max(28).optional(),
      unitOfMeasurement: z.string().default('NOS'),
    });

    const validatedData = hsnSacSchema.parse(body);

    // Check if code already exists
    const existingCode = await prisma.hsnSacCode.findUnique({
      where: { code: validatedData.code }
    });

    if (existingCode) {
      return NextResponse.json(
        { error: 'HSN/SAC code already exists' },
        { status: 400 }
      );
    }

    // Create new HSN/SAC code
    const newCode = await prisma.hsnSacCode.create({
      data: validatedData
    });

    return NextResponse.json({
      success: true,
      message: 'HSN/SAC code created successfully',
      data: newCode
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('HSN/SAC creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create HSN/SAC code' },
      { status: 500 }
    );
  }
}