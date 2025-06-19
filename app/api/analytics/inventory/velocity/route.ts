import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const type = searchParams.get('type') || 'fast'; // 'fast' or 'slow'
    const warehouse = searchParams.get('warehouse') || 'all';

    // Mock data for top moving items
    const fastMovingItems = [
      { 
        id: 1, 
        name: 'Wireless Headphones Pro', 
        sku: 'WH-001', 
        velocity: 85, 
        stock: 120, 
        reorderPoint: 50, 
        status: 'normal',
        dailyUsage: 12.5,
        daysOfStock: 9.6,
        category: 'Electronics'
      },
      { 
        id: 2, 
        name: 'Smart Fitness Tracker', 
        sku: 'FT-205', 
        velocity: 78, 
        stock: 45, 
        reorderPoint: 60, 
        status: 'low',
        dailyUsage: 8.9,
        daysOfStock: 5.1,
        category: 'Wearables'
      },
      { 
        id: 3, 
        name: 'Bluetooth Speaker', 
        sku: 'BS-102', 
        velocity: 72, 
        stock: 89, 
        reorderPoint: 40, 
        status: 'normal',
        dailyUsage: 7.2,
        daysOfStock: 12.4,
        category: 'Audio'
      },
      { 
        id: 4, 
        name: 'USB-C Cable 2m', 
        sku: 'CB-301', 
        velocity: 68, 
        stock: 25, 
        reorderPoint: 30, 
        status: 'critical',
        dailyUsage: 6.8,
        daysOfStock: 3.7,
        category: 'Accessories'
      },
      { 
        id: 5, 
        name: 'Laptop Stand Adjustable', 
        sku: 'LS-404', 
        velocity: 64, 
        stock: 156, 
        reorderPoint: 80, 
        status: 'normal',
        dailyUsage: 6.4,
        daysOfStock: 24.4,
        category: 'Accessories'
      }
    ];

    const slowMovingItems = [
      { 
        id: 1, 
        name: 'Legacy Monitor 19"', 
        sku: 'LM-901', 
        daysInStock: 180, 
        stock: 15, 
        lastSold: '2024-03-15',
        velocity: 2,
        category: 'Monitors',
        avgMonthlySales: 0.5,
        recommendedAction: 'Clearance sale'
      },
      { 
        id: 2, 
        name: 'Old Router Model', 
        sku: 'OR-702', 
        daysInStock: 150, 
        stock: 8, 
        lastSold: '2024-04-02',
        velocity: 3,
        category: 'Networking',
        avgMonthlySales: 0.8,
        recommendedAction: 'Return to supplier'
      },
      { 
        id: 3, 
        name: 'Discontinued Keyboard', 
        sku: 'DK-503', 
        daysInStock: 120, 
        stock: 22, 
        lastSold: '2024-04-20',
        velocity: 4,
        category: 'Input Devices',
        avgMonthlySales: 1.2,
        recommendedAction: 'Bundle with popular items'
      },
      { 
        id: 4, 
        name: 'VGA Adapter', 
        sku: 'VA-205', 
        daysInStock: 95, 
        stock: 35, 
        lastSold: '2024-05-10',
        velocity: 5,
        category: 'Adapters',
        avgMonthlySales: 2.1,
        recommendedAction: 'Reduce order quantity'
      }
    ];

    const items = type === 'fast' ? fastMovingItems : slowMovingItems;
    const limitedItems = items.slice(0, limit);

    // Calculate summary statistics
    const summary = type === 'fast' ? {
      averageVelocity: Math.round(fastMovingItems.reduce((sum, item) => sum + item.velocity, 0) / fastMovingItems.length),
      lowStockCount: fastMovingItems.filter(item => item.status === 'low' || item.status === 'critical').length,
      totalStockValue: 245600, // Mock value
      criticalItems: fastMovingItems.filter(item => item.status === 'critical').length
    } : {
      averageDaysInStock: Math.round(slowMovingItems.reduce((sum, item) => sum + item.daysInStock, 0) / slowMovingItems.length),
      totalValue: 85400, // Mock value
      obsolescenceRisk: slowMovingItems.filter(item => item.daysInStock > 120).length,
      clearanceRequired: slowMovingItems.filter(item => item.recommendedAction === 'Clearance sale').length
    };

    return NextResponse.json({
      success: true,
      data: {
        items: limitedItems,
        summary,
        type,
        warehouse,
        totalCount: items.length,
        lastUpdated: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error fetching item velocity data:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch item velocity data' 
      },
      { status: 500 }
    );
  }
}
