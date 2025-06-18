import { neonClient } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/inventory/stock/movements - List stock movements
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const type = searchParams.get('type') || ''
    const warehouseId = searchParams.get('warehouseId') || ''
    const productId = searchParams.get('productId') || ''
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const skip = (page - 1) * limit    // Build where clause
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {}
    
    if (type) where.type = type
    if (warehouseId) where.warehouseId = warehouseId
    if (productId) where.productId = productId
    
    if (startDate || endDate) {
      where.occurredAt = {}
      if (startDate) where.occurredAt.gte = new Date(startDate)
      if (endDate) where.occurredAt.lte = new Date(endDate)
    }

    // Fetch movements with relations
    const [movements, total] = await Promise.all([
      neonClient.inventoryMovement.findMany({
        where,
        include: {
          product: {
            select: {
              id: true,
              name: true,
              sku: true
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
        orderBy: { occurredAt: 'desc' },
        skip,
        take: limit
      }),
      neonClient.inventoryMovement.count({ where })
    ])

    return NextResponse.json({
      movements,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching stock movements:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stock movements' },
      { status: 500 }
    )
  }
}

// POST /api/inventory/stock/movements - Create new stock movement
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      type, 
      productId, 
      variantId, 
      warehouseId, 
      quantity, 
      unitCost, 
      reason, 
      notes, 
      userId,
      referenceType,
      referenceId,
      lotNumber,
      batchNumber,
      expiryDate
    } = body

    if (!type || !productId || !warehouseId || !quantity || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Find or create inventory item
    let inventoryItem = await neonClient.inventoryItem.findFirst({
      where: {
        productId,
        variantId: variantId || null,
        warehouseId,
        lotNumber: lotNumber || null,
        batchNumber: batchNumber || null
      }
    })

    const quantityBefore = inventoryItem?.quantity || 0
    const isInbound = ['RECEIPT', 'TRANSFER_IN', 'RETURN'].includes(type)
    const quantityChange = isInbound ? quantity : -quantity
    const quantityAfter = quantityBefore + quantityChange

    if (!isInbound && quantityAfter < 0) {
      return NextResponse.json(
        { error: 'Insufficient stock for this movement' },
        { status: 400 }
      )
    }

    // Create or update inventory item and movement in a transaction
    const result = await neonClient.$transaction(async (tx) => {
      // Create or update inventory item
      if (inventoryItem) {
        inventoryItem = await tx.inventoryItem.update({
          where: { id: inventoryItem.id },
          data: {
            quantity: quantityAfter,
            availableQuantity: Math.max(0, quantityAfter - (inventoryItem.reservedQuantity || 0)),
            lastMovement: new Date(),
            ...(unitCost && { lastCost: unitCost }),
            ...(expiryDate && { expiryDate: new Date(expiryDate) })
          }
        })
      } else {
        inventoryItem = await tx.inventoryItem.create({
          data: {
            productId,
            variantId,
            warehouseId,
            quantity: quantityAfter,
            availableQuantity: quantityAfter,
            reservedQuantity: 0,
            status: 'AVAILABLE',
            qcStatus: 'PENDING',
            lotNumber,
            batchNumber,
            expiryDate: expiryDate ? new Date(expiryDate) : null,
            lastCost: unitCost,
            lastMovement: new Date()
          }
        })
      }

      // Create movement record
      const movement = await tx.inventoryMovement.create({
        data: {
          type,
          productId,
          variantId,
          warehouseId,
          inventoryItemId: inventoryItem.id,
          quantity: Math.abs(quantity),
          quantityBefore,
          quantityAfter,
          unitCost,
          totalCost: unitCost ? unitCost * quantity : null,
          referenceType,
          referenceId,
          reason,
          notes,
          userId,
          lotNumber,
          batchNumber,
          expiryDate: expiryDate ? new Date(expiryDate) : null
        }
      })

      return { inventoryItem, movement }
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('Error creating stock movement:', error)
    return NextResponse.json(
      { error: 'Failed to create stock movement' },
      { status: 500 }
    )
  }
}
