'use client'

import { useState, useEffect } from 'react'
import { Shield, FileText, Download, CheckCircle, XCircle, AlertTriangle, Calendar, Award, Clock } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface ComplianceMetrics {
  overallScore: number
  auditFrequencyScore: number
  discrepancyResolutionScore: number
  documentationScore: number
  timelinessScore: number
  accuracyScore: number
  totalAudits: number
  onTimeAudits: number
  lateAudits: number
  missedAudits: number
  averageResolutionTime: number
  pendingActions: number
}

interface ComplianceRequirement {
  id: string
  name: string
  description: string
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'ANNUALLY'
  category: 'REGULATORY' | 'INTERNAL' | 'INDUSTRY' | 'CUSTOMER'
  status: 'COMPLIANT' | 'NON_COMPLIANT' | 'OVERDUE' | 'UPCOMING'
  lastCompletedDate?: string
  nextDueDate: string
  responsiblePerson: string
  completionRate: number
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
}

interface AuditTrail {
  id: string
  timestamp: string
  action: string
  user: string
  details: string
  auditId?: string
  auditNumber?: string
  changes?: Record<string, { from: any; to: any }>
  ipAddress?: string
  userAgent?: string
}

interface ComplianceReport {
  id: string
  name: string
  type: 'REGULATORY' | 'INTERNAL' | 'AUDIT_SUMMARY' | 'VARIANCE_ANALYSIS'
  generatedDate: string
  period: string
  status: 'DRAFT' | 'FINAL' | 'APPROVED' | 'SUBMITTED'
  format: 'PDF' | 'EXCEL' | 'CSV'
  fileSize?: number
  downloadUrl?: string
}

