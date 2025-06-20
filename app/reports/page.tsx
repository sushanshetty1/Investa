"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  BarChart3, 
  DollarSign, 
  Package, 
  TrendingUp,
  FileText,
  Eye,
  Download,
  Calendar,
  Clock,
  Activity,
  AlertTriangle,
  Lightbulb
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InventoryInsights } from "@/components/inventory/InventoryInsights";
import { ExportManager } from "@/components/analytics/ExportManager";

const reportCategories = [
  {
    title: "Inventory Analytics",
    description: "Comprehensive inventory analysis and insights",
    href: "/reports/inventory",
    icon: Package,
    color: "bg-blue-500",
    features: [
      "Stock Movement Reports",
      "ABC Analysis",
      "Inventory Aging Reports", 
      "Forecasting & Demand Planning"
    ],
    metrics: {
      totalValue: "$1,450,000",
      turnover: "6.8x",
      lowStock: 12
    }
  },
  {
    title: "Financial Reports",
    description: "Financial analysis and inventory valuation",
    href: "/reports/financial",
    icon: DollarSign,
    color: "bg-green-500",
    features: [
      "Inventory Valuation Reports",
      "Cost of Goods Sold (COGS)",
      "Profit Margin Analysis",
      "Purchase vs Sales Analytics"
    ],
    metrics: {
      grossMargin: "38.1%",
      cogs: "$650,000",
      roi: "24.7%"
    }
  },
  {
    title: "Sales Reports",
    description: "Sales performance and trend analysis",
    href: "/reports/sales",
    icon: TrendingUp,
    color: "bg-purple-500",
    features: [
      "Sales Performance",
      "Customer Analytics",
      "Product Performance",
      "Seasonal Trends"
    ],
    metrics: {
      monthlyGrowth: "+12.5%",
      topProducts: 45,
      avgOrderValue: "$234"
    },
    status: "coming-soon"
  },
  {
    title: "Custom Reports",
    description: "Build and schedule custom reports",
    href: "/reports/custom",
    icon: FileText,
    color: "bg-orange-500",
    features: [
      "Report Builder",
      "Scheduled Reports",
      "Export Options",
      "Template Library"
    ],
    metrics: {
      savedReports: 8,
      scheduled: 3,
      exports: 24
    },
    status: "coming-soon"
  }
];

const quickStats = [
  { label: "Total Reports", value: "24", change: "+3", icon: FileText },
  { label: "Scheduled", value: "6", change: "+1", icon: Clock },
  { label: "This Month", value: "156", change: "+28%", icon: Calendar },
  { label: "Alerts", value: "3", change: "0", icon: AlertTriangle, variant: "warning" as const },
];

