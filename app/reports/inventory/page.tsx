"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { 
  TrendingUp, 
  TrendingDown,
  Download,
  RefreshCw,
  AlertTriangle,
  Clock,
  Target,
  Activity,
  DollarSign
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { Progress } from "@/components/ui/progress";
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell
} from "recharts";

// Mock data for charts and analytics
const stockMovementData = [
  { date: '2024-06-01', inbound: 450, outbound: 320, net: 130, stock: 2450 },
  { date: '2024-06-02', inbound: 380, outbound: 420, net: -40, stock: 2410 },
  { date: '2024-06-03', inbound: 520, outbound: 380, net: 140, stock: 2550 },
  { date: '2024-06-04', inbound: 290, outbound: 450, net: -160, stock: 2390 },
  { date: '2024-06-05', inbound: 610, outbound: 320, net: 290, stock: 2680 },
  { date: '2024-06-06', inbound: 340, outbound: 490, net: -150, stock: 2530 },
  { date: '2024-06-07', inbound: 480, outbound: 380, net: 100, stock: 2630 },
];

const abcAnalysisData = [
  { category: 'A (High Value)', items: 45, percentage: 15, value: 850000, color: '#ef4444' },
  { category: 'B (Medium Value)', items: 90, percentage: 30, value: 450000, color: '#f59e0b' },
  { category: 'C (Low Value)', items: 165, percentage: 55, value: 120000, color: '#10b981' },
];

const inventoryAgingData = [
  { range: '0-30 days', quantity: 1250, value: 425000, percentage: 68 },
  { range: '31-60 days', quantity: 380, value: 145000, percentage: 21 },
  { range: '61-90 days', quantity: 150, value: 58000, percentage: 8 },
  { range: '91+ days', quantity: 70, value: 22000, percentage: 3 },
];

const forecastData = [
  { month: 'Jan', actual: 2450, predicted: 2400, demand: 2380 },
  { month: 'Feb', actual: 2620, predicted: 2580, demand: 2650 },
  { month: 'Mar', actual: 2380, predicted: 2420, demand: 2350 },
  { month: 'Apr', actual: 2750, predicted: 2720, demand: 2800 },
  { month: 'May', actual: 2580, predicted: 2600, demand: 2520 },
  { month: 'Jun', actual: null, predicted: 2650, demand: 2700 },
  { month: 'Jul', actual: null, predicted: 2720, demand: 2750 },
];

const topMovingItems = [
  { id: 1, name: 'Wireless Headphones Pro', sku: 'WH-001', velocity: 85, stock: 120, reorderPoint: 50, status: 'normal' },
  { id: 2, name: 'Smart Fitness Tracker', sku: 'FT-205', velocity: 78, stock: 45, reorderPoint: 60, status: 'low' },
  { id: 3, name: 'Bluetooth Speaker', sku: 'BS-102', velocity: 72, stock: 89, reorderPoint: 40, status: 'normal' },
  { id: 4, name: 'USB-C Cable 2m', sku: 'CB-301', velocity: 68, stock: 25, reorderPoint: 30, status: 'critical' },
  { id: 5, name: 'Laptop Stand Adjustable', sku: 'LS-404', velocity: 64, stock: 156, reorderPoint: 80, status: 'normal' },
];

const slowMovingItems = [
  { id: 1, name: 'Legacy Monitor 19"', sku: 'LM-901', daysInStock: 180, stock: 15, lastSold: '2024-03-15' },
  { id: 2, name: 'Old Router Model', sku: 'OR-702', daysInStock: 150, stock: 8, lastSold: '2024-04-02' },
  { id: 3, name: 'Discontinued Keyboard', sku: 'DK-503', daysInStock: 120, stock: 22, lastSold: '2024-04-20' },
  { id: 4, name: 'VGA Adapter', sku: 'VA-205', daysInStock: 95, stock: 35, lastSold: '2024-05-10' },
];