export function AuditComplianceReport() {
  const [metrics, setMetrics] = useState<ComplianceMetrics>({
    overallScore: 0,
    auditFrequencyScore: 0,
    discrepancyResolutionScore: 0,
    documentationScore: 0,
    timelinessScore: 0,
    accuracyScore: 0,
    totalAudits: 0,
    onTimeAudits: 0,
    lateAudits: 0,
    missedAudits: 0,
    averageResolutionTime: 0,
    pendingActions: 0
  })
  
  const [requirements, setRequirements] = useState<ComplianceRequirement[]>([])
  const [auditTrails, setAuditTrails] = useState<AuditTrail[]>([])
  const [reports, setReports] = useState<ComplianceReport[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('current')

  useEffect(() => {
    fetchComplianceData()
  }, [selectedPeriod])

  const fetchComplianceData = async () => {
    try {
      setIsLoading(true)
      
      const [metricsResponse, requirementsResponse, trailsResponse, reportsResponse] = await Promise.all([
        fetch(`/api/audits/compliance/metrics?period=${selectedPeriod}`),
        fetch(`/api/audits/compliance/requirements?period=${selectedPeriod}`),
        fetch(`/api/audits/compliance/audit-trail?period=${selectedPeriod}&limit=50`),
        fetch(`/api/audits/compliance/reports?period=${selectedPeriod}`)
      ])

      if (metricsResponse.ok) {
        const data = await metricsResponse.json()
        setMetrics(data)
      }

      if (requirementsResponse.ok) {
        const data = await requirementsResponse.json()
        setRequirements(data.requirements || [])
      }

      if (trailsResponse.ok) {
        const data = await trailsResponse.json()
        setAuditTrails(data.trails || [])
      }

      if (reportsResponse.ok) {
        const data = await reportsResponse.json()
        setReports(data.reports || [])
      }
    } catch (error) {
      console.error('Error fetching compliance data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const generateReport = async (type: string) => {
    try {
      const response = await fetch('/api/audits/compliance/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, period: selectedPeriod })
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `compliance-report-${type}-${new Date().toISOString().split('T')[0]}.pdf`
        link.click()
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Error generating report:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLIANT':
        return 'bg-green-100 text-green-800'
      case 'NON_COMPLIANT':
        return 'bg-red-100 text-red-800'
      case 'OVERDUE':
        return 'bg-red-600 text-white'
      case 'UPCOMING':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'CRITICAL':
        return 'bg-red-600 text-white'
      case 'HIGH':
        return 'bg-red-100 text-red-800'
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800'
      case 'LOW':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const formatDaysFromNow = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = date.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`
    if (diffDays === 0) return 'Due today'
    if (diffDays === 1) return 'Due tomorrow'
    return `Due in ${diffDays} days`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Audit Compliance & Reports</h2>
          <p className="text-muted-foreground">
            Monitor compliance status, generate reports, and maintain audit trails
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current">Current Period</SelectItem>
              <SelectItem value="last_month">Last Month</SelectItem>
              <SelectItem value="last_quarter">Last Quarter</SelectItem>
              <SelectItem value="last_year">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => generateReport('comprehensive')}>
            <Download className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Compliance Score Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Compliance Score Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
            <div className="text-center">
              <div className={`text-3xl font-bold ${getScoreColor(metrics.overallScore)}`}>
                {metrics.overallScore}%
              </div>
              <p className="text-sm text-muted-foreground">Overall Score</p>
              <Progress value={metrics.overallScore} className="mt-2" />
            </div>
            
            <div className="text-center">
              <div className={`text-2xl font-bold ${getScoreColor(metrics.auditFrequencyScore)}`}>
                {metrics.auditFrequencyScore}%
              </div>
              <p className="text-sm text-muted-foreground">Audit Frequency</p>
              <Progress value={metrics.auditFrequencyScore} className="mt-2" />
            </div>
            
            <div className="text-center">
              <div className={`text-2xl font-bold ${getScoreColor(metrics.timelinessScore)}`}>
                {metrics.timelinessScore}%
              </div>
              <p className="text-sm text-muted-foreground">Timeliness</p>
              <Progress value={metrics.timelinessScore} className="mt-2" />
            </div>
            
            <div className="text-center">
              <div className={`text-2xl font-bold ${getScoreColor(metrics.accuracyScore)}`}>
                {metrics.accuracyScore}%
              </div>
              <p className="text-sm text-muted-foreground">Accuracy</p>
              <Progress value={metrics.accuracyScore} className="mt-2" />
            </div>
            
            <div className="text-center">
              <div className={`text-2xl font-bold ${getScoreColor(metrics.discrepancyResolutionScore)}`}>
                {metrics.discrepancyResolutionScore}%
              </div>
              <p className="text-sm text-muted-foreground">Resolution</p>
              <Progress value={metrics.discrepancyResolutionScore} className="mt-2" />
            </div>
            
            <div className="text-center">
              <div className={`text-2xl font-bold ${getScoreColor(metrics.documentationScore)}`}>
                {metrics.documentationScore}%
              </div>
              <p className="text-sm text-muted-foreground">Documentation</p>
              <Progress value={metrics.documentationScore} className="mt-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Audit Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.onTimeAudits}</div>
            <p className="text-sm text-muted-foreground">
              On-time out of {metrics.totalAudits} total
            </p>
            {metrics.lateAudits > 0 && (
              <p className="text-sm text-red-600">
                {metrics.lateAudits} late, {metrics.missedAudits} missed
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Resolution Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.averageResolutionTime}</div>
            <p className="text-sm text-muted-foreground">days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{metrics.pendingActions}</div>
            <p className="text-sm text-muted-foreground">requiring attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Compliance Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {requirements.length > 0 
                ? Math.round((requirements.filter(r => r.status === 'COMPLIANT').length / requirements.length) * 100)
                : 0
              }%
            </div>
            <p className="text-sm text-muted-foreground">
              {requirements.filter(r => r.status === 'COMPLIANT').length} of {requirements.length} requirements
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="requirements" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="requirements">Compliance Requirements</TabsTrigger>
          <TabsTrigger value="audit-trail">Audit Trail</TabsTrigger>
          <TabsTrigger value="reports">Generated Reports</TabsTrigger>
          <TabsTrigger value="certifications">Certifications</TabsTrigger>
        </TabsList>

        <TabsContent value="requirements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Requirements Status</CardTitle>
              <CardDescription>
                Track all regulatory and internal compliance requirements
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-16 bg-gray-200 rounded animate-pulse" />
                  ))}
                </div>
              ) : requirements.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No compliance requirements configured</p>
                </div>
              ) : (
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Requirement</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Frequency</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Risk Level</TableHead>
                        <TableHead>Next Due</TableHead>
                        <TableHead>Responsible</TableHead>
                        <TableHead>Progress</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {requirements.map((requirement) => (
                        <TableRow key={requirement.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{requirement.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {requirement.description}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {requirement.category}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              {requirement.frequency}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {requirement.status === 'COMPLIANT' && (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              )}
                              {requirement.status === 'NON_COMPLIANT' && (
                                <XCircle className="h-4 w-4 text-red-600" />
                              )}
                              {requirement.status === 'OVERDUE' && (
                                <AlertTriangle className="h-4 w-4 text-red-600" />
                              )}
                              {requirement.status === 'UPCOMING' && (
                                <Clock className="h-4 w-4 text-yellow-600" />
                              )}
                              <Badge className={getStatusColor(requirement.status)}>
                                {requirement.status.replace('_', ' ')}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getRiskColor(requirement.riskLevel)}>
                              {requirement.riskLevel}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <p>{new Date(requirement.nextDueDate).toLocaleDateString()}</p>
                              <p className="text-muted-foreground">
                                {formatDaysFromNow(requirement.nextDueDate)}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {requirement.responsiblePerson}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="text-sm font-medium">
                                {requirement.completionRate}%
                              </div>
                              <Progress value={requirement.completionRate} className="h-2" />
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit-trail" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Audit Trail</CardTitle>
              <CardDescription>
                Complete log of all audit-related activities and changes
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(10)].map((_, i) => (
                    <div key={i} className="h-12 bg-gray-200 rounded animate-pulse" />
                  ))}
                </div>
              ) : auditTrails.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No audit trail entries found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {auditTrails.map((trail) => (
                    <div key={trail.id} className="flex items-start gap-3 p-3 border rounded-lg">
                      <div className="p-2 bg-blue-100 rounded">
                        <FileText className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{trail.action}</p>
                          <div className="text-sm text-muted-foreground">
                            {new Date(trail.timestamp).toLocaleString()}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {trail.details}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span>User: {trail.user}</span>
                          {trail.auditNumber && (
                            <span>Audit: {trail.auditNumber}</span>
                          )}
                          {trail.ipAddress && (
                            <span>IP: {trail.ipAddress}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Report Generation</CardTitle>
                <CardDescription>
                  Generate compliance and audit reports instantly
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => generateReport('compliance-summary')}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Compliance Summary Report
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => generateReport('audit-performance')}
                >
                  <Award className="h-4 w-4 mr-2" />
                  Audit Performance Report
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => generateReport('discrepancy-analysis')}
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Discrepancy Analysis Report
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => generateReport('regulatory-compliance')}
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Regulatory Compliance Report
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Generated Reports</CardTitle>
                <CardDescription>
                  Previously generated reports and documentation
                </CardDescription>
              </CardHeader>
              <CardContent>
                {reports.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No reports generated yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {reports.slice(0, 5).map((report) => (
                      <div key={report.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium">{report.name}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{report.type}</span>
                            <span>•</span>
                            <span>{new Date(report.generatedDate).toLocaleDateString()}</span>
                            <span>•</span>
                            <Badge variant="outline">{report.status}</Badge>
                          </div>
                        </div>
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="certifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Certifications & Standards</CardTitle>
              <CardDescription>
                Track compliance with industry standards and certifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <Award className="h-6 w-6 text-blue-600" />
                    <div>
                      <p className="font-medium">ISO 9001:2015</p>
                      <p className="text-sm text-muted-foreground">Quality Management</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Status</span>
                      <Badge className="bg-green-100 text-green-800">Certified</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Expires</span>
                      <span>Dec 2025</span>
                    </div>
                    <Progress value={85} className="h-2" />
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <Shield className="h-6 w-6 text-green-600" />
                    <div>
                      <p className="font-medium">SOX Compliance</p>
                      <p className="text-sm text-muted-foreground">Financial Controls</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Status</span>
                      <Badge className="bg-green-100 text-green-800">Compliant</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Next Review</span>
                      <span>Mar 2025</span>
                    </div>
                    <Progress value={92} className="h-2" />
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <AlertTriangle className="h-6 w-6 text-yellow-600" />
                    <div>
                      <p className="font-medium">FDA 21 CFR Part 11</p>
                      <p className="text-sm text-muted-foreground">Electronic Records</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Status</span>
                      <Badge className="bg-yellow-100 text-yellow-800">In Progress</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Target</span>
                      <span>Jun 2025</span>
                    </div>
                    <Progress value={67} className="h-2" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
