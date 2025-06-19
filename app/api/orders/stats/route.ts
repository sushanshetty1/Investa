import { NextResponse } from 'next/server';
import { getOrderStats } from '@/lib/actions/orders';

// GET /api/orders/stats
export async function GET() {
  try {
    const result = await getOrderStats();

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error('Order stats API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
