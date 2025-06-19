import { NextRequest, NextResponse } from 'next/server';
import { neonClient } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const dateRange = searchParams.get('dateRange') || '30d';
    const warehouseId = searchParams.get('warehouseId');

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    
    switch (dateRange) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(endDate.getDate() - 30);
    }

    // Get stock movement data
    const movementData = await neonClient.inventoryMovement.groupBy({
      by: ['occurredAt'],
      where: {
        occurredAt: {
          gte: startDate,
          lte: endDate,
        },
        ...(warehouseId !== 'all' && warehouseId ? { warehouseId } : {}),
      },
      _sum: {
        quantity: true,
      },
      _count: {
        id: true,
      },
      orderBy: {
        occurredAt: 'asc',
      },
    });    // Get ABC analysis data
    const products = await neonClient.product.findMany({
      include: {
        inventoryItems: {
          select: {
            quantity: true,
            averageCost: true,
          },
        },
      },
    });

    // Calculate ABC analysis
    const productValues = products.map((product: any) => {
      const totalValue = product.inventoryItems.reduce((sum: number, item: any) => {
        return sum + (item.quantity * (item.averageCost || 0));
      }, 0);
      return {
        id: product.id,
        name: product.name,
        value: Number(totalValue),
      };
    }).sort((a, b) => b.value - a.value);

    const totalValue = productValues.reduce((sum, p) => sum + p.value, 0);
    let cumulativeValue = 0;
    const abcAnalysis = productValues.map(product => {
      cumulativeValue += product.value;
      const cumulativePercentage = (cumulativeValue / totalValue) * 100;
      
      let category = 'C';
      if (cumulativePercentage <= 80) category = 'A';
      else if (cumulativePercentage <= 95) category = 'B';
      
      return {
        ...product,
        category,
        cumulativePercentage,
      };
    });

    // Get inventory aging data
    const inventoryItems = await neonClient.inventoryItem.findMany({
      include: {
        product: {
          select: {
            name: true,
            sku: true,
          },
        },
      },
    });    const agingData = inventoryItems.map((item: any) => {
      const daysInInventory = Math.floor(
        (new Date().getTime() - new Date(item.createdAt).getTime()) / (1000 * 60 * 60 * 24)
      );
      
      let ageCategory = '0-30 days';
      if (daysInInventory > 90) ageCategory = '91+ days';
      else if (daysInInventory > 60) ageCategory = '61-90 days';
      else if (daysInInventory > 30) ageCategory = '31-60 days';
      
      return {
        ...item,
        daysInInventory,
        ageCategory,
        value: item.quantity * (item.averageCost || 0),
      };
    });

    // Get top moving items
    const topMovingItems = await neonClient.inventoryMovement.groupBy({
      by: ['productId'],
      where: {
        occurredAt: {
          gte: startDate,
          lte: endDate,
        },
        type: 'SHIPMENT',
      },
      _sum: {
        quantity: true,
      },
      orderBy: {
        _sum: {
          quantity: 'desc',
        },
      },
      take: 10,
    });

    // Get slow moving items
    const slowMovingItems = await neonClient.product.findMany({
      include: {
        movements: {
          where: {
            type: 'SHIPMENT',
            occurredAt: {
              gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 days ago
            },
          },
          orderBy: {
            occurredAt: 'desc',
          },
          take: 1,
        },
        inventoryItems: {
          select: {
            quantity: true,
          },
        },
      },
      where: {
        movements: {
          none: {
            type: 'SHIPMENT',
            occurredAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
            },
          },
        },
      },
      take: 10,
    });

    return NextResponse.json({
      success: true,
      data: {
        movementData,
        abcAnalysis: {
          categories: [
            {
              category: 'A (High Value)',
              items: abcAnalysis.filter(p => p.category === 'A').length,
              percentage: 20,
              value: abcAnalysis.filter(p => p.category === 'A').reduce((sum, p) => sum + p.value, 0),
            },
            {
              category: 'B (Medium Value)', 
              items: abcAnalysis.filter(p => p.category === 'B').length,
              percentage: 30,
              value: abcAnalysis.filter(p => p.category === 'B').reduce((sum, p) => sum + p.value, 0),
            },
            {
              category: 'C (Low Value)',
              items: abcAnalysis.filter(p => p.category === 'C').length,
              percentage: 50,
              value: abcAnalysis.filter(p => p.category === 'C').reduce((sum, p) => sum + p.value, 0),
            },
          ],
        },
        agingData: [
          '0-30 days',
          '31-60 days', 
          '61-90 days',
          '91+ days'
        ].map(range => ({
          range,
          quantity: agingData.filter(item => item.ageCategory === range).length,
          value: agingData.filter(item => item.ageCategory === range).reduce((sum, item) => sum + item.value, 0),
          percentage: (agingData.filter(item => item.ageCategory === range).length / agingData.length) * 100,
        })),
        topMovingItems,
        slowMovingItems,
      },
    });

  } catch (error) {
    console.error('Inventory analytics API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch inventory analytics' },
      { status: 500 }
    );
  }
}
