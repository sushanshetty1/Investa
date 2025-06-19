import { z } from 'zod'

// Address schema for warehouses
export const addressSchema = z.object({
  street: z.string().min(1, 'Street is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  country: z.string().min(1, 'Country is required'),
  zipCode: z.string().min(1, 'ZIP code is required'),
})

// Base warehouse schema
export const baseWarehouseSchema = z.object({
  name: z.string().min(1, 'Warehouse name is required').max(100, 'Warehouse name too long'),
  code: z.string().min(1, 'Warehouse code is required').max(20, 'Warehouse code too long'),
  description: z.string().optional(),
  type: z.enum(['STANDARD', 'DISTRIBUTION_CENTER', 'RETAIL_STORE', 'FULFILLMENT_CENTER', 'CROSS_DOCK', 'COLD_STORAGE']).default('STANDARD'),
  address: addressSchema,
  contactName: z.string().optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().optional(),
  isActive: z.boolean().default(true),
})

// Create warehouse schema (no createdBy field as it's not in the DB schema)
export const createWarehouseSchema = baseWarehouseSchema

// Update warehouse schema
export const updateWarehouseSchema = baseWarehouseSchema.partial().extend({
  id: z.string().uuid(),
})

// Query warehouses schema
export const warehouseQuerySchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  type: z.enum(['STANDARD', 'DISTRIBUTION_CENTER', 'RETAIL_STORE', 'FULFILLMENT_CENTER', 'CROSS_DOCK', 'COLD_STORAGE']).optional(),
  isActive: z.boolean().optional(),
  sortBy: z.enum(['name', 'code', 'type', 'createdAt', 'updatedAt']).default('name'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
})

// Export types
export type CreateWarehouseInput = z.infer<typeof createWarehouseSchema>
export type UpdateWarehouseInput = z.infer<typeof updateWarehouseSchema>
export type WarehouseQueryInput = z.infer<typeof warehouseQuerySchema>
