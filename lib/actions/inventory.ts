'use server'

import { neonClient } from '@/lib/db'
import {
  inventoryItemSchema,
  updateInventoryItemSchema,
  stockMovementSchema,
  stockAdjustmentSchema,
  stockTransferSchema,
  stockReservationSchema,
  inventoryQuerySchema,
  movementQuerySchema,
  type InventoryItemInput,
  type UpdateInventoryItemInput,
  type StockMovementInput,
  type StockAdjustmentInput,
  type StockTransferInput,
  type StockReservationInput,
  type InventoryQueryInput,
  type MovementQueryInput,
} from '@/lib/validations/inventory'
import { actionSuccess, actionError, type ActionResponse } from '@/lib/api-utils'
import { revalidatePath } from 'next/cache'

// Create inventory item
export async function createInventoryItem(input: InventoryItemInput): Promise<ActionResponse> {
  try {
    const validatedData = inventoryItemSchema.parse(input)

    // Validate references exist
    const [product, variant, warehouse] = await Promise.all([
      neonClient.product.findUnique({ where: { id: validatedData.productId } }),
      validatedData.variantId 
        ? neonClient.productVariant.findUnique({ where: { id: validatedData.variantId } })
        : null,
      neonClient.warehouse.findUnique({ where: { id: validatedData.warehouseId } }),
    ])

    if (!product) return actionError('Product not found')
    if (validatedData.variantId && !variant) return actionError('Product variant not found')
    if (!warehouse) return actionError('Warehouse not found')

    // Calculate available quantity
    const availableQuantity = validatedData.quantity - validatedData.reservedQuantity

    const inventoryItem = await neonClient.inventoryItem.create({
      data: {
        ...validatedData,
        availableQuantity,
        serialNumbers: validatedData.serialNumbers,
      },
      include: {
        product: { select: { id: true, name: true, sku: true } },
        variant: { select: { id: true, name: true, sku: true } },
        warehouse: { select: { id: true, name: true, code: true } },
      },
    })

    revalidatePath('/inventory/stock')
    return actionSuccess(inventoryItem, 'Inventory item created successfully')
  } catch (error) {
    console.error('Error creating inventory item:', error)
    return actionError('Failed to create inventory item')
  }
}

// Update inventory item
export async function updateInventoryItem(input: UpdateInventoryItemInput): Promise<ActionResponse> {
  try {
    const validatedData = updateInventoryItemSchema.parse(input)
    const { id, ...updateData } = validatedData

    const existingItem = await neonClient.inventoryItem.findUnique({
      where: { id },
    })

    if (!existingItem) {
      return actionError('Inventory item not found')
    }

    // Calculate available quantity if quantity or reserved quantity changed
    const availableQuantity = updateData.quantity !== undefined || updateData.reservedQuantity !== undefined
      ? (updateData.quantity ?? existingItem.quantity) - (updateData.reservedQuantity ?? existingItem.reservedQuantity)
      : undefined

    const inventoryItem = await neonClient.inventoryItem.update({
      where: { id },
      data: {
        ...updateData,
        availableQuantity,
        serialNumbers: updateData.serialNumbers,
      },
      include: {
        product: { select: { id: true, name: true, sku: true } },
        variant: { select: { id: true, name: true, sku: true } },
        warehouse: { select: { id: true, name: true, code: true } },
      },
    })

    revalidatePath('/inventory/stock')
    return actionSuccess(inventoryItem, 'Inventory item updated successfully')
  } catch (error) {
    console.error('Error updating inventory item:', error)
    return actionError('Failed to update inventory item')
  }
}

