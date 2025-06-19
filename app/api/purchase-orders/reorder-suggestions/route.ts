import { NextRequest, NextResponse } from 'next/server';
import { getReorderSuggestions, createPurchaseOrderFromSuggestion } from '@/lib/actions/purchase-orders';

// GET /api/purchase-orders/reorder-suggestions
export async function GET() {
  try {
    const result = await getReorderSuggestions();

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error('Reorder suggestions API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/purchase-orders/reorder-suggestions
export async function POST(request: NextRequest) {
  try {
    const suggestion = await request.json();
    
    const result = await createPurchaseOrderFromSuggestion(suggestion);    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }    // TypeScript type assertion since we know result.success is true
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const successResult = result as { success: true; data: any };
    return NextResponse.json({ purchaseOrder: successResult.data }, { status: 201 });
  } catch (error) {
    console.error('Create PO from suggestion API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
