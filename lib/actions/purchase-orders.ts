'use server';

import { neonClient } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export interface CreatePurchaseOrderData {
  supplierId: string;
  warehouseId?: string;
  expectedDate?: Date;
  paymentTerms?: string;
  shippingTerms?: string;
  notes?: string;
  items: {
    productId: string;
    variantId?: string;
    quantity: number;
    unitCost: number;
    supplierSku?: string;
    expectedDate?: Date;
  }[];
}

export interface UpdatePurchaseOrderStatusData {
  purchaseOrderId: string;
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'SENT' | 'ACKNOWLEDGED' | 'PARTIALLY_RECEIVED' | 'RECEIVED' | 'INVOICED' | 'PAID' | 'CANCELLED' | 'CLOSED';
  deliveryDate?: Date;
  trackingNumber?: string;
  carrier?: string;
  approvedBy?: string;
}

export interface PurchaseOrderFilters {
  status?: string;
  supplierId?: string;
  warehouseId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  searchTerm?: string;
}

export interface GoodsReceiptData {
  purchaseOrderId: string;
  warehouseId: string;
  items: {
    purchaseOrderItemId: string;
    receivedQty: number;
    qcStatus: 'PASSED' | 'FAILED' | 'PENDING';
    lotNumber?: string;
    batchNumber?: string;
    expiryDate?: Date;
  }[];
  qcNotes?: string;
  notes?: string;
}

export interface ReorderSuggestion {
  productId: string;
  productName: string;
  productSku: string;
  currentStock: number;
  reorderPoint: number;
  suggestedQty: number;
  preferredSupplier: string;
  estimatedCost: number;
}

// Generate unique purchase order number
async function generatePurchaseOrderNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const lastOrder = await neonClient.purchaseOrder.findFirst({
    where: {
      orderNumber: {
        startsWith: `PO-${year}-`
      }
    },
    orderBy: {
      orderNumber: 'desc'
    }
  });

  let nextNumber = 1;
  if (lastOrder) {
    const lastNumber = parseInt(lastOrder.orderNumber.split('-')[2]);
    nextNumber = lastNumber + 1;
  }

  return `PO-${year}-${nextNumber.toString().padStart(3, '0')}`;
}

// Create a new purchase order
export async function createPurchaseOrder(data: CreatePurchaseOrderData) {
  try {
    // Generate order number
    const orderNumber = await generatePurchaseOrderNumber();

    // Calculate totals
    let subtotal = 0;
    data.items.forEach(item => {
      subtotal += item.quantity * item.unitCost;
    });

    // Create purchase order first
    const purchaseOrder = await neonClient.purchaseOrder.create({
      data: {
        orderNumber,
        supplierId: data.supplierId,
        warehouseId: data.warehouseId,
        subtotal,
        totalAmount: subtotal,
        expectedDate: data.expectedDate,
        paymentTerms: data.paymentTerms,
        shippingTerms: data.shippingTerms,
        notes: data.notes,
        createdBy: 'system',
      }
    });

    // Create purchase order items
    for (const item of data.items) {
      const product = await neonClient.product.findUnique({
        where: { id: item.productId }
      });

      if (product) {
        const itemTotal = item.quantity * item.unitCost;
        await neonClient.purchaseOrderItem.create({
          data: {
            purchaseOrderId: purchaseOrder.id,
            productId: item.productId,
            variantId: item.variantId,
            orderedQty: item.quantity,
            remainingQty: item.quantity,
            unitCost: item.unitCost,
            totalCost: itemTotal,
            productName: product.name,
            productSku: product.sku,
            supplierSku: item.supplierSku,
            expectedDate: item.expectedDate,
          }
        });
      }
    }

    revalidatePath('/purchase-orders');
    return { success: true, data: purchaseOrder };
  } catch (error) {
    console.error('Error creating purchase order:', error);
    return { success: false, error: 'Failed to create purchase order' };
  }
}

