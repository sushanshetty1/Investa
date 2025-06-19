import { NextRequest, NextResponse } from 'next/server'
import { neonClient } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30'
    const warehouseId = searchParams.get('warehouseId')
    const productId = searchParams.get('productId')

    const periodDays = parseInt(period)
    const dateFrom = new Date()
    dateFrom.setDate(dateFrom.getDate() - periodDays)

    // Build where clause for filtering
    const where: any = {
      completedDate: {
        gte: dateFrom
      },
      status: 'COMPLETED',
      discrepancies: { gt: 0 }
    }

    if (warehouseId) {
      where.warehouseId = warehouseId
    }

    if (productId) {
      where.productId = productId
    }

    // Get audits with discrepancies
    const auditsWithDiscrepancies = await neonClient.inventoryAudit.findMany({
      where,
      include: {
        warehouse: {
          select: { id: true, name: true, code: true }
        },
        product: {
          select: { id: true, name: true, sku: true }
        },
        items: {
          where: {
            adjustmentQty: { not: 0 }
          },
          include: {
            product: {
              select: { id: true, name: true, sku: true }
            },
            variant: {
              select: { id: true, name: true, sku: true }
            }
          }
        }
      },
      orderBy: { completedDate: 'desc' }
    })

    // Calculate summary stats
    const totalDiscrepancies = auditsWithDiscrepancies.reduce((sum, audit) => 
      sum + (audit.discrepancies || 0), 0
    )

    const totalValueImpact = auditsWithDiscrepancies.reduce((sum, audit) => 
      sum + Number(audit.adjustmentValue || 0), 0
    )

    const averageDiscrepanciesPerAudit = auditsWithDiscrepancies.length > 0 
      ? totalDiscrepancies / auditsWithDiscrepancies.length 
      : 0

    // Group by warehouse
    const warehouseStats = auditsWithDiscrepancies.reduce((acc, audit) => {
      const warehouseName = audit.warehouse?.name || 'Unknown'
      if (!acc[warehouseName]) {
        acc[warehouseName] = {
          name: warehouseName,
          audits: 0,
          discrepancies: 0,
          valueImpact: 0
        }
      }
      acc[warehouseName].audits += 1
      acc[warehouseName].discrepancies += audit.discrepancies || 0
      acc[warehouseName].valueImpact += Number(audit.adjustmentValue || 0)
      return acc
    }, {} as any)

    // Group by product category (simplified)
    const productStats = auditsWithDiscrepancies.reduce((acc, audit) => {
      audit.items.forEach(item => {
        const productName = item.product?.name || 'Unknown'
        if (!acc[productName]) {
          acc[productName] = {
            name: productName,
            sku: item.product?.sku,
            discrepancies: 0,
            totalAdjustment: 0
          }
        }
        if (item.adjustmentQty !== 0) {
          acc[productName].discrepancies += 1
          acc[productName].totalAdjustment += item.adjustmentQty || 0
        }
      })
      return acc
    }, {} as any)

    // Time series data (daily aggregation)
    const timeSeriesData = auditsWithDiscrepancies.reduce((acc, audit) => {
      if (audit.completedDate) {
        const date = audit.completedDate.toISOString().split('T')[0]
        if (!acc[date]) {
          acc[date] = {
            date,
            audits: 0,
            discrepancies: 0,
            valueImpact: 0
          }
        }
        acc[date].audits += 1
        acc[date].discrepancies += audit.discrepancies || 0
        acc[date].valueImpact += Number(audit.adjustmentValue || 0)
      }
      return acc
    }, {} as any)

    return NextResponse.json({
      summary: {
        totalAudits: auditsWithDiscrepancies.length,
        totalDiscrepancies,
        totalValueImpact,
        averageDiscrepanciesPerAudit: Math.round(averageDiscrepanciesPerAudit * 100) / 100,
        period: periodDays
      },
      warehouseBreakdown: Object.values(warehouseStats),
      productBreakdown: Object.values(productStats).slice(0, 20), // Top 20
      timeSeriesData: Object.values(timeSeriesData).sort((a: any, b: any) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      ),
      recentDiscrepancies: auditsWithDiscrepancies.slice(0, 10).map(audit => ({
        id: audit.id,
        auditNumber: audit.auditNumber,
        warehouse: audit.warehouse?.name,
        product: audit.product?.name,
        discrepancies: audit.discrepancies,
        valueImpact: audit.adjustmentValue,
        completedDate: audit.completedDate,
        itemCount: audit.items.length
      }))
    })

  } catch (error) {
    console.error('Error fetching discrepancy stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch discrepancy statistics' },
      { status: 500 }
    )
  }
}
