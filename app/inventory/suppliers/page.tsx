'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Filter, Download, Edit, Trash2, Eye, Phone, Mail, Star, TrendingUp, Package, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
  const [itemsPerPage] = useState(20)  // Load data
  useEffect(() => {
    loadData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadData = async () => {
    try {
      await Promise.all([
        loadSuppliers(),
        loadPurchaseOrders()
      ])    } catch (error) {
      console.error('Error loading data:', error)
    }
  }

  const loadSuppliers = async () => {
    // TODO: Implement API call to fetch suppliers with performance metrics
    const mockSuppliers: Supplier[] = [
      {
        id: '1',
        name: 'TechSupply Pro',
        code: 'TSP-001',
        email: 'orders@techsupplypro.com',
        phone: '+1-555-0123',
        website: 'https://techsupplypro.com',
        companyType: 'CORPORATION',
        taxId: '12-3456789',
        vatNumber: 'US123456789',
        registrationNumber: 'CORP-2020-001',
        billingAddress: {
          street: '123 Technology Ave',
          city: 'San Francisco',
          state: 'CA',
          country: 'United States',
          zipCode: '94105'
        },
        contactName: 'John Smith',
        contactEmail: 'john.smith@techsupplypro.com',
        contactPhone: '+1-555-0124',
        contactTitle: 'Sales Manager',
        paymentTerms: 'NET30',
        creditLimit: 50000,
        currency: 'USD',
        rating: 4.8,
        onTimeDelivery: 95.5,
        qualityRating: 4.7,
        status: 'ACTIVE',
        certifications: ['ISO 9001', 'CE Marking'],
        notes: 'Reliable supplier for electronics components',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-20T14:30:00Z',
        totalPurchaseOrders: 45,
        totalSpent: 125000,
        activeProducts: 78,
        lastOrderDate: '2024-01-18T09:00:00Z'
      },
      // Add more mock suppliers...
    ]
    setSuppliers(mockSuppliers)
  }

  const loadPurchaseOrders = async () => {
    // TODO: Implement API call to fetch purchase orders
    const mockPurchaseOrders: PurchaseOrder[] = [
      {
        id: '1',
        orderNumber: 'PO-2024-001',
        supplierId: '1',
        status: 'APPROVED',
        orderDate: '2024-01-18T09:00:00Z',
        expectedDate: '2024-01-25T09:00:00Z',
        subtotal: 5000,
        taxAmount: 400,
        shippingCost: 150,
        discountAmount: 0,
        totalAmount: 5550,
        currency: 'USD',
        paymentTerms: 'NET30',
        shippingTerms: 'FOB Origin',
        createdAt: '2024-01-18T09:00:00Z',
        supplier: {
          id: '1',
          name: 'TechSupply Pro',
          code: 'TSP-001'
        },
        items: []
      },
      // Add more mock purchase orders...
    ]
    setPurchaseOrders(mockPurchaseOrders)
  }  // Utility function to load supplier contacts - currently unused but kept for future implementation
  // const loadSupplierContacts = async () => {
  //   // TODO: Implement API call to fetch supplier contacts
  //   const mockContacts: SupplierContact[] = [
  //     {
  //       id: '1',
  //       supplierId: '1',
  //       name: 'John Smith',
  //       title: 'Sales Manager',
  //       email: 'john.smith@techsupplypro.com',
  //       phone: '+1-555-0124',
  //       mobile: '+1-555-0125',
  //       isPrimary: true,
  //       department: 'Sales',
  //       isActive: true,
  //       notes: 'Primary contact for all orders'
  //     },
  //     // Add more mock contacts...
  //   ]
  //   // setSupplierContacts(mockContacts) - commented out as supplierContacts state was removed
  //   console.log('Loaded supplier contacts:', mockContacts)
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
    // TODO: Implement supplier editing
    console.log('Edit supplier:', supplier.id)
  }

  const handleManageContacts = (supplier: Supplier) => {
    // TODO: Implement contact management
    console.log('Manage contacts for supplier:', supplier.id)
  }

  const handleCreatePurchaseOrder = (supplier: Supplier) => {
    // TODO: Implement purchase order creation
    console.log('Create purchase order for supplier:', supplier.id)
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
            // TODO: Implement add supplier functionality
            console.log('Add new supplier')
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
      </Tabs>

      {/* TODO: Add Dialog Components */}
      {/* These would be implemented as separate components:
          - SupplierFormDialog
          - SupplierContactsManager
          - PurchaseOrderFormDialog
      */}
    </div>
  )
}
