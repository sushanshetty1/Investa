'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { 
  Search, 
  Filter, 
  Plus, 
  Eye, 
  Edit, 
  Truck, 
  Package, 
  Clock, 
  CheckCircle, 
  XCircle,  RefreshCw,
  DollarSign,
  BarChart3,
  FileText,
  AlertTriangle,
  ShoppingCart,
  Zap
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

// Types
interface PurchaseOrder {
  id: string;
  orderNumber: string;
  supplierId: string;
  supplier: {
    name: string;
    email?: string;
    phone?: string;
  };
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'SENT' | 'ACKNOWLEDGED' | 'PARTIALLY_RECEIVED' | 'RECEIVED' | 'INVOICED' | 'PAID' | 'CANCELLED' | 'CLOSED';
  totalAmount: number;
  currency: string;
  orderDate: string;
  expectedDate?: string;
  deliveryDate?: string;
  approvedBy?: string;
  approvedAt?: string;
  items: PurchaseOrderItem[];
  paymentTerms?: string;
  shippingTerms?: string;
  notes?: string;
}

interface PurchaseOrderItem {
  id: string;
  productName: string;
  productSku: string;
  supplierSku?: string;
  orderedQty: number;
  receivedQty: number;
  unitCost: number;
  totalCost: number;
  status: 'PENDING' | 'PARTIALLY_RECEIVED' | 'RECEIVED' | 'CANCELLED';
  expectedDate?: string;
}

interface PurchaseOrderStats {
  totalOrders: number;
  pendingApproval: number;
  awaitingDelivery: number;
  totalValue: number;
  avgOrderValue: number;
}

interface ReorderSuggestion {
  productId: string;
  productName: string;
  productSku: string;
  currentStock: number;
  reorderPoint: number;
  suggestedQty: number;
  preferredSupplier: string;
  estimatedCost: number;
}

