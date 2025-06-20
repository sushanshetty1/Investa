import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30'

    // These would typically be configured in a database or config file
    // For now, we'll return standard inventory audit requirements
    const requirements = [
      {
        id: 'cycle-count-monthly',
        name: 'Monthly Cycle Counts',
        description: 'Perform cycle counts on high-value items monthly',
        category: 'Cycle Counting',
        frequency: 'MONTHLY',
        mandatoryFor: ['HIGH_VALUE', 'FAST_MOVING'],
        complianceRate: 85,
        status: 'ACTIVE',
        lastReview: '2024-01-15',
        nextReview: '2024-07-15',
        regulation: 'SOX Compliance',
        severity: 'HIGH'
      },
      {
        id: 'full-inventory-quarterly',
        name: 'Quarterly Full Inventory Count',
        description: 'Complete physical inventory count of all items quarterly',
        category: 'Full Inventory',
        frequency: 'QUARTERLY',
        mandatoryFor: ['ALL_ITEMS'],
        complianceRate: 92,
        status: 'ACTIVE',
        lastReview: '2024-01-15',
        nextReview: '2024-07-15',
        regulation: 'Financial Reporting',
        severity: 'HIGH'
      },
      {
        id: 'annual-comprehensive',
        name: 'Annual Comprehensive Audit',
        description: 'Comprehensive audit including procedures, controls, and inventory verification',
        category: 'Comprehensive',
        frequency: 'ANNUALLY',
        mandatoryFor: ['ALL_LOCATIONS'],
        complianceRate: 98,
        status: 'ACTIVE',
        lastReview: '2024-01-01',
        nextReview: '2025-01-01',
        regulation: 'Industry Standard',
        severity: 'CRITICAL'
      },
      {
        id: 'spot-check-weekly',
        name: 'Weekly Spot Checks',
        description: 'Random spot checks on various product categories',
        category: 'Spot Check',
        frequency: 'WEEKLY',
        mandatoryFor: ['RANDOM_SELECTION'],
        complianceRate: 76,
        status: 'ACTIVE',
        lastReview: '2024-02-01',
        nextReview: '2024-08-01',
        regulation: 'Internal Policy',
        severity: 'MEDIUM'
      },
      {
        id: 'damaged-goods-immediate',
        name: 'Damaged Goods Investigation',
        description: 'Immediate investigation and documentation of damaged inventory',
        category: 'Investigation',
        frequency: 'AS_NEEDED',
        mandatoryFor: ['DAMAGED_ITEMS'],
        complianceRate: 88,
        status: 'ACTIVE',
        lastReview: '2024-01-20',
        nextReview: '2024-07-20',
        regulation: 'Insurance Requirement',
        severity: 'HIGH'
      },
      {
        id: 'high-value-security',
        name: 'High-Value Items Security Audit',
        description: 'Enhanced security verification for high-value inventory items',
        category: 'Security',
        frequency: 'MONTHLY',
        mandatoryFor: ['HIGH_VALUE'],
        complianceRate: 94,
        status: 'ACTIVE',
        lastReview: '2024-01-10',
        nextReview: '2024-07-10',
        regulation: 'Security Protocol',
        severity: 'HIGH'
      }
    ]

    // Filter by compliance status if needed
    const filteredRequirements = requirements.map(req => ({
      ...req,
      isCompliant: req.complianceRate >= 80,
      riskLevel: req.complianceRate < 60 ? 'HIGH' : req.complianceRate < 80 ? 'MEDIUM' : 'LOW',
      daysToNextReview: Math.ceil((new Date(req.nextReview).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    }))

    // Calculate summary statistics
    const summary = {
      totalRequirements: requirements.length,
      compliantRequirements: filteredRequirements.filter(r => r.isCompliant).length,
      nonCompliantRequirements: filteredRequirements.filter(r => !r.isCompliant).length,
      averageComplianceRate: Math.round(
        requirements.reduce((sum, req) => sum + req.complianceRate, 0) / requirements.length
      ),
      highRiskRequirements: filteredRequirements.filter(r => r.riskLevel === 'HIGH').length,
      upcomingReviews: filteredRequirements.filter(r => r.daysToNextReview <= 30).length
    }

    // Group by category
    const categoryBreakdown = filteredRequirements.reduce((acc, req) => {
      if (!acc[req.category]) {
        acc[req.category] = {
          category: req.category,
          total: 0,
          compliant: 0,
          averageRate: 0,
          highestSeverity: 'LOW'
        }
      }
      
      acc[req.category].total += 1
      if (req.isCompliant) acc[req.category].compliant += 1
        // Update highest severity
      const severityLevels: Record<string, number> = { 'LOW': 1, 'MEDIUM': 2, 'HIGH': 3, 'CRITICAL': 4 }
      if ((severityLevels[req.severity] || 0) > (severityLevels[acc[req.category].highestSeverity] || 0)) {
        acc[req.category].highestSeverity = req.severity
      }
      
      return acc    }, {} as Record<string, any>)

    // Calculate average rates for categories
    Object.values(categoryBreakdown).forEach((cat: Record<string, any>) => {
      const categoryReqs = filteredRequirements.filter(r => r.category === cat.category)
      cat.averageRate = Math.round(
        categoryReqs.reduce((sum, req) => sum + req.complianceRate, 0) / categoryReqs.length
      )
      cat.complianceRate = Math.round((cat.compliant / cat.total) * 100)
    })

    return NextResponse.json({
      requirements: filteredRequirements,
      summary,
      categoryBreakdown: Object.values(categoryBreakdown),
      period: parseInt(period)
    })

  } catch (error) {
    console.error('Error fetching compliance requirements:', error)
    return NextResponse.json(
      { error: 'Failed to fetch compliance requirements' },
      { status: 500 }
    )
  }
}
