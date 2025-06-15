"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { 
  Package, 
  BarChart3, 
  ShoppingCart, 
  Users, 
  TrendingUp,
  AlertTriangle,
  DollarSign,
  Activity,
  Download,
  Eye,
  Star,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  RefreshCw,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  FileText,
  Phone
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
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
  Cell,
  LineChart,
  Line,
  Legend
} from "recharts";

// Sample data for charts and tables
const revenueData = [
  { month: 'Jan', revenue: 45000, orders: 120, growth: 12, profit: 12000, expenses: 33000 },
  { month: 'Feb', revenue: 52000, orders: 135, growth: 15.5, profit: 15600, expenses: 36400 },
  { month: 'Mar', revenue: 48000, orders: 128, growth: -7.7, profit: 13440, expenses: 34560 },
  { month: 'Apr', revenue: 61000, orders: 158, growth: 27.1, profit: 19520, expenses: 41480 },
  { month: 'May', revenue: 55000, orders: 142, growth: -9.8, profit: 16500, expenses: 38500 },
  { month: 'Jun', revenue: 67000, orders: 178, growth: 21.8, profit: 21440, expenses: 45560 },
];

const categoryData = [
  { name: 'Electronics', value: 35, color: '#3b82f6', trend: '+12%' },
  { name: 'Clothing', value: 25, color: '#10b981', trend: '+8%' },
  { name: 'Home & Garden', value: 20, color: '#f59e0b', trend: '-3%' },
  { name: 'Sports', value: 12, color: '#8b5cf6', trend: '+15%' },
  { name: 'Books', value: 8, color: '#ef4444', trend: '+5%' },
];

const performanceData = [
  { name: 'Q1', performance: 85, target: 90, satisfaction: 4.2 },
  { name: 'Q2', performance: 92, target: 90, satisfaction: 4.5 },
  { name: 'Q3', performance: 88, target: 90, satisfaction: 4.3 },
  { name: 'Q4', performance: 95, target: 90, satisfaction: 4.7 },
];

const topProducts = [
  { id: 1, name: 'iPhone 15 Pro', sales: 245, revenue: 245000, stock: 12, trend: 'up' },
  { id: 2, name: 'MacBook Air M3', sales: 156, revenue: 187200, stock: 8, trend: 'up' },
  { id: 3, name: 'Nike Air Max', sales: 189, revenue: 22680, stock: 45, trend: 'down' },
  { id: 4, name: 'Samsung Galaxy S24', sales: 167, revenue: 133600, stock: 23, trend: 'up' },
  { id: 5, name: 'AirPods Pro', sales: 298, revenue: 74500, stock: 67, trend: 'up' },
];

const recentOrders = [
  { id: '#ORD-2024-001', customer: 'John Doe', amount: 1299, status: 'completed', date: '2024-06-15' },
  { id: '#ORD-2024-002', customer: 'Sarah Wilson', amount: 456, status: 'processing', date: '2024-06-15' },
  { id: '#ORD-2024-003', customer: 'Mike Johnson', amount: 789, status: 'shipped', date: '2024-06-14' },
  { id: '#ORD-2024-004', customer: 'Emily Davis', amount: 234, status: 'pending', date: '2024-06-14' },
  { id: '#ORD-2024-005', customer: 'Chris Brown', amount: 567, status: 'completed', date: '2024-06-13' },
];

