import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dateRange = searchParams.get('dateRange') || '30d';
    const warehouse = searchParams.get('warehouse') || 'all';

    // Mock data - in production, fetch from database
    const stats = {
      totalStockValue: {
        value: 1420000,
        change: 5.2,
        trend: 'up',
        currency: 'USD'
      },
      stockTurnover: {
        value: 6.8,
        change: 0.3,
        trend: 'up',
        unit: 'x'
      },
      daysOnHand: {
        value: 53.7,
        change: -2.1,
        trend: 'down',
        unit: 'days'
      },
      stockoutRisk: {
        value: 12,
        change: 0,
        trend: 'stable',
        unit: 'items'
      }
    };

    return NextResponse.json({
      success: true,
      data: {
        stats,
        dateRange,
        warehouse,
        lastUpdated: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error fetching inventory stats:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch inventory statistics' 
      },
      { status: 500 }
    );
  }
}
