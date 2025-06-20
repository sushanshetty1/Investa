import { NextRequest, NextResponse } from 'next/server'
import { neonClient } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30'
    const limit = parseInt(searchParams.get('limit') || '20')

    const periodDays = parseInt(period)
    const dateFrom = new Date()
    dateFrom.setDate(dateFrom.getDate() - periodDays)

    // Get audit items with discrepancies that have reasons
    const discrepancyItems = await neonClient.inventoryAuditItem.findMany({
      where: {
        audit: {
          completedDate: { gte: dateFrom },
          status: 'COMPLETED'
        },
        adjustmentQty: { not: 0 },
        discrepancyReason: { not: null }
      },
      select: {
        discrepancyReason: true,
        adjustmentQty: true,
        requiresInvestigation: true,
        product: {
          select: { name: true, sku: true }
        },
        warehouse: {
          select: { name: true }
        },
        audit: {
          select: { completedDate: true, type: true }
        }
      },
      take: 1000 // Large sample for analysis
    })

    // Aggregate root causes
    const rootCauseStats = discrepancyItems.reduce((acc, item) => {
      const reason = item.discrepancyReason || 'Unknown'
      
      if (!acc[reason]) {
        acc[reason] = {
          reason,
          count: 0,
          totalAdjustment: 0,
          averageAdjustment: 0,
          investigationsRequired: 0,
          affectedProducts: new Set(),
          affectedWarehouses: new Set(),
          auditTypes: {},
          severity: 'LOW'
        }
      }

      acc[reason].count += 1
      acc[reason].totalAdjustment += Math.abs(item.adjustmentQty || 0)
      
      if (item.requiresInvestigation) {
        acc[reason].investigationsRequired += 1
      }

      if (item.product?.name) {
        acc[reason].affectedProducts.add(item.product.name)
      }

      if (item.warehouse?.name) {
        acc[reason].affectedWarehouses.add(item.warehouse.name)
      }

      const auditType = item.audit?.type || 'UNKNOWN'
      acc[reason].auditTypes[auditType] = (acc[reason].auditTypes[auditType] || 0) + 1

      return acc    }, {} as Record<string, any>)

    // Calculate averages and determine severity
    const rootCauses = Object.values(rootCauseStats).map((cause: Record<string, any>) => {
      cause.averageAdjustment = Math.round((cause.totalAdjustment / cause.count) * 100) / 100
      cause.affectedProductsCount = cause.affectedProducts.size
      cause.affectedWarehousesCount = cause.affectedWarehouses.size
      
      // Remove Sets (not JSON serializable)
      delete cause.affectedProducts
      delete cause.affectedWarehouses

      // Determine severity based on frequency and impact
      if (cause.count >= 20 || cause.averageAdjustment >= 50) {
        cause.severity = 'HIGH'
      } else if (cause.count >= 10 || cause.averageAdjustment >= 20) {
        cause.severity = 'MEDIUM'
      } else {
        cause.severity = 'LOW'
      }

      // Calculate investigation rate
      cause.investigationRate = cause.count > 0 
        ? Math.round((cause.investigationsRequired / cause.count) * 100)
        : 0

      return cause
    }).sort((a, b) => b.count - a.count).slice(0, limit)

    // Common predefined reasons for reference
    const commonReasons = [
      'Shrinkage/Theft',
      'Receiving Error',
      'Shipping Error',
      'Location Mismatch', 
      'System Error',
      'Damaged Goods',
      'Counting Error',
      'Expired Products',
      'Return Processing',
      'Production Variance',
      'Transfer Discrepancy',
      'Vendor Short/Over Shipment'
    ]

    // Generate recommendations based on top causes
    const recommendations = rootCauses.slice(0, 5).map(cause => {
      let recommendation = ''
      
      switch (cause.reason.toLowerCase()) {
        case 'shrinkage/theft':
        case 'shrinkage':
        case 'theft':
          recommendation = 'Implement enhanced security measures and increase cycle count frequency'
          break
        case 'receiving error':
        case 'receiving':
          recommendation = 'Improve receiving process training and implement dual verification'
          break
        case 'location mismatch':
        case 'location':
          recommendation = 'Review warehouse layout and implement location verification technology'
          break
        case 'counting error':
        case 'counting':
          recommendation = 'Provide additional training for counting procedures and implement count verification'
          break
        case 'system error':
        case 'system':
          recommendation = 'Review system processes and implement automated data validation'
          break
        default:
          recommendation = 'Investigate process improvements and implement preventive measures'
      }

      return {
        cause: cause.reason,
        recommendation,
        priority: cause.severity,
        frequency: cause.count
      }
    })

    return NextResponse.json({
      rootCauses,
      totalDiscrepancies: discrepancyItems.length,
      period: periodDays,
      recommendations,
      commonReasons,
      summary: {
        mostCommonCause: rootCauses[0]?.reason || 'No data',
        highSeverityCauses: rootCauses.filter(c => c.severity === 'HIGH').length,
        averageInvestigationRate: rootCauses.length > 0 
          ? Math.round(rootCauses.reduce((sum, c) => sum + c.investigationRate, 0) / rootCauses.length)
          : 0
      }
    })

  } catch (error) {
    console.error('Error fetching root cause analysis:', error)
    return NextResponse.json(
      { error: 'Failed to fetch root cause analysis' },
      { status: 500 }
    )
  }
}
