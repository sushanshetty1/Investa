'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Filter, Download, Edit, Trash2, Eye, Phone, Mail, Star, TrendingUp, Package, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface Supplier {
  id: string
  name: string
  code: string
  email?: string
  phone?: string
  website?: string
  companyType?: 'CORPORATION' | 'LLC' | 'PARTNERSHIP' | 'SOLE_PROPRIETORSHIP' | 'NON_PROFIT' | 'GOVERNMENT' | 'OTHER'
  taxId?: string
  vatNumber?: string
  registrationNumber?: string
  billingAddress: {
    street: string
    city: string
    state: string
    country: string
    zipCode: string
  }
  shippingAddress?: {
    street: string
    city: string
    state: string
    country: string
    zipCode: string
  }
  contactName?: string
  contactEmail?: string
  contactPhone?: string
  contactTitle?: string
  paymentTerms?: string
  creditLimit?: number
  currency: string
  rating?: number
  onTimeDelivery?: number
  qualityRating?: number
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING_APPROVAL' | 'SUSPENDED' | 'BLACKLISTED'
  certifications?: string[]
  notes?: string
  createdAt: string
  updatedAt: string
  totalPurchaseOrders: number
  totalSpent: number
  activeProducts: number
  lastOrderDate?: string
}

interface PurchaseOrder {
  id: string
  orderNumber: string
  supplierId: string
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'SENT' | 'ACKNOWLEDGED' | 'PARTIALLY_RECEIVED' | 'RECEIVED' | 'INVOICED' | 'PAID' | 'CANCELLED' | 'CLOSED'
  orderDate: string
  expectedDate?: string
  deliveryDate?: string
  subtotal: number
  taxAmount: number
  shippingCost: number
  discountAmount: number
  totalAmount: number
  currency: string
  paymentTerms?: string
  shippingTerms?: string
  trackingNumber?: string
  carrier?: string
  notes?: string
  createdAt: string
  supplier: {
    id: string
    name: string
    code: string
  }
  items: PurchaseOrderItem[]
}

interface PurchaseOrderItem {
  id: string
  productId: string
  variantId?: string
  orderedQty: number
  receivedQty: number
  remainingQty: number
  unitCost: number
  totalCost: number
  productName: string
  productSku: string
  supplierSku?: string
  expectedDate?: string
  status: 'PENDING' | 'PARTIALLY_RECEIVED' | 'RECEIVED' | 'CANCELLED'
}

