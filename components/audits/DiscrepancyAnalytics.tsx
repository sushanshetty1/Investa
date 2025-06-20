'use client'

import { useState, useEffect, useCallback } from 'react'
import { TrendingUp, TrendingDown, AlertTriangle, Package, MapPin, Filter } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'

interface DiscrepancyStats {
  totalDiscrepancies: number
  totalValueImpact: number
  averageDiscrepancyValue: number
  discrepancyRate: number
  topCausesCount: number
  resolvedCount: number
  pendingCount: number
  trendsData: {
    month: string
    discrepancies: number
    value: number
  }[]
}

interface Discrepancy {
  id: string
  auditId: string
  auditNumber: string
  productId: string
  productName: string
  sku: string
  warehouseId: string
  warehouseName: string
  location?: string
  systemQty: number
  countedQty: number
  adjustmentQty: number
  unitCost: number
  valueImpact: number
  discrepancyReason?: string
  rootCause?: string
  status: 'IDENTIFIED' | 'INVESTIGATING' | 'RESOLVED' | 'APPROVED'
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  reportedDate: string
  resolvedDate?: string
  investigatedBy?: string
  approvedBy?: string
  correctionAction?: string
  notes?: string
}

interface RootCauseAnalysis {
  cause: string
  count: number
  percentage: number
  totalValue: number
  averageValue: number
}