export default function PurchaseOrdersPage() {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<PurchaseOrder[]>([]);
  const [stats, setStats] = useState<PurchaseOrderStats>({
    totalOrders: 0,
    pendingApproval: 0,
    awaitingDelivery: 0,
    totalValue: 0,
    avgOrderValue: 0
  });
  const [reorderSuggestions, setReorderSuggestions] = useState<ReorderSuggestion[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');  const [isOrderDetailOpen, setIsOrderDetailOpen] = useState(false);
  const [isGoodsReceiptOpen, setIsGoodsReceiptOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('orders');
  // Load purchase orders and reorder suggestions
  useEffect(() => {
    loadPurchaseOrders();
    loadReorderSuggestions();
  }, []);
  const loadPurchaseOrders = async () => {
    setLoading(true);
    try {
      // Fetch purchase orders from API
      const ordersResponse = await fetch('/api/purchase-orders');
      const ordersData = await ordersResponse.json();
      
      if (!ordersResponse.ok) {
        throw new Error(ordersData.error || 'Failed to fetch purchase orders');
      }

      // Fetch stats from API
      const statsResponse = await fetch('/api/purchase-orders/stats');
      const statsData = await statsResponse.json();

      if (!statsResponse.ok) {
        throw new Error(statsData.error || 'Failed to fetch stats');
      }

      setPurchaseOrders(ordersData.purchaseOrders || []);
      setFilteredOrders(ordersData.purchaseOrders || []);
      setStats(statsData.stats || {
        totalOrders: 0,
        pendingApproval: 0,
        awaitingDelivery: 0,
        totalValue: 0,
        avgOrderValue: 0
      });
    } catch (error) {
      console.error('Error loading purchase orders:', error);
      toast.error('Failed to load purchase orders');
    } finally {
      setLoading(false);
    }
  };
  const loadReorderSuggestions = async () => {
    try {
      // Fetch reorder suggestions from API
      const response = await fetch('/api/purchase-orders/reorder-suggestions');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch reorder suggestions');
      }

      setReorderSuggestions(data.suggestions || []);
    } catch (error) {
      console.error('Error loading reorder suggestions:', error);
      toast.error('Failed to load reorder suggestions');
    }
  };

  // Filter orders based on search and status
  useEffect(() => {
    let filtered = purchaseOrders;

    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.supplier.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    setFilteredOrders(filtered);
  }, [purchaseOrders, searchTerm, statusFilter]);  const getStatusBadge = (status: string) => {
    type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline';
    const statusConfig: Record<string, { variant: BadgeVariant, icon: React.ComponentType<{ className?: string }> }> = {
      DRAFT: { variant: 'secondary', icon: FileText },
      PENDING_APPROVAL: { variant: 'secondary', icon: Clock },
      APPROVED: { variant: 'default', icon: CheckCircle },
      SENT: { variant: 'default', icon: Truck },
      ACKNOWLEDGED: { variant: 'default', icon: CheckCircle },
      PARTIALLY_RECEIVED: { variant: 'default', icon: Package },
      RECEIVED: { variant: 'default', icon: CheckCircle },
      INVOICED: { variant: 'default', icon: FileText },
      PAID: { variant: 'default', icon: DollarSign },
      CANCELLED: { variant: 'destructive', icon: XCircle },
      CLOSED: { variant: 'secondary', icon: CheckCircle }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.DRAFT;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {status.replace('_', ' ')}
      </Badge>    );
  };

  const approveOrder = async (orderId: string) => {
    try {
      const response = await fetch(`/api/purchase-orders/${orderId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          approvedBy: 'Current User' // TODO: Get from auth context
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to approve purchase order');
      }

      // Update local state
      setPurchaseOrders(prev => prev.map(order => 
        order.id === orderId 
          ? { 
              ...order, 
              status: 'APPROVED' as PurchaseOrder['status'],
              approvedBy: 'Current User',
              approvedAt: new Date().toISOString()
            }
          : order
      ));

      toast.success('Purchase order approved successfully');
    } catch (error) {
      console.error('Error approving order:', error);
      toast.error('Failed to approve purchase order');
    }
  };
  const createReorderFromSuggestion = async (suggestion: ReorderSuggestion) => {
    try {
      const response = await fetch('/api/purchase-orders/reorder-suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: suggestion.productId,
          quantity: suggestion.suggestedQty
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create purchase order from suggestion');
      }

      // Remove from suggestions after creating order
      setReorderSuggestions(prev => prev.filter(s => s.productId !== suggestion.productId));
      
      // Reload purchase orders to show the new one
      loadPurchaseOrders();

      toast.success('Purchase order created successfully from reorder suggestion');
    } catch (error) {
      console.error('Error creating reorder:', error);
      toast.error('Failed to create purchase order from suggestion');
    }
  };

  const viewOrderDetails = (order: PurchaseOrder) => {
    setSelectedOrder(order);
    setIsOrderDetailOpen(true);
  };

  const receiveGoods = (order: PurchaseOrder) => {
    setSelectedOrder(order);
    setIsGoodsReceiptOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Purchase Orders</h1>
              <p className="text-muted-foreground">
                Manage purchase orders, supplier relationships, and inventory procurement
              </p>
            </div><Button asChild>
          <Link href="/purchase-orders/create">
            <Plus className="mr-2 h-4 w-4" />
            New Purchase Order
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingApproval}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Awaiting Delivery</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.awaitingDelivery}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalValue.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Order</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.avgOrderValue.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="orders">Purchase Orders</TabsTrigger>
          <TabsTrigger value="reorder" className="gap-2">
            <AlertTriangle className="h-4 w-4" />
            Reorder Suggestions ({reorderSuggestions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Purchase Orders</CardTitle>
              <CardDescription>
                View and manage all purchase orders
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search purchase orders..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[200px]">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="PENDING_APPROVAL">Pending Approval</SelectItem>
                    <SelectItem value="APPROVED">Approved</SelectItem>
                    <SelectItem value="SENT">Sent</SelectItem>
                    <SelectItem value="ACKNOWLEDGED">Acknowledged</SelectItem>
                    <SelectItem value="PARTIALLY_RECEIVED">Partially Received</SelectItem>
                    <SelectItem value="RECEIVED">Received</SelectItem>
                    <SelectItem value="INVOICED">Invoiced</SelectItem>
                    <SelectItem value="PAID">Paid</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    <SelectItem value="CLOSED">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Purchase Orders Table */}
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>PO Number</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Order Date</TableHead>
                      <TableHead>Expected Date</TableHead>
                      <TableHead>Approved By</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">
                          {order.orderNumber}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{order.supplier.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {order.supplier.email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(order.status)}
                        </TableCell>
                        <TableCell>
                          {order.currency} {order.totalAmount.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          {format(new Date(order.orderDate), 'MMM dd, yyyy')}
                        </TableCell>
                        <TableCell>
                          {order.expectedDate ? 
                            format(new Date(order.expectedDate), 'MMM dd, yyyy') : 
                            '-'
                          }
                        </TableCell>
                        <TableCell>
                          {order.approvedBy || '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => viewOrderDetails(order)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {order.status === 'PENDING_APPROVAL' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => approveOrder(order.id)}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}
                            {['APPROVED', 'SENT', 'ACKNOWLEDGED', 'PARTIALLY_RECEIVED'].includes(order.status) && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => receiveGoods(order)}
                              >
                                <Package className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reorder" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Automated Reorder Suggestions
              </CardTitle>
              <CardDescription>
                Products that are below reorder point and need restocking
              </CardDescription>
            </CardHeader>
            <CardContent>
              {reorderSuggestions.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No reorder suggestions</h3>
                  <p className="text-muted-foreground">All products are adequately stocked</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead>Current Stock</TableHead>
                        <TableHead>Reorder Point</TableHead>
                        <TableHead>Suggested Qty</TableHead>
                        <TableHead>Preferred Supplier</TableHead>
                        <TableHead>Estimated Cost</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reorderSuggestions.map((suggestion) => (
                        <TableRow key={suggestion.productId}>
                          <TableCell className="font-medium">
                            {suggestion.productName}
                          </TableCell>
                          <TableCell>{suggestion.productSku}</TableCell>
                          <TableCell>
                            <span className="text-red-600 font-medium">
                              {suggestion.currentStock}
                            </span>
                          </TableCell>
                          <TableCell>{suggestion.reorderPoint}</TableCell>
                          <TableCell className="font-medium">
                            {suggestion.suggestedQty}
                          </TableCell>
                          <TableCell>{suggestion.preferredSupplier}</TableCell>
                          <TableCell>
                            USD {suggestion.estimatedCost.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              onClick={() => createReorderFromSuggestion(suggestion)}
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Create PO
                            </Button>
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

      {/* Purchase Order Detail Dialog */}
      <Dialog open={isOrderDetailOpen} onOpenChange={setIsOrderDetailOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Purchase Order Details - {selectedOrder?.orderNumber}</DialogTitle>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Order Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      {getStatusBadge(selectedOrder.status)}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total:</span>
                      <span className="font-medium">
                        {selectedOrder.currency} {selectedOrder.totalAmount.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Payment Terms:</span>
                      <span>{selectedOrder.paymentTerms || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shipping Terms:</span>
                      <span>{selectedOrder.shippingTerms || '-'}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Supplier Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Name:</span>
                      <span>{selectedOrder.supplier.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Email:</span>
                      <span>{selectedOrder.supplier.email || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Phone:</span>
                      <span>{selectedOrder.supplier.phone || '-'}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Order Items */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Order Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead>Supplier SKU</TableHead>
                        <TableHead>Ordered</TableHead>
                        <TableHead>Received</TableHead>
                        <TableHead>Unit Cost</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedOrder.items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">
                            {item.productName}
                          </TableCell>
                          <TableCell>{item.productSku}</TableCell>
                          <TableCell>{item.supplierSku || '-'}</TableCell>
                          <TableCell>{item.orderedQty}</TableCell>
                          <TableCell>{item.receivedQty}</TableCell>
                          <TableCell>
                            {selectedOrder.currency} {item.unitCost.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            {selectedOrder.currency} {item.totalCost.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(item.status)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-2">
                {selectedOrder.status === 'PENDING_APPROVAL' && (
                  <Button onClick={() => approveOrder(selectedOrder.id)}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve Order
                  </Button>
                )}
                {['APPROVED', 'SENT', 'ACKNOWLEDGED', 'PARTIALLY_RECEIVED'].includes(selectedOrder.status) && (
                  <Button onClick={() => receiveGoods(selectedOrder)}>
                    <Package className="h-4 w-4 mr-2" />
                    Receive Goods
                  </Button>
                )}
                <Button variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Order
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Goods Receipt Dialog */}
      <Dialog open={isGoodsReceiptOpen} onOpenChange={setIsGoodsReceiptOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Goods Receipt - {selectedOrder?.orderNumber}</DialogTitle>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Receive Goods</CardTitle>
                  <CardDescription>
                    Update received quantities and perform quality checks
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Ordered</TableHead>
                        <TableHead>Previously Received</TableHead>
                        <TableHead>Receiving Now</TableHead>
                        <TableHead>Quality Check</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedOrder.items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{item.productName}</div>
                              <div className="text-sm text-muted-foreground">{item.productSku}</div>
                            </div>
                          </TableCell>
                          <TableCell>{item.orderedQty}</TableCell>
                          <TableCell>{item.receivedQty}</TableCell>
                          <TableCell>
                            <Input 
                              type="number" 
                              placeholder="0" 
                              className="w-20"
                              max={item.orderedQty - item.receivedQty}
                            />
                          </TableCell>
                          <TableCell>
                            <Select defaultValue="passed">
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="passed">Passed</SelectItem>
                                <SelectItem value="failed">Failed</SelectItem>
                                <SelectItem value="partial">Partial</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  
                  <div className="mt-4">
                    <label className="text-sm font-medium">Receipt Notes</label>
                    <Textarea 
                      placeholder="Add any notes about the receipt, quality issues, or discrepancies..."
                      className="mt-1"
                    />
                  </div>

                  <div className="flex justify-end space-x-2 mt-6">
                    <Button variant="outline" onClick={() => setIsGoodsReceiptOpen(false)}>
                      Cancel
                    </Button>
                    <Button>
                      <Package className="h-4 w-4 mr-2" />
                      Complete Receipt
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}        </DialogContent>
      </Dialog>
        </div>
      </div>
    </div>
  );
}
