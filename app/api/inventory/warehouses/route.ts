import { neonClient } from '@/lib/db'
import { NextResponse } from 'next/server'

// GET /api/inventory/warehouses - List warehouses
export async function GET() {
  try {
    const warehouses = await neonClient.warehouse.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: {
            inventoryItems: true
          }
        }
      },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json(warehouses)
  } catch (error) {
    console.error('Error fetching warehouses:', error)
    return NextResponse.json(
      { error: 'Failed to fetch warehouses' },
      { status: 500 }
    )
  }
}