// Get all purchase orders with filters
export async function getPurchaseOrders(filters: PurchaseOrderFilters = {}) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.supplierId) {
      where.supplierId = filters.supplierId;
    }

    if (filters.warehouseId) {
      where.warehouseId = filters.warehouseId;
    }

    if (filters.dateFrom || filters.dateTo) {
      where.orderDate = {};
      if (filters.dateFrom) {
        where.orderDate.gte = filters.dateFrom;
      }
      if (filters.dateTo) {
        where.orderDate.lte = filters.dateTo;
      }
    }

    if (filters.searchTerm) {
      where.OR = [
        { orderNumber: { contains: filters.searchTerm, mode: 'insensitive' } },
        { supplier: { name: { contains: filters.searchTerm, mode: 'insensitive' } } },
      ];
    }

    const purchaseOrders = await neonClient.purchaseOrder.findMany({
      where,
      include: {
        supplier: true,
        warehouse: true,
        items: {
          include: {
            product: true,
            variant: true
          }
        }
      },
      orderBy: {
        orderDate: 'desc'
      }
    });

    return { success: true, data: purchaseOrders };
  } catch (error) {
    console.error('Error fetching purchase orders:', error);
    return { success: false, error: 'Failed to fetch purchase orders' };
  }
}

// Get purchase order by ID
export async function getPurchaseOrderById(id: string) {
  try {
    const purchaseOrder = await neonClient.purchaseOrder.findUnique({
      where: { id },
      include: {
        supplier: true,
        warehouse: true,
        items: {
          include: {
            product: true,
            variant: true
          }
        },
        receipts: true,
        invoices: true
      }
    });

    if (!purchaseOrder) {
      return { success: false, error: 'Purchase order not found' };
    }

    return { success: true, data: purchaseOrder };
  } catch (error) {
    console.error('Error fetching purchase order:', error);
    return { success: false, error: 'Failed to fetch purchase order' };
  }
}

// Update purchase order status
export async function updatePurchaseOrderStatus(data: UpdatePurchaseOrderStatusData) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {
      status: data.status,
      updatedAt: new Date()
    };

    if (data.deliveryDate) {
      updateData.deliveryDate = data.deliveryDate;
    }

    if (data.trackingNumber) {
      updateData.trackingNumber = data.trackingNumber;
    }

    if (data.carrier) {
      updateData.carrier = data.carrier;
    }

    if (data.approvedBy && data.status === 'APPROVED') {
      updateData.approvedBy = data.approvedBy;
      updateData.approvedAt = new Date();
    }

    const purchaseOrder = await neonClient.purchaseOrder.update({
      where: { id: data.purchaseOrderId },
      data: updateData,
      include: {
        supplier: true,
        warehouse: true,
        items: true
      }
    });

    revalidatePath('/purchase-orders');
    return { success: true, data: purchaseOrder };
  } catch (error) {
    console.error('Error updating purchase order status:', error);
    return { success: false, error: 'Failed to update purchase order status' };
  }
}

// Approve purchase order
export async function approvePurchaseOrder(purchaseOrderId: string, approvedBy: string) {
  try {
    const purchaseOrder = await neonClient.purchaseOrder.update({
      where: { id: purchaseOrderId },
      data: {
        status: 'APPROVED',
        approvedBy,
        approvedAt: new Date(),
        updatedAt: new Date()
      },
      include: {
        supplier: true,
        warehouse: true,
        items: true
      }
    });

    revalidatePath('/purchase-orders');
    return { success: true, data: purchaseOrder };
  } catch (error) {
    console.error('Error approving purchase order:', error);
    return { success: false, error: 'Failed to approve purchase order' };
  }
}

