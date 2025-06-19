import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dateRange = searchParams.get('dateRange') || '30d';
    const warehouse = searchParams.get('warehouse') || 'all';

    // Mock financial metrics - in production, calculate from sales and cost data
    const financialMetrics = {
      grossMargin: {
        value: 38.1,
        change: 2.3,
        trend: 'up',
        unit: '%',
        target: 35.0
      },
      cogs: {
        value: 650000,
        change: 8.5,
        trend: 'up',
        unit: 'USD',
        previousPeriod: 598000
      },
      roi: {
        value: 24.7,
        change: 1.8,
        trend: 'up',
        unit: '%',
        target: 22.0
      },
      inventoryTurnover: {
        value: 6.8,
        change: 0.3,
        trend: 'up',
        unit: 'x',
        target: 6.0
      },
      carryingCost: {
        value: 142000,
        change: -5.2,
        trend: 'down',
        unit: 'USD',
        percentOfInventory: 10.0
      },
      deadStock: {
        value: 45000,
        change: -12.8,
        trend: 'down',
        unit: 'USD',
        percentOfInventory: 3.2
      }
    };

    // Monthly trend data
    const monthlyTrends = [
      { 
        month: 'Jan',
        revenue: 820000,
        cogs: 580000,
        grossProfit: 240000,
        grossMargin: 29.3,
        inventoryValue: 1380000
      },
      { 
        month: 'Feb',
        revenue: 945000,
        cogs: 620000,
        grossProfit: 325000,
        grossMargin: 34.4,
        inventoryValue: 1420000
      },
      { 
        month: 'Mar',
        revenue: 756000,
        cogs: 485000,
        grossProfit: 271000,
        grossMargin: 35.8,
        inventoryValue: 1350000
      },
      { 
        month: 'Apr',
        revenue: 1120000,
        cogs: 720000,
        grossProfit: 400000,
        grossMargin: 35.7,
        inventoryValue: 1485000
      },
      { 
        month: 'May',
        revenue: 980000,
        cogs: 605000,
        grossProfit: 375000,
        grossMargin: 38.3,
        inventoryValue: 1420000
      },
      { 
        month: 'Jun',
        revenue: 1050000,
        cogs: 650000,
        grossProfit: 400000,
        grossMargin: 38.1,
        inventoryValue: 1420000
      }
    ];

    // Category breakdown
    const categoryBreakdown = [
      {
        category: 'Electronics',
        revenue: 520000,
        cogs: 312000,
        grossProfit: 208000,
        grossMargin: 40.0,
        inventoryValue: 680000,
        turnover: 7.2
      },
      {
        category: 'Accessories',
        revenue: 285000,
        cogs: 171000,
        grossProfit: 114000,
        grossMargin: 40.0,
        inventoryValue: 385000,
        turnover: 5.9
      },
      {
        category: 'Audio',
        revenue: 165000,
        cogs: 115500,
        grossProfit: 49500,
        grossMargin: 30.0,
        inventoryValue: 245000,
        turnover: 6.8
      },
      {
        category: 'Networking',
        revenue: 80000,
        cogs: 51500,
        grossProfit: 28500,
        grossMargin: 35.6,
        inventoryValue: 110000,
        turnover: 4.2
      }
    ];

    return NextResponse.json({
      success: true,
      data: {
        metrics: financialMetrics,
        monthlyTrends,
        categoryBreakdown,
        dateRange,
        warehouse,
        lastUpdated: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error fetching financial metrics:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch financial metrics' 
      },
      { status: 500 }
    );
  }
}
