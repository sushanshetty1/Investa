'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Plus, Search, Filter, Upload, Download, Edit, Trash2, Eye, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { ProductFormDialog } from '@/components/inventory/ProductFormDialog'
import { ProductVariantsManager } from '@/components/inventory/ProductVariantsManager'
import { CategoryManager } from '@/components/inventory/CategoryManager'
import { BulkActionsDialog } from '@/components/inventory/BulkActionsDialog'

interface Product {
  id: string
  name: string
  sku: string
  barcode?: string
  description?: string
  categoryId?: string
  brandId?: string
  costPrice?: number
  sellingPrice?: number
  wholesalePrice?: number
  minStockLevel: number
  maxStockLevel?: number
  reorderPoint?: number
  status: 'ACTIVE' | 'INACTIVE' | 'DISCONTINUED' | 'DRAFT'
  primaryImage?: string
  isTrackable: boolean
  isSerialized: boolean
  totalStock: number
  availableStock: number
  reservedStock: number
  createdAt: string
  updatedAt: string
  category?: {
    id: string
    name: string
  }
  brand?: {
    id: string
    name: string
  }
  variants?: ProductVariant[]
}

interface ProductVariant {
  id: string
  name: string
  sku: string
  attributes: Record<string, string>
  costPrice?: number
  sellingPrice?: number
  isActive: boolean
  stock: number
}

interface Category {
  id: string
  name: string
  description?: string
  level: number
  parentId?: string
  children?: Category[]
}

interface Brand {
  id: string
  name: string
  description?: string
  isActive: boolean
}

