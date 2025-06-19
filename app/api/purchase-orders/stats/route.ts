import { NextResponse } from 'next/server';
import { getPurchaseOrderStats } from '@/lib/actions/purchase-orders';

// GET /api/purchase-orders/stats
export async function GET() {
  try {
    const result = await getPurchaseOrderStats();

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error('Purchase order stats API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
