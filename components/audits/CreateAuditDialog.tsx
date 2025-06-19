'use client'

import { useState, useEffect } from 'react'
import { Plus, Calendar, Building, Package, Users } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface CreateAuditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAuditCreated: () => void
}

interface Warehouse {
  id: string
  name: string
  description?: string
  type: string
}

interface Product {
  id: string
  name: string
  sku: string
  categoryName?: string
}

interface AuditFormData {
  type: 'CYCLE_COUNT' | 'FULL_COUNT' | 'SPOT_CHECK' | 'ANNUAL_COUNT' | 'INVESTIGATION'
  method: 'FULL_COUNT' | 'SAMPLE_COUNT' | 'ABC_ANALYSIS' | 'PERPETUAL'
  warehouseId?: string
  productId?: string
  plannedDate: string
  supervisedBy?: string
  notes?: string
}

export function CreateAuditDialog({ open, onOpenChange, onAuditCreated }: CreateAuditDialogProps) {
  const [formData, setFormData] = useState<AuditFormData>({
    type: 'CYCLE_COUNT',
    method: 'FULL_COUNT',
    plannedDate: new Date().toISOString().split('T')[0],
    notes: ''
  })
  
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (open) {
      fetchWarehouses()
      fetchProducts()
    }
  }, [open])

  const fetchWarehouses = async () => {
    try {
      const response = await fetch('/api/warehouses')
      if (response.ok) {
        const data = await response.json()
        setWarehouses(data.warehouses || [])
      }
    } catch (error) {
      console.error('Error fetching warehouses:', error)
    }
  }

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products?limit=100')
      if (response.ok) {
        const data = await response.json()
        setProducts(data.products || [])
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.type) {
      newErrors.type = 'Audit type is required'
    }

    if (!formData.method) {
      newErrors.method = 'Audit method is required'
    }

    if (!formData.plannedDate) {
      newErrors.plannedDate = 'Planned date is required'
    } else {
      const plannedDate = new Date(formData.plannedDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      if (plannedDate < today) {
        newErrors.plannedDate = 'Planned date cannot be in the past'
      }
    }

    // Specific validations based on audit type
    if (formData.type === 'SPOT_CHECK' && !formData.productId) {
      newErrors.productId = 'Product is required for spot checks'
    }

    if (formData.type === 'CYCLE_COUNT' && !formData.warehouseId) {
      newErrors.warehouseId = 'Warehouse is required for cycle counts'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/audits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        onAuditCreated()
        onOpenChange(false)
        resetForm()
      } else {
        const errorData = await response.json()
        setErrors({ submit: errorData.message || 'Failed to create audit' })
      }
    } catch (error) {
      console.error('Error creating audit:', error)
      setErrors({ submit: 'Failed to create audit' })
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      type: 'CYCLE_COUNT',
      method: 'FULL_COUNT',
      plannedDate: new Date().toISOString().split('T')[0],
      notes: ''
    })
    setErrors({})
  }

  const getAuditTypeDescription = (type: string) => {
    switch (type) {
      case 'CYCLE_COUNT':
        return 'Regular counting of specific inventory locations or categories on a rotating schedule'
      case 'FULL_COUNT':
        return 'Complete physical count of all inventory items in selected warehouses'
      case 'SPOT_CHECK':
        return 'Random or targeted verification of specific products or locations'
      case 'ANNUAL_COUNT':
        return 'Comprehensive annual inventory verification for compliance and reporting'
      case 'INVESTIGATION':
        return 'Detailed audit to investigate discrepancies or specific issues'
      default:
        return ''
    }
  }

  const getMethodDescription = (method: string) => {
    switch (method) {
      case 'FULL_COUNT':
        return 'Count every single item in the audit scope'
      case 'SAMPLE_COUNT':
        return 'Count a representative sample of items'
      case 'ABC_ANALYSIS':
        return 'Prioritize counting based on item value and movement'
      case 'PERPETUAL':
        return 'Continuous counting as part of regular operations'
      default:
        return ''
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create New Audit
          </DialogTitle>
          <DialogDescription>
            Set up a new inventory audit with specific parameters and schedule
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Audit Type Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Audit Type</CardTitle>
              <CardDescription>
                Choose the type of audit to perform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={formData.type}
                onValueChange={(value) => setFormData({ 
                  ...formData, 
                  type: value as AuditFormData['type'],
                  // Clear conflicting fields when changing type
                  warehouseId: value === 'SPOT_CHECK' ? undefined : formData.warehouseId,
                  productId: value !== 'SPOT_CHECK' ? undefined : formData.productId
                })}
                className="space-y-3"
              >
                {[
                  { value: 'CYCLE_COUNT', label: 'Cycle Count', icon: Calendar },
                  { value: 'FULL_COUNT', label: 'Full Count', icon: Building },
                  { value: 'SPOT_CHECK', label: 'Spot Check', icon: Package },
                  { value: 'ANNUAL_COUNT', label: 'Annual Count', icon: Calendar },
                  { value: 'INVESTIGATION', label: 'Investigation', icon: Users }
                ].map(({ value, label, icon: Icon }) => (
                  <div key={value} className="flex items-center space-x-2">
                    <RadioGroupItem value={value} id={value} />
                    <Label htmlFor={value} className="flex items-center gap-2 cursor-pointer">
                      <Icon className="h-4 w-4" />
                      <div>
                        <p className="font-medium">{label}</p>
                        <p className="text-sm text-muted-foreground">
                          {getAuditTypeDescription(value)}
                        </p>
                      </div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
              {errors.type && (
                <p className="text-sm text-red-600 mt-2">{errors.type}</p>
              )}
            </CardContent>
          </Card>

          {/* Audit Method */}
          <div className="space-y-2">
            <Label htmlFor="method">Counting Method</Label>
            <Select
              value={formData.method}
              onValueChange={(value) => setFormData({ 
                ...formData, 
                method: value as AuditFormData['method']
              })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select counting method" />
              </SelectTrigger>
              <SelectContent>
                {[
                  { value: 'FULL_COUNT', label: 'Full Count' },
                  { value: 'SAMPLE_COUNT', label: 'Sample Count' },
                  { value: 'ABC_ANALYSIS', label: 'ABC Analysis' },
                  { value: 'PERPETUAL', label: 'Perpetual' }
                ].map(({ value, label }) => (
                  <SelectItem key={value} value={value}>
                    <div>
                      <p className="font-medium">{label}</p>
                      <p className="text-sm text-muted-foreground">
                        {getMethodDescription(value)}
                      </p>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.method && (
              <p className="text-sm text-red-600">{errors.method}</p>
            )}
          </div>

          {/* Scope Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Warehouse Selection */}
            {formData.type !== 'SPOT_CHECK' && (
              <div className="space-y-2">
                <Label htmlFor="warehouse">
                  Warehouse
                  {formData.type === 'CYCLE_COUNT' && <span className="text-red-500"> *</span>}
                </Label>
                <Select                  value={formData.warehouseId || 'all'}
                  onValueChange={(value) => setFormData({ 
                    ...formData, 
                    warehouseId: value === 'all' ? undefined : value
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select warehouse (optional)" />
                  </SelectTrigger>                  <SelectContent>
                    <SelectItem value="all">All Warehouses</SelectItem>
                    {warehouses.map((warehouse) => (
                      <SelectItem key={warehouse.id} value={warehouse.id}>
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4" />
                          <div>
                            <p className="font-medium">{warehouse.name}</p>
                            {warehouse.description && (
                              <p className="text-sm text-muted-foreground">
                                {warehouse.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.warehouseId && (
                  <p className="text-sm text-red-600">{errors.warehouseId}</p>
                )}
              </div>
            )}

            {/* Product Selection for Spot Checks */}
            {formData.type === 'SPOT_CHECK' && (
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="product">
                  Product <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.productId || ''}
                  onValueChange={(value) => setFormData({ 
                    ...formData, 
                    productId: value || undefined
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select product to audit" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4" />
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span>SKU: {product.sku}</span>
                              {product.categoryName && (
                                <Badge variant="outline" className="text-xs">
                                  {product.categoryName}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.productId && (
                  <p className="text-sm text-red-600">{errors.productId}</p>
                )}
              </div>
            )}
          </div>

          {/* Schedule & Team */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="plannedDate">
                Planned Date <span className="text-red-500">*</span>
              </Label>
              <Input
                id="plannedDate"
                type="date"
                value={formData.plannedDate}
                onChange={(e) => setFormData({ ...formData, plannedDate: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
              />
              {errors.plannedDate && (
                <p className="text-sm text-red-600">{errors.plannedDate}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="supervisedBy">Supervisor (User ID)</Label>
              <Input
                id="supervisedBy"
                placeholder="Enter supervisor user ID"
                value={formData.supervisedBy || ''}
                onChange={(e) => setFormData({ ...formData, supervisedBy: e.target.value })}
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Additional notes or instructions for this audit..."
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>

          {/* Error Message */}
          {errors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? 'Creating...' : 'Create Audit'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
