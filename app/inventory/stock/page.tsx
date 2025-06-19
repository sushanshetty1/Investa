'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Plus, Search, Filter, Download, TrendingUp, TrendingDown, AlertTriangle, MapPin, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { StockMovementDialog } from '@/components/inventory/StockMovementDialog'
import { StockTransferDialog } from '@/components/inventory/StockTransferDialog'
import { StockAdjustmentDialog } from '@/components/inventory/StockAdjustmentDialog'
import { LowStockAlerts } from '@/components/inventory/LowStockAlerts'
import { StockHistoryChart } from '@/components/inventory/StockHistoryChart'

// interface StockAdjustment {
//   stockItemId: string
//   adjustmentType: 'increase' | 'decrease' | 'set'
//   quantity: number
//   reason: string
//   notes?: string
// }

interface StockItem {
  id: string
  productId: string
  variantId?: string
  warehouseId: string
  quantity: number
  reservedQuantity: number
  availableQuantity: number
  averageCost?: number
  lastCost?: number
  lotNumber?: string
  batchNumber?: string
  expiryDate?: string
  status: 'AVAILABLE' | 'RESERVED' | 'QUARANTINE' | 'DAMAGED' | 'EXPIRED'
  qcStatus: 'PASSED' | 'FAILED' | 'PENDING' | 'QUARANTINE'
  locationCode?: string
  lastMovement?: string
  lastCount?: string
  product: {
    id: string
    name: string
    sku: string
    primaryImage?: string
    minStockLevel: number
    reorderPoint?: number
  }
  variant?: {
    id: string
    name: string
    sku: string
    attributes: Record<string, string>
  }
  warehouse: {
    id: string
    name: string
    code: string
  }
}

interface StockMovement {
  id: string
  type: 'RECEIPT' | 'SHIPMENT' | 'ADJUSTMENT' | 'TRANSFER_OUT' | 'TRANSFER_IN' | 'RETURN' | 'DAMAGE'
  productId: string
  variantId?: string
  warehouseId: string
  quantity: number
  quantityBefore: number
  quantityAfter: number
  unitCost?: number
  totalCost?: number
  referenceType?: string
  referenceId?: string
  reason?: string
  notes?: string
  userId: string
  occurredAt: string
  product: {
    name: string
    sku: string
  }
  variant?: {
    name: string
    sku: string
  }
  warehouse: {
    name: string
    code: string
  }
  user?: {
    name: string
  }
}

interface Warehouse {
  id: string
  name: string
  code: string
  type: string
  isActive: boolean
}

interface StockAlert {
  id: string
  type: 'LOW_STOCK' | 'OUT_OF_STOCK' | 'OVERSTOCK' | 'EXPIRING'
  productId: string
  warehouseId: string
  currentLevel: number
  threshold: number
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
  product: {
    name: string
    sku: string
  }
  warehouse: {
    name: string
    code: string
  }
}

