import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dateRange = searchParams.get('dateRange') || '30d';
    const warehouse = searchParams.get('warehouse') || 'all';

    // Mock data - in production, fetch from database with actual date filtering
    const stockMovementData = [
      { 
        date: '2024-06-01', 
        inbound: 450, 
        outbound: 320, 
        net: 130, 
        stock: 2450,
        adjustments: 10,
        transfers: 20
      },
      { 
        date: '2024-06-02', 
        inbound: 380, 
        outbound: 420, 
        net: -40, 
        stock: 2410,
        adjustments: -5,
        transfers: 15
      },
      { 
        date: '2024-06-03', 
        inbound: 520, 
        outbound: 380, 
        net: 140, 
        stock: 2550,
        adjustments: 0,
        transfers: 25
      },
      { 
        date: '2024-06-04', 
        inbound: 290, 
        outbound: 450, 
        net: -160, 
        stock: 2390,
        adjustments: -10,
        transfers: 30
      },
      { 
        date: '2024-06-05', 
        inbound: 610, 
        outbound: 320, 
        net: 290, 
        stock: 2680,
        adjustments: 5,
        transfers: 10
      },
      { 
        date: '2024-06-06', 
        inbound: 340, 
        outbound: 490, 
        net: -150, 
        stock: 2530,
        adjustments: 0,
        transfers: 35
      },
      { 
        date: '2024-06-07', 
        inbound: 480, 
        outbound: 380, 
        net: 100, 
        stock: 2630,
        adjustments: 8,
        transfers: 12
      }
    ];

    // Calculate summary statistics
    const totalInbound = stockMovementData.reduce((sum, day) => sum + day.inbound, 0);
    const totalOutbound = stockMovementData.reduce((sum, day) => sum + day.outbound, 0);
    const avgDailyInbound = totalInbound / stockMovementData.length;
    const avgDailyOutbound = totalOutbound / stockMovementData.length;
    const netMovement = totalInbound - totalOutbound;

    return NextResponse.json({
      success: true,
      data: {
        movements: stockMovementData,
        summary: {
          totalInbound,
          totalOutbound,
          avgDailyInbound: Math.round(avgDailyInbound),
          avgDailyOutbound: Math.round(avgDailyOutbound),
          netMovement,
          periodDays: stockMovementData.length
        },
        dateRange,
        warehouse,
        lastUpdated: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error fetching stock movements:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch stock movement data' 
      },
      { status: 500 }
    );
  }
}
