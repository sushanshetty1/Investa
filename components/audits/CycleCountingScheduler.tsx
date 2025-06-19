'use client'

import { useState, useEffect } from 'react'
import { Calendar, Clock, MapPin, Package2, Settings, Play, Pause, RotateCcw } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface CycleCountSchedule {
  id: string
  name: string
  description?: string
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY'
  method: 'ABC_ANALYSIS' | 'LOCATION_BASED' | 'VELOCITY_BASED' | 'RANDOM'
  isActive: boolean
  warehouseId?: string
  warehouseName?: string
  categoryIds?: string[]
  lastRunDate?: string
  nextRunDate: string
  itemsPerCycle: number
  progress: {
    totalItems: number
    countedItems: number
    pendingItems: number
    completionRate: number
  }
  createdAt: string
  updatedAt: string
}

interface CycleCountItem {
  id: string
  scheduleId: string
  productId: string
  productName: string
  sku: string
  location: string
  lastCounted?: string
  countFrequency: number
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
  status: 'PENDING' | 'COUNTING' | 'COMPLETED' | 'OVERDUE'
  assignedTo?: string
  dueDate: string
}

interface ScheduleFormData {
  name: string
  description: string
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY'
  method: 'ABC_ANALYSIS' | 'LOCATION_BASED' | 'VELOCITY_BASED' | 'RANDOM'
  warehouseId: string
  itemsPerCycle: number
  isActive: boolean
}

