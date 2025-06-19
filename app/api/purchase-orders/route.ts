import { NextRequest, NextResponse } from 'next/server';
import { getPurchaseOrders, createPurchaseOrder } from '@/lib/actions/purchase-orders';

// GET /api/purchase-orders
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    const filters = {
      status: searchParams.get('status') || undefined,
      supplierId: searchParams.get('supplierId') || undefined,
      warehouseId: searchParams.get('warehouseId') || undefined,
      searchTerm: searchParams.get('search') || undefined,
    };

    const result = await getPurchaseOrders(filters);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error('Purchase Orders API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/purchase-orders
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const result = await createPurchaseOrder(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json(result.data, { status: 201 });
  } catch (error) {
    console.error('Create purchase order API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
