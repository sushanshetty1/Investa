'use server';

import { neonClient } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export interface CreateOrderData {
  customerId: string;
  warehouseId: string;
  type?: 'SALES' | 'RETURN' | 'EXCHANGE' | 'SAMPLE' | 'REPLACEMENT';
  channel?: 'DIRECT' | 'ONLINE' | 'PHONE' | 'EMAIL' | 'RETAIL' | 'WHOLESALE' | 'B2B_PORTAL';
  priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  requiredDate?: Date;
  shippingMethod?: string;
  shippingAddress?: string;
  notes?: string;
  items: {
    productId: string;
    variantId?: string;
    quantity: number;
    unitPrice: number;
    discountAmount?: number;
  }[];
}

export interface UpdateOrderStatusData {
  orderId: string;
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'RETURNED' | 'COMPLETED';
  fulfillmentStatus?: 'PENDING' | 'PICKING' | 'PACKED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  paymentStatus?: 'PENDING' | 'AUTHORIZED' | 'PAID' | 'PARTIALLY_PAID' | 'REFUNDED' | 'FAILED';
  shippedDate?: Date;
  deliveredDate?: Date;
  trackingNumber?: string;
  carrier?: string;
}

export interface OrderFilters {
  status?: string;
  customerId?: string;
  warehouseId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  searchTerm?: string;
}

// Generate unique order number
async function generateOrderNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const lastOrder = await neonClient.order.findFirst({
    where: {
      orderNumber: {
        startsWith: `ORD-${year}-`
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

  return `ORD-${year}-${nextNumber.toString().padStart(3, '0')}`;
}

// Create a new order
export async function createOrder(data: CreateOrderData) {
  try {
    // Generate order number
    const orderNumber = await generateOrderNumber();

    // Calculate totals
    let subtotal = 0;
    data.items.forEach(item => {
      subtotal += item.quantity * item.unitPrice - (item.discountAmount || 0);
    });

    // Create order first
    const order = await neonClient.order.create({
      data: {
        orderNumber,
        customerId: data.customerId,
        warehouseId: data.warehouseId,
        type: data.type || 'SALES',
        channel: data.channel || 'DIRECT',
        priority: data.priority || 'NORMAL',
        subtotal,
        totalAmount: subtotal,
        requiredDate: data.requiredDate,
        shippingMethod: data.shippingMethod,
        shippingAddress: data.shippingAddress,
        notes: data.notes,
        createdBy: 'system',
      }
    });

    // Create order items
    for (const item of data.items) {
      const product = await neonClient.product.findUnique({
        where: { id: item.productId }
      });

      if (product) {
        const itemTotal = item.quantity * item.unitPrice - (item.discountAmount || 0);
        await neonClient.orderItem.create({
          data: {
            orderId: order.id,
            productId: item.productId,
            variantId: item.variantId,
            orderedQty: item.quantity,
            remainingQty: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: itemTotal,
            discountAmount: item.discountAmount || 0,
            productName: product.name,
            productSku: product.sku,
          }
        });
      }
    }

    revalidatePath('/orders');
    return { success: true, data: order };
  } catch (error) {
    // Error handled silently in production
    return { success: false, error: 'Failed to create order' };
  }
}

// Get all orders with filters
export async function getOrders(filters: OrderFilters = {}) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.customerId) {
      where.customerId = filters.customerId;
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
        { customer: { firstName: { contains: filters.searchTerm, mode: 'insensitive' } } },
        { customer: { lastName: { contains: filters.searchTerm, mode: 'insensitive' } } },
        { customer: { companyName: { contains: filters.searchTerm, mode: 'insensitive' } } },
        { customer: { email: { contains: filters.searchTerm, mode: 'insensitive' } } },
      ];
    }

    const orders = await neonClient.order.findMany({
      where,
      include: {
        customer: true,
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

    return { success: true, data: orders };
  } catch (error) {
    // Error handled silently in production
    return { success: false, error: 'Failed to fetch orders' };
  }
}

// Get order by ID
export async function getOrderById(id: string) {
  try {
    const order = await neonClient.order.findUnique({
      where: { id },
      include: {
        customer: true,
        warehouse: true,
        items: {
          include: {
            product: true,
            variant: true
          }
        },
        shipments: true,
        invoices: true
      }
    });

    if (!order) {
      return { success: false, error: 'Order not found' };
    }

    return { success: true, data: order };
  } catch (error) {
    // Error handled silently in production
    return { success: false, error: 'Failed to fetch order' };
  }
}

// Update order status
export async function updateOrderStatus(data: UpdateOrderStatusData) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {
      status: data.status,
      updatedAt: new Date()
    };

    if (data.fulfillmentStatus) {
      updateData.fulfillmentStatus = data.fulfillmentStatus;
    }

    if (data.paymentStatus) {
      updateData.paymentStatus = data.paymentStatus;
    }

    if (data.shippedDate) {
      updateData.shippedDate = data.shippedDate;
    }

    if (data.deliveredDate) {
      updateData.deliveredDate = data.deliveredDate;
    }

    if (data.trackingNumber) {
      updateData.trackingNumber = data.trackingNumber;
    }

    if (data.carrier) {
      updateData.carrier = data.carrier;
    }

    const order = await neonClient.order.update({
      where: { id: data.orderId },
      data: updateData,
      include: {
        customer: true,
        warehouse: true,
        items: true
      }
    });

    revalidatePath('/orders');
    return { success: true, data: order };
  } catch (error) {
    // Error handled silently in production
    return { success: false, error: 'Failed to update order status' };
  }
}

// Get order statistics
export async function getOrderStats() {
  try {
    const [
      totalOrders,
      pendingOrders,
      shippedOrders,
      revenueResult
    ] = await Promise.all([
      neonClient.order.count(),
      neonClient.order.count({
        where: {
          status: {
            in: ['PENDING', 'CONFIRMED', 'PROCESSING']
          }
        }
      }),
      neonClient.order.count({
        where: {
          status: {
            in: ['SHIPPED', 'DELIVERED']
          }
        }
      }),
      neonClient.order.aggregate({
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

    const totalRevenue = Number(revenueResult._sum.totalAmount) || 0;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    return {
      success: true,
      data: {
        totalOrders,
        pendingOrders,
        shippedOrders,
        totalRevenue,
        averageOrderValue
      }
    };
  } catch (error) {
    // Error handled silently in production
    return { success: false, error: 'Failed to fetch order statistics' };
  }
}
