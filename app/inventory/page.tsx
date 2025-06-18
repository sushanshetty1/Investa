'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Package, Users, TrendingUp, AlertTriangle, ArrowRight, BarChart3 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { InventoryAnalytics } from '@/components/inventory/InventoryAnalytics'

interface DashboardStats {
  totalProducts: number
  activeProducts: number
  lowStockItems: number
  outOfStockItems: number
  totalSuppliers: number
  activeSuppliers: number
  totalWarehouses: number
  totalStockValue: number
  recentMovements: number
  pendingOrders: number
}

interface RecentActivity {
  id: string
  type: 'product_created' | 'stock_adjusted' | 'supplier_added' | 'low_stock_alert'
  message: string
  timestamp: string
  severity?: 'low' | 'medium' | 'high'
}

interface TopProduct {
  id: string
  name: string
  sku: string
  currentStock: number
  value: number
  status: 'healthy' | 'low' | 'critical'
}

export default function InventoryDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    activeProducts: 0,
    lowStockItems: 0,
    outOfStockItems: 0,
    totalSuppliers: 0,
    activeSuppliers: 0,
    totalWarehouses: 0,
    totalStockValue: 0,
    recentMovements: 0,
    pendingOrders: 0
  })
    const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [topProducts, setTopProducts] = useState<TopProduct[]>([])

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      // TODO: Replace with actual API calls
      
      // Mock data for demonstration
      setStats({
        totalProducts: 1247,
        activeProducts: 1198,
        lowStockItems: 23,
        outOfStockItems: 7,
        totalSuppliers: 45,
        activeSuppliers: 42,
        totalWarehouses: 3,
        totalStockValue: 2456780,
        recentMovements: 156,
        pendingOrders: 12
      })

      setRecentActivity([
        {
          id: '1',
          type: 'low_stock_alert',
          message: 'Wireless Mouse (WM-001) is running low in Main Warehouse',
          timestamp: '2024-01-20T10:30:00Z',
          severity: 'high'
        },
        {
          id: '2',
          type: 'product_created',
          message: 'New product "Gaming Keyboard" added to catalog',
          timestamp: '2024-01-20T09:15:00Z'
        },
        {
          id: '3',
          type: 'stock_adjusted',
          message: 'Stock adjusted for Premium Laptop Stand (+50 units)',
          timestamp: '2024-01-20T08:45:00Z'
        },
        {
          id: '4',
          type: 'supplier_added',
          message: 'New supplier "TechSupply Plus" added to system',
          timestamp: '2024-01-19T16:20:00Z'
        }
      ])

      setTopProducts([
        {
          id: '1',
          name: 'Premium Laptop Stand',
          sku: 'LPS-001',
          currentStock: 125,
          value: 11237.50,
          status: 'healthy'
        },
        {
          id: '2',
          name: 'Wireless Mouse',
          sku: 'WM-001',
          currentStock: 8,
          value: 2400.00,
          status: 'low'
        },
        {
          id: '3',
          name: 'USB-C Hub',
          sku: 'UCH-001',
          currentStock: 0,
          value: 0,
          status: 'critical'
        }
      ])    } catch (error) {
      console.error('Error loading dashboard data:', error)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'product_created':
        return <Package className="h-4 w-4 text-blue-600" />
      case 'stock_adjusted':
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'supplier_added':
        return <Users className="h-4 w-4 text-purple-600" />
      case 'low_stock_alert':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      default:
        return <Package className="h-4 w-4 text-gray-600" />
    }
  }

  const getSeverityBadge = (severity?: string) => {
    if (!severity) return null
    
    const variants = {
      low: 'secondary',
      medium: 'outline',
      high: 'destructive'
    } as const

    return (
      <Badge variant={variants[severity as keyof typeof variants]}>
        {severity.toUpperCase()}
      </Badge>
    )
  }

  const getStockStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600'
      case 'low':
        return 'text-yellow-600'
      case 'critical':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const stockHealthPercentage = stats.totalProducts > 0 
    ? ((stats.totalProducts - stats.lowStockItems - stats.outOfStockItems) / stats.totalProducts) * 100 
    : 0

  return (
    <div className="py-8 px-6 mx-4 md:mx-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Inventory Management</h1>
          <p className="text-muted-foreground">
            Overview of your inventory, suppliers, and stock levels
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/inventory/products">
              <Package className="h-4 w-4 mr-2" />
              Manage Products
            </Link>
          </Button>
        </div>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeProducts} active • {stats.totalProducts - stats.activeProducts} inactive
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Health</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stockHealthPercentage.toFixed(1)}%</div>
            <div className="mt-2">
              <Progress value={stockHealthPercentage} className="h-2" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {stats.lowStockItems} low stock • {stats.outOfStockItems} out of stock
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Value</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalStockValue)}</div>
            <p className="text-xs text-muted-foreground">
              Across {stats.totalWarehouses} warehouses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Suppliers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeSuppliers}</div>
            <p className="text-xs text-muted-foreground">
              {stats.pendingOrders} pending orders
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common inventory management tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button asChild variant="outline" className="h-auto p-4">
              <Link href="/inventory/products" className="flex flex-col items-start space-y-2">
                <Package className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">Manage Products</div>
                  <div className="text-sm text-muted-foreground">Add, edit, and organize products</div>
                </div>
                <ArrowRight className="h-4 w-4 ml-auto" />
              </Link>
            </Button>

            <Button asChild variant="outline" className="h-auto p-4">
              <Link href="/inventory/stock" className="flex flex-col items-start space-y-2">
                <TrendingUp className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">Stock Management</div>
                  <div className="text-sm text-muted-foreground">Track and adjust inventory levels</div>
                </div>
                <ArrowRight className="h-4 w-4 ml-auto" />
              </Link>
            </Button>

            <Button asChild variant="outline" className="h-auto p-4">
              <Link href="/inventory/suppliers" className="flex flex-col items-start space-y-2">
                <Users className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">Supplier Management</div>
                  <div className="text-sm text-muted-foreground">Manage supplier relationships</div>
                </div>
                <ArrowRight className="h-4 w-4 ml-auto" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest inventory movements and updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className="mt-1">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{activity.message}</p>
                      {getSeverityBadge(activity.severity)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(activity.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t">
              <Button variant="outline" size="sm" asChild className="w-full">
                <Link href="/inventory/activity">
                  View All Activity
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stock Alerts */}
        <Card>
          <CardHeader>
            <CardTitle>Stock Alerts</CardTitle>
            <CardDescription>
              Products requiring attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium truncate">{product.name}</p>
                      <Badge variant="outline" className="text-xs">
                        {product.sku}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Stock: <span className={getStockStatusColor(product.status)}>
                        {product.currentStock} units
                      </span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{formatCurrency(product.value)}</p>
                    <Badge 
                      variant={product.status === 'critical' ? 'destructive' : 
                              product.status === 'low' ? 'outline' : 'secondary'}
                      className="text-xs"
                    >
                      {product.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t">
              <Button variant="outline" size="sm" asChild className="w-full">
                <Link href="/inventory/stock">
                  Manage Stock Levels
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>      {/* Alerts Section */}
      {(stats.lowStockItems > 0 || stats.outOfStockItems > 0) && (
        <Card className="border-yellow-200 bg-yellow-50/50 dark:border-yellow-800 dark:bg-yellow-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
              <AlertTriangle className="h-5 w-5" />
              Inventory Alerts
            </CardTitle>
            <CardDescription>
              Items that need immediate attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {stats.lowStockItems > 0 && (
                <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-900 rounded-lg">
                  <div>
                    <p className="font-medium">Low Stock Items</p>
                    <p className="text-sm text-muted-foreground">
                      {stats.lowStockItems} products below minimum level
                    </p>
                  </div>
                  <Button size="sm" asChild>
                    <Link href="/inventory/stock?alertsOnly=true">
                      Review
                    </Link>
                  </Button>
                </div>
              )}
              
              {stats.outOfStockItems > 0 && (
                <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-900 rounded-lg">
                  <div>
                    <p className="font-medium">Out of Stock</p>
                    <p className="text-sm text-muted-foreground">
                      {stats.outOfStockItems} products need restocking
                    </p>
                  </div>
                  <Button size="sm" variant="destructive" asChild>
                    <Link href="/inventory/stock?status=out-of-stock">
                      Restock
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analytics Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Analytics & Insights</h2>
            <p className="text-muted-foreground">
              Detailed analytics and performance metrics for your inventory
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/inventory/analytics">
              <BarChart3 className="h-4 w-4 mr-2" />
              Full Analytics
            </Link>
          </Button>
        </div>
        
        <InventoryAnalytics />
      </div>
    </div>
  )
}
