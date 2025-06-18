'use client'

import { useState } from 'react'
import { Download, Edit, Trash2, Archive } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface BulkActionsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedProductIds: string[]
  onComplete: () => void
}

export function BulkActionsDialog({
  open,
  onOpenChange,
  selectedProductIds,
  onComplete
}: BulkActionsDialogProps) {
  const [activeAction, setActiveAction] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<Record<string, unknown>>({})

  const bulkActions = [
    {
      id: 'export',
      title: 'Export Products',
      description: 'Export selected products to CSV or Excel',
      icon: Download,
      category: 'data'
    },
    {
      id: 'update-status',
      title: 'Update Status',
      description: 'Change status for all selected products',
      icon: Edit,
      category: 'update'
    },
    {
      id: 'update-category',
      title: 'Update Category',
      description: 'Assign a new category to selected products',
      icon: Edit,
      category: 'update'
    },
    {
      id: 'update-pricing',
      title: 'Update Pricing',
      description: 'Apply pricing changes to selected products',
      icon: Edit,
      category: 'update'
    },
    {
      id: 'delete',
      title: 'Delete Products',
      description: 'Permanently delete selected products',
      icon: Trash2,
      category: 'danger'
    },
    {
      id: 'archive',
      title: 'Archive Products',
      description: 'Archive selected products',
      icon: Archive,
      category: 'update'
    }
  ]

  const handleActionSelect = (actionId: string) => {
    setActiveAction(actionId)
    setFormData({})
  }

  const handleSubmit = async () => {
    if (!activeAction) return
    setLoading(true)
    try {
      // Here you would implement the actual bulk action logic
      await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate API call
      onComplete()
      onOpenChange(false)
      setActiveAction('')
      setFormData({})
    } catch (error) {
      console.error('Bulk action failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const renderActionForm = () => {
    switch (activeAction) {
      case 'export':
        return (
          <div className="space-y-4">
            <div>
              <Label>Export Format</Label>
              <Select onValueChange={(value) => setFormData({ ...formData, format: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="excel">Excel (XLSX)</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )

      case 'update-status':
        return (
          <div className="space-y-4">
            <div>
              <Label>New Status</Label>
              <Select onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select new status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                  <SelectItem value="DISCONTINUED">Discontinued</SelectItem>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )

      case 'delete':
        return (
          <div className="space-y-4">
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <h4 className="font-medium text-destructive mb-2">⚠️ Warning</h4>
              <p className="text-sm text-destructive">
                This action will permanently delete {selectedProductIds.length} product(s). 
                This action cannot be undone.
              </p>
            </div>
            <div>
              <Label>Confirmation</Label>
              <Input
                placeholder="Type 'DELETE' to confirm"
                onChange={(e) => setFormData({ ...formData, confirmation: e.target.value })}
              />
            </div>
          </div>
        )

      default:
        return null
    }
  }

  const selectedAction = bulkActions.find(action => action.id === activeAction)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Bulk Actions</DialogTitle>
          <DialogDescription>
            Perform actions on {selectedProductIds.length} selected product(s)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Selected Items</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant="outline" className="text-sm">
                {selectedProductIds.length} product(s) selected
              </Badge>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Label>Choose Action</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bulkActions.map((action) => {
                const Icon = action.icon
                return (
                  <Card 
                    key={action.id}
                    className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                      activeAction === action.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => handleActionSelect(action.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Icon className={`h-5 w-5 mt-0.5 ${
                          action.category === 'danger' ? 'text-destructive' : 'text-primary'
                        }`} />
                        <div>
                          <h4 className="font-medium text-sm">{action.title}</h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            {action.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {activeAction && (
              <>
                <Separator />
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      {selectedAction && <selectedAction.icon className="h-4 w-4" />}
                      {selectedAction?.title} Configuration
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {renderActionForm()}
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!activeAction || loading || (activeAction === 'delete' && formData.confirmation !== 'DELETE')}
            variant={selectedAction?.category === 'danger' ? 'destructive' : 'default'}
          >
            {loading ? 'Processing...' : `Apply ${selectedAction?.title || 'Action'}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
