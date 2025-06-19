'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'

interface StockMovementDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: () => void
}

export function StockMovementDialog({ open,
  onOpenChange,
  onSave
}: StockMovementDialogProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [products, setProducts] = useState<{ id: string; name: string; sku: string }[]>([])
  const [warehouses, setWarehouses] = useState<{ id: string; name: string; code?: string }[]>([])
  const [formData, setFormData] = useState({
    type: 'IN',
    productId: '',
    warehouseId: '',
    quantity: '',
    reason: '',
    notes: '',
    referenceType: 'MANUAL',
    referenceId: ''
  })

  // Load products and warehouses
  useEffect(() => {
    if (open) {
      loadProducts()
      loadWarehouses()
    }
  }, [open])

  const loadProducts = async () => {
    try {
      const response = await fetch('/api/inventory/products?limit=100')
      if (response.ok) {
        const data = await response.json()
        setProducts(data.products || [])
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error) {
      toast.error('Error loading products')
    }
  }

  const loadWarehouses = async () => {
    try {
      const response = await fetch('/api/inventory/warehouses')
      if (response.ok) {
        const data = await response.json()
        setWarehouses(data.warehouses || [])
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error) {
      toast.error('Error loading warehouses')
    }
  }
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.productId || !formData.warehouseId || !formData.quantity) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      setLoading(true)
      const movementData = {
        ...formData,
        quantity: parseInt(formData.quantity),
        userId: user?.id || 'anonymous-user',
        occurredAt: new Date().toISOString()
      }

      const response = await fetch('/api/inventory/stock/movements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(movementData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to save stock movement')
      } onSave()
      onOpenChange(false)
      toast.success('Stock movement saved successfully')

      // Reset form
      setFormData({
        type: 'IN',
        productId: '',
        warehouseId: '',
        quantity: '', reason: '',
        notes: '',
        referenceType: 'MANUAL',
        referenceId: ''
      })
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error) {
      toast.error('Failed to save stock movement. Please try again.')
    } finally {
      setLoading(false)
    }
  }
  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Record Stock Movement</DialogTitle>
          <DialogDescription>
            Record a manual stock movement transaction
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Movement Details</CardTitle>
              <CardDescription>
                Specify the type and details of the stock movement
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Movement Type *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => handleInputChange('type', value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select movement type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="IN">Stock In</SelectItem>
                      <SelectItem value="OUT">Stock Out</SelectItem>
                      <SelectItem value="ADJUSTMENT">Adjustment</SelectItem>
                      <SelectItem value="TRANSFER">Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => handleInputChange('quantity', e.target.value)}
                    placeholder="Enter quantity"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="product">Product *</Label>
                <Select
                  value={formData.productId}
                  onValueChange={(value) => handleInputChange('productId', value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name} ({product.sku})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="warehouse">Warehouse *</Label>
                <Select
                  value={formData.warehouseId}
                  onValueChange={(value) => handleInputChange('warehouseId', value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select warehouse" />
                  </SelectTrigger>
                  <SelectContent>
                    {warehouses.map((warehouse) => (
                      <SelectItem key={warehouse.id} value={warehouse.id}>
                        {warehouse.name} ({warehouse.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Reason *</Label>
                <Select
                  value={formData.reason}
                  onValueChange={(value) => handleInputChange('reason', value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select reason" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PURCHASE">Purchase Receipt</SelectItem>
                    <SelectItem value="SALE">Sale</SelectItem>
                    <SelectItem value="ADJUSTMENT">Stock Adjustment</SelectItem>
                    <SelectItem value="DAMAGE">Damaged Goods</SelectItem>
                    <SelectItem value="EXPIRED">Expired Items</SelectItem>
                    <SelectItem value="THEFT">Theft/Loss</SelectItem>
                    <SelectItem value="RETURN">Customer Return</SelectItem>
                    <SelectItem value="TRANSFER">Warehouse Transfer</SelectItem>
                    <SelectItem value="PRODUCTION">Production</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Additional notes about this movement"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="referenceType">Reference Type</Label>
                  <Select
                    value={formData.referenceType}
                    onValueChange={(value) => handleInputChange('referenceType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MANUAL">Manual Entry</SelectItem>
                      <SelectItem value="PURCHASE_ORDER">Purchase Order</SelectItem>
                      <SelectItem value="SALES_ORDER">Sales Order</SelectItem>
                      <SelectItem value="TRANSFER_ORDER">Transfer Order</SelectItem>
                      <SelectItem value="ADJUSTMENT">Stock Adjustment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="referenceId">Reference ID</Label>
                  <Input
                    id="referenceId"
                    value={formData.referenceId}
                    onChange={(e) => handleInputChange('referenceId', e.target.value)}
                    placeholder="Reference order/document ID"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Movement'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