const suppliers = [
  { name: 'TechCorp Ltd', orders: 45, reliability: 98, rating: 4.8 },
  { name: 'Fashion Forward', orders: 32, reliability: 95, rating: 4.6 },
  { name: 'Home Essentials', orders: 28, reliability: 92, rating: 4.4 },
  { name: 'Sports Gear Co', orders: 19, reliability: 89, rating: 4.2 },
];

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [timeRange, setTimeRange] = useState("7d");
  const [selectedTab, setSelectedTab] = useState("overview");

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Package className="h-12 w-12 text-primary mx-auto mb-4 animate-spin" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300",
      processing: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      shipped: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
      pending: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300"
    };
    return variants[status as keyof typeof variants] || variants.pending;
  };

  return (    <div className="min-h-screen bg-background pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 lg:mb-10">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-3">
              <Avatar className="h-14 w-14 border-2 border-primary/20">
                <AvatarImage src="/placeholder-avatar.jpg" />
                <AvatarFallback className="bg-primary text-primary-foreground text-lg font-semibold">
                  {user.email?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h1 className="text-2xl lg:text-3xl font-bold text-foreground leading-tight">
                  Welcome back, {user.email?.split('@')[0] || 'User'}!
                </h1>
                <p className="text-sm lg:text-base text-muted-foreground">
                  Here&apos;s your inventory performance overview for today
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 lg:gap-3 mt-6 lg:mt-0">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-36 h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">Last 24h</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" className="h-9 px-3">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button size="sm" className="h-9 px-4">
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </div>
        </div>        {/* Alert Section */}
        <div className="mb-6">
          <Alert className="relative border-l-4 border-l-amber-500 bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
            <div className="flex items-center gap-3 p-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center w-8 h-8 bg-amber-500 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-white" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <AlertTitle className="text-base font-semibold text-amber-900 dark:text-amber-100">
                  Attention Required
                </AlertTitle>
                <AlertDescription className="text-sm text-amber-800 dark:text-amber-200 mt-1">
                  You have <span className="font-medium">23 products</span> with low stock levels. Consider restocking to avoid shortages.
                </AlertDescription>
              </div>
              <div className="flex-shrink-0">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="bg-white dark:bg-gray-800 border-amber-300 text-amber-900 dark:text-amber-100 hover:bg-amber-100 dark:hover:bg-amber-900/30"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
              </div>
            </div>
          </Alert>
        </div>{/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6 mb-8 lg:mb-10">
          <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300 border-l-4 border-l-emerald-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/20 rounded-full">
                <DollarSign className="h-4 w-4 text-emerald-600" />
              </div>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="text-2xl lg:text-3xl font-bold text-foreground mb-2">$245,231</div>
              <div className="flex items-center text-xs">
                <ArrowUpRight className="h-3 w-3 text-emerald-500 mr-1" />
                <span className="text-emerald-600 font-medium">+20.1%</span>
                <span className="text-muted-foreground ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                <ShoppingCart className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="text-2xl lg:text-3xl font-bold text-foreground mb-2">1,847</div>
              <div className="flex items-center text-xs">
                <ArrowUpRight className="h-3 w-3 text-blue-500 mr-1" />
                <span className="text-blue-600 font-medium">+12.5%</span>
                <span className="text-muted-foreground ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300 border-l-4 border-l-purple-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Products</CardTitle>
              <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-full">
                <Package className="h-4 w-4 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="text-2xl lg:text-3xl font-bold text-foreground mb-2">1,234</div>
              <div className="flex items-center text-xs">
                <ArrowUpRight className="h-3 w-3 text-purple-500 mr-1" />
                <span className="text-purple-600 font-medium">+8.2%</span>
                <span className="text-muted-foreground ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300 border-l-4 border-l-amber-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Low Stock Alert</CardTitle>
              <div className="p-2 bg-amber-100 dark:bg-amber-900/20 rounded-full">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
              </div>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="text-2xl lg:text-3xl font-bold text-foreground mb-2">23</div>
              <div className="flex items-center text-xs">
                <ArrowDownRight className="h-3 w-3 text-amber-500 mr-1" />
                <span className="text-amber-600 font-medium">-3</span>
                <span className="text-muted-foreground ml-1">from yesterday</span>
              </div>
            </CardContent>
          </Card>
        </div>        {/* Main Content Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-8">
          <div className="border-b border-border">
            <TabsList className="grid w-full max-w-md grid-cols-4 bg-muted/50 p-1 h-12">
              <TabsTrigger value="overview" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
                Overview
              </TabsTrigger>
              <TabsTrigger value="analytics" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
                Analytics
              </TabsTrigger>
              <TabsTrigger value="inventory" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
                Inventory
              </TabsTrigger>
              <TabsTrigger value="suppliers" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
                Suppliers
              </TabsTrigger>
            </TabsList>
          </div>          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">              {/* Revenue Chart */}
              <Card className="border-0 shadow-md bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-3 text-lg">
                        <div className="p-2 bg-blue-500 rounded-lg">
                          <TrendingUp className="h-5 w-5 text-white" />
                        </div>
                        Revenue Analytics
                      </CardTitle>
                      <CardDescription className="mt-1">Interactive performance dashboard</CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-green-600">+21.8%</div>
                      <div className="text-xs text-muted-foreground">vs last period</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="relative pt-0">
                  <ResponsiveContainer width="100%" height={380}>
                    <AreaChart data={revenueData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                      <defs>
                        <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.9}/>
                          <stop offset="50%" stopColor="#6366f1" stopOpacity={0.6}/>
                          <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                        </linearGradient>
                        <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" stopOpacity={0.8}/>
                          <stop offset="100%" stopColor="#10b981" stopOpacity={0.1}/>
                        </linearGradient>
                        <filter id="glow">
                          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                          <feMerge> 
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                          </feMerge>
                        </filter>
                      </defs>
                      <CartesianGrid strokeDasharray="2 2" stroke="#e2e8f0" opacity={0.5} />
                      <XAxis 
                        dataKey="month" 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: '#64748b' }}
                        dy={10}
                      />
                      <YAxis 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: '#64748b' }}
                        tickFormatter={(value) => `$${value/1000}k`}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: 'none',
                          borderRadius: '16px',
                          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                          backdropFilter: 'blur(12px)',
                          padding: '16px'
                        }}
                        labelStyle={{ fontWeight: 'bold', color: '#1e293b' }}
                        formatter={(value, name) => [
                          `$${Number(value).toLocaleString()}`,
                          name === 'revenue' ? 'Revenue' : name === 'profit' ? 'Profit' : 'Expenses'
                        ]}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#3b82f6" 
                        strokeWidth={3}
                        fill="url(#revenueGradient)"
                        filter="url(#glow)"
                        animationDuration={2000}
                        animationBegin={0}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="profit" 
                        stroke="#10b981" 
                        strokeWidth={2}
                        fill="url(#profitGradient)"
                        animationDuration={2000}
                        animationBegin={500}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="expenses" 
                        stroke="#ef4444" 
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                        animationDuration={2000}
                        animationBegin={1000}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                    {/* Legend */}
                  <div className="flex items-center justify-center gap-4 mt-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span>Revenue</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span>Profit</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 border-2 border-red-500 border-dashed rounded-full"></div>
                      <span>Expenses</span>
                    </div>
                  </div>
                </CardContent>
              </Card>              {/* Category Distribution */}
              <Card className="border-0 shadow-md bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-3 text-lg">
                        <div className="p-2 bg-purple-500 rounded-lg">
                          <BarChart3 className="h-5 w-5 text-white" />
                        </div>
                        Category Analytics
                      </CardTitle>
                      <CardDescription className="mt-1">Product distribution insights</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="relative pt-0">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Modern Pie Chart */}
                    <div className="relative">
                      <ResponsiveContainer width="100%" height={280}>
                        <PieChart>
                          <defs>
                            {categoryData.map((entry, index) => (
                              <linearGradient key={index} id={`gradient-${index}`} x1="0" y1="0" x2="1" y2="1">
                                <stop offset="0%" stopColor={entry.color} stopOpacity={1}/>
                                <stop offset="100%" stopColor={entry.color} stopOpacity={0.7}/>
                              </linearGradient>
                            ))}
                          </defs>
                          <Pie
                            data={categoryData}
                            cx="50%"
                            cy="50%"
                            innerRadius={70}
                            outerRadius={110}
                            paddingAngle={3}
                            dataKey="value"
                            animationBegin={0}
                            animationDuration={1500}
                          >
                            {categoryData.map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={`url(#gradient-${index})`}
                                stroke="white"
                                strokeWidth={2}
                              />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{
                              backgroundColor: 'rgba(255, 255, 255, 0.95)',
                              border: 'none',
                              borderRadius: '12px',
                              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                              backdropFilter: 'blur(10px)',
                            }}
                            formatter={(value, name) => [`${value}%`, name]}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      
                      {/* Center Info */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-foreground">100%</div>
                          <div className="text-xs text-muted-foreground">Categories</div>
                        </div>
                      </div>
                    </div>
                      {/* Category Stats */}
                    <div className="space-y-3">
                      {categoryData.map((category, index) => (
                        <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-white/70 dark:bg-gray-800/70 border border-gray-200/50 dark:border-gray-700/50">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: category.color }}
                            ></div>
                            <div>
                              <div className="font-medium text-sm">{category.name}</div>
                              <div className="text-xs text-muted-foreground">{category.value}% of total</div>
                            </div>
                          </div>
                          <Badge 
                            variant={category.trend.startsWith('+') ? 'default' : 'destructive'}
                            className="text-xs"
                          >
                            {category.trend}
                          </Badge>
                        </div>
                      ))}
                      
                      {/* Summary */}
                      <div className="mt-4 p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                        <div className="text-sm font-medium text-purple-900 dark:text-purple-100">
                          Top Performer: Electronics
                        </div>
                        <div className="text-xs text-purple-700 dark:text-purple-300 mt-1">
                          Leading with 35% market share
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>            {/* Recent Orders & Top Products */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
              {/* Recent Orders */}
              <Card className="shadow-sm border-0 bg-gradient-to-br from-background to-muted/20">
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                  <div>
                    <CardTitle className="flex items-center gap-3 text-lg">
                      <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                        <ShoppingCart className="h-5 w-5 text-green-600" />
                      </div>
                      Recent Orders
                    </CardTitle>
                    <CardDescription className="mt-2">Latest customer orders</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" className="shrink-0">
                    <Eye className="h-4 w-4 mr-2" />
                    View All
                  </Button>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {recentOrders.map((order, index) => (
                      <div key={order.id} className="flex items-center justify-between p-4 rounded-xl border border-border/50 hover:bg-muted/30 transition-all duration-200 hover:shadow-sm">
                        <div className="flex items-center space-x-4">
                          <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
                            <AvatarFallback className="text-xs font-medium bg-primary/10 text-primary">
                              {order.customer.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="space-y-1">
                            <p className="text-sm font-semibold text-foreground">{order.id}</p>
                            <p className="text-xs text-muted-foreground">{order.customer}</p>
                          </div>
                        </div>
                        <div className="text-right space-y-1">
                          <p className="text-sm font-semibold text-foreground">${order.amount}</p>
                          <Badge className={`${getStatusBadge(order.status)} text-xs px-2 py-1`} variant="secondary">
                            {order.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Top Products */}
              <Card className="shadow-sm border-0 bg-gradient-to-br from-background to-muted/20">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                      <Star className="h-5 w-5 text-yellow-600" />
                    </div>
                    Top Selling Products
                  </CardTitle>
                  <CardDescription className="mt-2">Best performing items this month</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    {topProducts.map((product, index) => (
                      <div key={product.id} className="flex items-center space-x-4 p-3 rounded-xl hover:bg-muted/30 transition-colors">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary font-bold text-sm border-2 border-primary/20">
                          {index + 1}
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-semibold text-foreground">{product.name}</p>
                          <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                            <span className="flex items-center">
                              <ShoppingCart className="h-3 w-3 mr-1" />
                              {product.sales} sales
                            </span>
                            <span className="flex items-center">
                              <Package className="h-3 w-3 mr-1" />
                              {product.stock} in stock
                            </span>
                          </div>
                        </div>
                        <div className="text-right space-y-1">
                          <p className="text-sm font-bold text-foreground">${product.revenue.toLocaleString()}</p>
                          <div className="flex items-center justify-end">
                            {product.trend === 'up' ? (
                              <div className="flex items-center text-xs text-emerald-600">
                                <ArrowUpRight className="h-3 w-3 mr-1" />
                                Trending
                              </div>
                            ) : (
                              <div className="flex items-center text-xs text-red-600">
                                <ArrowDownRight className="h-3 w-3 mr-1" />
                                Declining
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-0 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/50 dark:to-blue-900/30 hover:scale-105">
                <CardContent className="p-6 text-center">
                  <div className="w-14 h-14 mx-auto mb-4 bg-blue-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Package className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Add Product</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">Add new items to your inventory system</p>
                </CardContent>
              </Card>
              
              <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-0 bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/50 dark:to-green-900/30 hover:scale-105">
                <CardContent className="p-6 text-center">
                  <div className="w-14 h-14 mx-auto mb-4 bg-green-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <ShoppingCart className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">New Order</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">Process new customer orders quickly</p>
                </CardContent>
              </Card>
              
              <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-0 bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/50 dark:to-purple-900/30 hover:scale-105">
                <CardContent className="p-6 text-center">
                  <div className="w-14 h-14 mx-auto mb-4 bg-purple-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Users className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Suppliers</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">Manage your supplier relationships</p>
                </CardContent>
              </Card>
              
              <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-0 bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-950/50 dark:to-orange-900/30 hover:scale-105">
                <CardContent className="p-6 text-center">
                  <div className="w-14 h-14 mx-auto mb-4 bg-orange-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <BarChart3 className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">Reports</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">View detailed analytics and insights</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-8">
            {/* Advanced Performance Dashboard */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">              {/* Multi-Layer Performance Chart */}
              <Card className="lg:col-span-2 border-0 shadow-md bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <div className="p-2 bg-emerald-500 rounded-lg">
                      <Activity className="h-5 w-5 text-white" />
                    </div>
                    Performance Metrics
                  </CardTitle>
                  <CardDescription className="mt-1">Multi-dimensional analysis</CardDescription>
                </CardHeader>
                <CardContent className="relative pt-0">
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={performanceData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                      <defs>
                        <linearGradient id="performanceGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" stopOpacity={1}/>
                          <stop offset="100%" stopColor="#06d6a0" stopOpacity={0.8}/>
                        </linearGradient>
                        <linearGradient id="targetGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#f59e0b" stopOpacity={1}/>
                          <stop offset="100%" stopColor="#fbbf24" stopOpacity={0.8}/>
                        </linearGradient>
                        <filter id="shadow">
                          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000000" floodOpacity="0.1"/>
                        </filter>
                      </defs>
                      <CartesianGrid strokeDasharray="2 2" stroke="#e2e8f0" opacity={0.3} />
                      <XAxis 
                        dataKey="name" 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: '#64748b' }}
                      />
                      <YAxis 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: '#64748b' }}
                        domain={[0, 100]}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: 'none',
                          borderRadius: '16px',
                          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                          backdropFilter: 'blur(12px)',
                        }}
                        formatter={(value, name) => [
                          `${value}${name === 'satisfaction' ? '/5' : '%'}`,
                          name === 'performance' ? 'Performance' : name === 'target' ? 'Target' : 'Satisfaction'
                        ]}
                      />
                      <Bar 
                        dataKey="performance" 
                        fill="url(#performanceGradient)"
                        radius={[4, 4, 0, 0]}
                        filter="url(#shadow)"
                        animationDuration={1500}
                        animationBegin={0}
                      />
                      <Bar 
                        dataKey="target" 
                        fill="url(#targetGradient)"
                        radius={[4, 4, 0, 0]}
                        filter="url(#shadow)"
                        animationDuration={1500}
                        animationBegin={500}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="satisfaction" 
                        stroke="#8b5cf6" 
                        strokeWidth={3}
                        dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 5 }}
                        yAxisId="right"
                        animationDuration={2000}
                        animationBegin={1000}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                    {/* Performance Indicators */}
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div className="text-center p-3 bg-white/70 dark:bg-gray-800/70 rounded-lg border border-gray-200/50">
                      <div className="text-lg font-bold text-green-600">92%</div>
                      <div className="text-xs text-muted-foreground">Avg Performance</div>
                    </div>
                    <div className="text-center p-3 bg-white/70 dark:bg-gray-800/70 rounded-lg border border-gray-200/50">
                      <div className="text-lg font-bold text-orange-600">90%</div>
                      <div className="text-xs text-muted-foreground">Target</div>
                    </div>
                    <div className="text-center p-3 bg-white/70 dark:bg-gray-800/70 rounded-lg border border-gray-200/50">
                      <div className="text-lg font-bold text-purple-600">4.4</div>
                      <div className="text-xs text-muted-foreground">Satisfaction</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Key Metrics */}
              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Conversion Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl font-bold">24.5%</span>
                      <span className="text-xs text-emerald-600">+2.1%</span>
                    </div>
                    <Progress value={24.5} className="h-2" />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Average Order Value</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl font-bold">$156</span>
                      <span className="text-xs text-blue-600">+$12</span>
                    </div>
                    <Progress value={78} className="h-2" />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Customer Satisfaction</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl font-bold">4.8</span>
                      <span className="text-xs text-yellow-600">+0.2</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Inventory Tab */}
          <TabsContent value="inventory" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Inventory Management</h3>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search products..." className="pl-10 w-64" />
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Inventory Stats */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Total Value</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$2.4M</div>
                  <p className="text-xs text-muted-foreground">Across all products</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">24</div>
                  <p className="text-xs text-muted-foreground">Active categories</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Out of Stock</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">12</div>
                  <p className="text-xs text-muted-foreground">Requires restocking</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Turnover Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">6.2x</div>
                  <p className="text-xs text-muted-foreground">Annual turnover</p>
                </CardContent>
              </Card>
            </div>

            {/* Inventory Table */}
            <Card>
              <CardHeader>
                <CardTitle>Product Inventory</CardTitle>
                <CardDescription>Current stock levels and details</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>Electronics</TableCell>
                        <TableCell>{product.stock}</TableCell>
                        <TableCell>
                          <Badge variant={product.stock > 20 ? "secondary" : product.stock > 10 ? "default" : "destructive"}>
                            {product.stock > 20 ? "In Stock" : product.stock > 10 ? "Low Stock" : "Critical"}
                          </Badge>
                        </TableCell>
                        <TableCell>${product.revenue.toLocaleString()}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Suppliers Tab */}
          <TabsContent value="suppliers" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Supplier Management</h3>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Supplier
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {suppliers.map((supplier, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{supplier.name}</CardTitle>
                      <Badge variant="outline">{supplier.orders} orders</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Reliability</span>
                      <span className="font-medium">{supplier.reliability}%</span>
                    </div>
                    <Progress value={supplier.reliability} className="h-2" />
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Rating</span>
                      <div className="flex items-center space-x-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{supplier.rating}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Phone className="h-3 w-3 mr-1" />
                        Contact
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <FileText className="h-3 w-3 mr-1" />
                        Orders
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>            {/* Supplier Performance Chart */}
            <Card className="border-0 shadow-md bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-800 dark:to-gray-900">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-lg">
                  <div className="p-2 bg-blue-500 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                  Supplier Performance Overview
                </CardTitle>
                <CardDescription>Delivery times and reliability metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart 
                    data={suppliers.map(s => ({...s, deliveryTime: Math.floor(Math.random() * 10) + 5}))}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <defs>
                      <linearGradient id="reliabilityGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.9}/>
                        <stop offset="100%" stopColor="#1d4ed8" stopOpacity={0.7}/>
                      </linearGradient>
                      <linearGradient id="deliveryGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity={0.9}/>
                        <stop offset="100%" stopColor="#059669" stopOpacity={0.7}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="2 2" stroke="#e2e8f0" opacity={0.5} />
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: 12, fill: '#64748b' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis 
                      tick={{ fontSize: 12, fill: '#64748b' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: 'none',
                        borderRadius: '12px',
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                        backdropFilter: 'blur(10px)',
                      }}
                      formatter={(value, name) => [
                        `${value}${name === 'reliability' ? '%' : ' days'}`,
                        name === 'reliability' ? 'Reliability' : 'Avg Delivery Time'
                      ]}
                    />
                    <Bar 
                      dataKey="reliability" 
                      fill="url(#reliabilityGradient)" 
                      name="Reliability %" 
                      radius={[4, 4, 0, 0]}
                      animationDuration={1200}
                    />
                    <Bar 
                      dataKey="deliveryTime" 
                      fill="url(#deliveryGradient)" 
                      name="Avg Delivery (days)" 
                      radius={[4, 4, 0, 0]}
                      animationDuration={1200}
                      animationBegin={300}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>        {/* Footer Summary */}
        <div className="mt-16 pt-8 border-t border-border/50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="space-y-3">
              <h4 className="font-semibold text-foreground">System Status</h4>
              <div className="flex items-center justify-center space-x-3">
                <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-muted-foreground">All systems operational</span>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-foreground">Last Updated</h4>
              <p className="text-sm text-muted-foreground flex items-center justify-center">
                <Clock className="inline h-4 w-4 mr-2" />
                {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
              </p>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-foreground">Data Sync</h4>
              <div className="flex items-center justify-center space-x-3">
                <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
                <span className="text-sm text-muted-foreground">Synced 2 minutes ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
