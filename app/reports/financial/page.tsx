"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import {
  TrendingUp,
  TrendingDown,
  Calculator,
  Download,
  RefreshCw,
  Target,
  Activity,
  Percent,
  Package
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
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  ComposedChart
} from "recharts";

// Mock data for financial analytics
const inventoryValuationData = [
  { month: 'Jan', fifo: 1250000, lifo: 1230000, weighted: 1240000 },
  { month: 'Feb', fifo: 1340000, lifo: 1315000, weighted: 1327500 },
  { month: 'Mar', fifo: 1280000, lifo: 1255000, weighted: 1267500 },
  { month: 'Apr', fifo: 1420000, lifo: 1385000, weighted: 1402500 },
  { month: 'May', fifo: 1380000, lifo: 1350000, weighted: 1365000 },
  { month: 'Jun', fifo: 1450000, lifo: 1410000, weighted: 1430000 },
];

const cogsData = [
  { month: 'Jan', cogs: 450000, revenue: 720000, margin: 37.5 },
  { month: 'Feb', cogs: 520000, revenue: 840000, margin: 38.1 },
  { month: 'Mar', cogs: 480000, revenue: 750000, margin: 36.0 },
  { month: 'Apr', cogs: 610000, revenue: 980000, margin: 37.8 },
  { month: 'May', cogs: 580000, revenue: 920000, margin: 37.0 },
  { month: 'Jun', cogs: 650000, revenue: 1050000, margin: 38.1 },
];

const profitMarginData = [
  { category: 'Electronics', revenue: 450000, cogs: 270000, margin: 40.0 },
  { category: 'Accessories', revenue: 180000, cogs: 90000, margin: 50.0 },
  { category: 'Software', revenue: 120000, cogs: 36000, margin: 70.0 },
  { category: 'Hardware', revenue: 300000, cogs: 210000, margin: 30.0 },
  { category: 'Services', revenue: 80000, cogs: 32000, margin: 60.0 },
];

const purchaseVsSalesData = [
  { month: 'Jan', purchases: 520000, sales: 720000, ratio: 1.38 },
  { month: 'Feb', purchases: 680000, sales: 840000, ratio: 1.24 },
  { month: 'Mar', purchases: 580000, sales: 750000, ratio: 1.29 },
  { month: 'Apr', purchases: 750000, sales: 980000, ratio: 1.31 },
  { month: 'May', purchases: 620000, sales: 920000, ratio: 1.48 },
  { month: 'Jun', purchases: 780000, sales: 1050000, ratio: 1.35 },
];

const topValueCategories = [
  { category: 'Premium Electronics', value: 580000, percentage: 32.4, trend: 'up' },
  { category: 'Computer Hardware', value: 420000, percentage: 23.5, trend: 'up' },
  { category: 'Mobile Accessories', value: 280000, percentage: 15.6, trend: 'down' },
  { category: 'Audio Equipment', value: 240000, percentage: 13.4, trend: 'up' },
  { category: 'Gaming Products', value: 180000, percentage: 10.1, trend: 'stable' },
  { category: 'Other', value: 90000, percentage: 5.0, trend: 'stable' },
];

const profitabilityAnalysis = [
  { product: 'Wireless Headphones Pro', revenue: 45000, cogs: 22500, margin: 50.0, units: 150 },
  { product: 'Smart Fitness Tracker', revenue: 38000, cogs: 22800, margin: 40.0, units: 190 },
  { product: 'Bluetooth Speaker', revenue: 32000, cogs: 20800, margin: 35.0, units: 160 },
  { product: 'Laptop Stand Adjustable', revenue: 28000, cogs: 14000, margin: 50.0, units: 280 },
  { product: 'USB-C Cable 2m', revenue: 15000, cogs: 7500, margin: 50.0, units: 750 },
];