// Create goods receipt
export async function createGoodsReceipt(data: GoodsReceiptData) {
  try {
    // Generate receipt number
    const year = new Date().getFullYear();
    const lastReceipt = await neonClient.goodsReceipt.findFirst({
      where: {
        receiptNumber: {
          startsWith: `GR-${year}-`
        }
      },
      orderBy: {
        receiptNumber: 'desc'
      }
    });

    let nextNumber = 1;
    if (lastReceipt) {
      const lastNumber = parseInt(lastReceipt.receiptNumber.split('-')[2]);
      nextNumber = lastNumber + 1;
    }

    const receiptNumber = `GR-${year}-${nextNumber.toString().padStart(3, '0')}`;    // Create goods receipt
    const goodsReceipt = await neonClient.goodsReceipt.create({
      data: {
        receiptNumber,
        purchaseOrderId: data.purchaseOrderId,
        warehouseId: data.warehouseId,
        qcNotes: data.qcNotes,
        notes: data.notes,
        receivedBy: 'system',
      }
    });

    // Process each received item
    for (const item of data.items) {
      // Get the purchase order item
      const poItem = await neonClient.purchaseOrderItem.findUnique({
        where: { id: item.purchaseOrderItemId }
      });

      if (!poItem) continue;      // Create goods receipt item
      await neonClient.goodsReceiptItem.create({
        data: {
          goodsReceiptId: goodsReceipt.id,
          productId: poItem.productId,
          variantId: poItem.variantId,
          expectedQty: poItem.orderedQty,
          receivedQty: item.receivedQty,
          acceptedQty: item.qcStatus === 'PASSED' ? item.receivedQty : 0,
          rejectedQty: item.qcStatus === 'FAILED' ? item.receivedQty : 0,
          qcStatus: item.qcStatus,
          lotNumber: item.lotNumber,
          batchNumber: item.batchNumber,
          expiryDate: item.expiryDate,
        }
      });

      // Update purchase order item
      await neonClient.purchaseOrderItem.update({
        where: { id: item.purchaseOrderItemId },
        data: {
          receivedQty: poItem.receivedQty + item.receivedQty,
          remainingQty: poItem.remainingQty - item.receivedQty,
          status: poItem.remainingQty - item.receivedQty <= 0 ? 'RECEIVED' : 'PARTIALLY_RECEIVED'
        }
      });

      // Update inventory if QC passed
      if (item.qcStatus === 'PASSED') {
        // Find or create inventory item
        let inventoryItem = await neonClient.inventoryItem.findFirst({
          where: {
            productId: poItem.productId,
            variantId: poItem.variantId,
            warehouseId: data.warehouseId,
            lotNumber: item.lotNumber || null
          }
        });

        if (inventoryItem) {
          // Update existing inventory
          await neonClient.inventoryItem.update({
            where: { id: inventoryItem.id },
            data: {
              quantity: inventoryItem.quantity + item.receivedQty,
              availableQuantity: inventoryItem.availableQuantity + item.receivedQty,
              lastMovement: new Date(),
              updatedAt: new Date()
            }
          });
        } else {
          // Create new inventory item
          inventoryItem = await neonClient.inventoryItem.create({
            data: {
              productId: poItem.productId,
              variantId: poItem.variantId,
              warehouseId: data.warehouseId,
              quantity: item.receivedQty,
              availableQuantity: item.receivedQty,
              lotNumber: item.lotNumber,
              batchNumber: item.batchNumber,
              expiryDate: item.expiryDate,
              qcStatus: item.qcStatus,
              lastMovement: new Date()
            }
          });
        }

        // Create inventory movement
        await neonClient.inventoryMovement.create({
          data: {
            type: 'RECEIPT',
            productId: poItem.productId,
            variantId: poItem.variantId,
            warehouseId: data.warehouseId,
            inventoryItemId: inventoryItem.id,
            quantity: item.receivedQty,
            quantityBefore: inventoryItem.quantity - item.receivedQty,
            quantityAfter: inventoryItem.quantity,
            unitCost: poItem.unitCost,
            totalCost: Number(poItem.unitCost) * item.receivedQty,
            referenceType: 'PURCHASE_ORDER',
            referenceId: data.purchaseOrderId,
            reason: `Goods receipt: ${receiptNumber}`,
            userId: 'system'
          }
        });
      }
    }

    // Update purchase order status
    const purchaseOrder = await neonClient.purchaseOrder.findUnique({
      where: { id: data.purchaseOrderId },
      include: { items: true }
    });

    if (purchaseOrder) {
      const allReceived = purchaseOrder.items.every(item => item.remainingQty <= 0);
      const partiallyReceived = purchaseOrder.items.some(item => item.receivedQty > 0);

      let newStatus = purchaseOrder.status;
      if (allReceived) {
        newStatus = 'RECEIVED';
      } else if (partiallyReceived) {
        newStatus = 'PARTIALLY_RECEIVED';
      }

      await neonClient.purchaseOrder.update({
        where: { id: data.purchaseOrderId },
        data: { status: newStatus }
      });
    }

    revalidatePath('/purchase-orders');
    return { success: true, data: goodsReceipt };
  } catch (error) {
    console.error('Error creating goods receipt:', error);
    return { success: false, error: 'Failed to create goods receipt' };
  }
}

