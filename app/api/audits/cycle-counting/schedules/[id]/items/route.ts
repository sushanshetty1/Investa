import { NextRequest, NextResponse } from 'next/server'
import { neonClient } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const items = await neonClient.inventoryAuditItem.findMany({
      where: {
        auditId: params.id
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
            description: true
          }
        },
        variant: {
          select: {
            id: true,
            name: true,
            sku: true
          }
        },
        warehouse: {
          select: {
            id: true,
            name: true,
            code: true
          }
        }
      },
      orderBy: [
        { product: { name: 'asc' } },
        { variant: { name: 'asc' } }
      ]
    })

    return NextResponse.json({ items })

  } catch (error) {
    console.error('Error fetching cycle count items:', error)
    return NextResponse.json(
      { error: 'Failed to fetch cycle count items' },
      { status: 500 }
    )
  }
}
