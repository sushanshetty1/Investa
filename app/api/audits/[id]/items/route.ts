import { NextRequest, NextResponse } from 'next/server'
import { neonClient } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<Promise<{ id: string }>> }
) {
  try {
    const { id } = await params

    const auditItems = await neonClient.inventoryAuditItem.findMany({
      where: { auditId: id },
      include: {
        product: {
          select: {
            name: true,
            sku: true
          }
        },
        warehouse: {
          select: {
            name: true
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    })

    const transformedItems = auditItems.map((item: Record<string, any>) => ({
      id: item.id,
      productId: item.productId,
      productName: item.product.name,
      sku: item.product.sku,
      warehouseId: item.warehouseId,
      warehouseName: item.warehouse.name,
      location: item.location,
      systemQty: item.systemQty,
      countedQty: item.countedQty,
      adjustmentQty: item.adjustmentQty,
      status: item.status,
      countedBy: item.countedBy,
      countedAt: item.countedAt,
      verifiedBy: item.verifiedBy,
      verifiedAt: item.verifiedAt,
      discrepancyReason: item.discrepancyReason,
      notes: item.notes
    }))

    return NextResponse.json({
      items: transformedItems
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