// Create stock movement and update inventory
export async function createStockMovement(input: StockMovementInput): Promise<ActionResponse> {
  try {
    const validatedData = stockMovementSchema.parse(input)

    // Validate references exist
    const [product, variant, warehouse] = await Promise.all([
      neonClient.product.findUnique({ where: { id: validatedData.productId } }),
      validatedData.variantId 
        ? neonClient.productVariant.findUnique({ where: { id: validatedData.variantId } })
        : null,
      neonClient.warehouse.findUnique({ where: { id: validatedData.warehouseId } }),
    ])

    if (!product) return actionError('Product not found')
    if (validatedData.variantId && !variant) return actionError('Product variant not found')
    if (!warehouse) return actionError('Warehouse not found')

    // Find or create inventory item
    let inventoryItem = await neonClient.inventoryItem.findFirst({
      where: {
        productId: validatedData.productId,
        variantId: validatedData.variantId,
        warehouseId: validatedData.warehouseId,
        lotNumber: validatedData.lotNumber,
      },
    })

    const quantityBefore = inventoryItem?.quantity || 0
    let quantityAfter = quantityBefore

    // Calculate quantity change based on movement type
    if (['RECEIPT', 'TRANSFER_IN', 'RETURN'].includes(validatedData.type)) {
      quantityAfter = quantityBefore + validatedData.quantity
    } else if (['SHIPMENT', 'TRANSFER_OUT', 'DAMAGE', 'EXPIRED', 'THEFT'].includes(validatedData.type)) {
      quantityAfter = quantityBefore - validatedData.quantity
      if (quantityAfter < 0) {
        return actionError('Insufficient stock for this movement')
      }
    } else if (validatedData.type === 'ADJUSTMENT') {
      quantityAfter = validatedData.quantity // Direct set for adjustments
    }

    // Use transaction to ensure consistency
    const result = await neonClient.$transaction(async (tx) => {
      // Create movement record
      const movement = await tx.inventoryMovement.create({
        data: {
          ...validatedData,
          quantityBefore,
          quantityAfter,
          inventoryItemId: inventoryItem?.id,
        },
        include: {
          product: { select: { id: true, name: true, sku: true } },
          variant: { select: { id: true, name: true, sku: true } },
          warehouse: { select: { id: true, name: true, code: true } },
        },
      })

      // Update or create inventory item
      if (inventoryItem) {
        inventoryItem = await tx.inventoryItem.update({
          where: { id: inventoryItem.id },
          data: {
            quantity: quantityAfter,
            availableQuantity: quantityAfter - inventoryItem.reservedQuantity,
            lastMovement: validatedData.occurredAt,
            lastCost: validatedData.unitCost || inventoryItem.lastCost,            averageCost: validatedData.unitCost 
              ? (Number(inventoryItem.averageCost || 0) + validatedData.unitCost) / 2
              : inventoryItem.averageCost,
          },
        })
      } else if (quantityAfter > 0) {
        inventoryItem = await tx.inventoryItem.create({
          data: {
            productId: validatedData.productId,
            variantId: validatedData.variantId,
            warehouseId: validatedData.warehouseId,
            quantity: quantityAfter,
            availableQuantity: quantityAfter,
            reservedQuantity: 0,
            lotNumber: validatedData.lotNumber,
            batchNumber: validatedData.batchNumber,
            expiryDate: validatedData.expiryDate,
            lastMovement: validatedData.occurredAt,
            lastCost: validatedData.unitCost,
            averageCost: validatedData.unitCost,
          },
        })
      }

      return { movement, inventoryItem }
    })

    revalidatePath('/inventory/stock')
    revalidatePath('/inventory/movements')
    return actionSuccess(result, 'Stock movement created successfully')
  } catch (error) {
    console.error('Error creating stock movement:', error)
    return actionError('Failed to create stock movement')
  }
}

// Stock adjustment with approval flow
export async function adjustStock(input: StockAdjustmentInput): Promise<ActionResponse> {
  try {
    const validatedData = stockAdjustmentSchema.parse(input)

    // Find inventory item
    const inventoryItem = await neonClient.inventoryItem.findFirst({
      where: {
        productId: validatedData.productId,
        variantId: validatedData.variantId,
        warehouseId: validatedData.warehouseId,
      },
    })

    if (!inventoryItem) {
      return actionError('Inventory item not found')
    }

    const currentQuantity = inventoryItem.quantity
    let newQuantity: number

    switch (validatedData.adjustmentType) {
      case 'INCREASE':
        newQuantity = currentQuantity + validatedData.quantity
        break
      case 'DECREASE':
        newQuantity = Math.max(0, currentQuantity - validatedData.quantity)
        break
      case 'SET':
        newQuantity = validatedData.quantity
        break
      default:
        return actionError('Invalid adjustment type')
    }

    // Create stock movement
    const movementInput: StockMovementInput = {
      type: 'ADJUSTMENT',
      subtype: validatedData.adjustmentType,
      productId: validatedData.productId,
      variantId: validatedData.variantId,
      warehouseId: validatedData.warehouseId,
      inventoryItemId: inventoryItem.id,
      quantity: newQuantity,
      reason: validatedData.reason,
      notes: validatedData.notes,
      userId: validatedData.userId,
      approvedBy: validatedData.approvedBy,
      approvedAt: validatedData.approvedBy ? new Date() : undefined,
      occurredAt: new Date(),
    }

    return await createStockMovement(movementInput)
  } catch (error) {
    console.error('Error adjusting stock:', error)
    return actionError('Failed to adjust stock')
  }
}

