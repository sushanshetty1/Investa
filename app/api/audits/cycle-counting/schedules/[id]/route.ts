import { NextRequest, NextResponse } from 'next/server'
import { neonClient } from '@/lib/db'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json()
    const { status, notes, plannedDate } = body
    const { id } = await params

    const audit = await neonClient.inventoryAudit.update({
      where: { 
        id: id,
        type: 'CYCLE_COUNT'
      },
      data: {
        ...(status && { status }),
        ...(notes && { notes }),
        ...(plannedDate && { plannedDate: new Date(plannedDate) }),
        updatedAt: new Date()
      },
      include: {
        warehouse: {
          select: {
            id: true,
            name: true,
            code: true
          }
        },
        product: {
          select: {
            id: true,
            name: true,
            sku: true
          }
        }
      }
    })

    // Transform to schedule format
    const schedule = {
      id: audit.id,
      name: `Cycle Count - ${audit.warehouse?.name || audit.product?.name || 'All Products'}`,
      auditNumber: audit.auditNumber,
      warehouseId: audit.warehouseId,
      productId: audit.productId,
      warehouse: audit.warehouse,
      product: audit.product,
      status: audit.status,
      plannedDate: audit.plannedDate,
      nextCountDate: audit.plannedDate,
      type: 'CYCLE_COUNT',
      createdAt: audit.createdAt,
      updatedAt: audit.updatedAt
    }

    return NextResponse.json(schedule)

  } catch (error) {
    console.error('Error updating cycle count schedule:', error)
    return NextResponse.json(
      { error: 'Failed to update cycle count schedule' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await neonClient.inventoryAudit.delete({
      where: { 
        id: id,
        type: 'CYCLE_COUNT'
      }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error deleting cycle count schedule:', error)
    return NextResponse.json(
      { error: 'Failed to delete cycle count schedule' },
      { status: 500 }
    )
  }
}
