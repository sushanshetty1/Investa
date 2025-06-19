import { z } from 'zod'

// Base inventory schemas
export const inventoryItemSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  variantId: z.string().uuid().optional(),
  warehouseId: z.string().uuid('Invalid warehouse ID'),
  zone: z.string().optional(),
  aisle: z.string().optional(),
  shelf: z.string().optional(),
  bin: z.string().optional(),
  locationCode: z.string().optional(),
  quantity: z.number().int().min(0).default(0),
  reservedQuantity: z.number().int().min(0).default(0),
  averageCost: z.number().positive().optional(),
  lastCost: z.number().positive().optional(),
  lotNumber: z.string().optional(),
  batchNumber: z.string().optional(),
  serialNumbers: z.array(z.string()).optional(),
  expiryDate: z.date().optional(),
  status: z.enum(['AVAILABLE', 'RESERVED', 'QUARANTINE', 'DAMAGED', 'EXPIRED', 'RECALLED']).default('AVAILABLE'),
  qcStatus: z.enum(['PASSED', 'FAILED', 'PENDING', 'QUARANTINE']).default('PASSED'),
  quarantineReason: z.string().optional(),
})

export const updateInventoryItemSchema = inventoryItemSchema.partial().extend({
  id: z.string().uuid('Invalid inventory item ID'),
})

// Stock movement schemas
export const stockMovementSchema = z.object({
  type: z.enum(['RECEIPT', 'SHIPMENT', 'ADJUSTMENT', 'TRANSFER_OUT', 'TRANSFER_IN', 'RETURN', 'DAMAGE', 'EXPIRED', 'PROMOTION', 'SAMPLE', 'THEFT', 'COUNT']),
  subtype: z.string().optional(),
  productId: z.string().uuid('Invalid product ID'),
  variantId: z.string().uuid().optional(),
  warehouseId: z.string().uuid('Invalid warehouse ID'),
  inventoryItemId: z.string().uuid().optional(),
  quantity: z.number().int().min(1, 'Quantity must be positive'),
  unitCost: z.number().positive().optional(),
  totalCost: z.number().positive().optional(),
  referenceType: z.string().optional(),
  referenceId: z.string().uuid().optional(),
  fromLocation: z.string().optional(),
  toLocation: z.string().optional(),
  lotNumber: z.string().optional(),
  batchNumber: z.string().optional(),
  expiryDate: z.date().optional(),
  reason: z.string().min(1, 'Reason is required'),
  notes: z.string().optional(),
  userId: z.string().uuid('Invalid user ID'),
  approvedBy: z.string().uuid().optional(),
  approvedAt: z.date().optional(),
  occurredAt: z.date().default(() => new Date()),
})

// Stock adjustment schema
export const stockAdjustmentSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  variantId: z.string().uuid().optional(),
  warehouseId: z.string().uuid('Invalid warehouse ID'),
  adjustmentType: z.enum(['INCREASE', 'DECREASE', 'SET']),
  quantity: z.number().int().min(1, 'Quantity must be positive'),
  reason: z.string().min(1, 'Reason is required'),
  notes: z.string().optional(),
  userId: z.string().uuid('Invalid user ID'),
  approvedBy: z.string().uuid().optional(),
})

// Stock transfer schema
export const stockTransferSchema = z.object({
  fromWarehouseId: z.string().uuid('Invalid source warehouse ID'),
  toWarehouseId: z.string().uuid('Invalid destination warehouse ID'),
  productId: z.string().uuid('Invalid product ID'),
  variantId: z.string().uuid().optional(),
  quantity: z.number().int().positive('Quantity must be positive'),
  reason: z.string().min(1, 'Reason is required'),
  notes: z.string().optional(),
  requestedBy: z.string().uuid('Invalid user ID'),
  expectedDate: z.date().optional(),
})

// Stock reservation schema
export const stockReservationSchema = z.object({
  inventoryItemId: z.string().uuid('Invalid inventory item ID'),
  quantity: z.number().int().positive('Quantity must be positive'),
  reservationType: z.enum(['ORDER', 'TRANSFER', 'MANUAL']),
  referenceType: z.string().min(1, 'Reference type is required'),
  referenceId: z.string().uuid().optional(),
  expiresAt: z.date().optional(),
  reservedBy: z.string().uuid('Invalid user ID'),
  notes: z.string().optional(),
})

// Low stock alert schema
export const lowStockAlertSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  variantId: z.string().uuid().optional(),
  warehouseId: z.string().uuid('Invalid warehouse ID'),
  currentQuantity: z.number().int().min(0),
  minStockLevel: z.number().int().min(0),
  reorderPoint: z.number().int().min(0).optional(),
  recommendedOrderQuantity: z.number().int().positive().optional(),
})

// Inventory query schemas
export const inventoryQuerySchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  warehouseId: z.string().uuid().optional(),
  productId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
  brandId: z.string().uuid().optional(),
  status: z.enum(['AVAILABLE', 'RESERVED', 'QUARANTINE', 'DAMAGED', 'EXPIRED', 'RECALLED']).optional(),
  lowStock: z.boolean().optional(),
  sortBy: z.enum(['quantity', 'product', 'warehouse', 'lastMovement', 'createdAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

export const movementQuerySchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().min(1).max(100).default(20),
  productId: z.string().uuid().optional(),
  warehouseId: z.string().uuid().optional(),
  type: z.enum(['RECEIPT', 'SHIPMENT', 'ADJUSTMENT', 'TRANSFER_OUT', 'TRANSFER_IN', 'RETURN', 'DAMAGE', 'EXPIRED', 'PROMOTION', 'SAMPLE', 'THEFT', 'COUNT']).optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
  sortBy: z.enum(['occurredAt', 'quantity', 'type']).default('occurredAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

// Export types
export type InventoryItemInput = z.infer<typeof inventoryItemSchema>
export type UpdateInventoryItemInput = z.infer<typeof updateInventoryItemSchema>
export type StockMovementInput = z.infer<typeof stockMovementSchema>
export type StockAdjustmentInput = z.infer<typeof stockAdjustmentSchema>
export type StockTransferInput = z.infer<typeof stockTransferSchema>
export type StockReservationInput = z.infer<typeof stockReservationSchema>
export type LowStockAlertInput = z.infer<typeof lowStockAlertSchema>
export type InventoryQueryInput = z.infer<typeof inventoryQuerySchema>
export type MovementQueryInput = z.infer<typeof movementQuerySchema>