// Stock transfer between warehouses
export async function transferStock(input: StockTransferInput): Promise<ActionResponse> {
  try {
    const validatedData = stockTransferSchema.parse(input)

    if (validatedData.fromWarehouseId === validatedData.toWarehouseId) {
      return actionError('Source and destination warehouses cannot be the same')
    }    // Find source inventory item with product details
    const sourceItem = await neonClient.inventoryItem.findFirst({
      where: {
        productId: validatedData.productId,
        variantId: validatedData.variantId,
        warehouseId: validatedData.fromWarehouseId,
      },
      include: {
        product: {
          select: { name: true, sku: true },
        },
      },
    })

    if (!sourceItem) {
      return actionError('Source inventory item not found')
    }

    if (sourceItem.availableQuantity < validatedData.quantity) {
      return actionError('Insufficient available stock for transfer')
    }

    // Use transaction for atomic transfer
    const result = await neonClient.$transaction(async (tx) => {      // Create transfer record
      const transfer = await tx.stockTransfer.create({
        data: {
          transferNumber: `TRF-${Date.now()}`,
          fromWarehouseId: validatedData.fromWarehouseId,
          toWarehouseId: validatedData.toWarehouseId,
          status: 'PENDING',
          reason: validatedData.reason,
          notes: validatedData.notes,
          createdBy: validatedData.requestedBy,
        },
      })

      // Create transfer items
      const transferItem = await tx.stockTransferItem.create({
        data: {
          transferId: transfer.id,
          productId: validatedData.productId,
          variantId: validatedData.variantId,
          requestedQty: validatedData.quantity,
          productName: sourceItem.product?.name || 'Unknown Product',
          productSku: sourceItem.product?.sku || 'Unknown SKU',
          notes: validatedData.notes,
        },
      })

      // Create outbound movement
      const outboundMovement = await tx.inventoryMovement.create({
        data: {
          type: 'TRANSFER_OUT',
          productId: validatedData.productId,
          variantId: validatedData.variantId,
          warehouseId: validatedData.fromWarehouseId,
          inventoryItemId: sourceItem.id,
          quantity: validatedData.quantity,
          quantityBefore: sourceItem.quantity,
          quantityAfter: sourceItem.quantity - validatedData.quantity,
          referenceType: 'TRANSFER',
          referenceId: transfer.id,
          reason: validatedData.reason,
          notes: validatedData.notes,
          userId: validatedData.requestedBy,
          occurredAt: new Date(),
        },
      })

      // Update source inventory
      await tx.inventoryItem.update({
        where: { id: sourceItem.id },
        data: {
          quantity: sourceItem.quantity - validatedData.quantity,
          availableQuantity: sourceItem.availableQuantity - validatedData.quantity,
          lastMovement: new Date(),
        },
      })

      // Create inbound movement
      const inboundMovement = await tx.inventoryMovement.create({
        data: {
          type: 'TRANSFER_IN',
          productId: validatedData.productId,
          variantId: validatedData.variantId,
          warehouseId: validatedData.toWarehouseId,
          quantity: validatedData.quantity,
          quantityBefore: 0, // Will be updated when destination item is found/created
          quantityAfter: validatedData.quantity,
          referenceType: 'TRANSFER',
          referenceId: transfer.id,
          reason: validatedData.reason,
          notes: validatedData.notes,
          userId: validatedData.requestedBy,
          occurredAt: new Date(),
        },
      })

      // Find or create destination inventory item
      let destinationItem = await tx.inventoryItem.findFirst({
        where: {
          productId: validatedData.productId,
          variantId: validatedData.variantId,
          warehouseId: validatedData.toWarehouseId,
        },
      })

      if (destinationItem) {
        // Update existing destination item
        destinationItem = await tx.inventoryItem.update({
          where: { id: destinationItem.id },
          data: {
            quantity: destinationItem.quantity + validatedData.quantity,
            availableQuantity: destinationItem.availableQuantity + validatedData.quantity,
            lastMovement: new Date(),
          },
        })

        // Update inbound movement with correct before quantity
        await tx.inventoryMovement.update({
          where: { id: inboundMovement.id },
          data: {
            quantityBefore: destinationItem.quantity - validatedData.quantity,
            quantityAfter: destinationItem.quantity,
            inventoryItemId: destinationItem.id,
          },
        })
      } else {
        // Create new destination item
        destinationItem = await tx.inventoryItem.create({
          data: {
            productId: validatedData.productId,
            variantId: validatedData.variantId,
            warehouseId: validatedData.toWarehouseId,
            quantity: validatedData.quantity,
            availableQuantity: validatedData.quantity,
            reservedQuantity: 0,
            lastMovement: new Date(),
          },
        })

        // Update inbound movement with destination item ID
        await tx.inventoryMovement.update({
          where: { id: inboundMovement.id },
          data: { inventoryItemId: destinationItem.id },
        })
      }

      return {
        transfer,
        transferItem,
        outboundMovement,
        inboundMovement,
        sourceItem,
        destinationItem,
      }
    })

    revalidatePath('/inventory/stock')
    revalidatePath('/inventory/transfers')
    return actionSuccess(result, 'Stock transfer completed successfully')
  } catch (error) {
    console.error('Error transferring stock:', error)
    return actionError('Failed to transfer stock')
  }
}