export default function ProductsPage() {  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedBrand, setSelectedBrand] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(20)

  // Dialog states
  const [showProductForm, setShowProductForm] = useState(false)
  const [showCategoryManager, setShowCategoryManager] = useState(false)
  const [showBulkActions, setShowBulkActions] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)  // Load data
  useEffect(() => {
    loadData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadData = async () => {
    try {
      // TODO: Replace with actual API calls
      await Promise.all([
        loadProducts(),
        loadCategories(),
        loadBrands()
      ])    } catch (error) {
      console.error('Error loading data:', error)
    }
  }

  const loadProducts = async () => {
    // TODO: Implement API call to fetch products with inventory data
    // This would use the neonClient to fetch from Product model with relations
    const mockProducts: Product[] = [
      {
        id: '1',
        name: 'Premium Laptop Stand',
        sku: 'LPS-001',
        barcode: '1234567890123',
        description: 'Adjustable aluminum laptop stand with cooling vents',
        categoryId: 'cat-1',
        brandId: 'brand-1',
        costPrice: 45.99,
        sellingPrice: 89.99,
        wholesalePrice: 65.99,
        minStockLevel: 10,
        maxStockLevel: 100,
        reorderPoint: 15,
        status: 'ACTIVE',
        primaryImage: '/images/laptop-stand.jpg',
        isTrackable: true,
        isSerialized: false,
        totalStock: 85,
        availableStock: 78,
        reservedStock: 7,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-20T14:30:00Z',
        category: { id: 'cat-1', name: 'Computer Accessories' },
        brand: { id: 'brand-1', name: 'TechPro' }
      },
      // Add more mock products...
    ]
    setProducts(mockProducts)
  }

  const loadCategories = async () => {
    // TODO: Implement API call to fetch categories hierarchy
    const mockCategories: Category[] = [
      {
        id: 'cat-1',
        name: 'Computer Accessories',
        description: 'Accessories for computers and laptops',
        level: 0,
        parentId: undefined
      },
      // Add more mock categories...
    ]
    setCategories(mockCategories)
  }

  const loadBrands = async () => {
    // TODO: Implement API call to fetch brands
    const mockBrands: Brand[] = [
      {
        id: 'brand-1',
        name: 'TechPro',
        description: 'Professional technology accessories',
        isActive: true
      },
      // Add more mock brands...
    ]
    setBrands(mockBrands)
  }

  // Filter products based on search and filters
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.barcode && product.barcode.includes(searchTerm))
    
    const matchesCategory = selectedCategory === 'all' || product.categoryId === selectedCategory
    const matchesBrand = selectedBrand === 'all' || product.brandId === selectedBrand
    const matchesStatus = statusFilter === 'all' || product.status === statusFilter

    return matchesSearch && matchesCategory && matchesBrand && matchesStatus
  })

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage)

  const handleSelectProduct = (productId: string, checked: boolean) => {
    if (checked) {
      setSelectedProducts([...selectedProducts, productId])
    } else {
      setSelectedProducts(selectedProducts.filter(id => id !== productId))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProducts(paginatedProducts.map(p => p.id))
    } else {
      setSelectedProducts([])
    }
  }

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product)
    setShowProductForm(true)
  }
  const handleManageVariants = (product: Product) => {
    setSelectedProduct(product)
    // TODO: Implement variants manager
    console.log('Manage variants for product:', product.id)
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      ACTIVE: 'default',
      INACTIVE: 'secondary',
      DISCONTINUED: 'destructive',
      DRAFT: 'outline'
    } as const

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {status}
      </Badge>
    )
  }

  const getStockStatus = (product: Product) => {
    if (product.availableStock <= 0) {
      return <Badge variant="destructive">Out of Stock</Badge>
    } else if (product.availableStock <= product.minStockLevel) {
      return <Badge variant="outline" className="border-yellow-500 text-yellow-600">Low Stock</Badge>
    } else {
      return <Badge variant="secondary">In Stock</Badge>
    }
  }
    return (
    <div className="py-16 px-6 mx-4 md:mx-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-between sm:items-center">
        <div>
          <h1 className="text-3xl font-bold">Products Management</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage your product catalog, inventory, and variants
          </p>
        </div>
        <div className="flex gap-2 mt-2 sm:mt-0">
          <Button variant="outline" onClick={() => setShowCategoryManager(true)}>
            <Package className="h-4 w-4 mr-2" />
            Categories
          </Button>
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => {
            setSelectedProduct(null)
            setShowProductForm(true)
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
            <p className="text-xs text-muted-foreground">
              +2.1% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 p-2 sm:p-4">
            <CardTitle className="text-xs sm:text-sm font-medium">Active Products</CardTitle>
            <Package className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-2 sm:p-4 pt-0">
            <div className="text-lg sm:text-xl md:text-2xl font-bold">
              {products.filter(p => p.status === 'ACTIVE').length}
            </div>
            <p className="text-xs text-muted-foreground">
              {((products.filter(p => p.status === 'ACTIVE').length / products.length) * 100).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 p-2 sm:p-4">
            <CardTitle className="text-xs sm:text-sm font-medium">Low Stock Items</CardTitle>
            <Package className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-2 sm:p-4 pt-0">
            <div className="text-lg sm:text-xl md:text-2xl font-bold text-yellow-600">
              {products.filter(p => p.availableStock <= p.minStockLevel).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Require attention
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 p-2 sm:p-4">
            <CardTitle className="text-xs sm:text-sm font-medium">Out of Stock</CardTitle>
            <Package className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-2 sm:p-4 pt-0">
            <div className="text-lg sm:text-xl md:text-2xl font-bold text-red-600">
              {products.filter(p => p.availableStock <= 0).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Need restocking
            </p>
          </CardContent>
        </Card>
      </div>      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products by name, SKU, or barcode..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
              <div>
                <label className="text-sm font-medium mb-2 block">Category</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Brand</label>
                <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Brands" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Brands</SelectItem>
                    {brands.map((brand) => (
                      <SelectItem key={brand.id} value={brand.id}>
                        {brand.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                    <SelectItem value="DISCONTINUED">Discontinued</SelectItem>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedProducts.length > 0 && (
        <Card>
          <CardContent className="p-3 sm:p-6">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm text-muted-foreground">
                {selectedProducts.length} product(s) selected
              </span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowBulkActions(true)}
              >
                Bulk Actions
              </Button>
            </div>
          </CardContent>
        </Card>
      )}      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Products ({filteredProducts.length})</CardTitle>
          <CardDescription>
            Manage your product catalog and inventory levels
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedProducts.length === paginatedProducts.length && paginatedProducts.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Product</TableHead>
                <TableHead className="hidden sm:table-cell">SKU</TableHead>
                <TableHead className="hidden md:table-cell">Category</TableHead>
                <TableHead className="hidden md:table-cell">Brand</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead className="hidden sm:table-cell">Available</TableHead>
                <TableHead className="hidden sm:table-cell">Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedProducts.includes(product.id)}
                      onCheckedChange={(checked) => 
                        handleSelectProduct(product.id, checked as boolean)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 sm:gap-3">
                      {product.primaryImage ? (
                        <Image
                          src={product.primaryImage}
                          alt={product.name}
                          width={40}
                          height={40}
                          className="w-8 h-8 sm:w-10 sm:h-10 rounded object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-muted rounded flex items-center justify-center">
                          <Package className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-sm sm:text-base truncate max-w-[120px] sm:max-w-[200px]">{product.name}</div>
                        {product.description && (
                          <div className="text-xs sm:text-sm text-muted-foreground truncate max-w-[120px] sm:max-w-[200px]">
                            {product.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <code className="text-xs sm:text-sm bg-muted px-1.5 py-0.5 sm:px-2 sm:py-1 rounded">
                      {product.sku}
                    </code>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{product.category?.name || '-'}</TableCell>
                  <TableCell className="hidden md:table-cell">{product.brand?.name || '-'}</TableCell>
                  <TableCell>{getStockStatus(product)}</TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <div className="text-xs sm:text-sm">
                      <div>{product.availableStock}</div>
                      <div className="text-muted-foreground">
                        of {product.totalStock}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {product.sellingPrice ? `$${product.sellingPrice.toFixed(2)}` : '-'}
                  </TableCell>
                  <TableCell>{getStatusBadge(product.status)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                          <span className="sr-only">Open menu</span>
                          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
                            <path d="M3.625 7.5C3.625 8.12132 3.12132 8.625 2.5 8.625C1.87868 8.625 1.375 8.12132 1.375 7.5C1.375 6.87868 1.87868 6.375 2.5 6.375C3.12132 6.375 3.625 6.87868 3.625 7.5ZM8.625 7.5C8.625 8.12132 8.12132 8.625 7.5 8.625C6.87868 8.625 6.375 8.12132 6.375 7.5C6.375 6.87868 6.87868 6.375 7.5 6.375C8.12132 6.375 8.625 6.87868 8.625 7.5ZM12.5 8.625C13.1213 8.625 13.625 8.12132 13.625 7.5C13.625 6.87868 13.1213 6.375 12.5 6.375C11.8787 6.375 11.375 6.87868 11.375 7.5C11.375 8.12132 11.8787 8.625 12.5 8.625Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                          </svg>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditProduct(product)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Product
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleManageVariants(product)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Manage Variants
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Product
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredProducts.length)} of {filteredProducts.length} products
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm px-3 py-1">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <ProductFormDialog
        open={showProductForm}
        onOpenChange={setShowProductForm}
        product={selectedProduct || undefined}
        categories={categories}
        brands={brands}
        onSave={async () => {
          await loadProducts()
        }}
      />      {selectedProduct && (
        <ProductVariantsManager
          product={selectedProduct}          onVariantCreate={async (variant: Omit<ProductVariant, 'id' | 'stock'>) => {
            // Implement variant creation
            console.log('Creating variant:', variant)
          }}
          onVariantUpdate={async (variantId: string, data: Partial<ProductVariant>) => {
            // Implement variant update
            console.log('Updating variant:', variantId, data)
          }}
          onVariantDelete={async (variantId: string) => {
            // Implement variant deletion
            console.log('Deleting variant:', variantId)
          }}
        />
      )}

      <CategoryManager
        open={showCategoryManager}
        onOpenChange={setShowCategoryManager}
        categories={categories}
        onSave={loadCategories}
      />

      <BulkActionsDialog
        open={showBulkActions}
        onOpenChange={setShowBulkActions}
        selectedProductIds={selectedProducts}
        onComplete={() => {
          setSelectedProducts([])
          loadProducts()
        }}
      />
    </div>
  )
}
