import { z } from 'zod'

// Base supplier schema
export const baseSupplierSchema = z.object({
  name: z.string().min(1, 'Supplier name is required').max(255),
  code: z.string().min(1, 'Supplier code is required').max(50),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  website: z.string().url().optional(),
  companyType: z.enum(['CORPORATION', 'LLC', 'PARTNERSHIP', 'SOLE_PROPRIETORSHIP', 'NON_PROFIT', 'GOVERNMENT', 'OTHER']).optional(),
  taxId: z.string().optional(),
  vatNumber: z.string().optional(),
  registrationNumber: z.string().optional(),
  billingAddress: z.object({
    street: z.string().min(1, 'Street address is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    country: z.string().min(1, 'Country is required'),
    zipCode: z.string().min(1, 'ZIP code is required'),
  }),
  shippingAddress: z.object({
    street: z.string().min(1, 'Street address is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    country: z.string().min(1, 'Country is required'),
    zipCode: z.string().min(1, 'ZIP code is required'),
  }).optional(),
  contactName: z.string().optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().optional(),
  contactTitle: z.string().optional(),
  paymentTerms: z.string().optional(),
  creditLimit: z.number().positive().optional(),
  currency: z.string().length(3).default('USD'),
  rating: z.number().min(1).max(5).optional(),
  onTimeDelivery: z.number().min(0).max(100).optional(),
  qualityRating: z.number().min(1).max(5).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'PENDING_APPROVAL', 'SUSPENDED', 'BLACKLISTED']).default('ACTIVE'),
  certifications: z.array(z.string()).optional(),
  notes: z.string().optional(),
})

// Create supplier schema
export const createSupplierSchema = baseSupplierSchema.extend({
  createdBy: z.string().uuid('Invalid user ID'),
})

// Update supplier schema
export const updateSupplierSchema = baseSupplierSchema.partial().extend({
  id: z.string().uuid('Invalid supplier ID'),
})

// Supplier query schema
export const supplierQuerySchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'PENDING_APPROVAL', 'SUSPENDED', 'BLACKLISTED']).optional(),
  companyType: z.enum(['CORPORATION', 'LLC', 'PARTNERSHIP', 'SOLE_PROPRIETORSHIP', 'NON_PROFIT', 'GOVERNMENT', 'OTHER']).optional(),
  sortBy: z.enum(['name', 'code', 'createdAt', 'updatedAt', 'rating']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

// Product supplier relationship schema
export const productSupplierSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  supplierId: z.string().uuid('Invalid supplier ID'),
  supplierSku: z.string().optional(),
  supplierName: z.string().optional(),
  unitCost: z.number().positive('Unit cost must be positive'),
  currency: z.string().length(3).default('USD'),
  minOrderQty: z.number().int().positive().optional(),
  maxOrderQty: z.number().int().positive().optional(),
  leadTimeDays: z.number().int().positive().optional(),
  isPreferred: z.boolean().default(false),
  isActive: z.boolean().default(true),
})

export const updateProductSupplierSchema = productSupplierSchema.partial().extend({
  id: z.string().uuid('Invalid product supplier ID'),
})

// Supplier contact schema
export const supplierContactSchema = z.object({
  supplierId: z.string().uuid('Invalid supplier ID'),
  name: z.string().min(1, 'Contact name is required'),
  title: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  mobile: z.string().optional(),
  isPrimary: z.boolean().default(false),
  department: z.string().optional(),
  isActive: z.boolean().default(true),
  notes: z.string().optional(),
})

export const updateSupplierContactSchema = supplierContactSchema.partial().extend({
  id: z.string().uuid('Invalid contact ID'),
})

// Export types
export type CreateSupplierInput = z.infer<typeof createSupplierSchema>
export type UpdateSupplierInput = z.infer<typeof updateSupplierSchema>
export type SupplierQueryInput = z.infer<typeof supplierQuerySchema>
export type ProductSupplierInput = z.infer<typeof productSupplierSchema>
export type UpdateProductSupplierInput = z.infer<typeof updateProductSupplierSchema>
export type SupplierContactInput = z.infer<typeof supplierContactSchema>
export type UpdateSupplierContactInput = z.infer<typeof updateSupplierContactSchema>