export default function StockPage() {
  const [stockItems, setStockItems] = useState<StockItem[]>([])
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([])
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [stockAlerts, setStockAlerts] = useState<StockAlert[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [alertFilter, setAlertFilter] = useState<string>('all')
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(20)  // Dialog states
  const [showMovementDialog, setShowMovementDialog] = useState(false)
  const [showTransferDialog, setShowTransferDialog] = useState(false)
  const [showAdjustmentDialog, setShowAdjustmentDialog] = useState(false)
  const [selectedStockItem] = useState<StockItem | null>(null) // Currently unused but needed for StockAdjustmentDialog  // Load data
  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadData = async () => {
    try {
      await Promise.all([
        loadStockItems(),
        loadStockMovements(),
        loadWarehouses(),
        loadStockAlerts()
      ])
    } catch (error) {
      console.error('Error loading data:', error)
    }
  }
  const loadStockItems = async () => {
    try {
      const response = await fetch('/api/inventory/stock')
      if (response.ok) {
        const data = await response.json()
        setStockItems(data.data || [])
      } else {
        console.error('Failed to fetch stock items')
        setStockItems([])
      }
    } catch (error) {
      console.error('Error loading stock items:', error)
      setStockItems([])
    }
  }

  const loadStockMovements = async () => {
    try {
      const response = await fetch('/api/inventory/stock/movements')
      if (response.ok) {
        const data = await response.json()
        setStockMovements(data.data || [])
      } else {
        console.error('Failed to fetch stock movements')
        setStockMovements([])
      }
    } catch (error) {
      console.error('Error loading stock movements:', error)
      setStockMovements([])
    }
  }

  const loadWarehouses = async () => {
    try {
      const response = await fetch('/api/inventory/warehouses')
      if (response.ok) {
        const data = await response.json()
        setWarehouses(data.data || [])
      } else {
        console.error('Failed to fetch warehouses')
        setWarehouses([])
      }
    } catch (error) {
      console.error('Error loading warehouses:', error)
      setWarehouses([])
    }
  }

  const loadStockAlerts = async () => {
    try {
      const response = await fetch('/api/inventory/stock/alerts')
      if (response.ok) {
        const data = await response.json()
        setStockAlerts(data.data || [])
      } else {
        console.error('Failed to fetch stock alerts')
        setStockAlerts([])
      }
    } catch (error) {
      console.error('Error loading stock alerts:', error)
      setStockAlerts([])
    }
  }

  // Filter stock items
  const filteredStockItems = stockItems.filter(item => {
    const matchesSearch = item.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.variant?.sku.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesWarehouse = selectedWarehouse === 'all' || item.warehouseId === selectedWarehouse
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter

    return matchesSearch && matchesWarehouse && matchesStatus
  })

  // Filter stock movements based on alert filter
  const filteredMovements = stockMovements.filter(movement => {
    if (alertFilter === 'all') return true
    return movement.type === alertFilter
  })

  // Pagination for stock items
  const totalPages = Math.ceil(filteredStockItems.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedStockItems = filteredStockItems.slice(startIndex, startIndex + itemsPerPage)

  const getStatusBadge = (status: string) => {
    const variants = {
      AVAILABLE: 'default',
      RESERVED: 'secondary',
      QUARANTINE: 'outline',
      DAMAGED: 'destructive',
      EXPIRED: 'destructive'
    } as const

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {status}
      </Badge>
    )
  }

  const getQualityBadge = (qcStatus: string) => {
    const variants = {
      PASSED: 'default',
      FAILED: 'destructive',
      PENDING: 'outline',
      QUARANTINE: 'outline'
    } as const

    return (
      <Badge variant={variants[qcStatus as keyof typeof variants] || 'outline'}>
        {qcStatus}
      </Badge>
    )
  }

  const getStockLevel = (item: StockItem) => {
    if (item.availableQuantity <= 0) {
      return { status: 'Out of Stock', color: 'text-red-600', icon: <AlertTriangle className="h-4 w-4" /> }
    } else if (item.availableQuantity <= item.product.minStockLevel) {
      return { status: 'Low Stock', color: 'text-yellow-600', icon: <TrendingDown className="h-4 w-4" /> }
    } else {
      return { status: 'In Stock', color: 'text-green-600', icon: <TrendingUp className="h-4 w-4" /> }
    }
  }

  const getMovementTypeIcon = (type: string) => {
    const icons = {
      RECEIPT: <TrendingUp className="h-4 w-4 text-green-600" />,
      SHIPMENT: <TrendingDown className="h-4 w-4 text-blue-600" />,
      ADJUSTMENT: <Package className="h-4 w-4 text-purple-600" />,
      TRANSFER_OUT: <TrendingDown className="h-4 w-4 text-orange-600" />,
      TRANSFER_IN: <TrendingUp className="h-4 w-4 text-orange-600" />,
      RETURN: <TrendingUp className="h-4 w-4 text-gray-600" />,
      DAMAGE: <AlertTriangle className="h-4 w-4 text-red-600" />
    } as const

    return icons[type as keyof typeof icons] || <Package className="h-4 w-4" />
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="py-16 px-6 mx-4 md:mx-8 space-y-6">{/* Header */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:justify-between sm:items-center">
        <div>
          <h1 className="text-3xl font-bold">Stock Management</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Monitor inventory levels, movements, and alerts across all warehouses
          </p>
        </div>        <div className="flex gap-2 mt-2 sm:mt-0">
          <Button variant="outline" onClick={() => setShowTransferDialog(true)}>
            <MapPin className="h-4 w-4 mr-2" />
            Transfer Stock
          </Button>
          <Button variant="outline" onClick={() => setShowAdjustmentDialog(true)}>
            <Package className="h-4 w-4 mr-2" />
            Adjust Stock
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => setShowMovementDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Movement
          </Button>
        </div>
      </div>      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Stock Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stockItems.length}</div>
            <p className="text-xs text-muted-foreground">
              Across {warehouses.length} warehouses
            </p>
          </CardContent>
        </Card>        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stockItems.reduce((sum, item) => sum + (item.quantity * (item.averageCost || 0)), 0))}
            </div>
            <p className="text-xs text-muted-foreground">
              At average cost
            </p>
          </CardContent>
        </Card>        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stockAlerts.filter(alert => alert.type === 'LOW_STOCK').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Need attention
            </p>
          </CardContent>
        </Card>        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stockItems.filter(item => item.availableQuantity <= 0).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Require restocking
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reserved Stock</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stockItems.reduce((sum, item) => sum + item.reservedQuantity, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Pending orders
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Stock Alerts */}
      <LowStockAlerts alerts={stockAlerts} />

      {/* Main Content Tabs */}      <Tabs defaultValue="stock" className="space-y-6">
        <TabsList>
          <TabsTrigger value="stock">Current Stock</TabsTrigger>
          <TabsTrigger value="movements">Stock Movements</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Current Stock Tab */}        <TabsContent value="stock" className="space-y-4 sm:space-y-6">
          {/* Search and Filters */}
          <Card>
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-3 sm:mb-4">                <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by product name, SKU, or location..."
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
                  {showFilters ? 'Hide Filters' : 'Filters'}
                </Button>
              </div>              {showFilters && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Warehouse</label>
                    <Select value={selectedWarehouse} onValueChange={setSelectedWarehouse}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Warehouses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Warehouses</SelectItem>
                        {warehouses.map((warehouse) => (
                          <SelectItem key={warehouse.id} value={warehouse.id}>
                            {warehouse.name} ({warehouse.code})
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
                        <SelectItem value="AVAILABLE">Available</SelectItem>
                        <SelectItem value="RESERVED">Reserved</SelectItem>
                        <SelectItem value="QUARANTINE">Quarantine</SelectItem>
                        <SelectItem value="DAMAGED">Damaged</SelectItem>
                        <SelectItem value="EXPIRED">Expired</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stock Items Table */}          <Card>
            <CardHeader>
              <CardTitle>Stock Levels ({filteredStockItems.length})</CardTitle>
              <CardDescription>
                Current inventory levels across all warehouses
              </CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>            <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="hidden sm:table-cell">Location</TableHead>
                  <TableHead className="hidden md:table-cell">Warehouse</TableHead>
                  <TableHead>Available</TableHead>
                  <TableHead className="hidden sm:table-cell">Reserved</TableHead>
                  <TableHead className="hidden sm:table-cell">Total</TableHead>
                  <TableHead className="hidden md:table-cell">Value</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden lg:table-cell">QC Status</TableHead>
                  <TableHead className="hidden lg:table-cell">Last Movement</TableHead>
                </TableRow>
              </TableHeader>
                <TableBody>
                  {paginatedStockItems.map((item) => {
                    const stockLevel = getStockLevel(item)
                    return (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="flex items-center gap-2 sm:gap-3">
                            {item.product.primaryImage ? (
                              <Image
                                src={item.product.primaryImage}
                                alt={item.product.name}
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
                              <div className="font-medium text-sm sm:text-base truncate max-w-[120px] sm:max-w-[200px]">{item.product.name}</div>
                              <div className="text-xs sm:text-sm text-muted-foreground">
                                {item.product.sku}
                                {item.variant && ` • ${item.variant.name}`}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          {item.locationCode ? (
                            <code className="text-xs sm:text-sm bg-muted px-1.5 py-0.5 sm:px-2 sm:py-1 rounded">
                              {item.locationCode}
                            </code>
                          ) : (
                            <span className="text-muted-foreground">Not assigned</span>
                          )}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div>
                            <div className="font-medium">{item.warehouse.name}</div>
                            <div className="text-xs sm:text-sm text-muted-foreground">{item.warehouse.code}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className={`flex items-center gap-1 sm:gap-2 ${stockLevel.color}`}>
                            {stockLevel.icon}
                            <span className="font-medium text-sm sm:text-base">{item.availableQuantity}</span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          {item.reservedQuantity > 0 ? (
                            <span className="text-blue-600 font-medium">{item.reservedQuantity}</span>
                          ) : (
                            <span className="text-muted-foreground">0</span>
                          )}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <span className="font-medium">{item.quantity}</span>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {item.averageCost ?
                            formatCurrency(item.quantity * item.averageCost) :
                            <span className="text-muted-foreground">-</span>
                          }
                        </TableCell>
                        <TableCell>{getStatusBadge(item.status)}</TableCell>
                        <TableCell className="hidden lg:table-cell">{getQualityBadge(item.qcStatus)}</TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {item.lastMovement ? (
                            <span className="text-xs sm:text-sm text-muted-foreground">
                              {formatDate(item.lastMovement)}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">Never</span>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>          {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredStockItems.length)} of {filteredStockItems.length} items
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
        </TabsContent>

        {/* Stock Movements Tab */}
        <TabsContent value="movements" className="space-y-6">          <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4 mb-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Search movements..."
                    className="pl-8 h-8 sm:h-9 text-sm"
                  />
                </div>
              </div>
              <Select value={alertFilter} onValueChange={setAlertFilter}>
                <SelectTrigger className="h-8 sm:h-9 text-xs sm:text-sm w-full sm:w-48">
                  <SelectValue placeholder="All Movement Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Movement Types</SelectItem>
                  <SelectItem value="RECEIPT">Receipts</SelectItem>
                  <SelectItem value="SHIPMENT">Shipments</SelectItem>
                  <SelectItem value="ADJUSTMENT">Adjustments</SelectItem>
                  <SelectItem value="TRANSFER_OUT">Transfers Out</SelectItem>
                  <SelectItem value="TRANSFER_IN">Transfers In</SelectItem>
                  <SelectItem value="RETURN">Returns</SelectItem>
                  <SelectItem value="DAMAGE">Damage</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>          <Card>
            <CardHeader>
              <CardTitle>Recent Stock Movements</CardTitle>
              <CardDescription>
                Track all inventory movements and transactions
              </CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto"><Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead className="hidden md:table-cell">Warehouse</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead className="hidden sm:table-cell">Before/After</TableHead>
                  <TableHead className="hidden md:table-cell">Cost</TableHead>
                  <TableHead className="hidden md:table-cell">Reference</TableHead>
                  <TableHead className="hidden lg:table-cell">User</TableHead>
                  <TableHead className="hidden sm:table-cell">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMovements.slice(0, 20).map((movement) => (
                  <TableRow key={movement.id}>
                    <TableCell>
                      <div className="flex items-center gap-1 sm:gap-2">
                        {getMovementTypeIcon(movement.type)}
                        <span className="text-xs sm:text-sm font-medium whitespace-nowrap">
                          {movement.type.replace('_', ' ')}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium text-sm truncate max-w-[120px] sm:max-w-[200px]">{movement.product.name}</div>
                        <div className="text-xs text-muted-foreground truncate max-w-[120px] sm:max-w-[200px]">
                          {movement.product.sku}
                          {movement.variant && ` • ${movement.variant.name}`}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div>
                        <div className="font-medium text-sm">{movement.warehouse.name}</div>
                        <div className="text-xs text-muted-foreground">{movement.warehouse.code}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`font-medium text-sm ${['RECEIPT', 'TRANSFER_IN', 'RETURN'].includes(movement.type) ? 'text-green-600' : 'text-red-600'
                        }`}>
                        {['RECEIPT', 'TRANSFER_IN', 'RETURN'].includes(movement.type) ? '+' : '-'}{movement.quantity}
                      </span>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <span className="text-xs sm:text-sm text-muted-foreground">
                        {movement.quantityBefore} → {movement.quantityAfter}
                      </span>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {movement.unitCost ? (
                        <div>
                          <div className="text-sm">{formatCurrency(movement.unitCost)}</div>
                          {movement.totalCost && (
                            <div className="text-xs text-muted-foreground">
                              Total: {formatCurrency(movement.totalCost)}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {movement.referenceType && movement.referenceId ? (
                        <div className="text-xs sm:text-sm">
                          <div>{movement.referenceType}</div>
                          <div className="text-muted-foreground">{movement.referenceId}</div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Manual</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <span className="text-xs sm:text-sm">{movement.user?.name || 'System'}</span>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <span className="text-xs text-muted-foreground">
                        {formatDate(movement.occurredAt)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}        <TabsContent value="analytics" className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <StockHistoryChart />
            <Card>
              <CardHeader className="p-3 sm:p-6 pb-0">
                <CardTitle className="text-lg sm:text-xl">Top Moving Products</CardTitle>
                <CardDescription className="text-xs sm:text-sm">Products with highest movement volume</CardDescription>
              </CardHeader>              <CardContent className="p-3 sm:p-6 pt-3 sm:pt-4">
                <div className="space-y-3 sm:space-y-4">
                  {/* Top Moving Products */}
                  <div className="space-y-3">
                    {[
                      { name: 'Widget A', movements: 245, trend: '+12%' },
                      { name: 'Product B', movements: 189, trend: '+8%' },
                      { name: 'Item C', movements: 156, trend: '+5%' },
                      { name: 'Component D', movements: 134, trend: '+3%' },
                      { name: 'Material E', movements: 98, trend: '-2%' }
                    ].map((product, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{product.name}</p>
                            <p className="text-xs text-muted-foreground">{product.movements} movements</p>
                          </div>
                        </div>
                        <Badge variant={product.trend.startsWith('+') ? 'default' : 'secondary'} className="text-xs">
                          {product.trend}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <StockMovementDialog
        open={showMovementDialog}
        onOpenChange={setShowMovementDialog}
        onSave={loadData}
      />      <StockTransferDialog
        open={showTransferDialog}
        onOpenChange={setShowTransferDialog}
        onSave={loadData}
      />
      <StockAdjustmentDialog
        open={showAdjustmentDialog}
        onOpenChange={setShowAdjustmentDialog} stockItem={selectedStockItem || undefined}
        onSave={async () => {
          // Implement stock adjustment logic here
          await loadData()
        }}
      />
    </div>
  )
}
