'use client'

import { useState, useEffect } from 'react'
import { Plus, FileText, TrendingUp, AlertTriangle, Eye, Clock, Calendar } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { AuditListView } from '@/components/audits/AuditListView'
import { CycleCountingScheduler } from '@/components/audits/CycleCountingScheduler'
import { DiscrepancyAnalytics } from '@/components/audits/DiscrepancyAnalytics'
import { AuditComplianceReport } from '@/components/audits/AuditComplianceReport'
import { CreateAuditDialog } from '@/components/audits/CreateAuditDialog'

interface AuditStats {
  totalAudits: number
  activeAudits: number
  completedThisMonth: number
  pendingApproval: number
  discrepanciesFound: number
  discrepancyValue: number
  complianceScore: number
  lastAuditDate: string | null
  nextScheduledAudit: string | null
  cycleCounts: {
    scheduled: number
    completed: number
    pending: number
  }
}

interface RecentAudit {
  id: string
  auditNumber: string
  type: 'CYCLE_COUNT' | 'FULL_COUNT' | 'SPOT_CHECK' | 'ANNUAL_COUNT' | 'INVESTIGATION'
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  warehouseName?: string
  productName?: string
  auditedBy: string
  completedDate?: string
  discrepancies: number
  adjustmentValue: number
}

export default function AuditsPage() {
  const [stats, setStats] = useState<AuditStats>({
    totalAudits: 0,
    activeAudits: 0,
    completedThisMonth: 0,
    pendingApproval: 0,
    discrepanciesFound: 0,
    discrepancyValue: 0,
    complianceScore: 0,
    lastAuditDate: null,
    nextScheduledAudit: null,
    cycleCounts: {
      scheduled: 0,
      completed: 0,
      pending: 0
    }
  })
  
  const [recentAudits, setRecentAudits] = useState<RecentAudit[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  useEffect(() => {
    fetchStats()
    fetchRecentAudits()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/audits/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching audit stats:', error)
    }
  }

  const fetchRecentAudits = async () => {
    try {
      const response = await fetch('/api/audits?limit=10')
      if (response.ok) {
        const data = await response.json()
        setRecentAudits(data.audits || [])
      }
    } catch (error) {
      console.error('Error fetching recent audits:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800'
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800'
      case 'PLANNED':
        return 'bg-gray-100 text-gray-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'CYCLE_COUNT':
        return <Clock className="h-4 w-4" />
      case 'FULL_COUNT':
        return <FileText className="h-4 w-4" />
      case 'SPOT_CHECK':
        return <Eye className="h-4 w-4" />
      case 'ANNUAL_COUNT':
        return <Calendar className="h-4 w-4" />
      case 'INVESTIGATION':
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }
  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Quality Control & Audits</h1>
          <p className="text-muted-foreground">
            Comprehensive inventory auditing and quality management system
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Audit
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Audits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeAudits}</div>
            <p className="text-xs text-muted-foreground">
              Currently in progress
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completed This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedThisMonth}</div>
            <p className="text-xs text-muted-foreground">
              +{Math.round((stats.completedThisMonth / (stats.totalAudits || 1)) * 100)}% of total
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Discrepancies Found
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.discrepanciesFound}</div>
            <p className="text-xs text-muted-foreground">
              ${stats.discrepancyValue.toLocaleString()} value impact
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Compliance Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.complianceScore}%</div>
            <Progress value={stats.complianceScore} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Cycle Count Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Cycle Count Schedule
          </CardTitle>
          <CardDescription>
            Current status of ongoing cycle counting program
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.cycleCounts.scheduled}</div>
              <p className="text-sm text-muted-foreground">Scheduled</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.cycleCounts.completed}</div>
              <p className="text-sm text-muted-foreground">Completed</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.cycleCounts.pending}</div>
              <p className="text-sm text-muted-foreground">Pending</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="audits" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="audits">All Audits</TabsTrigger>
          <TabsTrigger value="cycle-counting">Cycle Counting</TabsTrigger>
          <TabsTrigger value="discrepancies">Discrepancy Analysis</TabsTrigger>
          <TabsTrigger value="compliance">Compliance & Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="audits" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Audits */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Audits</CardTitle>
                  <CardDescription>
                    Latest audit activities and their status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-4">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center space-x-4">
                          <div className="h-10 w-10 rounded bg-gray-200 animate-pulse" />
                          <div className="space-y-2 flex-1">
                            <div className="h-4 bg-gray-200 rounded animate-pulse" />
                            <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : recentAudits.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No audits found</p>
                      <Button
                        variant="outline"
                        className="mt-4"
                        onClick={() => setShowCreateDialog(true)}
                      >
                        Create Your First Audit
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {recentAudits.map((audit) => (
                        <div
                          key={audit.id}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-gray-100 rounded">
                              {getTypeIcon(audit.type)}
                            </div>
                            <div>
                              <p className="font-medium">{audit.auditNumber}</p>
                              <p className="text-sm text-muted-foreground">
                                {audit.warehouseName || audit.productName || 'Full Inventory'}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                By {audit.auditedBy}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge className={getStatusColor(audit.status)}>
                              {audit.status.replace('_', ' ')}
                            </Badge>
                            {audit.discrepancies > 0 && (
                              <p className="text-xs text-red-600 mt-1">
                                {audit.discrepancies} discrepancies
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => setShowCreateDialog(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Audit
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Clock className="h-4 w-4 mr-2" />
                    Schedule Cycle Count
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Eye className="h-4 w-4 mr-2" />
                    Spot Check Products
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    View Analytics
                  </Button>
                </CardContent>
              </Card>

              {/* Audit Summary */}
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle>Audit Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">Total Audits</span>
                      <span className="font-medium">{stats.totalAudits}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Pending Approval</span>
                      <span className="font-medium">{stats.pendingApproval}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Last Audit</span>
                      <span className="font-medium text-xs">
                        {stats.lastAuditDate 
                          ? new Date(stats.lastAuditDate).toLocaleDateString()
                          : 'Never'
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Next Scheduled</span>
                      <span className="font-medium text-xs">
                        {stats.nextScheduledAudit 
                          ? new Date(stats.nextScheduledAudit).toLocaleDateString()
                          : 'None'
                        }
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          
          {/* Full Audit List */}
          <AuditListView />
        </TabsContent>

        <TabsContent value="cycle-counting">
          <CycleCountingScheduler />
        </TabsContent>

        <TabsContent value="discrepancies">
          <DiscrepancyAnalytics />
        </TabsContent>

        <TabsContent value="compliance">
          <AuditComplianceReport />
        </TabsContent>
      </Tabs>

      {/* Create Audit Dialog */}
      <CreateAuditDialog 
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onAuditCreated={() => {
          fetchStats()
          fetchRecentAudits()
        }}      />
      </div>
    </div>
  )
}