// Create stock reservation
export async function reserveStock(input: StockReservationInput): Promise<ActionResponse> {
  try {
    const validatedData = stockReservationSchema.parse(input)

    const inventoryItem = await neonClient.inventoryItem.findUnique({
      where: { id: validatedData.inventoryItemId },
    })

    if (!inventoryItem) {
      return actionError('Inventory item not found')
    }

    if (inventoryItem.availableQuantity < validatedData.quantity) {
      return actionError('Insufficient available stock for reservation')
    }

    const result = await neonClient.$transaction(async (tx) => {      // Create reservation
      const reservation = await tx.stockReservation.create({
        data: {
          inventoryItemId: validatedData.inventoryItemId,
          quantity: validatedData.quantity,
          reservationType: validatedData.reservationType,
          referenceType: validatedData.referenceType || validatedData.reservationType,
          referenceId: validatedData.referenceId || '',
          expiresAt: validatedData.expiresAt,
          reservedBy: validatedData.reservedBy,
          notes: validatedData.notes,
        },
        include: {
          inventoryItem: {
            include: {
              product: { select: { id: true, name: true, sku: true } },
              warehouse: { select: { id: true, name: true, code: true } },
            },
          },
        },
      })

      // Update inventory item
      await tx.inventoryItem.update({
        where: { id: validatedData.inventoryItemId },
        data: {
          reservedQuantity: inventoryItem.reservedQuantity + validatedData.quantity,
          availableQuantity: inventoryItem.availableQuantity - validatedData.quantity,
        },
      })

      return reservation
    })

    revalidatePath('/inventory/stock')
    return actionSuccess(result, 'Stock reserved successfully')
  } catch (error) {
    console.error('Error reserving stock:', error)
    return actionError('Failed to reserve stock')
  }
}

