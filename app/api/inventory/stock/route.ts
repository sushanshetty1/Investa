import { neonClient } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/inventory/stock - List stock items with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const warehouseId = searchParams.get('warehouseId') || ''
    const status = searchParams.get('status') || ''
    const alertsOnly = searchParams.get('alertsOnly') === 'true'

    const skip = (page - 1) * limit    // Build where clause
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {}
    
    if (warehouseId) where.warehouseId = warehouseId
    if (status) where.status = status
    
    if (search) {
      where.OR = [
        { product: { name: { contains: search, mode: 'insensitive' } } },
        { product: { sku: { contains: search, mode: 'insensitive' } } },
        { variant: { name: { contains: search, mode: 'insensitive' } } },
        { variant: { sku: { contains: search, mode: 'insensitive' } } },
        { locationCode: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Filter for alerts (low stock or out of stock)
    if (alertsOnly) {
      where.OR = [
        { availableQuantity: { lte: 0 } }, // Out of stock
        // Low stock will need a subquery to compare with product.minStockLevel
      ]
    }

    // Fetch stock items with relations
    const [stockItems, total] = await Promise.all([
      neonClient.inventoryItem.findMany({
        where,
        include: {
          product: {
            select: {
              id: true,
              name: true,
              sku: true,
              primaryImage: true,
              minStockLevel: true,
              reorderPoint: true
            }
          },
          variant: {
            select: {
              id: true,
              name: true,
              sku: true,
              attributes: true
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
        orderBy: { lastMovement: 'desc' },
        skip,
        take: limit
      }),
      neonClient.inventoryItem.count({ where })
    ])

    return NextResponse.json({
      stockItems,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching stock items:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stock items' },
      { status: 500 }
    )
  }
}

// POST /api/inventory/stock/adjust - Adjust stock levels
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { inventoryItemId, newQuantity, reason, notes, userId } = body

    if (!inventoryItemId || newQuantity === undefined) {
      return NextResponse.json(
        { error: 'Inventory item ID and new quantity are required' },
        { status: 400 }
      )
    }

    // Get current inventory item
    const inventoryItem = await neonClient.inventoryItem.findUnique({
      where: { id: inventoryItemId },
      include: { product: true, warehouse: true }
    })

    if (!inventoryItem) {
      return NextResponse.json(
        { error: 'Inventory item not found' },
        { status: 404 }
      )
    }

    const quantityDifference = newQuantity - inventoryItem.quantity
    const newAvailableQuantity = Math.max(0, newQuantity - inventoryItem.reservedQuantity)

    // Update inventory item and create movement record in a transaction
    const result = await neonClient.$transaction(async (tx) => {
      // Update inventory item
      const updatedItem = await tx.inventoryItem.update({
        where: { id: inventoryItemId },
        data: {
          quantity: newQuantity,
          availableQuantity: newAvailableQuantity,
          lastMovement: new Date()
        }
      })

      // Create movement record
      const movement = await tx.inventoryMovement.create({
        data: {
          type: 'ADJUSTMENT',
          productId: inventoryItem.productId,
          variantId: inventoryItem.variantId,
          warehouseId: inventoryItem.warehouseId,
          inventoryItemId: inventoryItemId,
          quantity: Math.abs(quantityDifference),
          quantityBefore: inventoryItem.quantity,
          quantityAfter: newQuantity,
          reason: reason || 'Manual adjustment',
          notes,
          userId: userId || 'system'
        }
      })

      return { updatedItem, movement }
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error adjusting stock:', error)
    return NextResponse.json(
      { error: 'Failed to adjust stock' },
      { status: 500 }
    )
  }
}
