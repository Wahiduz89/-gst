// src/app/api/business/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { userService } from '@/lib/db-service';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const businessInfo = await userService.getBusinessInfo(session.user.id);
    return NextResponse.json(businessInfo);
  } catch (error) {
    console.error('Business GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch business information' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();
    const updated = await userService.updateBusinessInfo(session.user.id, data);
    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Business PUT error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update business information' },
      { status: 400 }
    );
  }
}

