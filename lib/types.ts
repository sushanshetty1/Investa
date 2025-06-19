// Global type definitions for the inventory management system
// These types match the database schema and frontend expectations

export interface Category {
  id: string
  name: string
  description?: string
  slug: string
  parentId?: string
  level: number
  path?: string
  icon?: string
  color?: string
  image?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  // Relations (optional for API responses)
  parent?: Category
  children?: Category[]
  productCount?: number
}

export interface Brand {
  id: string
  name: string
  description?: string
  logo?: string
  website?: string
  contactEmail?: string
  contactPhone?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  // Relations (optional for API responses)
  productCount?: number
}

export interface Supplier {
  id: string
  name: string
  description?: string
  contactPerson?: string
  email?: string
  phone?: string
  address?: string
  city?: string
  state?: string
  postalCode?: string
  country?: string
  website?: string
  taxId?: string
  paymentTerms?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  // Relations (optional for API responses)
  productCount?: number
}

export interface Warehouse {
  id: string
  name: string
  description?: string
  type: 'MAIN' | 'BRANCH' | 'STORAGE' | 'TRANSIT'
  address?: string
  city?: string
  state?: string
  postalCode?: string
  country?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  // Relations (optional for API responses)
  inventoryItemCount?: number
}

// Stock information (computed/aggregated)
export interface StockInfo {
  quantity: number
  reservedQuantity: number
  availableQuantity: number
  reorderPoint?: number
  minStockLevel?: number
  maxStockLevel?: number
}

export interface ProductVariant {
  id: string
  productId: string
  name: string
  sku: string
  barcode?: string
  attributes: Record<string, unknown>
  costPrice?: number
  sellingPrice?: number
  minStockLevel?: number
  reorderPoint?: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  // Stock information (computed from inventoryItems)
  stock?: StockInfo
}

export interface Product {
  id: string
  name: string
  description?: string
  sku: string
  barcode?: string
  categoryId?: string
  brandId?: string
  supplierId?: string
  type: 'SIMPLE' | 'VARIABLE' | 'BUNDLE'
  status: 'ACTIVE' | 'INACTIVE' | 'DRAFT' | 'ARCHIVED'
  tags?: string[]
  images?: string[]
  attributes?: Record<string, unknown>
  costPrice?: number
  sellingPrice?: number
  weight?: number
  dimensions?: Record<string, unknown>
  minStockLevel?: number
  reorderPoint?: number
  maxStockLevel?: number
  trackInventory: boolean
  sellWithoutStock: boolean
  taxable: boolean
  featured: boolean
  createdAt: Date
  updatedAt: Date
  // Relations (optional for API responses)
  category?: Category
  brand?: Brand
  supplier?: Supplier
  variants?: ProductVariant[]
  stock?: StockInfo
}

export interface InventoryItem {
  id: string
  productId?: string
  variantId?: string
  warehouseId: string
  locationId?: string
  quantity: number
  reservedQuantity: number
  availableQuantity: number
  reorderPoint?: number
  minStockLevel?: number
  maxStockLevel?: number
  lastStockTake?: Date
  createdAt: Date
  updatedAt: Date
  // Relations (optional for API responses)
  product?: Product
  variant?: ProductVariant
  warehouse?: Warehouse
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  pagination: PaginationInfo
}

// Query input types
export interface BaseQueryParams {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface ProductQueryParams extends BaseQueryParams {
  categoryId?: string
  brandId?: string
  supplierId?: string
  type?: 'SIMPLE' | 'VARIABLE' | 'BUNDLE'
  status?: 'ACTIVE' | 'INACTIVE' | 'DRAFT' | 'ARCHIVED'
  featured?: boolean
  trackInventory?: boolean
  lowStock?: boolean
}

export interface CategoryQueryParams extends BaseQueryParams {
  parentId?: string
  level?: number
  isActive?: boolean
}
