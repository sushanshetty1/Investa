'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Plus, Trash2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

// Types
interface PurchaseOrderItem {
  productId: string;
  productName: string;
  productSku: string;
  supplierSku?: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
}

interface Supplier {
  id: string;
  name: string;
  email?: string;
  phone?: string;
}

interface Product {
  id: string;
  name: string;
  sku: string;
  costPrice?: number;
  inventory?: {
    availableQuantity: number;
    reorderPoint: number;
  };
}

export default function CreatePurchaseOrderPage() {
  const router = useRouter();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [orderItems, setOrderItems] = useState<PurchaseOrderItem[]>([]);
  const [expectedDate, setExpectedDate] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('');
  const [shippingTerms, setShippingTerms] = useState('');
  const [notes, setNotes] = useState('');
  const [isProductSelectOpen, setIsProductSelectOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadSuppliers();
    loadProducts();
  }, []);

  const loadSuppliers = async () => {
    try {
      const response = await fetch('/api/suppliers');
      const data = await response.json();
      
      if (response.ok) {
        setSuppliers(data.suppliers || []);
      }
    } catch (error) {
      console.error('Error loading suppliers:', error);
    }
  };

  const loadProducts = async () => {
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      
      if (response.ok) {
        setProducts(data.products || []);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const addProduct = (product: Product) => {
    const existingItem = orderItems.find(item => item.productId === product.id);
    
    if (existingItem) {
      setOrderItems(prev => prev.map(item =>
        item.productId === product.id
          ? { ...item, quantity: item.quantity + 1, totalCost: (item.quantity + 1) * item.unitCost }
          : item
      ));
    } else {
      const newItem: PurchaseOrderItem = {
        productId: product.id,
        productName: product.name,
        productSku: product.sku,
        quantity: product.inventory?.reorderPoint || 10,
        unitCost: product.costPrice || 0,
        totalCost: (product.inventory?.reorderPoint || 10) * (product.costPrice || 0)
      };
      setOrderItems(prev => [...prev, newItem]);
    }
    
    setIsProductSelectOpen(false);
  };

  const updateItemQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    
    setOrderItems(prev => prev.map(item =>
      item.productId === productId
        ? { ...item, quantity, totalCost: quantity * item.unitCost }
        : item
    ));
  };

  const updateItemCost = (productId: string, unitCost: number) => {
    setOrderItems(prev => prev.map(item =>
      item.productId === productId
        ? { 
            ...item, 
            unitCost: unitCost >= 0 ? unitCost : 0, 
            totalCost: item.quantity * (unitCost >= 0 ? unitCost : 0)
          }
        : item
    ));
  };

  const updateSupplierSku = (productId: string, supplierSku: string) => {
    setOrderItems(prev => prev.map(item =>
      item.productId === productId
        ? { ...item, supplierSku }
        : item
    ));
  };

  const removeItem = (productId: string) => {
    setOrderItems(prev => prev.filter(item => item.productId !== productId));
  };

  const calculateSubtotal = () => {
    return orderItems.reduce((sum, item) => sum + item.totalCost, 0);
  };

  const handleSubmit = async () => {
    if (!selectedSupplierId) {
      toast.error('Please select a supplier');
      return;
    }

    if (orderItems.length === 0) {
      toast.error('Please add at least one item to the purchase order');
      return;
    }

    setIsSubmitting(true);

    try {
      const purchaseOrderData = {
        supplierId: selectedSupplierId,
        warehouseId: 'default-warehouse', // TODO: Allow warehouse selection
        expectedDate: expectedDate ? new Date(expectedDate) : undefined,
        paymentTerms,
        shippingTerms,
        notes,
        items: orderItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          unitCost: item.unitCost,
          supplierSku: item.supplierSku
        }))
      };

      const response = await fetch('/api/purchase-orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(purchaseOrderData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create purchase order');
      }

      toast.success('Purchase order created successfully!');
      router.push('/purchase-orders');
    } catch (error) {
      console.error('Error creating purchase order:', error);
      toast.error('Failed to create purchase order');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create Purchase Order</h1>
          <p className="text-muted-foreground">Create a new purchase order for inventory restocking</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Purchase Order Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Supplier Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Supplier Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="supplier">Supplier</Label>
                <Select value={selectedSupplierId} onValueChange={setSelectedSupplierId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id}>
                        {supplier.name} {supplier.email && `- ${supplier.email}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Purchase Order Items */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Purchase Order Items</CardTitle>
                <Dialog open={isProductSelectOpen} onOpenChange={setIsProductSelectOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Product
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl">
                    <DialogHeader>
                      <DialogTitle>Select Product</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Input placeholder="Search products..." />
                      <div className="max-h-96 overflow-y-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Product</TableHead>
                              <TableHead>SKU</TableHead>
                              <TableHead>Current Stock</TableHead>
                              <TableHead>Reorder Point</TableHead>
                              <TableHead>Cost Price</TableHead>
                              <TableHead></TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {products.map((product) => (
                              <TableRow key={product.id}>
                                <TableCell>{product.name}</TableCell>
                                <TableCell>{product.sku}</TableCell>
                                <TableCell>{product.inventory?.availableQuantity || 0}</TableCell>
                                <TableCell>{product.inventory?.reorderPoint || '-'}</TableCell>
                                <TableCell>${(product.costPrice || 0).toFixed(2)}</TableCell>
                                <TableCell>
                                  <Button
                                    size="sm"
                                    onClick={() => addProduct(product)}
                                  >
                                    Add
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {orderItems.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No items added yet. Click &quot;Add Product&quot; to get started.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Supplier SKU</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Unit Cost</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orderItems.map((item) => (
                      <TableRow key={item.productId}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{item.productName}</div>
                            <div className="text-sm text-muted-foreground">{item.productSku}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Input
                            value={item.supplierSku || ''}
                            onChange={(e) => updateSupplierSku(item.productId, e.target.value)}
                            placeholder="Supplier SKU"
                            className="w-32"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateItemQuantity(item.productId, parseInt(e.target.value) || 0)}
                            className="w-20"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unitCost}
                            onChange={(e) => updateItemCost(item.productId, parseFloat(e.target.value) || 0)}
                            className="w-24"
                          />
                        </TableCell>
                        <TableCell>${item.totalCost.toFixed(2)}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(item.productId)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Purchase Order Summary & Details */}
        <div className="space-y-6">
          {/* Purchase Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Purchase Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${calculateSubtotal().toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-medium">
                <span>Total:</span>
                <span>${calculateSubtotal().toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Additional Details */}
          <Card>
            <CardHeader>
              <CardTitle>Purchase Order Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="expectedDate">Expected Delivery Date</Label>
                <Input
                  id="expectedDate"
                  type="date"
                  value={expectedDate}
                  onChange={(e) => setExpectedDate(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="paymentTerms">Payment Terms</Label>
                <Select value={paymentTerms} onValueChange={setPaymentTerms}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment terms" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NET_30">Net 30</SelectItem>
                    <SelectItem value="NET_60">Net 60</SelectItem>
                    <SelectItem value="NET_90">Net 90</SelectItem>
                    <SelectItem value="COD">Cash on Delivery</SelectItem>
                    <SelectItem value="PREPAID">Prepaid</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="shippingTerms">Shipping Terms</Label>
                <Select value={shippingTerms} onValueChange={setShippingTerms}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select shipping terms" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FOB_ORIGIN">FOB Origin</SelectItem>
                    <SelectItem value="FOB_DESTINATION">FOB Destination</SelectItem>
                    <SelectItem value="CIF">CIF (Cost, Insurance, Freight)</SelectItem>
                    <SelectItem value="DDP">DDP (Delivered Duty Paid)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any special instructions or notes..."
                />
              </div>

              <Button
                className="w-full"
                onClick={handleSubmit}
                disabled={isSubmitting || orderItems.length === 0 || !selectedSupplierId}
              >
                {isSubmitting ? 'Creating Purchase Order...' : 'Create Purchase Order'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
