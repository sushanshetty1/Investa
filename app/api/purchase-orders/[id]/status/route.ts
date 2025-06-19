import { NextRequest, NextResponse } from 'next/server';
import { updatePurchaseOrderStatus } from '@/lib/actions/purchase-orders';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { status } = await request.json();
    
    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }    const updateData = {
      purchaseOrderId: id,
      status
    };

    const result = await updatePurchaseOrderStatus(updateData);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ purchaseOrder: result.data });
  } catch (error) {
    console.error('Error updating purchase order status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
