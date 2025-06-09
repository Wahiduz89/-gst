// src/app/api/dashboard/stats/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';
import { startOfMonth, endOfMonth } from 'date-fns';

export async function GET(request: NextRequest) {
  try {
    const session = await getAuthSession();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    // Fetch all statistics in parallel
    const [
      totalInvoices,
      thisMonthInvoices,
      totalCustomers,
      revenueData,
      recentInvoices
    ] = await Promise.all([
      // Total invoice count
      prisma.invoice.count({
        where: { userId }
      }),
      
      // This month's invoice count
      prisma.invoice.count({
        where: {
          userId,
          createdAt: {
            gte: monthStart,
            lte: monthEnd
          }
        }
      }),
      
      // Total customer count
      prisma.customer.count({
        where: { userId }
      }),
      
      // Revenue calculations
      prisma.invoice.aggregate({
        where: { userId },
        _sum: {
          totalAmount: true
        }
      }),
      
      // Recent invoices
      prisma.invoice.findMany({
        where: { userId },
        take: 5,
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          customer: true
        }
      })
    ]);

    // Calculate this month's revenue
    const thisMonthRevenue = await prisma.invoice.aggregate({
      where: {
        userId,
        createdAt: {
          gte: monthStart,
          lte: monthEnd
        }
      },
      _sum: {
        totalAmount: true
      }
    });

    // Calculate growth percentage
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    
    const lastMonthRevenue = await prisma.invoice.aggregate({
      where: {
        userId,
        createdAt: {
          gte: lastMonthStart,
          lte: lastMonthEnd
        }
      },
      _sum: {
        totalAmount: true
      }
    });

    const currentRevenue = Number(thisMonthRevenue._sum.totalAmount || 0);
    const previousRevenue = Number(lastMonthRevenue._sum.totalAmount || 0);
    const revenueGrowth = previousRevenue > 0 
      ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 
      : 0;

    return NextResponse.json({
      stats: {
        totalInvoices,
        thisMonthInvoices,
        totalCustomers,
        totalRevenue: Number(revenueData._sum.totalAmount || 0),
        thisMonthRevenue: currentRevenue,
        revenueGrowth: Math.round(revenueGrowth * 10) / 10
      },
      recentInvoices: recentInvoices.map(invoice => ({
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        customerName: invoice.customerName,
        totalAmount: Number(invoice.totalAmount),
        status: invoice.status,
        createdAt: invoice.createdAt
      }))
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    );
  }
}