export default function InventoryAnalyticsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [selectedDateRange, setSelectedDateRange] = useState("30d");
  const [selectedWarehouse, setSelectedWarehouse] = useState("all");
  const [analyticsData, setAnalyticsData] = useState<Record<string, unknown> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch analytics data
  useEffect(() => {
    async function fetchAnalyticsData() {
      try {
        setIsLoading(true);
        const [statsRes, movementsRes, abcRes, agingRes, forecastRes] = await Promise.all([
          fetch(`/api/analytics/inventory/stats?dateRange=${selectedDateRange}&warehouse=${selectedWarehouse}`),
          fetch(`/api/analytics/inventory/movements?dateRange=${selectedDateRange}&warehouse=${selectedWarehouse}`),
          fetch(`/api/analytics/inventory/abc-analysis?warehouse=${selectedWarehouse}`),
          fetch(`/api/analytics/inventory/aging?warehouse=${selectedWarehouse}`),
          fetch(`/api/analytics/inventory/forecast?warehouse=${selectedWarehouse}`)
        ]);

        const [stats, movements, abc, aging, forecast] = await Promise.all([
          statsRes.json(),
          movementsRes.json(),
          abcRes.json(),
          agingRes.json(),
          forecastRes.json()
        ]);

        setAnalyticsData({ stats, movements, abc, aging, forecast });
      } catch (error) {
        console.error('Error fetching analytics data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    if (user) {
      fetchAnalyticsData();
    }
  }, [user, selectedDateRange, selectedWarehouse]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);
  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }
  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Inventory Analytics</h1>
          <p className="text-muted-foreground">
            Comprehensive inventory analysis and insights
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedWarehouse} onValueChange={setSelectedWarehouse}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Warehouses</SelectItem>
              <SelectItem value="main">Main Warehouse</SelectItem>
              <SelectItem value="secondary">Secondary Warehouse</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedDateRange} onValueChange={setSelectedDateRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Stock Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(analyticsData as Record<string, any>)?.stats?.data?.stats?.totalStockValue?.value?.toLocaleString() || '1,420,000'}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className={`flex items-center ${
                ((analyticsData as Record<string, any>)?.stats?.data?.stats?.totalStockValue?.trend || 'up') === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {((analyticsData as Record<string, any>)?.stats?.data?.stats?.totalStockValue?.trend || 'up') === 'up' ? (
                  <TrendingUp className="w-3 h-3 mr-1" />
                ) : (
                  <TrendingDown className="w-3 h-3 mr-1" />
                )}
                +{(analyticsData as Record<string, any>)?.stats?.data?.stats?.totalStockValue?.change || 5.2}%
              </span>
              from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Turnover</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(analyticsData as Record<string, any>)?.stats?.data?.stats?.stockTurnover?.value || 6.8}x
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600 flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                +{(analyticsData as Record<string, any>)?.stats?.data?.stats?.stockTurnover?.change || 0.3}x
              </span>
              from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Days on Hand</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(analyticsData as Record<string, any>)?.stats?.data?.stats?.daysOnHand?.value || 53.7}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-red-600 flex items-center">
                <TrendingDown className="w-3 h-3 mr-1" />
                {(analyticsData as Record<string, any>)?.stats?.data?.stats?.daysOnHand?.change || -2.1} days
              </span>
              improvement
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stockout Risk</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(analyticsData as Record<string, any>)?.stats?.data?.stats?.stockoutRisk?.value || 12}
            </div>
            <p className="text-xs text-muted-foreground">
              Items below reorder point
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="movements" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="movements">Stock Movements</TabsTrigger>
          <TabsTrigger value="abc">ABC Analysis</TabsTrigger>
          <TabsTrigger value="aging">Inventory Aging</TabsTrigger>
          <TabsTrigger value="forecast">Forecasting</TabsTrigger>
        </TabsList>

        {/* Stock Movement Reports */}
        <TabsContent value="movements" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Stock Movement Trends</CardTitle>
                <CardDescription>Daily inbound vs outbound movements</CardDescription>
              </CardHeader>              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={(analyticsData as Record<string, any>)?.movements?.data?.movements || stockMovementData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(value) => new Date(value).toLocaleDateString()}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="inbound" 
                      stackId="1"
                      stroke="#10b981" 
                      fill="#10b981"
                      fillOpacity={0.6}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="outbound" 
                      stackId="2"
                      stroke="#ef4444" 
                      fill="#ef4444"
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Net Stock Changes</CardTitle>
                <CardDescription>Running stock levels with net changes</CardDescription>
              </CardHeader>              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={(analyticsData as Record<string, any>)?.movements?.data?.movements || stockMovementData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Bar yAxisId="left" dataKey="net" fill="#3b82f6" />
                    <Line 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="stock" 
                      stroke="#8b5cf6" 
                      strokeWidth={3}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Moving Items</CardTitle>
                <CardDescription>Highest velocity products</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topMovingItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-muted-foreground">{item.sku}</div>
                      </div>
                      <div className="text-right space-y-1">
                        <div className="font-medium">{item.velocity}% velocity</div>
                        <Badge variant={
                          item.status === 'critical' ? 'destructive' : 
                          item.status === 'low' ? 'secondary' : 'default'
                        }>
                          {item.stock} in stock
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Slow Moving Items</CardTitle>
                <CardDescription>Items with low turnover</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {slowMovingItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-muted-foreground">{item.sku}</div>
                      </div>
                      <div className="text-right space-y-1">
                        <div className="text-sm font-medium">{item.daysInStock} days</div>
                        <div className="text-xs text-muted-foreground">
                          Last sold: {new Date(item.lastSold).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ABC Analysis */}
        <TabsContent value="abc" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>ABC Distribution</CardTitle>
                <CardDescription>Inventory value distribution by category</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={abcAnalysisData}
                      dataKey="value"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({category, percentage}) => `${category}: ${percentage}%`}
                    >
                      {abcAnalysisData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Value']} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>ABC Categories Detail</CardTitle>
                <CardDescription>Detailed breakdown by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {abcAnalysisData.map((category, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: category.color }}
                          />
                          <span className="font-medium">{category.category}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {category.items} items
                        </span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Value: ${category.value.toLocaleString()}</span>
                          <span>{category.percentage}% of total</span>
                        </div>
                        <Progress value={category.percentage} className="h-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>ABC Strategy Recommendations</CardTitle>
              <CardDescription>Management strategies for each category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full" />
                    <h4 className="font-semibold">Category A (High Value)</h4>
                  </div>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Tight inventory control</li>
                    <li>• Frequent monitoring</li>
                    <li>• Just-in-time ordering</li>
                    <li>• Accurate forecasting</li>
                  </ul>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                    <h4 className="font-semibold">Category B (Medium Value)</h4>
                  </div>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Moderate control</li>
                    <li>• Regular monitoring</li>
                    <li>• Safety stock buffer</li>
                    <li>• Periodic review</li>
                  </ul>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full" />
                    <h4 className="font-semibold">Category C (Low Value)</h4>
                  </div>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Basic control</li>
                    <li>• Bulk ordering</li>
                    <li>• Larger safety stocks</li>
                    <li>• Simple systems</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Inventory Aging */}
        <TabsContent value="aging" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Inventory Age Distribution</CardTitle>
                <CardDescription>Stock aging by time periods</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={inventoryAgingData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="quantity" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Aging Value Analysis</CardTitle>
                <CardDescription>Financial impact of aged inventory</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {inventoryAgingData.map((range, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{range.range}</span>
                        <span className="text-sm font-medium">
                          ${range.value.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{range.quantity} items</span>
                        <span>{range.percentage}% of total</span>
                      </div>
                      <Progress value={range.percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Aging Analysis Insights</CardTitle>
              <CardDescription>Key findings and recommendations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-500" />
                    Risk Areas
                  </h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex justify-between">
                      <span>Items over 90 days:</span>
                      <Badge variant="destructive">70 items</Badge>
                    </li>
                    <li className="flex justify-between">
                      <span>High-value aged items:</span>
                      <Badge variant="secondary">$22,000</Badge>
                    </li>
                    <li className="flex justify-between">
                      <span>Potential obsolescence:</span>
                      <Badge variant="outline">15 items</Badge>
                    </li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Target className="w-4 h-4 text-green-500" />
                    Action Items
                  </h4>
                  <ul className="space-y-2 text-sm">
                    <li>• Review pricing strategy for aged items</li>
                    <li>• Consider promotional campaigns</li>
                    <li>• Evaluate supplier relationships</li>
                    <li>• Implement aging alerts</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Forecasting & Demand Planning */}
        <TabsContent value="forecast" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Demand Forecasting</CardTitle>
              <CardDescription>Predicted vs actual demand patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={forecastData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="actual" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    name="Actual"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="predicted" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Predicted"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="demand" 
                    stroke="#ef4444" 
                    strokeWidth={2}
                    name="Market Demand"
                  />
                </LineChart>
              </ResponsiveContainer>
              <div className="flex items-center justify-center gap-6 mt-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-0.5 bg-green-500"></div>
                  <span>Actual</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-0.5 bg-blue-500 border-dashed border-blue-500"></div>
                  <span>Predicted</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-0.5 bg-red-500"></div>
                  <span>Market Demand</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Forecast Accuracy</CardTitle>
                <CardDescription>Model performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Overall Accuracy</span>
                    <span className="font-semibold">87.3%</span>
                  </div>
                  <Progress value={87.3} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <span>Mean Absolute Error</span>
                    <span className="font-semibold">4.2%</span>
                  </div>
                  <Progress value={4.2} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <span>Trend Accuracy</span>
                    <span className="font-semibold">91.8%</span>
                  </div>
                  <Progress value={91.8} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Planning Recommendations</CardTitle>
                <CardDescription>Suggested actions based on forecast</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      <span className="font-medium text-green-800">Increase Orders</span>
                    </div>
                    <p className="text-sm text-green-700">
                      July forecast shows 15% demand increase. Consider increasing orders by 12%.
                    </p>
                  </div>
                  
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle className="w-4 h-4 text-yellow-600" />
                      <span className="font-medium text-yellow-800">Monitor Closely</span>
                    </div>
                    <p className="text-sm text-yellow-700">
                      Seasonal variation detected. Track performance weekly during peak period.
                    </p>
                  </div>
                  
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span className="font-medium text-blue-800">Lead Time Adjustment</span>
                    </div>
                    <p className="text-sm text-blue-700">
                      Consider reducing lead times for fast-moving items to improve service levels.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>      </Tabs>
      </div>
    </div>
  );
}