export function CycleCountingScheduler() {
  const [schedules, setSchedules] = useState<CycleCountSchedule[]>([])
  const [cycleItems, setCycleItems] = useState<CycleCountItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedSchedule, setSelectedSchedule] = useState<string>('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formData, setFormData] = useState<ScheduleFormData>({
    name: '',
    description: '',
    frequency: 'WEEKLY',
    method: 'ABC_ANALYSIS',
    warehouseId: '',
    itemsPerCycle: 50,
    isActive: true
  })

  useEffect(() => {
    fetchSchedules()
  }, [])

  useEffect(() => {
    if (selectedSchedule) {
      fetchCycleItems(selectedSchedule)
    }
  }, [selectedSchedule])

  const fetchSchedules = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/audits/cycle-counting/schedules')
      if (response.ok) {
        const data = await response.json()
        setSchedules(data.schedules || [])
        if (data.schedules?.length > 0 && !selectedSchedule) {
          setSelectedSchedule(data.schedules[0].id)
        }
      }
    } catch (error) {
      console.error('Error fetching cycle count schedules:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCycleItems = async (scheduleId: string) => {
    try {
      const response = await fetch(`/api/audits/cycle-counting/schedules/${scheduleId}/items`)
      if (response.ok) {
        const data = await response.json()
        setCycleItems(data.items || [])
      }
    } catch (error) {
      console.error('Error fetching cycle count items:', error)
    }
  }

  const handleCreateSchedule = async () => {
    try {
      const response = await fetch('/api/audits/cycle-counting/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        fetchSchedules()
        setShowCreateForm(false)
        resetForm()
      }
    } catch (error) {
      console.error('Error creating cycle count schedule:', error)
    }
  }

  const handleToggleSchedule = async (scheduleId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/audits/cycle-counting/schedules/${scheduleId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive })
      })

      if (response.ok) {
        fetchSchedules()
      }
    } catch (error) {
      console.error('Error toggling schedule:', error)
    }
  }

  const handleRunSchedule = async (scheduleId: string) => {
    try {
      const response = await fetch(`/api/audits/cycle-counting/schedules/${scheduleId}/run`, {
        method: 'POST'
      })

      if (response.ok) {
        fetchSchedules()
        fetchCycleItems(scheduleId)
      }
    } catch (error) {
      console.error('Error running schedule:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      frequency: 'WEEKLY',
      method: 'ABC_ANALYSIS',
      warehouseId: '',
      itemsPerCycle: 50,
      isActive: true
    })
  }

  const getFrequencyColor = (frequency: string) => {
    switch (frequency) {
      case 'DAILY':
        return 'bg-red-100 text-red-800'
      case 'WEEKLY':
        return 'bg-blue-100 text-blue-800'
      case 'MONTHLY':
        return 'bg-green-100 text-green-800'
      case 'QUARTERLY':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
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
      case 'COMPLETED':
        return 'bg-green-100 text-green-800'
      case 'COUNTING':
        return 'bg-blue-100 text-blue-800'
      case 'PENDING':
        return 'bg-gray-100 text-gray-800'
      case 'OVERDUE':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const selectedScheduleData = schedules.find(s => s.id === selectedSchedule)

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Cycle Counting Scheduler</h2>
          <p className="text-muted-foreground">
            Manage automated cycle counting schedules and track progress
          </p>
        </div>
        <Button 
          onClick={() => setShowCreateForm(!showCreateForm)}
          variant={showCreateForm ? "outline" : "default"}
        >
          <Settings className="h-4 w-4 mr-2" />
          {showCreateForm ? 'Cancel' : 'New Schedule'}
        </Button>
      </div>

      {/* Create Schedule Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create Cycle Count Schedule</CardTitle>
            <CardDescription>
              Set up an automated cycle counting schedule with specific parameters
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="scheduleName">Schedule Name</Label>
                <Input
                  id="scheduleName"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Weekly A-Items Count"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="frequency">Frequency</Label>
                <Select
                  value={formData.frequency}
                  onValueChange={(value) => setFormData({ 
                    ...formData, 
                    frequency: value as ScheduleFormData['frequency']
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DAILY">Daily</SelectItem>
                    <SelectItem value="WEEKLY">Weekly</SelectItem>
                    <SelectItem value="MONTHLY">Monthly</SelectItem>
                    <SelectItem value="QUARTERLY">Quarterly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="method">Counting Method</Label>
                <Select
                  value={formData.method}
                  onValueChange={(value) => setFormData({ 
                    ...formData, 
                    method: value as ScheduleFormData['method']
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ABC_ANALYSIS">ABC Analysis</SelectItem>
                    <SelectItem value="LOCATION_BASED">Location Based</SelectItem>
                    <SelectItem value="VELOCITY_BASED">Velocity Based</SelectItem>
                    <SelectItem value="RANDOM">Random</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="itemsPerCycle">Items per Cycle</Label>
                <Input
                  id="itemsPerCycle"
                  type="number"
                  value={formData.itemsPerCycle}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    itemsPerCycle: parseInt(e.target.value) || 0
                  })}
                  min="1"
                  max="1000"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Optional description"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
              <Label htmlFor="isActive">Active Schedule</Label>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateSchedule}>
                Create Schedule
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Schedule Management */}
      <Tabs defaultValue="active" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active">Active Schedules</TabsTrigger>
          <TabsTrigger value="items">Current Items</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-48 bg-gray-200 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : schedules.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500 mb-4">No cycle count schedules configured</p>
                <Button onClick={() => setShowCreateForm(true)}>
                  Create First Schedule
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {schedules.map((schedule) => (
                <Card 
                  key={schedule.id} 
                  className={`cursor-pointer transition-all ${
                    selectedSchedule === schedule.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => setSelectedSchedule(schedule.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{schedule.name}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge className={getFrequencyColor(schedule.frequency)}>
                          {schedule.frequency}
                        </Badge>
                        <Switch
                          checked={schedule.isActive}
                          onCheckedChange={(checked) => 
                            handleToggleSchedule(schedule.id, checked)
                          }
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    </div>
                    {schedule.description && (
                      <CardDescription>{schedule.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">
                        {schedule.progress.completionRate}%
                      </span>
                    </div>
                    <Progress value={schedule.progress.completionRate} />
                    
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-muted-foreground">Counted</p>
                        <p className="font-medium">{schedule.progress.countedItems}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Pending</p>
                        <p className="font-medium">{schedule.progress.pendingItems}</p>
                      </div>
                    </div>
                    
                    <div className="text-sm">
                      <p className="text-muted-foreground">Next Run</p>
                      <p className="font-medium">
                        {new Date(schedule.nextRunDate).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div className="flex justify-between items-center pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRunSchedule(schedule.id)
                        }}
                        disabled={!schedule.isActive}
                      >
                        <Play className="h-4 w-4 mr-1" />
                        Run Now
                      </Button>
                      
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {schedule.warehouseName || 'All Warehouses'}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="items" className="space-y-4">
          {selectedScheduleData && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package2 className="h-5 w-5" />
                  Current Cycle Items - {selectedScheduleData.name}
                </CardTitle>
                <CardDescription>
                  Items scheduled for counting in the current cycle
                </CardDescription>
              </CardHeader>
              <CardContent>
                {cycleItems.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No items scheduled for current cycle</p>
                    <Button 
                      className="mt-4"
                      onClick={() => handleRunSchedule(selectedSchedule)}
                    >
                      Generate Next Cycle
                    </Button>
                  </div>
                ) : (
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Priority</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Due Date</TableHead>
                          <TableHead>Last Counted</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {cycleItems.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{item.productName}</p>
                                <p className="text-sm text-muted-foreground">
                                  SKU: {item.sku}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                {item.location}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={getPriorityColor(item.priority)}>
                                {item.priority}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(item.status)}>
                                {item.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                {new Date(item.dueDate).toLocaleDateString()}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm text-muted-foreground">
                                {item.lastCounted 
                                  ? new Date(item.lastCounted).toLocaleDateString()
                                  : 'Never'
                                }
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
          )}
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Completion Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {schedules.length > 0 
                    ? Math.round(
                        schedules.reduce((acc, s) => acc + s.progress.completionRate, 0) / schedules.length
                      )
                    : 0
                  }%
                </div>
                <p className="text-sm text-muted-foreground">Average across all schedules</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Items Counted Today</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {cycleItems.filter(item => item.status === 'COMPLETED').length}
                </div>
                <p className="text-sm text-muted-foreground">Out of {cycleItems.length} scheduled</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Overdue Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {cycleItems.filter(item => item.status === 'OVERDUE').length}
                </div>
                <p className="text-sm text-muted-foreground">Require immediate attention</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
