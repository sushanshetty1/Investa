'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { AlertTriangle, Plus, Minus } from 'lucide-react'

interface StockItem {
  id: string
  productId: string
  productVariantId?: string
  warehouseId: string
  quantity: number
  reservedQuantity: number
  product: {
    id: string
    name: string
    sku: string
  }
  productVariant?: {
    id: string
    name: string
    sku: string
  }
  warehouse: {
    id: string
    name: string
  }
}

interface StockAdjustmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  stockItem?: StockItem
  onSave: (adjustment: StockAdjustment) => Promise<void>
}

interface StockAdjustment {
  stockItemId: string
  adjustmentType: 'increase' | 'decrease' | 'set'
  quantity: number
  reason: string
  notes?: string
}

export function StockAdjustmentDialog({
  open,
  onOpenChange,
  stockItem,
  onSave
}: StockAdjustmentDialogProps) {
  const [adjustmentType, setAdjustmentType] = useState<'increase' | 'decrease' | 'set'>('increase')
  const [quantity, setQuantity] = useState('')
  const [reason, setReason] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      setAdjustmentType('increase')
      setQuantity('')
      setReason('')
      setNotes('')
    }
  }, [open])

  const handleSave = async () => {
    if (!stockItem || !quantity || !reason) return

    setLoading(true)
    try {
      await onSave({
        stockItemId: stockItem.id,
        adjustmentType,
        quantity: parseInt(quantity),
        reason,
        notes
      })
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to adjust stock:', error)
    } finally {
      setLoading(false)
    }
  }

  const getNewQuantity = () => {
    if (!stockItem || !quantity) return stockItem?.quantity || 0
    
    const adjustment = parseInt(quantity)
    switch (adjustmentType) {
      case 'increase':
        return stockItem.quantity + adjustment
      case 'decrease':
        return Math.max(0, stockItem.quantity - adjustment)
      case 'set':
        return adjustment
      default:
        return stockItem.quantity
    }
  }

  const isValid = quantity && reason && parseInt(quantity) > 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Adjust Stock Level</DialogTitle>
          <DialogDescription>
            Make manual adjustments to stock quantities
          </DialogDescription>
        </DialogHeader>
        
        {stockItem && (
          <div className="space-y-6">
            {/* Stock Item Info */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Product</Label>
              <div className="p-3 bg-muted rounded-lg">
                <div className="font-medium">{stockItem.product.name}</div>
                {stockItem.productVariant && (
                  <div className="text-sm text-muted-foreground">
                    Variant: {stockItem.productVariant.name}
                  </div>
                )}
                <div className="text-sm text-muted-foreground">
                  SKU: {stockItem.productVariant?.sku || stockItem.product.sku}
                </div>
                <div className="text-sm text-muted-foreground">
                  Warehouse: {stockItem.warehouse.name}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline">
                    Current: {stockItem.quantity}
                  </Badge>
                  {stockItem.reservedQuantity > 0 && (
                    <Badge variant="secondary">
                      Reserved: {stockItem.reservedQuantity}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            {/* Adjustment Type */}
            <div className="space-y-2">
              <Label>Adjustment Type</Label>
              <Select value={adjustmentType} onValueChange={(value: 'increase' | 'decrease' | 'set') => setAdjustmentType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="increase">
                    <div className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Increase Stock
                    </div>
                  </SelectItem>
                  <SelectItem value="decrease">
                    <div className="flex items-center gap-2">
                      <Minus className="h-4 w-4" />
                      Decrease Stock
                    </div>
                  </SelectItem>
                  <SelectItem value="set">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Set Exact Quantity
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Quantity */}
            <div className="space-y-2">
              <Label>
                {adjustmentType === 'set' ? 'New Quantity' : 'Adjustment Quantity'}
              </Label>
              <Input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder={adjustmentType === 'set' ? 'Enter new quantity' : 'Enter adjustment amount'}
              />
              {quantity && (
                <div className="text-sm text-muted-foreground">
                  New quantity will be: <span className="font-medium">{getNewQuantity()}</span>
                </div>
              )}
            </div>

            {/* Reason */}
            <div className="space-y-2">
              <Label>Reason *</Label>
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Select reason for adjustment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stocktake">Stock Take Correction</SelectItem>
                  <SelectItem value="damaged">Damaged Goods</SelectItem>
                  <SelectItem value="expired">Expired Products</SelectItem>
                  <SelectItem value="lost">Lost/Stolen</SelectItem>
                  <SelectItem value="return">Customer Return</SelectItem>
                  <SelectItem value="supplier">Supplier Correction</SelectItem>
                  <SelectItem value="recount">Physical Recount</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label>Notes (Optional)</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional details about this adjustment..."
                rows={3}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={!isValid || loading}
              >
                {loading ? 'Adjusting...' : 'Apply Adjustment'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