export default function ReportsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Activity className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Reports & Analytics</h1>
            <p className="text-muted-foreground">
              Comprehensive reporting and business intelligence dashboard
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export All
            </Button>
            <Button size="sm">
              <FileText className="w-4 h-4 mr-2" />
              New Report
            </Button>
          </div>
        </div>        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="insights">AI Insights</TabsTrigger>
            <TabsTrigger value="reports">Report Categories</TabsTrigger>
            <TabsTrigger value="exports">Export Manager</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {quickStats.map((stat, index) => (
                <Card key={index}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                    <stat.icon className={`h-4 w-4 ${
                      stat.variant === 'warning' ? 'text-yellow-500' : 'text-muted-foreground'
                    }`} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground">
                      <span className={`${
                        stat.change.includes('+') ? 'text-green-600' : 
                        stat.change === '0' ? 'text-gray-500' : 'text-red-600'
                      }`}>
                        {stat.change}
                      </span>
                      {stat.change !== '0' && ' from last month'}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Report Activity</CardTitle>
                <CardDescription>Latest generated reports and scheduled activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    {
                      title: "Monthly Inventory Report",
                      time: "2 hours ago",
                      status: "completed",
                      type: "Inventory Analytics"
                    },
                    {
                      title: "Financial Summary Q2",
                      time: "5 hours ago", 
                      status: "completed",
                      type: "Financial Reports"
                    },
                    {
                      title: "ABC Analysis Update",
                      time: "1 day ago",
                      status: "completed",
                      type: "Inventory Analytics"
                    },
                    {
                      title: "Weekly COGS Report",
                      time: "2 days ago",
                      status: "completed", 
                      type: "Financial Reports"
                    },
                    {
                      title: "Low Stock Alert Report",
                      time: "3 days ago",
                      status: "completed",
                      type: "Inventory Analytics"
                    }
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${
                          activity.status === 'completed' ? 'bg-green-500' : 
                          activity.status === 'running' ? 'bg-blue-500' : 'bg-gray-400'
                        }`} />
                        <div>
                          <div className="font-medium">{activity.title}</div>
                          <div className="text-sm text-muted-foreground">{activity.type}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">{activity.time}</div>
                        <Badge 
                          variant={activity.status === 'completed' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {activity.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* System Health */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>System Performance</CardTitle>
                  <CardDescription>Analytics system health and performance</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Report Generation Speed</span>
                    <span className="font-medium">92%</span>
                  </div>
                  <Progress value={92} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <span>Data Freshness</span>
                    <span className="font-medium">98%</span>
                  </div>
                  <Progress value={98} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <span>System Availability</span>
                    <span className="font-medium">99.9%</span>
                  </div>
                  <Progress value={99.9} className="h-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common reporting tasks</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link href="/reports/inventory">
                    <Button variant="outline" className="w-full justify-start">
                      <Package className="w-4 h-4 mr-2" />
                      Generate Inventory Report
                    </Button>
                  </Link>
                  <Link href="/reports/financial">
                    <Button variant="outline" className="w-full justify-start">
                      <DollarSign className="w-4 h-4 mr-2" />
                      Create Financial Summary
                    </Button>
                  </Link>
                  <Button variant="outline" className="w-full justify-start" disabled>
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Schedule Report
                    <Badge variant="secondary" className="ml-auto text-xs">Soon</Badge>
                  </Button>
                  <Button variant="outline" className="w-full justify-start" disabled>
                    <FileText className="w-4 h-4 mr-2" />
                    Export Dashboard
                    <Badge variant="secondary" className="ml-auto text-xs">Soon</Badge>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <div className="flex items-center gap-2 mb-6">
              <Lightbulb className="w-5 h-5 text-yellow-500" />
              <h2 className="text-xl font-semibold">AI-Powered Inventory Insights</h2>
            </div>
            <InventoryInsights />
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <h2 className="text-2xl font-semibold">Report Categories</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {reportCategories.map((category, index) => (
                <Card key={index} className="relative group hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${category.color} text-white`}>
                          <category.icon className="w-6 h-6" />
                        </div>
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            {category.title}
                            {category.status === 'coming-soon' && (
                              <Badge variant="secondary" className="text-xs">
                                Coming Soon
                              </Badge>
                            )}
                          </CardTitle>
                          <CardDescription>{category.description}</CardDescription>
                        </div>
                      </div>
                      <Link href={category.status !== 'coming-soon' ? category.href : '#'}>
                        <Button 
                          variant="outline" 
                          size="sm"
                          disabled={category.status === 'coming-soon'}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      </Link>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Features */}
                    <div>
                      <h4 className="text-sm font-medium mb-2">Features</h4>
                      <div className="grid grid-cols-2 gap-1 text-sm text-muted-foreground">
                        {category.features.map((feature, idx) => (
                          <div key={idx} className="flex items-center gap-1">
                            <div className="w-1 h-1 bg-current rounded-full" />
                            {feature}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Metrics */}
                    <div>
                      <h4 className="text-sm font-medium mb-2">Key Metrics</h4>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        {Object.entries(category.metrics).map(([key, value], idx) => (
                          <div key={idx} className="text-center p-2 bg-muted/50 rounded">
                            <div className="font-medium">{value}</div>
                            <div className="text-xs text-muted-foreground capitalize">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="exports" className="space-y-6">
            <ExportManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
