import { NextRequest, NextResponse } from 'next/server'
import { neonClient } from '@/lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Start the cycle count by updating audit status and generating audit items
    const audit = await neonClient.inventoryAudit.findUnique({
      where: {
        id,
        type: 'CYCLE_COUNT'
      },
      include: {
        warehouse: true,
        product: true
      }
    })

    if (!audit) {
      return NextResponse.json(
        { error: 'Cycle count schedule not found' },
        { status: 404 }
      )
    }

    if (audit.status !== 'PLANNED') {
      return NextResponse.json(
        { error: 'Cycle count can only be started from PLANNED status' },
        { status: 400 }
      )
    }

    // Update audit status
    await neonClient.inventoryAudit.update({
      where: { id },
      data: {
        status: 'IN_PROGRESS',
        startedDate: new Date()
      }
    })

    // Generate audit items based on warehouse and/or product selection
    let inventoryItems: any[] = []

    if (audit.productId) {
      // Product-specific audit
      inventoryItems = await neonClient.inventoryItem.findMany({
        where: {
          productId: audit.productId,
          ...(audit.warehouseId && { warehouseId: audit.warehouseId })
        },
        include: {
          product: true,
          variant: true,
          warehouse: true
        }
      })
    } else if (audit.warehouseId) {      // Warehouse-specific audit (limit to ABC items for cycle counting)
      inventoryItems = await neonClient.inventoryItem.findMany({
        where: {
          warehouseId: audit.warehouseId,
          quantity: { gt: 0 }
        },
        include: {
          product: true,
          variant: true,
          warehouse: true
        },
        take: 100 // Limit for cycle counting
      })
    } else {      // Full inventory audit (should be rare for cycle counts)
      inventoryItems = await neonClient.inventoryItem.findMany({
        where: {
          quantity: { gt: 0 }
        },
        include: {
          product: true,
          variant: true,
          warehouse: true
        },
        take: 50 // Very limited for cycle counts
      })
    }    // Create audit items
    const auditItemsData = inventoryItems.map(item => ({
      auditId: id,
      productId: item.productId,
      variantId: item.variantId,
      warehouseId: item.warehouseId,
      systemQty: item.quantity,
      location: item.locationCode || `${item.zone || ''}-${item.aisle || ''}-${item.shelf || ''}`.replace(/^-+|-+$/g, '') || null,
      status: 'PENDING' as const
    }))

    if (auditItemsData.length > 0) {
      await neonClient.inventoryAuditItem.createMany({
        data: auditItemsData
      })
    }

    // Update audit with totals
    await neonClient.inventoryAudit.update({
      where: { id },
      data: {
        totalItems: auditItemsData.length,
        itemsCounted: 0
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Cycle count started successfully',
      itemsGenerated: auditItemsData.length
    })

  } catch (error) {
    console.error('Error starting cycle count:', error)
    return NextResponse.json(
      { error: 'Failed to start cycle count' },
      { status: 500 }
    )
  }
}
