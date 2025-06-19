import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all';
    const priority = searchParams.get('priority') || 'all';

    // Mock AI-generated insights - in production, use ML models and real data analysis
    const insights = [
      {
        id: '1',
        title: 'Low Stock Alert - High Velocity Items',
        description: '8 fast-moving items are approaching reorder points and require immediate attention',
        type: 'alert',
        priority: 'high',
        impact: 'Potential stockouts affecting $45,000 in monthly revenue',
        recommendation: 'Expedite purchase orders for critical items: WH-001, FT-205, CB-301',
        metrics: {
          current: 8,
          target: 0,
          unit: 'items'
        },
        affectedItems: ['WH-001', 'FT-205', 'CB-301', 'BS-102'],
        estimatedImpact: 45000,
        confidence: 0.95,
        createdAt: new Date().toISOString()
      },
      {
        id: '2',
        title: 'Aged Inventory Optimization Opportunity',
        description: 'Items over 90 days old represent 12% of total inventory value ($85k)',
        type: 'optimization',
        priority: 'medium',
        impact: 'Free up $85,000 in working capital and reduce carrying costs by 15%',
        recommendation: 'Implement clearance pricing strategy for slow-moving items and review supplier order quantities',
        metrics: {
          current: 12,
          target: 5,
          unit: '%'
        },
        affectedItems: ['LM-901', 'OR-702', 'DK-503', 'VA-205'],
        estimatedImpact: 85000,
        confidence: 0.88,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '3',
        title: 'Category A Items - Margin Improvement Detected',
        description: 'High-value electronics showing 2.3% margin increase vs industry average',
        type: 'opportunity',
        priority: 'medium',
        impact: 'Potential to increase overall profit margin by 2.3% through strategic pricing',
        recommendation: 'Expand catalog of similar high-margin products and optimize pricing strategy',
        metrics: {
          current: 42.5,
          target: 45.0,
          unit: '%'
        },
        affectedItems: ['WH-001', 'FT-205', 'Premium Electronics'],
        estimatedImpact: 120000,
        confidence: 0.82,
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '4',
        title: 'Seasonal Demand Pattern Analysis',
        description: 'Electronics category shows 15% demand increase indicating seasonal trend',
        type: 'opportunity',
        priority: 'high',
        impact: 'Capture additional $120,000 in seasonal revenue over next 3 months',
        recommendation: 'Increase safety stock for electronics by 20% and prepare for holiday season',
        metrics: {
          current: 85,
          target: 102,
          unit: 'days stock'
        },
        affectedItems: ['Electronics Category', 'Gaming Products', 'Mobile Accessories'],
        estimatedImpact: 120000,
        confidence: 0.91,
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '5',
        title: 'Supplier Lead Time Variance Risk',
        description: 'Key supplier showing 50% increase in lead time variance affecting inventory planning',
        type: 'risk',
        priority: 'medium',
        impact: 'Increased safety stock requirements and potential service level degradation',
        recommendation: 'Diversify supplier base for critical items or negotiate improved SLA terms',
        metrics: {
          current: 18,
          target: 12,
          unit: 'days'
        },
        affectedItems: ['Supplier ABC items', 'Critical components'],
        estimatedImpact: 35000,
        confidence: 0.87,
        createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '6',
        title: 'Inventory Turnover Rate Improvement',
        description: 'Overall inventory turnover improved by 8% compared to last quarter',
        type: 'opportunity',
        priority: 'low',
        impact: 'Continue optimizing inventory levels to maintain improved cash flow',
        recommendation: 'Review and adjust reorder points based on improved turnover patterns',
        metrics: {
          current: 6.8,
          target: 7.5,
          unit: 'turns/year'
        },
        affectedItems: ['All categories'],
        estimatedImpact: 25000,
        confidence: 0.94,
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
      }
    ];

    // Filter insights based on query parameters
    let filteredInsights = insights;

    if (type !== 'all') {
      filteredInsights = filteredInsights.filter(insight => insight.type === type);
    }

    if (priority !== 'all') {
      filteredInsights = filteredInsights.filter(insight => insight.priority === priority);
    }

    // Calculate summary statistics
    const summary = {
      total: insights.length,
      highPriority: insights.filter(i => i.priority === 'high').length,
      opportunities: insights.filter(i => i.type === 'opportunity').length,
      risks: insights.filter(i => i.type === 'risk').length,
      alerts: insights.filter(i => i.type === 'alert').length,
      optimizations: insights.filter(i => i.type === 'optimization').length,
      totalPotentialImpact: insights.reduce((sum, i) => sum + i.estimatedImpact, 0),
      averageConfidence: insights.reduce((sum, i) => sum + i.confidence, 0) / insights.length
    };

    return NextResponse.json({
      success: true,
      data: {
        insights: filteredInsights,
        summary,
        filters: { type, priority },
        lastUpdated: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error fetching inventory insights:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch inventory insights' 
      },
      { status: 500 }
    );
  }
}

// POST endpoint to mark insights as actioned or dismissed
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { insightId, action, notes } = body;

    if (!insightId || !action) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: insightId and action' 
        },
        { status: 400 }
      );
    }

    // In production, update the insight status in database
    console.log(`Insight ${insightId} marked as ${action}`, notes ? `with notes: ${notes}` : '');

    return NextResponse.json({
      success: true,
      data: {
        insightId,
        action,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error updating insight:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update insight' 
      },
      { status: 500 }
    );
  }
}
