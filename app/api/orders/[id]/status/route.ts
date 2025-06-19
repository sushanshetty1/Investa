import { NextRequest, NextResponse } from 'next/server';
import { updateOrderStatus } from '@/lib/actions/orders';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { status, fulfillmentStatus, paymentStatus, shippedDate, deliveredDate, trackingNumber, carrier } = await request.json();
    
    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }

    const updateData = {
      orderId: id,
      status,
      ...(fulfillmentStatus && { fulfillmentStatus }),
      ...(paymentStatus && { paymentStatus }),
      ...(shippedDate && { shippedDate: new Date(shippedDate) }),
      ...(deliveredDate && { deliveredDate: new Date(deliveredDate) }),
      ...(trackingNumber && { trackingNumber }),
      ...(carrier && { carrier })
    };

    const result = await updateOrderStatus(updateData);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ order: result.data });
  } catch (error) {
    console.error('Error updating order status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
