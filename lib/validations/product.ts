import { z } from 'zod'

// Base product schema for shared validation
export const baseProductSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(255),
  description: z.string().optional(),
  sku: z.string().min(1, 'SKU is required').max(100),
  barcode: z.string().optional(),
  slug: z.string().optional(),
  categoryId: z.string().uuid().optional(),
  brandId: z.string().uuid().optional(),
  weight: z.number().positive().optional(),
  dimensions: z.object({
    length: z.number().positive(),
    width: z.number().positive(),
    height: z.number().positive(),
    unit: z.enum(['cm', 'in', 'm', 'ft'])
  }).optional(),
  color: z.string().optional(),
  size: z.string().optional(),
  material: z.string().optional(),
  costPrice: z.number().positive().optional(),
  sellingPrice: z.number().positive().optional(),
  wholesalePrice: z.number().positive().optional(),
  minStockLevel: z.number().int().min(0).default(0),
  maxStockLevel: z.number().int().positive().optional(),
  reorderPoint: z.number().int().positive().optional(),
  reorderQuantity: z.number().int().positive().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'DISCONTINUED', 'DRAFT']).default('ACTIVE'),
  isTrackable: z.boolean().default(true),
  isSerialized: z.boolean().default(false),
  images: z.array(z.string().url()).optional(),
  primaryImage: z.string().url().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  tags: z.array(z.string()).optional(),
  leadTimeSupply: z.number().int().positive().optional(),
  shelfLife: z.number().int().positive().optional(),
})

// Create product schema
export const createProductSchema = baseProductSchema.extend({
  createdBy: z.string().uuid('Invalid user ID'),
})

// Update product schema - all fields optional except ID
export const updateProductSchema = baseProductSchema.partial().extend({
  id: z.string().uuid('Invalid product ID'),
})

// Product query schema for filters
export const productQuerySchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  categoryId: z.string().uuid().optional(),
  brandId: z.string().uuid().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'DISCONTINUED', 'DRAFT']).optional(),
  sortBy: z.enum(['name', 'sku', 'createdAt', 'updatedAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

// Product variant schema
export const productVariantSchema = z.object({
  name: z.string().min(1, 'Variant name is required'),
  sku: z.string().min(1, 'Variant SKU is required'),
  barcode: z.string().optional(),
  attributes: z.record(z.string(), z.any()),
  costPrice: z.number().positive().optional(),
  sellingPrice: z.number().positive().optional(),
  minStockLevel: z.number().int().min(0).optional(),
  reorderPoint: z.number().int().positive().optional(),
  isActive: z.boolean().default(true),
})

export const createProductVariantSchema = productVariantSchema.extend({
  productId: z.string().uuid('Invalid product ID'),
})

export const updateProductVariantSchema = productVariantSchema.partial().extend({
  id: z.string().uuid('Invalid variant ID'),
})

// Bulk operations schema
export const bulkProductUpdateSchema = z.object({
  productIds: z.array(z.string().uuid()).min(1, 'At least one product is required'),
  updates: baseProductSchema.partial(),
})

export const bulkProductDeleteSchema = z.object({
  productIds: z.array(z.string().uuid()).min(1, 'At least one product is required'),
})

// Export types
export type CreateProductInput = z.infer<typeof createProductSchema>
export type UpdateProductInput = z.infer<typeof updateProductSchema>
export type ProductQueryInput = z.infer<typeof productQuerySchema>
export type CreateProductVariantInput = z.infer<typeof createProductVariantSchema>
export type UpdateProductVariantInput = z.infer<typeof updateProductVariantSchema>
export type BulkProductUpdateInput = z.infer<typeof bulkProductUpdateSchema>
export type BulkProductDeleteInput = z.infer<typeof bulkProductDeleteSchema>
