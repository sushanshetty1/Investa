import { NextRequest, NextResponse } from 'next/server';
import { approvePurchaseOrder } from '@/lib/actions/purchase-orders';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { approvedBy } = await request.json();
    
    if (!approvedBy) {
      return NextResponse.json(
        { error: 'Approved by is required' },
        { status: 400 }
      );
    }    const result = await approvePurchaseOrder(id, approvedBy);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ purchaseOrder: result.data });
  } catch (error) {
    console.error('Error approving purchase order:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
