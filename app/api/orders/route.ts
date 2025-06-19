import { NextRequest, NextResponse } from 'next/server';
import { getOrders, createOrder } from '@/lib/actions/orders';

// GET /api/orders
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    const filters = {
      status: searchParams.get('status') || undefined,
      customerId: searchParams.get('customerId') || undefined,
      warehouseId: searchParams.get('warehouseId') || undefined,
      searchTerm: searchParams.get('search') || undefined,
    };

    const result = await getOrders(filters);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error('Orders API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/orders
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const result = await createOrder(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json(result.data, { status: 201 });
  } catch (error) {
    console.error('Create order API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
