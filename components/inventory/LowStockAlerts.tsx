'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Package, TrendingDown } from 'lucide-react'

interface StockAlert {
  id: string
  type: 'LOW_STOCK' | 'OUT_OF_STOCK' | 'OVERSTOCK' | 'EXPIRING'
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  productId: string
  productName: string
  productSku: string
  variantId?: string
  variantName?: string
  warehouseId: string
  warehouseName: string
  currentQuantity: number
  minimumLevel?: number
  maximumLevel?: number
  reorderPoint?: number
  expiryDate?: string
  daysToExpiry?: number
  message: string
  createdAt: string
  requiresAction: boolean
}

interface LowStockAlertsProps {
  alerts: StockAlert[]
}

export function LowStockAlerts({ alerts }: LowStockAlertsProps) {
  const criticalAlerts = alerts.filter(alert => alert.severity === 'CRITICAL')
  const highPriorityAlerts = alerts.filter(alert => alert.severity === 'HIGH')
  const mediumPriorityAlerts = alerts.filter(alert => alert.severity === 'MEDIUM')
  const lowPriorityAlerts = alerts.filter(alert => alert.severity === 'LOW')

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'LOW_STOCK':
        return <TrendingDown className="h-4 w-4" />
      case 'OUT_OF_STOCK':
        return <AlertTriangle className="h-4 w-4" />
      case 'OVERSTOCK':
        return <Package className="h-4 w-4" />
      case 'EXPIRING':
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <AlertTriangle className="h-4 w-4" />
    }
  }
  // Utility function to get alert variant - currently unused, removing to avoid ESLint error
  // const getAlertVariant = (priority: string) => {
  //   switch (priority) {
  //     case 'HIGH':
  //       return 'destructive'
  //     case 'MEDIUM':
  //       return 'default'
  //     case 'LOW':
  //       return 'secondary'
  //     default:
  //       return 'default'
  //   }
  // }

  if (alerts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-green-600" />
            Stock Alerts
          </CardTitle>
          <CardDescription>No stock alerts at this time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            All stock levels are within normal ranges
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-yellow-600" />
          Stock Alerts ({alerts.length})
        </CardTitle>
        <CardDescription>
          Items requiring attention
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* High Priority Alerts */}
        {highPriorityAlerts.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="destructive">High Priority</Badge>
              <span className="text-sm text-muted-foreground">
                {highPriorityAlerts.length} alerts
              </span>
            </div>
            {highPriorityAlerts.map((alert) => (<Alert key={alert.id} variant="destructive">
              <div className="flex items-center gap-2">
                {getAlertIcon(alert.type)}
                <AlertTitle className="text-sm">
                  {alert.productName} - {alert.warehouseName}
                </AlertTitle>
              </div>
              <AlertDescription className="mt-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium">{alert.type.replace('_', ' ')}</span>
                    <span className="text-muted-foreground ml-2">
                      Current: {alert.currentQuantity} | Min: {alert.minimumLevel || 'N/A'}
                    </span>
                  </div>
                  <Button size="sm" variant="outline">
                    Resolve
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
            ))}
          </div>
        )}

        {/* Medium Priority Alerts */}
        {mediumPriorityAlerts.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="default">Medium Priority</Badge>
              <span className="text-sm text-muted-foreground">
                {mediumPriorityAlerts.length} alerts
              </span>
            </div>
            {mediumPriorityAlerts.slice(0, 3).map((alert) => (
              <Alert key={alert.id}>                <div className="flex items-center gap-2">
                {getAlertIcon(alert.type)}
                <AlertTitle className="text-sm">
                  {alert.productName} - {alert.warehouseName}
                </AlertTitle>
              </div>
                <AlertDescription className="mt-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium">{alert.type.replace('_', ' ')}</span>
                      <span className="text-muted-foreground ml-2">
                        Current: {alert.currentQuantity} | Min: {alert.minimumLevel || 'N/A'}
                      </span>
                    </div>
                    <Button size="sm" variant="outline">
                      Resolve
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            ))}
            {mediumPriorityAlerts.length > 3 && (
              <div className="text-center">
                <Button variant="outline" size="sm">
                  View {mediumPriorityAlerts.length - 3} more medium priority alerts
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Low Priority Alerts Summary */}
        {lowPriorityAlerts.length > 0 && (
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Low Priority</Badge>
                <span className="text-sm text-muted-foreground">
                  {lowPriorityAlerts.length} alerts
                </span>
              </div>
              <Button variant="outline" size="sm">
                View All
              </Button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-4 border-t">
          <Button size="sm">
            Create Purchase Orders
          </Button>
          <Button variant="outline" size="sm">
            Export Alert Report
          </Button>
          <Button variant="outline" size="sm">
            Bulk Resolve
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
