'use client'

import { useState, useEffect, useCallback } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { MapPin, Package, User, Calendar, FileText, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react'

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

interface AuditItem {
  id: string
  productId: string
  productName: string
  sku: string
  location?: string
  systemQty: number
  countedQty?: number
  adjustmentQty?: number
  status: string
  countedBy?: string
  countedAt?: string
  verifiedBy?: string
  verifiedAt?: string
  discrepancyReason?: string
  notes?: string
}

interface AuditDetailsDialogProps {
  audit: Audit
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AuditDetailsDialog({ audit, open, onOpenChange }: AuditDetailsDialogProps) {
  const [auditItems, setAuditItems] = useState<AuditItem[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const fetchAuditItems = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/audits/${audit.id}/items`)
      if (response.ok) {
        const data = await response.json()
        setAuditItems(data.items || [])
      }
    } catch (error) {
      console.error('Error fetching audit items:', error)
    } finally {
      setIsLoading(false)
    }
  }, [audit.id])

  useEffect(() => {
    if (open && audit.id) {
      fetchAuditItems()
    }
  }, [open, audit.id, fetchAuditItems])

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

  const getItemStatusColor = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return 'bg-green-100 text-green-800'
      case 'COUNTED':
        return 'bg-blue-100 text-blue-800'
      case 'PENDING':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'CYCLE_COUNT':
        return <Calendar className="h-5 w-5" />
      case 'FULL_COUNT':
        return <FileText className="h-5 w-5" />
      case 'SPOT_CHECK':
        return <Package className="h-5 w-5" />
      case 'ANNUAL_COUNT':
        return <Calendar className="h-5 w-5" />
      case 'INVESTIGATION':
        return <AlertTriangle className="h-5 w-5" />
      default:
        return <FileText className="h-5 w-5" />
    }
  }

  const progressPercentage = audit.totalItems && audit.itemsCounted !== undefined
    ? Math.round((audit.itemsCounted / audit.totalItems) * 100)
    : 0

  const discrepancyCount = auditItems.filter(item => 
    item.adjustmentQty !== undefined && item.adjustmentQty !== 0
  ).length

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getTypeIcon(audit.type)}
            Audit Details - {audit.auditNumber}
          </DialogTitle>
          <DialogDescription>
            Comprehensive view of audit progress, items, and results
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Audit Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(audit.status)}>
                    {audit.status.replace('_', ' ')}
                  </Badge>
                  {audit.status === 'COMPLETED' && (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-lg font-bold">{progressPercentage}%</div>
                  <Progress value={progressPercentage} />
                  <div className="text-sm text-muted-foreground">
                    {audit.itemsCounted || 0} of {audit.totalItems || 0} items
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Discrepancies
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold text-red-600">
                  {discrepancyCount}
                </div>
                <div className="text-sm text-muted-foreground">
                  {audit.adjustmentValue !== undefined && (
                    <span>
                      {formatCurrency(Math.abs(audit.adjustmentValue))} impact
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Type & Method
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <div className="text-sm font-medium">
                    {audit.type.replace('_', ' ')}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {audit.method.replace('_', ' ')}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Audit Information */}
          <Card>
            <CardHeader>
              <CardTitle>Audit Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Planned Date</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(audit.plannedDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {audit.startedDate && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Started Date</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(audit.startedDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )}

                  {audit.completedDate && (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <div>
                        <p className="text-sm font-medium">Completed Date</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(audit.completedDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )}

                  {audit.warehouseName && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Warehouse</p>
                        <p className="text-sm text-muted-foreground">
                          {audit.warehouseName}
                        </p>
                      </div>
                    </div>
                  )}

                  {audit.productName && (
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Product</p>
                        <p className="text-sm text-muted-foreground">
                          {audit.productName}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Audited By</p>
                      <p className="text-sm text-muted-foreground">
                        {audit.auditedByName || audit.auditedBy}
                      </p>
                    </div>
                  </div>

                  {audit.supervisedByName && (
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Supervised By</p>
                        <p className="text-sm text-muted-foreground">
                          {audit.supervisedByName}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Created</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(audit.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Last Updated</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(audit.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {audit.notes && (
                <>
                  <Separator className="my-4" />
                  <div>
                    <p className="text-sm font-medium mb-2">Notes</p>
                    <p className="text-sm text-muted-foreground">{audit.notes}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Audit Items */}
          <Tabs defaultValue="all-items" className="space-y-4">
            <TabsList>
              <TabsTrigger value="all-items">All Items ({auditItems.length})</TabsTrigger>
              <TabsTrigger value="discrepancies">
                Discrepancies ({discrepancyCount})
              </TabsTrigger>
              <TabsTrigger value="pending">
                Pending ({auditItems.filter(item => item.status === 'PENDING').length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all-items">
              <Card>
                <CardHeader>
                  <CardTitle>Audit Items</CardTitle>
                  <CardDescription>
                    Complete list of items included in this audit
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-4">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-12 bg-gray-200 rounded animate-pulse" />
                      ))}
                    </div>
                  ) : auditItems.length === 0 ? (
                    <div className="text-center py-8">
                      <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No items found for this audit</p>
                    </div>
                  ) : (
                    <div className="border rounded-lg">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Product</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>System Qty</TableHead>
                            <TableHead>Counted Qty</TableHead>
                            <TableHead>Variance</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Counted By</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {auditItems.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell>
                                <div>
                                  <p className="font-medium">{item.productName}</p>
                                  <p className="text-sm text-muted-foreground">
                                    SKU: {item.sku}
                                  </p>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-4 w-4 text-muted-foreground" />
                                  {item.location || 'Unknown'}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm font-medium">
                                  {item.systemQty}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm">
                                  {item.countedQty !== undefined ? item.countedQty : '-'}
                                </div>
                              </TableCell>
                              <TableCell>
                                {item.adjustmentQty !== undefined ? (
                                  <div className={`text-sm font-medium ${
                                    item.adjustmentQty > 0 ? 'text-red-600' : 
                                    item.adjustmentQty < 0 ? 'text-green-600' : 
                                    'text-gray-600'
                                  }`}>
                                    {item.adjustmentQty > 0 ? '+' : ''}{item.adjustmentQty}
                                  </div>
                                ) : (
                                  <span className="text-muted-foreground">-</span>
                                )}
                              </TableCell>
                              <TableCell>
                                <Badge className={getItemStatusColor(item.status)}>
                                  {item.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm">
                                  {item.countedBy || '-'}
                                  {item.countedAt && (
                                    <p className="text-xs text-muted-foreground">
                                      {new Date(item.countedAt).toLocaleDateString()}
                                    </p>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="discrepancies">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    Discrepancies Found
                  </CardTitle>
                  <CardDescription>
                    Items with variances between system and counted quantities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {auditItems.filter(item => item.adjustmentQty !== undefined && item.adjustmentQty !== 0).length === 0 ? (
                    <div className="text-center py-8">
                      <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
                      <p className="text-green-600 font-medium">No discrepancies found!</p>
                      <p className="text-sm text-muted-foreground">
                        All counted items match the system quantities
                      </p>
                    </div>
                  ) : (
                    <div className="border rounded-lg">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Product</TableHead>
                            <TableHead>Expected</TableHead>
                            <TableHead>Actual</TableHead>
                            <TableHead>Variance</TableHead>
                            <TableHead>Reason</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {auditItems
                            .filter(item => item.adjustmentQty !== undefined && item.adjustmentQty !== 0)
                            .map((item) => (
                              <TableRow key={item.id}>
                                <TableCell>
                                  <div>
                                    <p className="font-medium">{item.productName}</p>
                                    <p className="text-sm text-muted-foreground">
                                      SKU: {item.sku}
                                    </p>
                                  </div>
                                </TableCell>
                                <TableCell>{item.systemQty}</TableCell>
                                <TableCell>{item.countedQty}</TableCell>
                                <TableCell>
                                  <div className={`font-medium ${
                                    (item.adjustmentQty || 0) > 0 ? 'text-red-600' : 'text-green-600'
                                  }`}>
                                    {(item.adjustmentQty || 0) > 0 ? '+' : ''}{item.adjustmentQty}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="text-sm">
                                    {item.discrepancyReason || 'Not specified'}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge className={getItemStatusColor(item.status)}>
                                    {item.status}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="pending">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    Pending Items
                  </CardTitle>
                  <CardDescription>
                    Items that still need to be counted or verified
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {auditItems.filter(item => item.status === 'PENDING').length === 0 ? (
                    <div className="text-center py-8">
                      <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
                      <p className="text-green-600 font-medium">All items completed!</p>
                      <p className="text-sm text-muted-foreground">
                        No pending items remaining for this audit
                      </p>
                    </div>
                  ) : (
                    <div className="border rounded-lg">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Product</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>System Qty</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {auditItems
                            .filter(item => item.status === 'PENDING')
                            .map((item) => (
                              <TableRow key={item.id}>
                                <TableCell>
                                  <div>
                                    <p className="font-medium">{item.productName}</p>
                                    <p className="text-sm text-muted-foreground">
                                      SKU: {item.sku}
                                    </p>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-1">
                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                    {item.location || 'Unknown'}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="text-sm font-medium">
                                    {item.systemQty}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge className={getItemStatusColor(item.status)}>
                                    {item.status}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}
