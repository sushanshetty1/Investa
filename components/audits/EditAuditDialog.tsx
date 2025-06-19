'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { AlertTriangle, Calendar, User, MapPin, Package } from 'lucide-react'

interface Audit {
  id: string
  auditNumber: string
  type: string
  method: string
  status: string
  warehouseId?: string
  warehouseName?: string
  productId?: string
  productName?: string
  plannedDate: string
  startedDate?: string
  completedDate?: string
  auditedBy: string
  auditedByName?: string
  supervisedBy?: string
  supervisedByName?: string
  totalItems?: number
  itemsCounted?: number
  discrepancies?: number
  adjustmentValue?: number
  notes?: string
  createdAt: string
  updatedAt: string
}

interface EditAuditDialogProps {
  audit: Audit
  open: boolean
  onOpenChange: (open: boolean) => void
  onAuditUpdated: () => void
}

interface AuditUpdateData {
  plannedDate?: string
  supervisedBy?: string
  notes?: string
  status?: string
}

export function EditAuditDialog({ audit, open, onOpenChange, onAuditUpdated }: EditAuditDialogProps) {
  const [formData, setFormData] = useState<AuditUpdateData>({
    plannedDate: audit.plannedDate?.split('T')[0] || '',
    supervisedBy: audit.supervisedBy || '',
    notes: audit.notes || '',
    status: audit.status
  })
  
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (open) {
      setFormData({
        plannedDate: audit.plannedDate?.split('T')[0] || '',
        supervisedBy: audit.supervisedBy || '',
        notes: audit.notes || '',
        status: audit.status
      })
      setErrors({})
    }
  }, [open, audit])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.plannedDate) {
      newErrors.plannedDate = 'Planned date is required'
    } else {
      const plannedDate = new Date(formData.plannedDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      // Only validate future date for planned audits
      if (audit.status === 'PLANNED' && plannedDate < today) {
        newErrors.plannedDate = 'Planned date cannot be in the past'
      }
    }

    // Validate status transitions
    if (formData.status !== audit.status) {
      const validTransitions: Record<string, string[]> = {
        'PLANNED': ['IN_PROGRESS', 'CANCELLED'],
        'IN_PROGRESS': ['COMPLETED', 'CANCELLED'],
        'COMPLETED': [], // Completed audits cannot be changed
        'CANCELLED': ['PLANNED'] // Can reactivate cancelled audits
      }

      if (!validTransitions[audit.status]?.includes(formData.status || '')) {
        newErrors.status = `Cannot change status from ${audit.status} to ${formData.status}`
      }
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
      const response = await fetch(`/api/audits/${audit.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        onAuditUpdated()
        onOpenChange(false)
      } else {
        const errorData = await response.json()
        setErrors({ submit: errorData.message || 'Failed to update audit' })
      }
    } catch (error) {
      console.error('Error updating audit:', error)
      setErrors({ submit: 'Failed to update audit' })
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800'
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800'
      case 'PLANNED':
        return 'bg-gray-100 text-gray-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const canEditStatus = audit.status !== 'COMPLETED'
  const canEditPlannedDate = audit.status === 'PLANNED'
  const hasStarted = audit.status === 'IN_PROGRESS' || audit.status === 'COMPLETED'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Audit - {audit.auditNumber}</DialogTitle>
          <DialogDescription>
            Modify audit details and settings. Some fields may be locked based on audit status.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Audit Overview */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium mb-3">Audit Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">Type</p>
                  <p className="text-muted-foreground">{audit.type.replace('_', ' ')}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge className={getStatusColor(audit.status)}>
                  {audit.status.replace('_', ' ')}
                </Badge>
              </div>

              {audit.warehouseName && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Warehouse</p>
                    <p className="text-muted-foreground">{audit.warehouseName}</p>
                  </div>
                </div>
              )}

              {audit.productName && (
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Product</p>
                    <p className="text-muted-foreground">{audit.productName}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">Audited By</p>
                  <p className="text-muted-foreground">{audit.auditedByName || audit.auditedBy}</p>
                </div>
              </div>

              {audit.totalItems && (
                <div>
                  <p className="font-medium">Progress</p>
                  <p className="text-muted-foreground">
                    {audit.itemsCounted || 0} of {audit.totalItems} items
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Status Restrictions Alert */}
          {!canEditStatus && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                This audit has been completed and cannot be modified. Contact an administrator if changes are needed.
              </AlertDescription>
            </Alert>
          )}

          {hasStarted && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                This audit has started. Some fields are locked to maintain audit integrity.
              </AlertDescription>
            </Alert>
          )}

          <Separator />

          {/* Editable Fields */}
          <div className="space-y-4">
            <h3 className="font-medium">Editable Fields</h3>
            
            {/* Status */}
            {canEditStatus && (
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {audit.status === 'PLANNED' && (
                      <>
                        <SelectItem value="PLANNED">Planned</SelectItem>
                        <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                        <SelectItem value="CANCELLED">Cancelled</SelectItem>
                      </>
                    )}
                    {audit.status === 'IN_PROGRESS' && (
                      <>
                        <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                        <SelectItem value="COMPLETED">Completed</SelectItem>
                        <SelectItem value="CANCELLED">Cancelled</SelectItem>
                      </>
                    )}
                    {audit.status === 'CANCELLED' && (
                      <>
                        <SelectItem value="CANCELLED">Cancelled</SelectItem>
                        <SelectItem value="PLANNED">Planned</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
                {errors.status && (
                  <p className="text-sm text-red-600">{errors.status}</p>
                )}
              </div>
            )}

            {/* Planned Date */}
            <div className="space-y-2">
              <Label htmlFor="plannedDate">
                Planned Date
                {!canEditPlannedDate && (
                  <span className="text-xs text-muted-foreground ml-2">(Read-only after start)</span>
                )}
              </Label>
              <Input
                id="plannedDate"
                type="date"
                value={formData.plannedDate}
                onChange={(e) => setFormData({ ...formData, plannedDate: e.target.value })}
                disabled={!canEditPlannedDate}
                min={canEditPlannedDate ? new Date().toISOString().split('T')[0] : undefined}
              />
              {errors.plannedDate && (
                <p className="text-sm text-red-600">{errors.plannedDate}</p>
              )}
            </div>

            {/* Supervisor */}
            <div className="space-y-2">
              <Label htmlFor="supervisedBy">Supervisor (User ID)</Label>
              <Input
                id="supervisedBy"
                placeholder="Enter supervisor user ID"
                value={formData.supervisedBy || ''}
                onChange={(e) => setFormData({ ...formData, supervisedBy: e.target.value })}
              />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Additional notes or instructions for this audit..."
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={4}
              />
            </div>
          </div>

          {/* Audit Dates Display */}
          {(audit.startedDate || audit.completedDate) && (
            <>
              <Separator />
              <div className="space-y-2">
                <h3 className="font-medium">Audit Timeline</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-medium">Created</p>
                    <p className="text-muted-foreground">
                      {new Date(audit.createdAt).toLocaleString()}
                    </p>
                  </div>
                  
                  {audit.startedDate && (
                    <div>
                      <p className="font-medium">Started</p>
                      <p className="text-muted-foreground">
                        {new Date(audit.startedDate).toLocaleString()}
                      </p>
                    </div>
                  )}
                  
                  {audit.completedDate && (
                    <div>
                      <p className="font-medium">Completed</p>
                      <p className="text-muted-foreground">
                        {new Date(audit.completedDate).toLocaleString()}
                      </p>
                    </div>
                  )}
                  
                  <div>
                    <p className="font-medium">Last Updated</p>
                    <p className="text-muted-foreground">
                      {new Date(audit.updatedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Error Message */}
          {errors.submit && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{errors.submit}</AlertDescription>
            </Alert>
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
            disabled={isLoading || !canEditStatus}
          >
            {isLoading ? 'Updating...' : 'Update Audit'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
