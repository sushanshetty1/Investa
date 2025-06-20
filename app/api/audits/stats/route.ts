import { NextRequest, NextResponse } from 'next/server'
import { neonClient } from '@/lib/db'

export async function GET(_request: NextRequest) {
  try {
    const now = new Date()
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    // Get total audits
    const totalAudits = await neonClient.inventoryAudit.count()

    // Get active audits (in progress)
    const activeAudits = await neonClient.inventoryAudit.count({
      where: { status: 'IN_PROGRESS' }
    })

    // Get completed audits this month
    const completedThisMonth = await neonClient.inventoryAudit.count({
      where: {
        status: 'COMPLETED',
        completedDate: {
          gte: thisMonth
        }
      }
    })

    // Get pending approval audits (completed but not approved)
    const pendingApproval = await neonClient.inventoryAudit.count({
      where: {
        status: 'COMPLETED',
        // Add approval logic when implemented
      }
    })

    // Get discrepancies found
    const discrepancyItems = await neonClient.inventoryAuditItem.findMany({
      where: {
        adjustmentQty: {
          not: 0
        }
      },
      include: {
        product: {
          select: { costPrice: true }
        }
      }
    })

    const discrepanciesFound = discrepancyItems.length
    const discrepancyValue = discrepancyItems.reduce((sum: number, item: Record<string, any>) => {
      const costPrice = item.product?.costPrice || 0
      const adjustmentValue = (item.adjustmentQty || 0) * Number(costPrice)
      return sum + Math.abs(adjustmentValue)
    }, 0)

    // Calculate compliance score (example calculation)
    const onTimeAudits = await getOnTimeAuditsCount()
    const complianceScore = totalAudits ? Math.round((onTimeAudits / totalAudits) * 100) : 100

    // Get last audit date
    const lastAudit = await neonClient.inventoryAudit.findFirst({
      where: { status: 'COMPLETED' },
      orderBy: { completedDate: 'desc' },
      select: { completedDate: true }
    })

    // Get next scheduled audit
    const nextAudit = await neonClient.inventoryAudit.findFirst({
      where: { status: 'PLANNED' },
      orderBy: { plannedDate: 'asc' },
      select: { plannedDate: true }
    })

    // Get cycle counting stats
    const cycleCounts = await getCycleCountStats()

    return NextResponse.json({
      totalAudits,
      activeAudits,
      completedThisMonth,
      pendingApproval,
      discrepanciesFound,
      discrepancyValue,
      complianceScore,
      lastAuditDate: lastAudit?.completedDate || null,
      nextScheduledAudit: nextAudit?.plannedDate || null,
      cycleCounts
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function getOnTimeAuditsCount(): Promise<number> {
  try {
    const audits = await neonClient.inventoryAudit.findMany({
      where: {
        status: 'COMPLETED',
        completedDate: { not: null }
      },
      select: {
        plannedDate: true,
        completedDate: true
      }
    })

    const onTimeAudits = audits.filter((audit: Record<string, any>) => {
      const plannedDate = new Date(audit.plannedDate)
      const completedDate = new Date(audit.completedDate)
      // Consider on-time if completed within 1 day of planned date
      const diffInDays = Math.abs(completedDate.getTime() - plannedDate.getTime()) / (1000 * 60 * 60 * 24)
      return diffInDays <= 1
    })

    return onTimeAudits.length
  } catch (error) {
    console.error('Error calculating on-time audits:', error)
    return 0
  }
}

async function getCycleCountStats() {
  try {
    // This would connect to cycle count schedules table
    // For now, return mock data
    return {
      scheduled: 15,
      completed: 12,
      pending: 3
    }
  } catch (error) {
    console.error('Error getting cycle count stats:', error)
    return {
      scheduled: 0,
      completed: 0,
      pending: 0
    }
  }
}
