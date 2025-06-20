import { NextRequest, NextResponse } from 'next/server'
import { neonClient } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30'
    const limit = parseInt(searchParams.get('limit') || '100')

    const periodDays = parseInt(period)
    const dateFrom = new Date()
    dateFrom.setDate(dateFrom.getDate() - periodDays)

    // Get all audits and audit items for audit trail
    const audits = await neonClient.inventoryAudit.findMany({
      where: {
        updatedAt: { gte: dateFrom }
      },
      include: {
        warehouse: {
          select: { id: true, name: true, code: true }
        },
        product: {
          select: { id: true, name: true, sku: true }
        },
        items: {
          where: {
            OR: [
              { countedAt: { not: null } },
              { verifiedAt: { not: null } },
              { adjustmentQty: { not: 0 } }
            ]
          },
          select: {
            id: true,
            systemQty: true,
            countedQty: true,
            adjustmentQty: true,
            countedBy: true,
            countedAt: true,
            verifiedBy: true,
            verifiedAt: true,
            status: true,
            discrepancyReason: true,
            product: {
              select: { name: true, sku: true }
            }
          },
          take: 50 // Limit items per audit for performance
        }
      },
      orderBy: { updatedAt: 'desc' },
      take: limit
    })

    // Transform to audit trail format
    const auditTrail = []

    // Add audit-level events
    for (const audit of audits) {
      // Audit creation
      auditTrail.push({
        id: `audit-${audit.id}-created`,
        timestamp: audit.createdAt,
        event: 'AUDIT_CREATED',
        entityType: 'AUDIT',
        entityId: audit.id,
        description: `${audit.type} audit created: ${audit.auditNumber}`,
        performedBy: audit.auditedBy,
        metadata: {
          auditNumber: audit.auditNumber,
          type: audit.type,
          warehouse: audit.warehouse?.name,
          product: audit.product?.name,
          plannedDate: audit.plannedDate
        }
      })

      // Audit started
      if (audit.startedDate) {
        auditTrail.push({
          id: `audit-${audit.id}-started`,
          timestamp: audit.startedDate,
          event: 'AUDIT_STARTED',
          entityType: 'AUDIT',
          entityId: audit.id,
          description: `Audit started: ${audit.auditNumber}`,
          performedBy: audit.auditedBy,
          metadata: {
            auditNumber: audit.auditNumber,
            totalItems: audit.totalItems
          }
        })
      }

      // Audit completed
      if (audit.completedDate) {
        auditTrail.push({
          id: `audit-${audit.id}-completed`,
          timestamp: audit.completedDate,
          event: 'AUDIT_COMPLETED',
          entityType: 'AUDIT',
          entityId: audit.id,
          description: `Audit completed: ${audit.auditNumber}`,
          performedBy: audit.auditedBy,
          metadata: {
            auditNumber: audit.auditNumber,
            itemsCounted: audit.itemsCounted,
            discrepancies: audit.discrepancies,
            adjustmentValue: audit.adjustmentValue
          }
        })
      }

      // Add item-level events
      for (const item of audit.items) {
        // Item counted
        if (item.countedAt && item.countedBy) {
          auditTrail.push({
            id: `item-${item.id}-counted`,
            timestamp: item.countedAt,
            event: 'ITEM_COUNTED',
            entityType: 'AUDIT_ITEM',
            entityId: item.id,
            description: `Item counted: ${item.product?.name} (${item.product?.sku})`,
            performedBy: item.countedBy,
            metadata: {
              auditNumber: audit.auditNumber,
              productName: item.product?.name,
              productSku: item.product?.sku,
              systemQty: item.systemQty,
              countedQty: item.countedQty,
              adjustment: item.adjustmentQty
            }
          })
        }

        // Item verified
        if (item.verifiedAt && item.verifiedBy) {
          auditTrail.push({
            id: `item-${item.id}-verified`,
            timestamp: item.verifiedAt,
            event: 'ITEM_VERIFIED',
            entityType: 'AUDIT_ITEM',
            entityId: item.id,
            description: `Item verified: ${item.product?.name} (${item.product?.sku})`,
            performedBy: item.verifiedBy,
            metadata: {
              auditNumber: audit.auditNumber,
              productName: item.product?.name,
              productSku: item.product?.sku,
              finalQty: item.countedQty,
              adjustment: item.adjustmentQty,
              discrepancyReason: item.discrepancyReason
            }
          })
        }

        // Discrepancy found
        if (item.adjustmentQty && item.adjustmentQty !== 0) {
          auditTrail.push({
            id: `item-${item.id}-discrepancy`,
            timestamp: item.countedAt || item.verifiedAt || audit.updatedAt,
            event: 'DISCREPANCY_FOUND',
            entityType: 'AUDIT_ITEM',
            entityId: item.id,
            description: `Discrepancy found: ${item.product?.name} (${item.adjustmentQty > 0 ? '+' : ''}${item.adjustmentQty})`,
            performedBy: item.countedBy || item.verifiedBy || audit.auditedBy,
            metadata: {
              auditNumber: audit.auditNumber,
              productName: item.product?.name,
              productSku: item.product?.sku,
              systemQty: item.systemQty,
              countedQty: item.countedQty,
              adjustment: item.adjustmentQty,
              discrepancyReason: item.discrepancyReason,
              severity: Math.abs(item.adjustmentQty) >= 100 ? 'HIGH' : 
                       Math.abs(item.adjustmentQty) >= 10 ? 'MEDIUM' : 'LOW'
            }
          })
        }
      }
    }

    // Sort by timestamp (most recent first)
    auditTrail.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    // Calculate summary statistics
    const eventCounts = auditTrail.reduce((acc, event) => {
      acc[event.event] = (acc[event.event] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const uniqueUsers = new Set(auditTrail.map(event => event.performedBy)).size
    const uniqueAudits = new Set(audits.map(audit => audit.id)).size
    const totalDiscrepancies = auditTrail.filter(event => event.event === 'DISCREPANCY_FOUND').length

    return NextResponse.json({
      auditTrail: auditTrail.slice(0, limit),
      total: auditTrail.length,
      period: periodDays,
      summary: {
        totalEvents: auditTrail.length,
        uniqueUsers,
        uniqueAudits,
        totalDiscrepancies,
        eventBreakdown: eventCounts,
        mostActiveUser: getMostActiveUser(auditTrail),
        recentActivity: auditTrail.slice(0, 10).length
      }
    })

  } catch (error) {
    console.error('Error fetching audit trail:', error)
    return NextResponse.json(
      { error: 'Failed to fetch audit trail' },
      { status: 500 }
    )
  }
}

function getMostActiveUser(auditTrail: Array<Record<string, any>>) {
  const userCounts = auditTrail.reduce((acc, event) => {
    acc[event.performedBy] = (acc[event.performedBy] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const mostActive = Object.entries(userCounts).sort(([,a], [,b]) => (b as number) - (a as number))[0]
  return mostActive ? { user: mostActive[0], events: mostActive[1] } : null
}
