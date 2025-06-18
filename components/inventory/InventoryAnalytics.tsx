'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  Package, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  DollarSign,
  BarChart3,
  Eye,
  RefreshCw
} from 'lucide-react'

interface InventoryAnalyticsProps {
  className?: string
}

export function InventoryAnalytics({ className }: InventoryAnalyticsProps) {
  const [loading, setLoading] = useState(false)
  const [analytics, setAnalytics] = useState<{
    totalProducts: number
    totalValue: number
    lowStockItems: number
    outOfStockItems: number
    topProducts: Array<{ id: string; name: string; sales: number; revenue: number }>
    categoryBreakdown: Array<{ name: string; value: number; color: string }>
    recentMovements: Array<{ id: string; type: string; product: string; quantity: number; date: string }>
    stockTurnover: number
    warehouseUtilization: Array<{ name: string; utilization: number; capacity: number; used: number }>
  }>({
    totalProducts: 0,
    totalValue: 0,
    lowStockItems: 0,
    outOfStockItems: 0,    topProducts: [],
    categoryBreakdown: [],
    recentMovements: [],
    stockTurnover: 0,
    warehouseUtilization: []
  })

  useEffect(() => {
    loadAnalytics()
  }, [])

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      
      // For now, using mock data - this would be replaced with actual API calls
      const mockAnalytics = {
        totalProducts: 156,
        totalValue: 125800.50,
        lowStockItems: 12,
        outOfStockItems: 3,
        topProducts: [
          { id: '1', name: 'Wireless Headphones', sales: 45, revenue: 13500 },
          { id: '2', name: 'Laptop Stand', sales: 32, revenue: 9600 },
          { id: '3', name: 'USB-C Cable', sales: 28, revenue: 840 },
          { id: '4', name: 'Phone Case', sales: 24, revenue: 1200 },
          { id: '5', name: 'Bluetooth Speaker', sales: 18, revenue: 5400 }
        ],
        categoryBreakdown: [
          { name: 'Electronics', value: 45, color: '#3b82f6' },
          { name: 'Accessories', value: 30, color: '#10b981' },
          { name: 'Hardware', value: 25, color: '#f59e0b' }
        ],
        recentMovements: [
          { id: '1', type: 'IN', product: 'Wireless Mouse', quantity: 50, date: '2025-01-18' },
          { id: '2', type: 'OUT', product: 'Laptop Stand', quantity: 5, date: '2025-01-18' },
          { id: '3', type: 'ADJUSTMENT', product: 'USB Cable', quantity: -2, date: '2025-01-17' }
        ],
        stockTurnover: 8.5,
        warehouseUtilization: [
          { name: 'Main Warehouse', utilization: 75, capacity: 1000, used: 750 },
          { name: 'Secondary Warehouse', utilization: 45, capacity: 500, used: 225 }
        ]
      }

      setAnalytics(mockAnalytics)
    } catch (error) {
      console.error('Error loading analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value)
  }

  const getMovementIcon = (type: string) => {
    switch (type) {
      case 'IN':
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'OUT':
        return <TrendingDown className="h-4 w-4 text-red-600" />
      case 'ADJUSTMENT':
        return <BarChart3 className="h-4 w-4 text-blue-600" />
      default:
        return <Package className="h-4 w-4" />
    }
  }

  const getMovementTypeColor = (type: string) => {
    switch (type) {
      case 'IN':
        return 'bg-green-100 text-green-800'
      case 'OUT':
        return 'bg-red-100 text-red-800'
      case 'ADJUSTMENT':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Inventory Analytics</h2>
          <p className="text-muted-foreground">
            Overview of your inventory performance and insights
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={loadAnalytics}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              Active inventory items
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analytics.totalValue)}</div>
            <p className="text-xs text-muted-foreground">
              Current inventory value
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{analytics.lowStockItems}</div>
            <p className="text-xs text-muted-foreground">
              Need reordering soon
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{analytics.outOfStockItems}</div>
            <p className="text-xs text-muted-foreground">
              Items unavailable
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Top Performing Products
            </CardTitle>
            <CardDescription>
              Best selling products by revenue this month
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {analytics.topProducts.map((product, index) => (
              <div key={product.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs">
                    {index + 1}
                  </Badge>
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-muted-foreground">{product.sales} sales</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatCurrency(product.revenue)}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Category Distribution
            </CardTitle>
            <CardDescription>
              Product distribution by category
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {analytics.categoryBreakdown.map((category, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{category.name}</span>
                  <span className="text-sm text-muted-foreground">{category.value}%</span>
                </div>
                <Progress value={category.value} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Movements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Recent Stock Movements
            </CardTitle>
            <CardDescription>
              Latest inventory transactions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {analytics.recentMovements.map((movement) => (
              <div key={movement.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getMovementIcon(movement.type)}
                  <div>
                    <p className="font-medium">{movement.product}</p>
                    <p className="text-sm text-muted-foreground">{movement.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getMovementTypeColor(movement.type)}>
                    {movement.type}
                  </Badge>
                  <span className="font-medium">
                    {movement.quantity > 0 ? '+' : ''}{movement.quantity}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Warehouse Utilization */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Warehouse Utilization
            </CardTitle>
            <CardDescription>
              Storage capacity usage by location
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {analytics.warehouseUtilization.map((warehouse, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{warehouse.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {warehouse.used}/{warehouse.capacity} units
                  </span>
                </div>
                <Progress value={warehouse.utilization} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {warehouse.utilization}% utilized
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Stock Turnover */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Inventory Performance
          </CardTitle>
          <CardDescription>
            Key performance indicators for inventory management
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-3xl font-bold text-blue-600">{analytics.stockTurnover}</div>
              <p className="text-sm text-muted-foreground">Stock Turnover Ratio</p>
              <p className="text-xs text-muted-foreground mt-1">
                Times inventory sold per year
              </p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-3xl font-bold text-green-600">12.5</div>
              <p className="text-sm text-muted-foreground">Days of Supply</p>
              <p className="text-xs text-muted-foreground mt-1">
                Average days of inventory on hand
              </p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-3xl font-bold text-purple-600">94.2%</div>
              <p className="text-sm text-muted-foreground">Fill Rate</p>
              <p className="text-xs text-muted-foreground mt-1">
                Orders fulfilled from stock
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
