import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const warehouse = searchParams.get('warehouse') || 'all';
    const horizon = parseInt(searchParams.get('horizon') || '6'); // months ahead

    // Mock forecast data - in production, use ML models and historical data
    const forecastData = [
      { 
        month: 'Jan', 
        period: '2024-01',
        actual: 2450, 
        predicted: 2400, 
        demand: 2380,
        confidence: 0.92,
        upperBound: 2480,
        lowerBound: 2320
      },
      { 
        month: 'Feb', 
        period: '2024-02',
        actual: 2620, 
        predicted: 2580, 
        demand: 2650,
        confidence: 0.89,
        upperBound: 2680,
        lowerBound: 2480
      },
      { 
        month: 'Mar', 
        period: '2024-03',
        actual: 2380, 
        predicted: 2420, 
        demand: 2350,
        confidence: 0.91,
        upperBound: 2520,
        lowerBound: 2320
      },
      { 
        month: 'Apr', 
        period: '2024-04',
        actual: 2750, 
        predicted: 2720, 
        demand: 2800,
        confidence: 0.88,
        upperBound: 2850,
        lowerBound: 2590
      },
      { 
        month: 'May', 
        period: '2024-05',
        actual: 2580, 
        predicted: 2600, 
        demand: 2520,
        confidence: 0.90,
        upperBound: 2700,
        lowerBound: 2500
      },
      { 
        month: 'Jun', 
        period: '2024-06',
        actual: null, 
        predicted: 2650, 
        demand: 2700,
        confidence: 0.85,
        upperBound: 2780,
        lowerBound: 2520
      },
      { 
        month: 'Jul', 
        period: '2024-07',
        actual: null, 
        predicted: 2720, 
        demand: 2750,
        confidence: 0.82,
        upperBound: 2850,
        lowerBound: 2590
      }
    ];

    // Calculate forecast accuracy metrics
    const actualData = forecastData.filter(d => d.actual !== null);
    const mae = actualData.reduce((sum, d) => sum + Math.abs(d.actual! - d.predicted), 0) / actualData.length;
    const mape = actualData.reduce((sum, d) => sum + Math.abs((d.actual! - d.predicted) / d.actual!) * 100, 0) / actualData.length;
    const accuracy = Math.max(0, 100 - mape);

    // Trend analysis
    const trendAccuracy = actualData.reduce((correct, d, i) => {
      if (i === 0) return 0;
      const actualTrend = d.actual! > actualData[i-1].actual! ? 'up' : 'down';
      const predictedTrend = d.predicted > forecastData[i-1].predicted ? 'up' : 'down';
      return correct + (actualTrend === predictedTrend ? 1 : 0);
    }, 0) / Math.max(1, actualData.length - 1) * 100;

    const performanceMetrics = {
      accuracy: Math.round(accuracy * 10) / 10,
      meanAbsoluteError: Math.round(mae),
      meanAbsolutePercentageError: Math.round(mape * 10) / 10,
      trendAccuracy: Math.round(trendAccuracy * 10) / 10,
      confidence: Math.round(forecastData.reduce((sum, d) => sum + d.confidence, 0) / forecastData.length * 100)
    };

    // Generate recommendations based on forecast
    const recommendations = [
      {
        type: 'increase_orders',
        priority: 'high',
        title: 'Increase Orders',
        description: 'July forecast shows 15% demand increase. Consider increasing orders by 12%.',
        action: 'Adjust purchase orders for July delivery',
        impact: 'Prevent stockouts during peak demand',
        confidence: 0.85
      },
      {
        type: 'monitor',
        priority: 'medium',
        title: 'Monitor Closely',
        description: 'Seasonal variation detected. Track performance weekly during peak period.',
        action: 'Set up weekly performance reviews',
        impact: 'Early detection of demand changes',
        confidence: 0.90
      },
      {
        type: 'lead_time',
        priority: 'medium',
        title: 'Lead Time Adjustment',
        description: 'Consider reducing lead times for fast-moving items to improve service levels.',
        action: 'Negotiate shorter lead times with key suppliers',
        impact: 'Improved responsiveness to demand changes',
        confidence: 0.78
      },
      {
        type: 'safety_stock',
        priority: 'low',
        title: 'Safety Stock Review',
        description: 'Current forecast confidence suggests reviewing safety stock levels.',
        action: 'Recalculate safety stock using latest demand patterns',
        impact: 'Optimize inventory investment vs service level',
        confidence: 0.82
      }
    ];

    return NextResponse.json({
      success: true,
      data: {
        forecast: forecastData,
        performanceMetrics,
        recommendations,
        parameters: {
          warehouse,
          horizon,
          model: 'Seasonal ARIMA with ML enhancement',
          lastTrainingDate: '2024-05-31'
        },
        lastUpdated: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error fetching forecast data:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch forecast data' 
      },
      { status: 500 }
    );
  }
}