// Get inventory with filtering and pagination
export async function getInventory(input: InventoryQueryInput): Promise<ActionResponse> {  try {
    const validatedQuery = inventoryQuerySchema.parse(input)
    const { page, limit, search, warehouseId, productId, categoryId, brandId, status, lowStock, sortBy, sortOrder } = validatedQuery

    const skip = (page - 1) * limit    // Build where clause  
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {}

    if (search) {
      where.OR = [
        { product: { name: { contains: search, mode: 'insensitive' } } },
        { product: { sku: { contains: search, mode: 'insensitive' } } },
        { product: { barcode: { contains: search, mode: 'insensitive' } } },
        { variant: { sku: { contains: search, mode: 'insensitive' } } },
        { lotNumber: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (warehouseId) where.warehouseId = warehouseId
    if (productId) where.productId = productId
    if (categoryId) where.product = { categoryId }
    if (brandId) where.product = { brandId }
    if (status) where.status = status
    if (lowStock) {
      where.AND = [
        { quantity: { gt: 0 } },
        { OR: [
          { quantity: { lte: { product: { minStockLevel: {} } } } },
          { quantity: { lte: { product: { reorderPoint: {} } } } },
        ] }
      ]    }

    // Build order clause
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const orderBy: any = {}
    if (sortBy === 'quantity') {
      orderBy.quantity = sortOrder
    } else if (sortBy === 'product') {
      orderBy.product = { name: sortOrder }
    } else if (sortBy === 'warehouse') {
      orderBy.warehouse = { name: sortOrder }
    } else if (sortBy === 'lastMovement') {
      orderBy.lastMovement = sortOrder
    } else if (sortBy === 'createdAt') {
      orderBy.createdAt = sortOrder
    }

    const [inventory, total] = await Promise.all([
      neonClient.inventoryItem.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          product: {
            select: {
              id: true,
              name: true,
              sku: true,
              primaryImage: true,
              minStockLevel: true,
              reorderPoint: true,
              category: { select: { name: true } },
              brand: { select: { name: true } },
            },
          },
          variant: {
            select: { id: true, name: true, sku: true, attributes: true },
          },
          warehouse: {
            select: { id: true, name: true, code: true },
          },
        },
      }),
      neonClient.inventoryItem.count({ where }),
    ])

    const pagination = {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    }

    return actionSuccess({ inventory, pagination }, 'Inventory retrieved successfully')
  } catch (error) {
    console.error('Error fetching inventory:', error)
    return actionError('Failed to fetch inventory')
  }
}

// Get stock movements with filtering
export async function getStockMovements(input: MovementQueryInput): Promise<ActionResponse> {
  try {
    const validatedQuery = movementQuerySchema.parse(input)
    const { page, limit, productId, warehouseId, type, dateFrom, dateTo, sortBy, sortOrder } = validatedQuery

    const skip = (page - 1) * limit    // Build where clause
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {}

    if (productId) where.productId = productId
    if (warehouseId) where.warehouseId = warehouseId
    if (type) where.type = type

    if (dateFrom || dateTo) {
      where.occurredAt = {}
      if (dateFrom) where.occurredAt.gte = dateFrom
      if (dateTo) where.occurredAt.lte = dateTo
    }    // Build order clause
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const orderBy: any = {}
    if (sortBy === 'occurredAt') {
      orderBy.occurredAt = sortOrder
    } else if (sortBy === 'quantity') {
      orderBy.quantity = sortOrder
    } else if (sortBy === 'type') {
      orderBy.type = sortOrder
    }

    const [movements, total] = await Promise.all([
      neonClient.inventoryMovement.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          product: {
            select: { id: true, name: true, sku: true, primaryImage: true },
          },
          variant: {
            select: { id: true, name: true, sku: true },
          },
          warehouse: {
            select: { id: true, name: true, code: true },
          },
        },
      }),
      neonClient.inventoryMovement.count({ where }),
    ])

    const pagination = {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    }

    return actionSuccess({ movements, pagination }, 'Stock movements retrieved successfully')
  } catch (error) {
    console.error('Error fetching stock movements:', error)
    return actionError('Failed to fetch stock movements')
  }
}

// Get low stock alerts
export async function getLowStockAlerts(): Promise<ActionResponse> {
  try {
    const lowStockItems = await neonClient.inventoryItem.findMany({
      where: {
        quantity: { gt: 0 },
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
            primaryImage: true,
            minStockLevel: true,
            reorderPoint: true,
            reorderQuantity: true,
          },
        },
        variant: {
          select: { id: true, name: true, sku: true },
        },
        warehouse: {
          select: { id: true, name: true, code: true },
        },
      },
      orderBy: [
        { quantity: 'asc' },
        { product: { name: 'asc' } },
      ],
    })

    // Filter items that are actually low stock
    const filteredItems = lowStockItems.filter(item => {
      const minLevel = item.product.minStockLevel
      const reorderPoint = item.product.reorderPoint
      return (minLevel && item.quantity <= minLevel) || 
             (reorderPoint && item.quantity <= reorderPoint)
    })

    return actionSuccess(filteredItems, 'Low stock alerts retrieved successfully')
  } catch (error) {
    console.error('Error fetching low stock alerts:', error)
    return actionError('Failed to fetch low stock alerts')
  }
}