// Get reorder suggestions
export async function getReorderSuggestions(): Promise<{ success: boolean; data?: ReorderSuggestion[]; error?: string }> {
  try {
    // Find products that are below reorder point
    const products = await neonClient.product.findMany({
      where: {
        reorderPoint: {
          gt: 0
        }
      },
      include: {
        inventoryItems: {
          select: {
            quantity: true,
            warehouseId: true
          }
        },
        suppliers: {
          include: {
            supplier: true
          }
        }
      }
    });

    const suggestions: ReorderSuggestion[] = [];

    for (const product of products) {
      // Calculate total stock across all warehouses
      const totalStock = product.inventoryItems.reduce((sum, item) => sum + item.quantity, 0);

      if (totalStock <= (product.reorderPoint || 0)) {
        const preferredSupplier = product.suppliers[0]?.supplier.name || 'No supplier';
        const suggestedQty = product.reorderQuantity || Math.max(product.reorderPoint || 0, 10);
        const estimatedCost = Number(product.costPrice || 0) * suggestedQty;

        suggestions.push({
          productId: product.id,
          productName: product.name,
          productSku: product.sku,
          currentStock: totalStock,
          reorderPoint: product.reorderPoint || 0,
          suggestedQty,
          preferredSupplier,
          estimatedCost
        });
      }
    }

    return { success: true, data: suggestions };
  } catch (error) {
    console.error('Error fetching reorder suggestions:', error);
    return { success: false, error: 'Failed to fetch reorder suggestions' };
  }
}

// Create purchase order from reorder suggestion
export async function createPurchaseOrderFromSuggestion(suggestion: ReorderSuggestion) {
  try {
    // Find the supplier for this product
    const productSupplier = await neonClient.productSupplier.findFirst({
      where: {
        productId: suggestion.productId
      },
      include: {
        supplier: true
      }
    });

    if (!productSupplier) {
      return { success: false, error: 'No supplier found for this product' };
    }

    const createData: CreatePurchaseOrderData = {
      supplierId: productSupplier.supplierId,
      expectedDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      items: [
        {
          productId: suggestion.productId,
          quantity: suggestion.suggestedQty,
          unitCost: suggestion.estimatedCost / suggestion.suggestedQty,
          supplierSku: productSupplier.supplierSku || undefined
        }
      ]
    };

    return await createPurchaseOrder(createData);
  } catch (error) {
    console.error('Error creating purchase order from suggestion:', error);
    return { success: false, error: 'Failed to create purchase order from suggestion' };
  }
}

// Get purchase order statistics
export async function getPurchaseOrderStats() {
  try {
    const [
      totalOrders,
      pendingApproval,
      awaitingDelivery,
      valueResult
    ] = await Promise.all([
      neonClient.purchaseOrder.count(),
      neonClient.purchaseOrder.count({
        where: {
          status: 'PENDING_APPROVAL'
        }
      }),
      neonClient.purchaseOrder.count({
        where: {
          status: {
            in: ['APPROVED', 'SENT', 'ACKNOWLEDGED', 'PARTIALLY_RECEIVED']
          }
        }
      }),
      neonClient.purchaseOrder.aggregate({
        _sum: {
          totalAmount: true
        },
        where: {
          status: {
            notIn: ['CANCELLED']
          }
        }
      })
    ]);

    const totalValue = Number(valueResult._sum.totalAmount) || 0;
    const avgOrderValue = totalOrders > 0 ? totalValue / totalOrders : 0;

    return {
      success: true,
      data: {
        totalOrders,
        pendingApproval,
        awaitingDelivery,
        totalValue,
        avgOrderValue
      }
    };
  } catch (error) {
    console.error('Error fetching purchase order stats:', error);
    return { success: false, error: 'Failed to fetch purchase order statistics' };
  }
}
