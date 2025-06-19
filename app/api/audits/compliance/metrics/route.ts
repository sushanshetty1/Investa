import { NextRequest, NextResponse } from 'next/server'
import { neonClient } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30'

    const periodDays = parseInt(period)
    const dateFrom = new Date()
    dateFrom.setDate(dateFrom.getDate() - periodDays)

    // Get all audits in the period
    const allAudits = await neonClient.inventoryAudit.findMany({
      where: {
        createdAt: { gte: dateFrom }
      },
      select: {
        id: true,
        type: true,
        status: true,
        plannedDate: true,
        startedDate: true,
        completedDate: true,
        discrepancies: true,
        totalItems: true,
        itemsCounted: true,
        createdAt: true
      }
    })

    // Calculate compliance metrics
    const totalAudits = allAudits.length
    const completedAudits = allAudits.filter(a => a.status === 'COMPLETED').length
    const overdueAudits = allAudits.filter(a => 
      a.status === 'PLANNED' && a.plannedDate < new Date()
    ).length
    const cancelledAudits = allAudits.filter(a => a.status === 'CANCELLED').length

    // Completion rate
    const completionRate = totalAudits > 0 ? Math.round((completedAudits / totalAudits) * 100) : 0

    // On-time completion rate
    const onTimeCompletions = allAudits.filter(a => 
      a.status === 'COMPLETED' && 
      a.completedDate && 
      a.plannedDate &&
      a.completedDate <= a.plannedDate
    ).length
    const onTimeRate = completedAudits > 0 ? Math.round((onTimeCompletions / completedAudits) * 100) : 0

    // Average time to complete (in days)
    const completedWithTimes = allAudits.filter(a => 
      a.status === 'COMPLETED' && a.startedDate && a.completedDate
    )
    const avgCompletionTime = completedWithTimes.length > 0 
      ? completedWithTimes.reduce((sum, audit) => {
          const start = new Date(audit.startedDate!)
          const end = new Date(audit.completedDate!)
          return sum + (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
        }, 0) / completedWithTimes.length
      : 0

    // Discrepancy rate
    const auditItemsTotal = allAudits.reduce((sum, a) => sum + (a.totalItems || 0), 0)
    const discrepanciesTotal = allAudits.reduce((sum, a) => sum + (a.discrepancies || 0), 0)
    const discrepancyRate = auditItemsTotal > 0 ? Math.round((discrepanciesTotal / auditItemsTotal) * 10000) / 100 : 0

    // Audit frequency compliance (cycle counts should be monthly, full counts quarterly)
    const cycleCountsThisMonth = allAudits.filter(a => 
      a.type === 'CYCLE_COUNT' && 
      a.createdAt >= new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    ).length

    const fullCountsThisQuarter = allAudits.filter(a => {
      const quarterStart = new Date()
      quarterStart.setMonth(Math.floor(quarterStart.getMonth() / 3) * 3, 1)
      quarterStart.setHours(0, 0, 0, 0)
      
      return a.type === 'FULL_COUNT' && a.createdAt >= quarterStart
    }).length

    // Overall compliance score (weighted average)
    const weights = {
      completion: 0.3,
      onTime: 0.25,
      frequency: 0.25,
      quality: 0.2
    }

    const frequencyScore = Math.min(100, (cycleCountsThisMonth * 33) + (fullCountsThisQuarter * 50))
    const qualityScore = Math.max(0, 100 - (discrepancyRate * 2)) // Lower discrepancy = higher quality

    const overallScore = Math.round(
      (completionRate * weights.completion) +
      (onTimeRate * weights.onTime) +
      (frequencyScore * weights.frequency) +
      (qualityScore * weights.quality)
    )

    // Compliance by audit type
    const typeCompliance = allAudits.reduce((acc, audit) => {
      const type = audit.type
      if (!acc[type]) {
        acc[type] = {
          type,
          total: 0,
          completed: 0,
          onTime: 0,
          overdue: 0,
          cancelled: 0
        }
      }
      
      acc[type].total += 1
      
      if (audit.status === 'COMPLETED') {
        acc[type].completed += 1
        if (audit.completedDate && audit.plannedDate && audit.completedDate <= audit.plannedDate) {
          acc[type].onTime += 1
        }
      } else if (audit.status === 'PLANNED' && audit.plannedDate < new Date()) {
        acc[type].overdue += 1
      } else if (audit.status === 'CANCELLED') {
        acc[type].cancelled += 1
      }
      
      return acc
    }, {} as any)

    // Add completion rates to type compliance
    Object.values(typeCompliance).forEach((tc: any) => {
      tc.completionRate = tc.total > 0 ? Math.round((tc.completed / tc.total) * 100) : 0
      tc.onTimeRate = tc.completed > 0 ? Math.round((tc.onTime / tc.completed) * 100) : 0
    })

    return NextResponse.json({
      overallScore,
      period: periodDays,
      metrics: {
        totalAudits,
        completedAudits,
        completionRate,
        onTimeCompletions,
        onTimeRate,
        overdueAudits,
        cancelledAudits,
        avgCompletionTime: Math.round(avgCompletionTime * 100) / 100,
        discrepancyRate,
        auditItemsTotal,
        discrepanciesTotal
      },
      frequencyCompliance: {
        cycleCountsThisMonth,
        fullCountsThisQuarter,
        cycleCountTarget: 1, // Monthly target
        fullCountTarget: 1,  // Quarterly target
        cycleCountCompliance: Math.min(100, cycleCountsThisMonth * 100),
        fullCountCompliance: Math.min(100, fullCountsThisQuarter * 100)
      },
      typeBreakdown: Object.values(typeCompliance),
      scoreBreakdown: {
        completion: Math.round(completionRate * weights.completion),
        onTime: Math.round(onTimeRate * weights.onTime),
        frequency: Math.round(frequencyScore * weights.frequency),
        quality: Math.round(qualityScore * weights.quality)
      },
      recommendations: generateRecommendations({
        completionRate,
        onTimeRate,
        overdueAudits,
        discrepancyRate,
        cycleCountsThisMonth,
        fullCountsThisQuarter
      })
    })

  } catch (error) {
    console.error('Error fetching compliance metrics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch compliance metrics' },
      { status: 500 }
    )
  }
}

