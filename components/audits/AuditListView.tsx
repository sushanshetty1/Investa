'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, Download, Eye, Edit, Trash2, CheckCircle, XCircle, Clock, Calendar, FileText, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { AuditDetailsDialog } from '@/components/audits/AuditDetailsDialog'
import { EditAuditDialog } from '@/components/audits/EditAuditDialog'

interface Audit {
  id: string
  auditNumber: string
  type: 'CYCLE_COUNT' | 'FULL_COUNT' | 'SPOT_CHECK' | 'ANNUAL_COUNT' | 'INVESTIGATION'
  method: 'FULL_COUNT' | 'SAMPLE_COUNT' | 'ABC_ANALYSIS' | 'PERPETUAL'
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  warehouseId?: string
  warehouseName?: string
  productId?: string
  productName?: string
  plannedDate: string
  startedDate?: string
  completedDate?: string
  auditedBy: string
  auditedByName?: string
  supervisedBy?: string
  supervisedByName?: string
  totalItems?: number
  itemsCounted?: number
  discrepancies?: number
  adjustmentValue?: number
  notes?: string
  createdAt: string
  updatedAt: string
}

interface FilterOptions {
  search: string
  type: string
  status: string
  warehouse: string
  dateRange: string
}

export function AuditListView() {
  const [audits, setAudits] = useState<Audit[]>([])
  const [filteredAudits, setFilteredAudits] = useState<Audit[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedAudit, setSelectedAudit] = useState<Audit | null>(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    type: 'all',
    status: 'all',    warehouse: 'all',
    dateRange: 'all'
  })
  
  const fetchAudits = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/audits')
      if (response.ok) {
        const data = await response.json()
        setAudits(data.audits || [])
      }
    } catch (error) {
      console.error('Error fetching audits:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const applyFilters = useCallback(() => {
    let filtered = [...audits]

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(audit =>
        audit.auditNumber.toLowerCase().includes(searchLower) ||
        audit.warehouseName?.toLowerCase().includes(searchLower) ||
        audit.productName?.toLowerCase().includes(searchLower) ||
        audit.auditedByName?.toLowerCase().includes(searchLower)      )
    }

    // Type filter
    if (filters.type && filters.type !== 'all') {
      filtered = filtered.filter(audit => audit.type === filters.type)
    }

    // Status filter
    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter(audit => audit.status === filters.status)
    }

    // Warehouse filter
    if (filters.warehouse && filters.warehouse !== 'all') {
      filtered = filtered.filter(audit => audit.warehouseId === filters.warehouse)
    }

    // Date range filter
    if (filters.dateRange && filters.dateRange !== 'all') {
      const now = new Date()
      const filterDate = new Date()
      
      switch (filters.dateRange) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0)
          break
        case 'week':
          filterDate.setDate(now.getDate() - 7)
          break
        case 'month':
          filterDate.setMonth(now.getMonth() - 1)
          break
        case 'quarter':
          filterDate.setMonth(now.getMonth() - 3)
          break
      }      filtered = filtered.filter(audit => 
        new Date(audit.createdAt) >= filterDate
      )
    }
    
    setFilteredAudits(filtered)
  }, [audits, filters])

  useEffect(() => {
    fetchAudits()
  }, [fetchAudits])

  useEffect(() => {
    applyFilters()
  }, [applyFilters])

  const handleDeleteAudit = async (auditId: string) => {
    try {
      const response = await fetch(`/api/audits/${auditId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setAudits(audits.filter(audit => audit.id !== auditId))
      }
    } catch (error) {
      console.error('Error deleting audit:', error)
    }
  }

  const handleExportAudits = () => {
    // Convert audits to CSV format
    const headers = [
      'Audit Number',
      'Type',
      'Status',
      'Warehouse',
      'Product',
      'Planned Date',
      'Completed Date',
      'Audited By',
      'Total Items',
      'Items Counted',
      'Discrepancies',
      'Adjustment Value'
    ]

    const csvContent = [
      headers.join(','),
      ...filteredAudits.map(audit => [
        audit.auditNumber,
        audit.type,
        audit.status,
        audit.warehouseName || '',
        audit.productName || '',
        audit.plannedDate,
        audit.completedDate || '',
        audit.auditedByName || audit.auditedBy,
        audit.totalItems || '',
        audit.itemsCounted || '',
        audit.discrepancies || '',
        audit.adjustmentValue || ''
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `audits_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    window.URL.revokeObjectURL(url)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'IN_PROGRESS':
        return <Clock className="h-4 w-4 text-blue-600" />
      case 'PLANNED':
        return <Calendar className="h-4 w-4 text-gray-600" />
      case 'CANCELLED':
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
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

  const handleViewAudit = (audit: Audit) => {
    setSelectedAudit(audit)
    setShowDetailsDialog(true)
  }

  const handleEditAudit = (audit: Audit) => {
    setSelectedAudit(audit)
    setShowEditDialog(true)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Audits</CardTitle>
        <CardDescription>
          Complete list of inventory audits with filtering and management options
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search audits..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="pl-9"
              />
            </div>
          </div>
          
          <Select 
            value={filters.type} 
            onValueChange={(value) => setFilters({ ...filters, type: value })}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="CYCLE_COUNT">Cycle Count</SelectItem>
              <SelectItem value="FULL_COUNT">Full Count</SelectItem>
              <SelectItem value="SPOT_CHECK">Spot Check</SelectItem>
              <SelectItem value="ANNUAL_COUNT">Annual Count</SelectItem>
              <SelectItem value="INVESTIGATION">Investigation</SelectItem>
            </SelectContent>
          </Select>

          <Select 
            value={filters.status} 
            onValueChange={(value) => setFilters({ ...filters, status: value })}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="PLANNED">Planned</SelectItem>
              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          <Select 
            value={filters.dateRange} 
            onValueChange={(value) => setFilters({ ...filters, dateRange: value })}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Date Range" />
            </SelectTrigger>            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={handleExportAudits}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>

        {/* Audits Table */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="h-12 w-full rounded bg-gray-200 animate-pulse" />
              </div>
            ))}
          </div>
        ) : filteredAudits.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No audits found</p>
            <p className="text-sm text-muted-foreground">
              Try adjusting your filters or create a new audit
            </p>
          </div>
        ) : (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Audit</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Scope</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Discrepancies</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAudits.map((audit) => (
                  <TableRow key={audit.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div>
                        <p className="font-medium">{audit.auditNumber}</p>
                        <p className="text-sm text-muted-foreground">
                          By {audit.auditedByName || audit.auditedBy}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getTypeIcon(audit.type)}
                        <span className="text-sm">
                          {audit.type.replace('_', ' ')}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(audit.status)}
                        <Badge className={getStatusColor(audit.status)}>
                          {audit.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {audit.warehouseName && (
                          <p>{audit.warehouseName}</p>
                        )}
                        {audit.productName && (
                          <p className="text-muted-foreground">{audit.productName}</p>
                        )}
                        {!audit.warehouseName && !audit.productName && (
                          <p className="text-muted-foreground">Full Inventory</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {audit.totalItems && audit.itemsCounted !== undefined ? (
                        <div className="text-sm">
                          <p>{audit.itemsCounted}/{audit.totalItems}</p>
                          <p className="text-muted-foreground">
                            {Math.round((audit.itemsCounted / audit.totalItems) * 100)}%
                          </p>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {audit.discrepancies !== undefined ? (
                        <div className="text-sm">
                          <p className={audit.discrepancies > 0 ? 'text-red-600' : 'text-green-600'}>
                            {audit.discrepancies}
                          </p>
                          {audit.adjustmentValue !== undefined && audit.adjustmentValue !== 0 && (
                            <p className="text-muted-foreground">
                              ${Math.abs(audit.adjustmentValue).toLocaleString()}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{new Date(audit.plannedDate).toLocaleDateString()}</p>
                        {audit.completedDate && (
                          <p className="text-muted-foreground">
                            Completed: {new Date(audit.completedDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewAudit(audit)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditAudit(audit)}
                          disabled={audit.status === 'COMPLETED'}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={audit.status === 'IN_PROGRESS'}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Audit</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete audit {audit.auditNumber}? 
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteAudit(audit.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Results Summary */}
        {!isLoading && filteredAudits.length > 0 && (
          <div className="mt-4 text-sm text-muted-foreground">
            Showing {filteredAudits.length} of {audits.length} audits
          </div>
        )}
      </CardContent>

      {/* Dialogs */}
      {selectedAudit && (
        <>
          <AuditDetailsDialog
            audit={selectedAudit}
            open={showDetailsDialog}
            onOpenChange={setShowDetailsDialog}
          />
          <EditAuditDialog
            audit={selectedAudit}
            open={showEditDialog}
            onOpenChange={setShowEditDialog}
            onAuditUpdated={fetchAudits}
          />
        </>
      )}
    </Card>
  )
}
