'use client'

import { useState } from 'react'
import { Plus, Edit, Trash2, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Separator } from '@/components/ui/separator'

interface ProductVariant {
  id: string
  name: string
  sku: string
  barcode?: string
  attributes: Record<string, string>
  costPrice?: number
  sellingPrice?: number
  minStockLevel?: number
  reorderPoint?: number
  isActive: boolean
  stock?: {
    quantity: number
    reservedQuantity: number
    availableQuantity: number
  }
}

interface Product {
  id: string
  name: string
  sku: string
  variants?: ProductVariant[]
}

interface ProductVariantsManagerProps {
  product: Product
  onVariantCreate: (variant: Omit<ProductVariant, 'id' | 'stock'>) => Promise<void>
  onVariantUpdate: (variantId: string, data: Partial<ProductVariant>) => Promise<void>
  onVariantDelete: (variantId: string) => Promise<void>
}

export function ProductVariantsManager({
  product,
  onVariantCreate,
  onVariantUpdate,
  onVariantDelete
}: ProductVariantsManagerProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null)
  const [loading, setLoading] = useState(false)

  // Form state for creating/editing variants
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    barcode: '',
    attributes: {} as Record<string, string>,
    costPrice: 0,
    sellingPrice: 0,
    minStockLevel: 0,
    reorderPoint: 0,
    isActive: true
  })

  // Available attribute options
  const attributeOptions = {
    color: ['Red', 'Blue', 'Green', 'Black', 'White', 'Yellow', 'Purple', 'Orange'],
    size: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '2XL', '3XL'],
    material: ['Cotton', 'Polyester', 'Leather', 'Plastic', 'Metal', 'Wood', 'Glass'],
    style: ['Casual', 'Formal', 'Sport', 'Classic', 'Modern', 'Vintage']
  }

  const resetForm = () => {
    setFormData({
      name: '',
      sku: '',
      barcode: '',
      attributes: {},
      costPrice: 0,
      sellingPrice: 0,
      minStockLevel: 0,
      reorderPoint: 0,
      isActive: true
    })
  }

  const handleCreate = () => {
    setSelectedVariant(null)
    resetForm()
    setShowCreateDialog(true)
  }

  const handleEdit = (variant: ProductVariant) => {
    setSelectedVariant(variant)
    setFormData({
      name: variant.name,
      sku: variant.sku,
      barcode: variant.barcode || '',
      attributes: variant.attributes,
      costPrice: variant.costPrice || 0,
      sellingPrice: variant.sellingPrice || 0,
      minStockLevel: variant.minStockLevel || 0,
      reorderPoint: variant.reorderPoint || 0,
      isActive: variant.isActive
    })
    setShowEditDialog(true)
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      if (selectedVariant) {
        await onVariantUpdate(selectedVariant.id, formData)
        setShowEditDialog(false)
      } else {
        await onVariantCreate(formData)
        setShowCreateDialog(false)
      }
      resetForm()
    } catch (error) {
      console.error('Error saving variant:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (variantId: string) => {
    if (confirm('Are you sure you want to delete this variant? This action cannot be undone.')) {
      setLoading(true)
      try {
        await onVariantDelete(variantId)
      } catch (error) {
        console.error('Error deleting variant:', error)
      } finally {
        setLoading(false)
      }
    }
  }

  const updateAttribute = (key: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      attributes: {
        ...prev.attributes,
        [key]: value
      }
    }))
  }

  const removeAttribute = (key: string) => {
    setFormData(prev => ({
      ...prev,
      attributes: Object.fromEntries(
        Object.entries(prev.attributes).filter(([k]) => k !== key)
      )
    }))
  }
  const getStockStatus = (variant: ProductVariant) => {
    const { quantity = 0, availableQuantity = 0 } = variant.stock || {}
    
    if (quantity === 0) return { label: 'Out of Stock', color: 'destructive' as const }
    if (availableQuantity <= (variant.minStockLevel || 0)) return { label: 'Low Stock', color: 'secondary' as const }
    return { label: 'In Stock', color: 'default' as const }
  }

  const VariantFormDialog = ({ open, onOpenChange, title }: { 
    open: boolean
    onOpenChange: (open: boolean) => void
    title: string 
  }) => (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {selectedVariant ? 'Update variant information' : 'Create a new product variant'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="variant-name">Variant Name</Label>
              <Input
                id="variant-name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Red Large T-Shirt"
              />
            </div>
            <div>
              <Label htmlFor="variant-sku">SKU</Label>
              <Input
                id="variant-sku"
                value={formData.sku}
                onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                placeholder="e.g., TSHIRT-RED-L"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="variant-barcode">Barcode</Label>
            <Input
              id="variant-barcode"
              value={formData.barcode}
              onChange={(e) => setFormData(prev => ({ ...prev, barcode: e.target.value }))}
              placeholder="Optional barcode"
            />
          </div>

          <Separator />

          <div>
            <Label className="text-sm font-medium">Variant Attributes</Label>
            <div className="space-y-3 mt-2">
              {Object.entries(attributeOptions).map(([key, options]) => (
                <div key={key} className="flex items-center gap-2">
                  <Label className="w-16 text-sm capitalize">{key}:</Label>
                  <Select
                    value={formData.attributes[key] || ''}
                    onValueChange={(value) => updateAttribute(key, value)}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder={`Select ${key}`} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {options.map(option => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formData.attributes[key] && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeAttribute(key)}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="variant-cost">Cost Price</Label>
              <Input
                id="variant-cost"
                type="number"
                step="0.01"
                value={formData.costPrice}
                onChange={(e) => setFormData(prev => ({ ...prev, costPrice: parseFloat(e.target.value) || 0 }))}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="variant-selling">Selling Price</Label>
              <Input
                id="variant-selling"
                type="number"
                step="0.01"
                value={formData.sellingPrice}
                onChange={(e) => setFormData(prev => ({ ...prev, sellingPrice: parseFloat(e.target.value) || 0 }))}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="variant-min-stock">Min Stock Level</Label>
              <Input
                id="variant-min-stock"
                type="number"
                value={formData.minStockLevel}
                onChange={(e) => setFormData(prev => ({ ...prev, minStockLevel: parseInt(e.target.value) || 0 }))}
                placeholder="0"
              />
            </div>
            <div>
              <Label htmlFor="variant-reorder">Reorder Point</Label>
              <Input
                id="variant-reorder"
                type="number"
                value={formData.reorderPoint}
                onChange={(e) => setFormData(prev => ({ ...prev, reorderPoint: parseInt(e.target.value) || 0 }))}
                placeholder="0"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Saving...' : (selectedVariant ? 'Update' : 'Create')} Variant
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Product Variants</CardTitle>
            <CardDescription>
              Manage different variations of {product.name}
            </CardDescription>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Add Variant
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!product.variants || product.variants.length === 0 ? (
          <div className="text-center py-8">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No variants found</h3>
            <p className="text-muted-foreground mb-4">
              Create variants to track different sizes, colors, or other attributes.
            </p>
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Variant
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Variant</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Attributes</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Pricing</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {product.variants.map((variant) => {
                const stockStatus = getStockStatus(variant)
                return (
                  <TableRow key={variant.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{variant.name}</div>
                        {variant.barcode && (
                          <div className="text-sm text-muted-foreground">
                            Barcode: {variant.barcode}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-1 py-0.5 rounded">
                        {variant.sku}
                      </code>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(variant.attributes).map(([key, value]) => (
                          <Badge key={key} variant="outline" className="text-xs">
                            {key}: {value}
                          </Badge>
                        ))}
                        {Object.keys(variant.attributes).length === 0 && (
                          <span className="text-sm text-muted-foreground">No attributes</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Badge variant={stockStatus.color} className="text-xs">
                          {stockStatus.label}
                        </Badge>
                        <div className="text-xs text-muted-foreground">
                          Available: {variant.stock?.availableQuantity || 0}
                        </div>                        {(variant.stock?.reservedQuantity || 0) > 0 && (
                          <div className="text-xs text-muted-foreground">
                            Reserved: {variant.stock?.reservedQuantity || 0}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm space-y-1">
                        {variant.costPrice && (
                          <div>Cost: ${variant.costPrice.toFixed(2)}</div>
                        )}
                        {variant.sellingPrice && (
                          <div>Sell: ${variant.sellingPrice.toFixed(2)}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={variant.isActive ? 'default' : 'secondary'}>
                        {variant.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            ⋮
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(variant)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDelete(variant.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}

        <VariantFormDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          title="Create New Variant"
        />

        <VariantFormDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          title="Edit Variant"
        />
      </CardContent>
    </Card>
  )
}
