import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const warehouse = searchParams.get('warehouse') || 'all';

    // Mock ABC analysis data - in production, calculate from inventory value and usage
    const abcAnalysisData = [
      { 
        category: 'A', 
        label: 'High Value',
        items: 45, 
        percentage: 15, 
        value: 850000, 
        color: '#ef4444',
        turnoverRate: 8.5,
        avgValue: 18889,
        description: 'High value items requiring tight control'
      },
      { 
        category: 'B', 
        label: 'Medium Value',
        items: 90, 
        percentage: 30, 
        value: 450000, 
        color: '#f59e0b',
        turnoverRate: 6.2,
        avgValue: 5000,
        description: 'Medium value items with moderate control'
      },
      { 
        category: 'C', 
        label: 'Low Value',
        items: 165, 
        percentage: 55, 
        value: 120000, 
        color: '#10b981',
        turnoverRate: 4.1,
        avgValue: 727,
        description: 'Low value items with basic control'
      }
    ];

    // Calculate totals
    const totalItems = abcAnalysisData.reduce((sum, cat) => sum + cat.items, 0);
    const totalValue = abcAnalysisData.reduce((sum, cat) => sum + cat.value, 0);

    // Management strategies
    const strategies = {
      A: {
        title: 'Category A (High Value)',
        strategies: [
          'Tight inventory control',
          'Frequent monitoring',
          'Just-in-time ordering',
          'Accurate forecasting',
          'Regular supplier reviews'
        ]
      },
      B: {
        title: 'Category B (Medium Value)',
        strategies: [
          'Moderate control',
          'Regular monitoring',
          'Safety stock buffer',
          'Periodic review',
          'Automated reordering'
        ]
      },
      C: {
        title: 'Category C (Low Value)',
        strategies: [
          'Basic control',
          'Bulk ordering',
          'Larger safety stocks',
          'Simple systems',
          'Annual reviews'
        ]
      }
    };

    return NextResponse.json({
      success: true,
      data: {
        categories: abcAnalysisData,
        strategies,
        summary: {
          totalItems,
          totalValue,
          averageValue: Math.round(totalValue / totalItems)
        },
        warehouse,
        lastUpdated: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error fetching ABC analysis:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch ABC analysis data' 
      },
      { status: 500 }
    );
  }
}