interface FilterOptions {
  dateRange: string
  warehouse: string
  severity: string
  status: string
  rootCause: string
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088fe']

export function DiscrepancyAnalytics() {
  const [stats, setStats] = useState<DiscrepancyStats>({
    totalDiscrepancies: 0,
    totalValueImpact: 0,
    averageDiscrepancyValue: 0,
    discrepancyRate: 0,
    topCausesCount: 0,
    resolvedCount: 0,
    pendingCount: 0,
    trendsData: []
  })
  
  const [discrepancies, setDiscrepancies] = useState<Discrepancy[]>([])
  const [rootCauses, setRootCauses] = useState<RootCauseAnalysis[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState<FilterOptions>({
    dateRange: 'month',
    warehouse: 'all',
    severity: 'all',
    status: 'all',
    rootCause: 'all'  })

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true)
        // Build query parameters
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== 'all') params.append(key, value)
      })

      const [statsResponse, discrepanciesResponse, rootCausesResponse] = await Promise.all([
        fetch(`/api/audits/discrepancies/stats?${params}`),
        fetch(`/api/audits/discrepancies?${params}`),
        fetch(`/api/audits/discrepancies/root-causes?${params}`)
      ])

      if (statsResponse.ok) {
        const data = await statsResponse.json()
        setStats(data)
      }

      if (discrepanciesResponse.ok) {
        const data = await discrepanciesResponse.json()
        setDiscrepancies(data.discrepancies || [])
      }

      if (rootCausesResponse.ok) {
        const data = await rootCausesResponse.json()
        setRootCauses(data.rootCauses || [])
      }    } catch (error) {
      console.error('Error fetching discrepancy data:', error)
    } finally {
      setIsLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const getSeverityColor = (severity: string) => {
    switch (severity) {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'RESOLVED':
        return 'bg-green-100 text-green-800'
      case 'APPROVED':
        return 'bg-blue-100 text-blue-800'
      case 'INVESTIGATING':
        return 'bg-yellow-100 text-yellow-800'
      case 'IDENTIFIED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value)
  }

  const pieChartData = rootCauses.slice(0, 5).map((cause, index) => ({
    name: cause.cause,
    value: cause.count,
    percentage: cause.percentage,
    color: COLORS[index % COLORS.length]
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Discrepancy Analysis</h2>
        <p className="text-muted-foreground">
          Analyze inventory discrepancies, identify patterns, and track resolution progress
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Select
              value={filters.dateRange}
              onValueChange={(value) => setFilters({ ...filters, dateRange: value })}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.severity}
              onValueChange={(value) => setFilters({ ...filters, severity: value })}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="CRITICAL">Critical</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="LOW">Low</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.status}
              onValueChange={(value) => setFilters({ ...filters, status: value })}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="IDENTIFIED">Identified</SelectItem>
                <SelectItem value="INVESTIGATING">Investigating</SelectItem>
                <SelectItem value="RESOLVED">Resolved</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
              </SelectContent>
            </Select>            <Button variant="outline" onClick={() => setFilters({
              dateRange: 'month',
              warehouse: 'all',
              severity: 'all',
              status: 'all',
              rootCause: 'all'
            })}>
              Reset Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Discrepancies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDiscrepancies}</div>
            <div className="flex items-center text-sm">
              <span className="text-muted-foreground">
                {stats.discrepancyRate.toFixed(2)}% of all counts
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Value Impact
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(Math.abs(stats.totalValueImpact))}
            </div>
            <div className="flex items-center text-sm">
              {stats.totalValueImpact > 0 ? (
                <TrendingUp className="h-4 w-4 text-red-500 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 text-green-500 mr-1" />
              )}
              <span className="text-muted-foreground">
                {stats.totalValueImpact > 0 ? 'Overcount' : 'Undercount'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Impact
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.averageDiscrepancyValue)}
            </div>
            <div className="flex items-center text-sm">
              <span className="text-muted-foreground">
                Per discrepancy
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Resolution Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalDiscrepancies > 0 
                ? Math.round((stats.resolvedCount / stats.totalDiscrepancies) * 100)
                : 0
              }%
            </div>
            <div className="flex items-center text-sm">
              <span className="text-muted-foreground">
                {stats.resolvedCount}/{stats.totalDiscrepancies} resolved
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analysis Tabs */}
      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="root-causes">Root Causes</TabsTrigger>
          <TabsTrigger value="details">Discrepancy Details</TabsTrigger>
          <TabsTrigger value="actions">Corrective Actions</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Discrepancy Trends</CardTitle>
                <CardDescription>
                  Number of discrepancies over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={stats.trendsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="discrepancies" 
                      stroke="#8884d8" 
                      strokeWidth={2}
                      name="Discrepancies"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Value Impact Trends</CardTitle>
                <CardDescription>
                  Financial impact of discrepancies over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.trendsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => `$${value.toLocaleString()}`} />
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Bar dataKey="value" fill="#82ca9d" name="Value Impact" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="root-causes" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Root Cause Distribution</CardTitle>
                <CardDescription>
                  Primary causes of inventory discrepancies
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Root Cause Analysis</CardTitle>
                <CardDescription>
                  Detailed breakdown of discrepancy causes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {rootCauses.slice(0, 5).map((cause) => (
                    <div key={cause.cause} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{cause.cause}</span>
                        <div className="text-right">
                          <div className="text-sm font-medium">{cause.count} cases</div>
                          <div className="text-xs text-muted-foreground">
                            {formatCurrency(cause.totalValue)}
                          </div>
                        </div>
                      </div>
                      <Progress value={cause.percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Discrepancy Details</CardTitle>
              <CardDescription>
                Complete list of identified discrepancies with investigation status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-16 bg-gray-200 rounded animate-pulse" />
                  ))}
                </div>
              ) : discrepancies.length === 0 ? (
                <div className="text-center py-8">
                  <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No discrepancies found</p>
                  <p className="text-sm text-muted-foreground">
                    Adjust your filters or check a different time period
                  </p>
                </div>
              ) : (
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Variance</TableHead>
                        <TableHead>Impact</TableHead>
                        <TableHead>Severity</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {discrepancies.map((discrepancy) => (
                        <TableRow key={discrepancy.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{discrepancy.productName}</p>
                              <p className="text-sm text-muted-foreground">
                                SKU: {discrepancy.sku}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="text-sm">{discrepancy.warehouseName}</p>
                                {discrepancy.location && (
                                  <p className="text-xs text-muted-foreground">
                                    {discrepancy.location}
                                  </p>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <p className={`font-medium ${
                                discrepancy.adjustmentQty > 0 ? 'text-red-600' : 'text-green-600'
                              }`}>
                                {discrepancy.adjustmentQty > 0 ? '+' : ''}{discrepancy.adjustmentQty}
                              </p>
                              <p className="text-muted-foreground">
                                {discrepancy.systemQty} → {discrepancy.countedQty}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <p className={`font-medium ${
                                discrepancy.valueImpact > 0 ? 'text-red-600' : 'text-green-600'
                              }`}>
                                {formatCurrency(Math.abs(discrepancy.valueImpact))}
                              </p>
                              <p className="text-muted-foreground">
                                @ {formatCurrency(discrepancy.unitCost)}/unit
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getSeverityColor(discrepancy.severity)}>
                              {discrepancy.severity}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(discrepancy.status)}>
                              {discrepancy.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <p>{new Date(discrepancy.reportedDate).toLocaleDateString()}</p>
                              {discrepancy.resolvedDate && (
                                <p className="text-muted-foreground">
                                  Resolved: {new Date(discrepancy.resolvedDate).toLocaleDateString()}
                                </p>
                              )}
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

        <TabsContent value="actions" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recommended Actions</CardTitle>
                <CardDescription>
                  System-generated recommendations based on discrepancy patterns
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-yellow-800">High Discrepancy Area</p>
                      <p className="text-sm text-yellow-700">
                        Location A-12 shows consistently high discrepancies. Consider additional training for staff in this area.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Package className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-blue-800">Frequent Count Errors</p>
                      <p className="text-sm text-blue-700">
                        SKU ABC-123 has recurring count discrepancies. Review storage conditions and counting procedures.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-green-800">Improvement Opportunity</p>
                      <p className="text-sm text-green-700">
                        Implementing cycle counting has reduced overall discrepancy rate by 15% this quarter.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Action Items</CardTitle>
                <CardDescription>
                  Tasks and follow-ups for discrepancy resolution
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {discrepancies
                    .filter(d => d.status === 'INVESTIGATING' || d.status === 'IDENTIFIED')
                    .slice(0, 5)
                    .map((discrepancy) => (
                      <div key={discrepancy.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium">{discrepancy.productName}</p>
                          <p className="text-sm text-muted-foreground">
                            {discrepancy.warehouseName} - {formatCurrency(Math.abs(discrepancy.valueImpact))} impact
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getSeverityColor(discrepancy.severity)}>
                            {discrepancy.severity}
                          </Badge>
                          <Button size="sm" variant="outline">
                            Investigate
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
