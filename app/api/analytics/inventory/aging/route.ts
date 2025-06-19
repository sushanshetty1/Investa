import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const warehouse = searchParams.get('warehouse') || 'all';

    // Mock aging data - in production, calculate from actual stock received dates
    const inventoryAgingData = [
      { 
        range: '0-30 days', 
        ageInDays: { min: 0, max: 30 },
        quantity: 1250, 
        value: 425000, 
        percentage: 68,
        items: [
          { sku: 'WH-001', name: 'Wireless Headphones Pro', quantity: 120, value: 24000, age: 15 },
          { sku: 'FT-205', name: 'Smart Fitness Tracker', quantity: 45, value: 11250, age: 22 },
          { sku: 'BS-102', name: 'Bluetooth Speaker', quantity: 89, value: 17800, age: 8 }
        ]
      },
      { 
        range: '31-60 days', 
        ageInDays: { min: 31, max: 60 },
        quantity: 380, 
        value: 145000, 
        percentage: 21,
        items: [
          { sku: 'CB-301', name: 'USB-C Cable 2m', quantity: 25, value: 625, age: 45 },
          { sku: 'LS-404', name: 'Laptop Stand Adjustable', quantity: 156, value: 31200, age: 52 }
        ]
      },
      { 
        range: '61-90 days', 
        ageInDays: { min: 61, max: 90 },
        quantity: 150, 
        value: 58000, 
        percentage: 8,
        items: [
          { sku: 'KB-505', name: 'Mechanical Keyboard', quantity: 35, value: 10500, age: 75 },
          { sku: 'MS-206', name: 'Wireless Mouse', quantity: 60, value: 4800, age: 68 }
        ]
      },
      { 
        range: '91+ days', 
        ageInDays: { min: 91, max: null },
        quantity: 70, 
        value: 22000, 
        percentage: 3,
        items: [
          { sku: 'LM-901', name: 'Legacy Monitor 19"', quantity: 15, value: 4500, age: 180 },
          { sku: 'OR-702', name: 'Old Router Model', quantity: 8, value: 2400, age: 150 },
          { sku: 'DK-503', name: 'Discontinued Keyboard', quantity: 22, value: 6600, age: 120 }
        ]
      }
    ];

    // Calculate risk analysis
    const riskAnalysis = {
      totalValue: inventoryAgingData.reduce((sum, range) => sum + range.value, 0),
      totalQuantity: inventoryAgingData.reduce((sum, range) => sum + range.quantity, 0),
      obsolescenceRisk: inventoryAgingData
        .filter(range => range.ageInDays.min >= 91)
        .reduce((sum, range) => sum + range.value, 0),
      slowMovingValue: inventoryAgingData
        .filter(range => range.ageInDays.min >= 61)
        .reduce((sum, range) => sum + range.value, 0),
      actionRequired: inventoryAgingData
        .filter(range => range.ageInDays.min >= 91)
        .reduce((sum, range) => sum + range.quantity, 0)
    };

    // Recommendations based on aging analysis
    const recommendations = [
      {
        type: 'pricing',
        priority: 'high',
        title: 'Review pricing strategy for aged items',
        description: 'Consider markdown pricing for items over 90 days old',
        impact: 'Reduce carrying costs and free up working capital'
      },
      {
        type: 'promotion',
        priority: 'medium',
        title: 'Consider promotional campaigns',
        description: 'Bundle slow-moving items with popular products',
        impact: 'Increase turnover rate and reduce obsolescence risk'
      },
      {
        type: 'supplier',
        priority: 'medium',
        title: 'Evaluate supplier relationships',
        description: 'Review ordering patterns and lead times',
        impact: 'Optimize order quantities and timing'
      },
      {
        type: 'alerts',
        priority: 'low',
        title: 'Implement aging alerts',
        description: 'Set up automated notifications for aging thresholds',
        impact: 'Proactive inventory management and early intervention'
      }
    ];

    return NextResponse.json({
      success: true,
      data: {
        agingRanges: inventoryAgingData,
        riskAnalysis,
        recommendations,
        warehouse,
        lastUpdated: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error fetching inventory aging data:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch inventory aging data' 
      },
      { status: 500 }
    );
  }
}