export default function FinancialReportsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [selectedDateRange, setSelectedDateRange] = useState("6m");
  const [selectedCurrency] = useState("USD");
  const [valuationMethod, setValuationMethod] = useState("fifo");
  const [financialData, setFinancialData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch financial data
  useEffect(() => {
    async function fetchFinancialData() {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/analytics/financial/metrics?dateRange=${selectedDateRange}&warehouse=all`);
        const data = await response.json();
        setFinancialData(data);
      } catch (error) {
        console.error('Error fetching financial data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    if (user) {
      fetchFinancialData();
    }
  }, [user, selectedDateRange]);

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
            <h1 className="text-3xl font-bold">Financial Reports</h1>
            <p className="text-muted-foreground">
              Comprehensive financial analysis and inventory valuation
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={valuationMethod} onValueChange={setValuationMethod}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fifo">FIFO</SelectItem>
                <SelectItem value="lifo">LIFO</SelectItem>
                <SelectItem value="weighted">Weighted Avg</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedDateRange} onValueChange={setSelectedDateRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3m">Last 3 months</SelectItem>
                <SelectItem value="6m">Last 6 months</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
                <SelectItem value="2y">Last 2 years</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>      {/* Key Financial Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Inventory Value</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${(financialData?.data.metrics.cogs.value * 2.2 || 1450000).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +8.2%
                </span>
                from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gross Margin</CardTitle>
              <Percent className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {financialData?.data.metrics.grossMargin.value || 38.1}%
              </div>
              <p className="text-xs text-muted-foreground">
                <span className={`flex items-center ${(financialData?.data.metrics.grossMargin.trend || 'up') === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                  {(financialData?.data.metrics.grossMargin.trend || 'up') === 'up' ? (
                    <TrendingUp className="w-3 h-3 mr-1" />
                  ) : (
                    <TrendingDown className="w-3 h-3 mr-1" />
                  )}
                  +{financialData?.data.metrics.grossMargin.change || 1.2}%
                </span>
                improvement
              </p>
            </CardContent>
          </Card>        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">COGS</CardTitle>
              <Calculator className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${financialData?.data.metrics.cogs.value.toLocaleString() || '650,000'}
              </div>
              <p className="text-xs text-muted-foreground">
                <span className={`flex items-center ${(financialData?.data.metrics.cogs.trend || 'up') === 'up' ? 'text-red-600' : 'text-green-600'
                  }`}>
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +{financialData?.data.metrics.cogs.change || 12.1}%
                </span>
                from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inventory ROI</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {financialData?.data.metrics.roi.value || 24.7}%
              </div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +{financialData?.data.metrics.roi.change || 2.3}%
                </span>
                annual improvement
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Financial Reports Tabs */}
        <Tabs defaultValue="valuation" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="valuation">Inventory Valuation</TabsTrigger>
            <TabsTrigger value="cogs">COGS Analysis</TabsTrigger>
            <TabsTrigger value="margins">Profit Margins</TabsTrigger>
            <TabsTrigger value="analytics">Purchase Analytics</TabsTrigger>
          </TabsList>

          {/* Inventory Valuation Reports */}
          <TabsContent value="valuation" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Inventory Valuation Trends</CardTitle>
                <CardDescription>Comparison of valuation methods over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={inventoryValuationData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => `$${(value / 1000)}K`} />
                    <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, '']} />
                    <Line
                      type="monotone"
                      dataKey="fifo"
                      stroke="#10b981"
                      strokeWidth={3}
                      name="FIFO"
                    />
                    <Line
                      type="monotone"
                      dataKey="lifo"
                      stroke="#ef4444"
                      strokeWidth={3}
                      name="LIFO"
                    />
                    <Line
                      type="monotone"
                      dataKey="weighted"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      name="Weighted Average"
                    />
                  </LineChart>
                </ResponsiveContainer>
                <div className="flex items-center justify-center gap-6 mt-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-0.5 bg-green-500"></div>
                    <span>FIFO</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-0.5 bg-red-500"></div>
                    <span>LIFO</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-0.5 bg-blue-500"></div>
                    <span>Weighted Average</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Valuation Method Comparison</CardTitle>
                  <CardDescription>Current month differences</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">FIFO (First In, First Out)</div>
                        <div className="text-sm text-muted-foreground">Higher inflation periods</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600">$1,450,000</div>
                        <div className="text-sm text-muted-foreground">+2.8% vs LIFO</div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">LIFO (Last In, First Out)</div>
                        <div className="text-sm text-muted-foreground">Tax advantages</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-red-600">$1,410,000</div>
                        <div className="text-sm text-muted-foreground">Base method</div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">Weighted Average</div>
                        <div className="text-sm text-muted-foreground">Smoothed values</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-blue-600">$1,430,000</div>
                        <div className="text-sm text-muted-foreground">+1.4% vs LIFO</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Category Value Breakdown</CardTitle>
                  <CardDescription>Inventory value by category</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={topValueCategories}
                        dataKey="value"
                        nameKey="category"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={({ category, percentage }) => `${percentage}%`}
                      >
                        {topValueCategories.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={`hsl(${index * 60}, 70%, 50%)`} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Value']} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* COGS Analysis */}
          <TabsContent value="cogs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Cost of Goods Sold Trends</CardTitle>
                <CardDescription>COGS vs Revenue with margin analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <ComposedChart data={cogsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" tickFormatter={(value) => `$${(value / 1000)}K`} />
                    <YAxis yAxisId="right" orientation="right" tickFormatter={(value) => `${value}%`} />
                    <Tooltip />
                    <Bar yAxisId="left" dataKey="cogs" fill="#ef4444" name="COGS" />
                    <Bar yAxisId="left" dataKey="revenue" fill="#10b981" name="Revenue" />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="margin"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      name="Gross Margin %"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>COGS Breakdown</CardTitle>
                  <CardDescription>Cost components analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Direct Materials</span>
                      <span className="font-semibold">$390,000 (60%)</span>
                    </div>
                    <Progress value={60} className="h-2" />

                    <div className="flex justify-between items-center">
                      <span>Direct Labor</span>
                      <span className="font-semibold">$130,000 (20%)</span>
                    </div>
                    <Progress value={20} className="h-2" />

                    <div className="flex justify-between items-center">
                      <span>Manufacturing Overhead</span>
                      <span className="font-semibold">$91,000 (14%)</span>
                    </div>
                    <Progress value={14} className="h-2" />

                    <div className="flex justify-between items-center">
                      <span>Other Costs</span>
                      <span className="font-semibold">$39,000 (6%)</span>
                    </div>
                    <Progress value={6} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>COGS Performance Metrics</CardTitle>
                  <CardDescription>Key efficiency indicators</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-3 border rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">COGS as % of Revenue</span>
                        <Badge variant="secondary">61.9%</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Target: &lt;60% | Previous: 63.0%
                      </div>
                    </div>

                    <div className="p-3 border rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">YoY COGS Growth</span>
                        <Badge variant="outline">+12.5%</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Revenue growth: +18.2%
                      </div>
                    </div>

                    <div className="p-3 border rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">Inventory Turns</span>
                        <Badge variant="default">4.8x</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Industry average: 4.2x
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Profit Margin Analysis */}
          <TabsContent value="margins" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Margin by Category</CardTitle>
                  <CardDescription>Profitability across product categories</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={profitMarginData} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" tickFormatter={(value) => `${value}%`} />
                      <YAxis type="category" dataKey="category" width={80} />
                      <Tooltip formatter={(value) => [`${value}%`, 'Margin']} />
                      <Bar dataKey="margin" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Profitable Products</CardTitle>
                  <CardDescription>Highest margin products</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {profitabilityAnalysis.map((product, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium">{product.product}</div>
                          <div className="text-sm text-muted-foreground">
                            {product.units} units sold
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{product.margin}%</div>
                          <div className="text-sm text-muted-foreground">
                            ${product.revenue.toLocaleString()} revenue
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Margin Analysis Insights</CardTitle>
                <CardDescription>Profitability trends and recommendations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-green-600">High Performers</h4>
                    <ul className="space-y-2 text-sm">
                      <li>• Software products: 70% margin</li>
                      <li>• Services: 60% margin</li>
                      <li>• Accessories: 50% margin</li>
                      <li>• Premium items performing well</li>
                    </ul>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-semibold text-yellow-600">Opportunities</h4>
                    <ul className="space-y-2 text-sm">
                      <li>• Review hardware pricing</li>
                      <li>• Negotiate better supplier terms</li>
                      <li>• Bundle low-margin items</li>
                      <li>• Focus on high-margin categories</li>
                    </ul>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-semibold text-red-600">Action Items</h4>
                    <ul className="space-y-2 text-sm">
                      <li>• Discontinue low-margin products</li>
                      <li>• Implement dynamic pricing</li>
                      <li>• Optimize product mix</li>
                      <li>• Regular margin reviews</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Purchase vs Sales Analytics */}
          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Purchase vs Sales Analysis</CardTitle>
                <CardDescription>Buying patterns and sales correlation</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <ComposedChart data={purchaseVsSalesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" tickFormatter={(value) => `$${(value / 1000)}K`} />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Bar yAxisId="left" dataKey="purchases" fill="#3b82f6" name="Purchases" />
                    <Bar yAxisId="left" dataKey="sales" fill="#10b981" name="Sales" />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="ratio"
                      stroke="#ef4444"
                      strokeWidth={3}
                      name="Sales/Purchase Ratio"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Purchase Efficiency Metrics</CardTitle>
                  <CardDescription>Key performance indicators</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Average Purchase Ratio</span>
                      <Badge variant="default">1.34x</Badge>
                    </div>
                    <Progress value={67} className="h-2" />

                    <div className="flex justify-between items-center">
                      <span>Purchase Lead Time</span>
                      <Badge variant="secondary">12.5 days</Badge>
                    </div>
                    <Progress value={75} className="h-2" />

                    <div className="flex justify-between items-center">
                      <span>Order Fulfillment Rate</span>
                      <Badge variant="default">94.2%</Badge>
                    </div>
                    <Progress value={94.2} className="h-2" />

                    <div className="flex justify-between items-center">
                      <span>Supplier Performance</span>
                      <Badge variant="default">91.8%</Badge>
                    </div>
                    <Progress value={91.8} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Purchase Optimization</CardTitle>
                  <CardDescription>Recommendations for better efficiency</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <TrendingUp className="w-4 h-4 text-blue-600" />
                        <span className="font-medium text-blue-800">Volume Discounts</span>
                      </div>
                      <p className="text-sm text-blue-700">
                        Consolidate purchases to achieve 15% volume discounts on electronics.
                      </p>
                    </div>

                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Target className="w-4 h-4 text-green-600" />
                        <span className="font-medium text-green-800">Timing Optimization</span>
                      </div>
                      <p className="text-sm text-green-700">
                        Shift 20% of purchases to Q1 for better seasonal pricing.
                      </p>
                    </div>

                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Activity className="w-4 h-4 text-yellow-600" />
                        <span className="font-medium text-yellow-800">Supplier Diversification</span>
                      </div>
                      <p className="text-sm text-yellow-700">
                        Add 2-3 alternative suppliers to reduce dependency and improve terms.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Financial Summary</CardTitle>
                <CardDescription>Overall financial performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600">$1.45M</div>
                    <div className="text-sm text-muted-foreground">Total Inventory Value</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">38.1%</div>
                    <div className="text-sm text-muted-foreground">Gross Margin</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">4.8x</div>
                    <div className="text-sm text-muted-foreground">Inventory Turns</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">24.7%</div>
                    <div className="text-sm text-muted-foreground">ROI</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>      </Tabs>
      </div>
    </div>
  );
}
