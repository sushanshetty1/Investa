import { NextRequest, NextResponse } from 'next/server'
import { neonClient } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30'
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const warehouseId = searchParams.get('warehouseId')
    const productId = searchParams.get('productId')
    const severity = searchParams.get('severity') // 'HIGH', 'MEDIUM', 'LOW'

    const periodDays = parseInt(period)
    const dateFrom = new Date()
    dateFrom.setDate(dateFrom.getDate() - periodDays)

    // Build where clause
    const where: any = {
      audit: {
        completedDate: { gte: dateFrom },
        status: 'COMPLETED'
      },
      adjustmentQty: { not: 0 }
    }

    if (warehouseId) {
      where.warehouseId = warehouseId
    }

    if (productId) {
      where.productId = productId
    }

    // Filter by severity (based on adjustment quantity threshold)
    if (severity) {
      switch (severity) {
        case 'HIGH':
          where.OR = [
            { adjustmentQty: { gte: 100 } },
            { adjustmentQty: { lte: -100 } }
          ]
          break
        case 'MEDIUM':
          where.OR = [
            { adjustmentQty: { gte: 10, lt: 100 } },
            { adjustmentQty: { lte: -10, gt: -100 } }
          ]
          break
        case 'LOW':
          where.OR = [
            { adjustmentQty: { gt: 0, lt: 10 } },
            { adjustmentQty: { lt: 0, gt: -10 } }
          ]
          break
      }
    }

    const [discrepancies, total] = await Promise.all([
      neonClient.inventoryAuditItem.findMany({
        where,
        include: {
          audit: {
            select: {
              id: true,
              auditNumber: true,
              type: true,
              completedDate: true,
              auditedBy: true
            }
          },
          product: {
            select: {
              id: true,
              name: true,
              sku: true,
              description: true
            }
          },
          variant: {
            select: {
              id: true,
              name: true,
              sku: true
            }
          },
          warehouse: {
            select: {
              id: true,
              name: true,
              code: true
            }
          }
        },
        orderBy: [
          { adjustmentQty: 'desc' }, // Largest discrepancies first
          { audit: { completedDate: 'desc' } }
        ],
        skip: offset,
        take: limit
      }),
      neonClient.inventoryAuditItem.count({ where })
    ])

    // Transform and add calculated fields
    const enrichedDiscrepancies = discrepancies.map(item => {
      const adjustmentQty = item.adjustmentQty || 0
      const systemQty = item.systemQty || 0
      const countedQty = item.countedQty || 0
      
      // Calculate severity
      let severityLevel = 'LOW'
      const absAdjustment = Math.abs(adjustmentQty)
      if (absAdjustment >= 100) {
        severityLevel = 'HIGH'
      } else if (absAdjustment >= 10) {
        severityLevel = 'MEDIUM'
      }

      // Calculate variance percentage
      const variancePercentage = systemQty > 0 
        ? Math.round((adjustmentQty / systemQty) * 100 * 100) / 100
        : 0

      return {
        id: item.id,
        audit: item.audit,
        product: item.product,
        variant: item.variant,
        warehouse: item.warehouse,
        location: item.location,
        systemQty,
        countedQty,
        adjustmentQty,
        variancePercentage,
        severity: severityLevel,
        discrepancyReason: item.discrepancyReason,
        requiresInvestigation: item.requiresInvestigation,
        countedBy: item.countedBy,
        countedAt: item.countedAt,
        verifiedBy: item.verifiedBy,
        verifiedAt: item.verifiedAt,
        status: item.status,
        notes: item.notes
      }
    })

    return NextResponse.json({
      discrepancies: enrichedDiscrepancies,
      total,
      hasMore: offset + limit < total,
      filters: {
        period: periodDays,
        warehouseId,
        productId,
        severity
      }
    })

  } catch (error) {
    console.error('Error fetching discrepancies:', error)
    return NextResponse.json(
      { error: 'Failed to fetch discrepancies' },
      { status: 500 }
    )
  }
}