// Currently unused but kept for future supplier contact management feature
// interface SupplierContact {
//   id: string
//   supplierId: string
//   name: string
//   title?: string
//   email?: string
//   phone?: string
//   mobile?: string
//   isPrimary: boolean
//   department?: string
//   isActive: boolean
//   notes?: string
// }

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(20)
  // Dialog states
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showContactsDialog, setShowContactsDialog] = useState(false)
  const [showPurchaseOrderDialog, setShowPurchaseOrderDialog] = useState(false)// Load data
  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadData = async () => {
    try {
      await Promise.all([
        loadSuppliers(),
        loadPurchaseOrders()
      ])
    } catch (error) {
      console.error('Error loading data:', error)
    }
  }
  const loadSuppliers = async () => {
    try {
      const response = await fetch('/api/inventory/suppliers')
      if (response.ok) {
        const data = await response.json()
        setSuppliers(data.data || [])
      } else {
        console.error('Failed to fetch suppliers')
        setSuppliers([])
      }
    } catch (error) {
      console.error('Error loading suppliers:', error)
      setSuppliers([])
    }
  }

  const loadPurchaseOrders = async () => {
    try {
      const response = await fetch('/api/inventory/purchase-orders')
      if (response.ok) {
        const data = await response.json()
        setPurchaseOrders(data.data || [])
      } else {
        console.error('Failed to fetch purchase orders')
        setPurchaseOrders([])
      }
    } catch (error) {
      console.error('Error loading purchase orders:', error)
      setPurchaseOrders([])
    }
  }
  // Utility function to load supplier contacts - for future implementation
  // const loadSupplierContacts = async () => {
  //   try {
  //     const response = await fetch('/api/inventory/suppliers/contacts')
  //     if (response.ok) {
  //       const data = await response.json()
  //       // Supplier contacts loaded successfully
  //     }
  //   } catch (error) {
  //     console.error('Error loading supplier contacts:', error)
  //   }
  // }

  // Filter suppliers
  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (supplier.email && supplier.email.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesStatus = statusFilter === 'all' || supplier.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // Pagination
  const totalPages = Math.ceil(filteredSuppliers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedSuppliers = filteredSuppliers.slice(startIndex, startIndex + itemsPerPage)

  const handleSelectSupplier = (supplierId: string, checked: boolean) => {
    if (checked) {
      setSelectedSuppliers([...selectedSuppliers, supplierId])
    } else {
      setSelectedSuppliers(selectedSuppliers.filter(id => id !== supplierId))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedSuppliers(paginatedSuppliers.map(s => s.id))
    } else {
      setSelectedSuppliers([])
    }
  }

  const handleEditSupplier = (supplier: Supplier) => {
    setSelectedSupplier(supplier)
    setShowEditDialog(true)
  }

  const handleManageContacts = (supplier: Supplier) => {
    setSelectedSupplier(supplier)
    setShowContactsDialog(true)
  }

  const handleCreatePurchaseOrder = (supplier: Supplier) => {
    setSelectedSupplier(supplier)
    setShowPurchaseOrderDialog(true)
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      ACTIVE: 'default',
      INACTIVE: 'secondary',
      PENDING_APPROVAL: 'outline',
      SUSPENDED: 'destructive',
      BLACKLISTED: 'destructive'
    } as const

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {status.replace('_', ' ')}
      </Badge>
    )
  }

  const getPOStatusBadge = (status: string) => {
    const variants = {
      DRAFT: 'outline',
      PENDING_APPROVAL: 'outline',
      APPROVED: 'secondary',
      SENT: 'secondary',
      ACKNOWLEDGED: 'secondary',
      PARTIALLY_RECEIVED: 'outline',
      RECEIVED: 'default',
      INVOICED: 'default',
      PAID: 'default',
      CANCELLED: 'destructive',
      CLOSED: 'secondary'
    } as const

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {status.replace('_', ' ')}
      </Badge>
    )
  }

  const getPerformanceColor = (value: number, threshold: number = 80) => {
    if (value >= threshold) return 'text-green-600'
    if (value >= threshold - 20) return 'text-yellow-600'
    return 'text-red-600'
  }

  const renderStarRating = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
          />
        ))}
        <span className="text-sm text-muted-foreground ml-1">({rating.toFixed(1)})</span>
      </div>
    )
  }

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }
  // Utility function to format address - currently unused, removing to avoid ESLint error
  // const formatAddress = (address: { street: string; city: string; state: string; zipCode: string; country: string }) => {
  //   return `${address.street}, ${address.city}, ${address.state} ${address.zipCode}, ${address.country}`
  // }

  return (
    <div className="py-16 px-6 mx-4 md:mx-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Suppliers Management</h1>
          <p className="text-muted-foreground">
            Manage supplier relationships, purchase orders, and performance metrics
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>          <Button onClick={() => {
            setSelectedSupplier(null)
            setShowAddDialog(true)
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Supplier
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Suppliers</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{suppliers.length}</div>
            <p className="text-xs text-muted-foreground">
              {suppliers.filter(s => s.status === 'ACTIVE').length} active
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(suppliers.reduce((sum, s) => sum + s.totalSpent, 0))}
            </div>
            <p className="text-xs text-muted-foreground">
              This year
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {purchaseOrders.filter(po => ['APPROVED', 'SENT', 'ACKNOWLEDGED', 'PARTIALLY_RECEIVED'].includes(po.status)).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Purchase orders
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Delivery Time</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7.2 days</div>
            <p className="text-xs text-muted-foreground">
              Faster than last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="suppliers" className="space-y-6">
        <TabsList>
          <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
          <TabsTrigger value="purchase-orders">Purchase Orders</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        {/* Suppliers Tab */}
        <TabsContent value="suppliers" className="space-y-6">
          {/* Search and Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-4 mb-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search suppliers by name, code, or email..."
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
              </div>

              {showFilters && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
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
                        <SelectItem value="PENDING_APPROVAL">Pending Approval</SelectItem>
                        <SelectItem value="SUSPENDED">Suspended</SelectItem>
                        <SelectItem value="BLACKLISTED">Blacklisted</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Bulk Actions */}
          {selectedSuppliers.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {selectedSuppliers.length} supplier(s) selected
                  </span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      Export Selected
                    </Button>
                    <Button variant="outline" size="sm">
                      Bulk Update
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Suppliers Table */}
          <Card>
            <CardHeader>
              <CardTitle>Suppliers ({filteredSuppliers.length})</CardTitle>
              <CardDescription>
                Manage your supplier database and relationships
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedSuppliers.length === paginatedSuppliers.length && paginatedSuppliers.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Performance</TableHead>
                    <TableHead>Orders</TableHead>
                    <TableHead>Total Spent</TableHead>
                    <TableHead>Last Order</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedSuppliers.map((supplier) => (
                    <TableRow key={supplier.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedSuppliers.includes(supplier.id)}
                          onCheckedChange={(checked) =>
                            handleSelectSupplier(supplier.id, checked as boolean)
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={`https://api.dicebear.com/6/initials/svg?seed=${supplier.name}`} />
                            <AvatarFallback>
                              {supplier.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{supplier.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {supplier.code}
                              {supplier.website && (
                                <span className="ml-2">• {supplier.website}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {supplier.contactName && (
                            <div className="text-sm font-medium">{supplier.contactName}</div>
                          )}
                          {supplier.contactEmail && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Mail className="h-3 w-3" />
                              {supplier.contactEmail}
                            </div>
                          )}
                          {supplier.contactPhone && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Phone className="h-3 w-3" />
                              {supplier.contactPhone}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          {supplier.rating && renderStarRating(supplier.rating)}
                          {supplier.onTimeDelivery && (
                            <div className="text-sm">
                              <span className="text-muted-foreground">On-time: </span>
                              <span className={getPerformanceColor(supplier.onTimeDelivery)}>
                                {supplier.onTimeDelivery.toFixed(1)}%
                              </span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">{supplier.totalPurchaseOrders}</div>
                          <div className="text-muted-foreground">
                            {supplier.activeProducts} products
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-medium">
                          {formatCurrency(supplier.totalSpent, supplier.currency)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {supplier.lastOrderDate ? (
                          <span className="text-sm text-muted-foreground">
                            {formatDate(supplier.lastOrderDate)}
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">Never</span>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(supplier.status)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              Actions
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditSupplier(supplier)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Supplier
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleManageContacts(supplier)}>
                              <Eye className="h-4 w-4 mr-2" />
                              Manage Contacts
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleCreatePurchaseOrder(supplier)}>
                              <Plus className="h-4 w-4 mr-2" />
                              Create PO
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Supplier
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredSuppliers.length)} of {filteredSuppliers.length} suppliers
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

        {/* Purchase Orders Tab */}
        <TabsContent value="purchase-orders" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Purchase Orders</CardTitle>
              <CardDescription>
                Track purchase orders and delivery status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order Number</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Order Date</TableHead>
                    <TableHead>Expected Date</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchaseOrders.slice(0, 10).map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <code className="text-sm bg-muted px-2 py-1 rounded">
                          {order.orderNumber}
                        </code>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{order.supplier.name}</div>
                          <div className="text-sm text-muted-foreground">{order.supplier.code}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {formatDate(order.orderDate)}
                        </span>
                      </TableCell>
                      <TableCell>
                        {order.expectedDate ? (
                          <span className="text-sm">
                            {formatDate(order.expectedDate)}
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">TBD</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">
                          {formatCurrency(order.totalAmount, order.currency)}
                        </span>
                      </TableCell>
                      <TableCell>{getPOStatusBadge(order.status)}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Performers</CardTitle>
                <CardDescription>Suppliers with highest ratings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {suppliers
                    .filter(s => s.rating)
                    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
                    .slice(0, 5)
                    .map((supplier) => (
                      <div key={supplier.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={`https://api.dicebear.com/6/initials/svg?seed=${supplier.name}`} />
                            <AvatarFallback>
                              {supplier.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-sm">{supplier.name}</div>
                            <div className="text-xs text-muted-foreground">{supplier.code}</div>
                          </div>
                        </div>
                        {supplier.rating && renderStarRating(supplier.rating)}
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Delivery Performance</CardTitle>
                <CardDescription>On-time delivery rates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {suppliers
                    .filter(s => s.onTimeDelivery)
                    .sort((a, b) => (b.onTimeDelivery || 0) - (a.onTimeDelivery || 0))
                    .slice(0, 5)
                    .map((supplier) => (
                      <div key={supplier.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={`https://api.dicebear.com/6/initials/svg?seed=${supplier.name}`} />
                            <AvatarFallback>
                              {supplier.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-sm">{supplier.name}</div>
                            <div className="text-xs text-muted-foreground">{supplier.code}</div>
                          </div>
                        </div>
                        <div className={`text-sm font-medium ${getPerformanceColor(supplier.onTimeDelivery || 0)}`}>
                          {supplier.onTimeDelivery?.toFixed(1)}%
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>      {/* Supplier Form Dialog */}
      <Dialog open={showAddDialog || showEditDialog} onOpenChange={(open) => {
        if (!open) {
          setShowAddDialog(false)
          setShowEditDialog(false)
          setSelectedSupplier(null)
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedSupplier ? 'Edit Supplier' : 'Add New Supplier'}
            </DialogTitle>
            <DialogDescription>
              {selectedSupplier ? 'Update supplier information' : 'Create a new supplier record'}
            </DialogDescription>
          </DialogHeader>
          <SupplierForm supplier={selectedSupplier} onSave={() => {
            // Handle save logic here
            setShowAddDialog(false)
            setShowEditDialog(false)
            setSelectedSupplier(null)
            loadData() // Reload data
          }}
            onCancel={() => {
              setShowAddDialog(false)
              setShowEditDialog(false)
              setSelectedSupplier(null)
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Supplier Contacts Dialog */}
      <Dialog open={showContactsDialog} onOpenChange={setShowContactsDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Contacts - {selectedSupplier?.name}</DialogTitle>
            <DialogDescription>
              Manage contact information for this supplier
            </DialogDescription>
          </DialogHeader>
          <div className="p-4">
            <p>Contact management functionality will be implemented here.</p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Purchase Order Dialog */}
      <Dialog open={showPurchaseOrderDialog} onOpenChange={setShowPurchaseOrderDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Purchase Order - {selectedSupplier?.name}</DialogTitle>
            <DialogDescription>
              Create a new purchase order for this supplier
            </DialogDescription>
          </DialogHeader>
          <div className="p-4">
            <p>Purchase order creation functionality will be implemented here.</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Simple Supplier Form Component
function SupplierForm({
  supplier,
  onSave,
  onCancel
}: {
  supplier?: Supplier | null
  onSave: () => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    name: supplier?.name || '',
    code: supplier?.code || '',
    email: supplier?.email || '',
    phone: supplier?.phone || '',
    website: supplier?.website || '',
    address: supplier?.billingAddress?.street || '',
    city: supplier?.billingAddress?.city || '',
    state: supplier?.billingAddress?.state || '',
    country: supplier?.billingAddress?.country || '',
    postalCode: supplier?.billingAddress?.zipCode || '',
    taxId: supplier?.taxId || '',
    companyType: supplier?.companyType || 'CORPORATION' as const,
    status: supplier?.status || 'ACTIVE' as const,
    paymentTerms: supplier?.paymentTerms || '',
    creditLimit: supplier?.creditLimit?.toString() || '',
    currency: supplier?.currency || 'USD',
    notes: supplier?.notes || ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = supplier
        ? `/api/inventory/suppliers/${supplier.id}`
        : '/api/inventory/suppliers'

      const method = supplier ? 'PUT' : 'POST'
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          code: formData.code,
          email: formData.email,
          phone: formData.phone,
          website: formData.website,
          companyType: formData.companyType,
          taxId: formData.taxId,
          billingAddress: {
            street: formData.address,
            city: formData.city,
            state: formData.state,
            country: formData.country,
            zipCode: formData.postalCode
          },
          paymentTerms: formData.paymentTerms,
          creditLimit: formData.creditLimit ? parseFloat(formData.creditLimit) : null,
          currency: formData.currency,
          notes: formData.notes,
          status: formData.status
        }),
      })

      if (response.ok) {
        onSave()
      } else {
        console.error('Failed to save supplier')
      }
    } catch (error) {
      console.error('Error saving supplier:', error)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Company Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="code">Supplier Code</Label>
          <Input
            id="code"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            value={formData.website}
            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="companyType">Company Type</Label>          <Select
            value={formData.companyType}
            onValueChange={(value: 'CORPORATION' | 'LLC' | 'PARTNERSHIP' | 'SOLE_PROPRIETORSHIP' | 'NON_PROFIT' | 'GOVERNMENT' | 'OTHER') =>
              setFormData({ ...formData, companyType: value })
            }>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CORPORATION">Corporation</SelectItem>
              <SelectItem value="LLC">LLC</SelectItem>
              <SelectItem value="PARTNERSHIP">Partnership</SelectItem>
              <SelectItem value="SOLE_PROPRIETORSHIP">Sole Proprietorship</SelectItem>
              <SelectItem value="NON_PROFIT">Non-Profit</SelectItem>
              <SelectItem value="GOVERNMENT">Government</SelectItem>
              <SelectItem value="OTHER">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="state">State/Province</Label>
          <Input
            id="state"
            value={formData.state}
            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="postalCode">Postal Code</Label>
          <Input
            id="postalCode"
            value={formData.postalCode}
            onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="country">Country</Label>
          <Input
            id="country"
            value={formData.country}
            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="taxId">Tax ID</Label>
          <Input
            id="taxId"
            value={formData.taxId}
            onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="creditLimit">Credit Limit</Label>
          <Input
            id="creditLimit"
            type="number"
            step="0.01"
            value={formData.creditLimit}
            onChange={(e) => setFormData({ ...formData, creditLimit: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="currency">Currency</Label>
          <Select value={formData.currency} onValueChange={(value) => setFormData({ ...formData, currency: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USD">USD - US Dollar</SelectItem>
              <SelectItem value="EUR">EUR - Euro</SelectItem>
              <SelectItem value="GBP">GBP - British Pound</SelectItem>
              <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
              <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="paymentTerms">Payment Terms</Label>
        <Input
          id="paymentTerms"
          value={formData.paymentTerms}
          onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
          placeholder="e.g., Net 30, 2/10 Net 30"
        />
      </div>

      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={3}
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {supplier ? 'Update' : 'Create'} Supplier
        </Button>
      </div>
    </form>
  )
}
