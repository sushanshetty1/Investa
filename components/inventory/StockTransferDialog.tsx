'use client'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface StockTransferDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: () => void
}

export function StockTransferDialog({
  open,
  onOpenChange,
  onSave
}: StockTransferDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Transfer Stock</DialogTitle>
          <DialogDescription>
            Transfer inventory between warehouses
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-8 text-center text-muted-foreground">
          Stock transfer form will be implemented here
        </div>
        
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSave}>
            Create Transfer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