function generateRecommendations(metrics: any) {
  const recommendations = []

  if (metrics.completionRate < 80) {
    recommendations.push({
      priority: 'HIGH',
      category: 'Completion',
      message: 'Audit completion rate is below target (80%). Review resource allocation and audit scheduling.',
      action: 'Increase audit team capacity or extend audit timelines'
    })
  }

  if (metrics.onTimeRate < 70) {
    recommendations.push({
      priority: 'HIGH',
      category: 'Timeliness',
      message: 'On-time completion rate is below target (70%). Consider audit process optimization.',
      action: 'Review audit procedures and identify bottlenecks'
    })
  }

  if (metrics.overdueAudits > 5) {
    recommendations.push({
      priority: 'MEDIUM',
      category: 'Scheduling',
      message: `${metrics.overdueAudits} audits are overdue. Immediate attention required.`,
      action: 'Prioritize overdue audits and reschedule if necessary'
    })
  }

  if (metrics.discrepancyRate > 5) {
    recommendations.push({
      priority: 'MEDIUM',
      category: 'Quality',
      message: 'Discrepancy rate is higher than optimal (>5%). Review inventory management processes.',
      action: 'Investigate root causes and implement corrective measures'
    })
  }

  if (metrics.cycleCountsThisMonth === 0) {
    recommendations.push({
      priority: 'HIGH',
      category: 'Frequency',
      message: 'No cycle counts completed this month. Schedule cycle counts immediately.',
      action: 'Create monthly cycle counting schedule'
    })
  }

  if (recommendations.length === 0) {
    recommendations.push({
      priority: 'LOW',
      category: 'Performance',
      message: 'All compliance metrics are meeting targets. Continue current practices.',
      action: 'Maintain current audit procedures and review quarterly'
    })
  }

  return recommendations
}
