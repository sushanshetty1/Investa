"use client"
import React, { useEffect, useState } from 'react';
import { 
  Package, 
  BarChart3, 
  Users, 
  ShoppingCart, 
  FileText, 
  Truck, 
  Bell, 
  Shield,
  CheckCircle,
  XCircle,
  ArrowRight,
  Warehouse,
  RefreshCw,
  Lock,
  Zap,
  TrendingUp,
  Globe,
  Clock
} from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';

const InvistaLanding = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [showFloatingCTA, setShowFloatingCTA] = useState(false);
  
  useEffect(() => {
    setIsLoaded(true);
    
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const triggerHeight = window.innerHeight * 0.5; // Show after scrolling 50% of viewport
      setShowFloatingCTA(scrollPosition > triggerHeight);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const AnimatedCounter = ({ value, suffix = "" }: { value: string; suffix?: string }) => {
    return (
      <div className={`text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        {value}{suffix}
      </div>
    );
  };
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="bg-background/95 backdrop-blur-sm border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">            <div className="flex items-center">
              <Package className="h-8 w-8 text-primary mr-2" />
              <span className="text-xl font-bold text-foreground">Invista</span>
            </div><div className="hidden md:flex items-center space-x-8">              <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</a>
              <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">How It Works</a>
              <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
              <div className="flex items-center space-x-4">
                <ThemeToggle />
                <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">
                  Get Started
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-50/90 via-blue-50/40 to-indigo-50/60 dark:from-background dark:via-muted/20 dark:to-chart-3/10 py-20 overflow-hidden">
        {/* Background Pattern with Better Mask */}
        <div className="absolute inset-0 bg-grid-slate-100 dark:bg-grid-slate-800/20 [mask-image:radial-gradient(ellipse_at_center,white_40%,rgba(255,255,255,0.4)_70%,transparent_100%)] dark:[mask-image:radial-gradient(ellipse_at_center,rgba(255,255,255,0.1)_40%,rgba(255,255,255,0.05)_70%,transparent_100%)]" />
        {/* Floating Elements - More Subtle */}
        <div className="absolute top-20 left-10 animate-float opacity-40">
          <div className="w-2 h-2 bg-blue-400 rounded-full blur-[0.5px]" />
        </div>
        <div className="absolute top-40 right-20 animate-float delay-1000 opacity-30">
          <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full blur-[0.5px]" />
        </div>
        <div className="absolute bottom-32 left-32 animate-float delay-500 opacity-35">
          <div className="w-2.5 h-2.5 bg-indigo-400 rounded-full blur-[0.5px]" />
        </div>
        <div className="absolute top-32 right-10 animate-float delay-700 opacity-25">
          <div className="w-1.5 h-1.5 bg-purple-400 rounded-full blur-[0.5px]" />
        </div>
        <div className="absolute bottom-20 right-40 animate-float delay-300 opacity-30">
          <div className="w-2 h-2 bg-emerald-400 rounded-full blur-[0.5px]" />
        </div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center min-h-[600px]">
            <div className="space-y-8 flex flex-col justify-center">
              {/* Status Badge */}
              <div className="inline-flex items-center bg-gradient-to-r from-emerald-50/80 to-blue-50/80 dark:from-primary/10 dark:to-chart-2/10 text-emerald-700 dark:text-primary px-4 py-2 rounded-full text-sm font-medium border border-emerald-200/50 dark:border-primary/20 backdrop-blur-sm">
                <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse" />
                <Zap className="h-4 w-4 mr-2" />
                Next-Gen Inventory & Supply Chain Platform
              </div>
              
              {/* Main Headline */}
              <div className="space-y-4">
                <h1 className="text-5xl lg:text-7xl font-bold text-foreground leading-tight">
                  Smart Supply Chain
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 dark:from-primary dark:via-chart-3 dark:to-chart-2 block">
                    Starts Here
                  </span>
                </h1>
                
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <div className="h-1 w-12 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full" />
                  <span className="text-sm font-medium">Powered by Invista</span>
                </div>
              </div>
              
              {/* Enhanced Description */}
              <p className="text-xl lg:text-2xl text-muted-foreground leading-relaxed">
                Transform your business with our unified platform that provides 
                <span className="text-foreground font-semibold"> real-time inventory visibility</span>, 
                <span className="text-foreground font-semibold"> automated supplier collaboration</span>, 
                and <span className="text-foreground font-semibold">intelligent logistics management</span>.
              </p>
                {/* Key Benefits with Industry Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 group hover:bg-emerald-50/50 dark:hover:bg-chart-2/10 p-3 rounded-lg transition-all duration-300">
                  <div className="w-8 h-8 bg-emerald-100 dark:bg-chart-2/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-chart-2" />
                  </div>
                  <div>
                    <span className="text-foreground font-medium block">99.9% System Uptime</span>
                    <span className="text-xs text-muted-foreground">Industry leading reliability</span>
                  </div>
                </div>
                <div className="flex items-center space-x-3 group hover:bg-blue-50/50 dark:hover:bg-primary/10 p-3 rounded-lg transition-all duration-300">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-primary/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Zap className="h-5 w-5 text-blue-600 dark:text-primary" />
                  </div>
                  <div>
                    <span className="text-foreground font-medium block">Real-Time Analytics</span>
                    <span className="text-xs text-muted-foreground">Sub-second data updates</span>
                  </div>
                </div>
                <div className="flex items-center space-x-3 group hover:bg-indigo-50/50 dark:hover:bg-chart-3/10 p-3 rounded-lg transition-all duration-300">
                  <div className="w-8 h-8 bg-indigo-100 dark:bg-chart-3/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Shield className="h-5 w-5 text-indigo-600 dark:text-chart-3" />
                  </div>
                  <div>
                    <span className="text-foreground font-medium block">Enterprise Security</span>
                    <span className="text-xs text-muted-foreground">SOC 2 Type II compliant</span>
                  </div>
                </div>
                <div className="flex items-center space-x-3 group hover:bg-amber-50/50 dark:hover:bg-chart-4/10 p-3 rounded-lg transition-all duration-300">
                  <div className="w-8 h-8 bg-amber-100 dark:bg-chart-4/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <RefreshCw className="h-5 w-5 text-amber-600 dark:text-chart-4" />
                  </div>
                  <div>
                    <span className="text-foreground font-medium block">Auto-Replenishment</span>
                    <span className="text-xs text-muted-foreground">AI-powered demand forecasting</span>
                  </div>
                </div>
              </div>              {/* Enhanced Key Metrics */}
              <div className="grid grid-cols-3 gap-4 lg:gap-6 p-4 lg:p-6 bg-white/40 dark:bg-card/30 backdrop-blur-sm rounded-2xl border border-white/30 dark:border-border/30 shadow-lg">
                <div className="text-center group hover:scale-105 transition-transform duration-300">
                  <div className="flex items-center justify-center mb-3">
                    <div className="relative">
                      <Warehouse className="h-6 lg:h-8 w-6 lg:w-8 text-blue-600 dark:text-primary group-hover:scale-110 transition-transform" />
                      <div className="absolute -top-1 -right-1 w-2 lg:w-3 h-2 lg:h-3 bg-emerald-500 rounded-full animate-pulse" />
                    </div>
                  </div>
                  <AnimatedCounter value="50+" />
                  <div className="text-xs lg:text-sm text-muted-foreground font-medium">Active Warehouses</div>
                  <div className="text-xs text-emerald-600 dark:text-chart-2 mt-1 flex items-center justify-center">
                    <TrendingUp className="h-2.5 lg:h-3 w-2.5 lg:w-3 mr-1" />
                    +12% this month
                  </div>
                </div>
                <div className="text-center group hover:scale-105 transition-transform duration-300">
                  <div className="flex items-center justify-center mb-3">
                    <div className="relative">
                      <RefreshCw className="h-6 lg:h-8 w-6 lg:w-8 text-emerald-600 dark:text-chart-2 group-hover:rotate-180 transition-transform duration-500" />
                      <div className="absolute -top-1 -right-1 w-2 lg:w-3 h-2 lg:h-3 bg-blue-500 rounded-full animate-pulse" />
                    </div>
                  </div>
                  <div className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">15K+</div>
                  <div className="text-xs lg:text-sm text-muted-foreground font-medium">Orders Processed</div>
                  <div className="text-xs text-emerald-600 dark:text-chart-2 mt-1 flex items-center justify-center">
                    <Clock className="h-2.5 lg:h-3 w-2.5 lg:w-3 mr-1" />
                    Daily average
                  </div>
                </div>
                <div className="text-center group hover:scale-105 transition-transform duration-300">
                  <div className="flex items-center justify-center mb-3">
                    <div className="relative">
                      <Shield className="h-6 lg:h-8 w-6 lg:w-8 text-indigo-600 dark:text-chart-3 group-hover:scale-110 transition-transform" />
                      <div className="absolute -top-1 -right-1 w-2 lg:w-3 h-2 lg:h-3 bg-emerald-500 rounded-full animate-pulse" />
                    </div>
                  </div>
                  <div className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">99.9%</div>
                  <div className="text-xs lg:text-sm text-muted-foreground font-medium">System Uptime</div>
                  <div className="text-xs text-emerald-600 dark:text-chart-2 mt-1 flex items-center justify-center">
                    <Globe className="h-2.5 lg:h-3 w-2.5 lg:w-3 mr-1" />
                    Last 30 days
                  </div>
                </div>
              </div>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="group bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center">
                  <span>Start Free Trial</span>
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button className="group border-2 border-foreground/20 hover:border-foreground/40 text-foreground px-8 py-4 rounded-xl font-semibold transition-all duration-300 hover:bg-foreground/5 flex items-center justify-center">
                  <Package className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
                  <span>View Demo</span>
                </button>
              </div>
            </div>            {/* Enhanced Right Side - Dashboard Preview */}
            <div className="relative group flex items-center justify-center">
              {/* Main Dashboard Card */}
              <div className="relative bg-white/90 dark:bg-card/90 rounded-3xl p-6 lg:p-8 shadow-2xl border border-white/40 dark:border-border/40 backdrop-blur-sm group-hover:shadow-3xl transition-all duration-500 transform group-hover:-translate-y-2 w-full max-w-md">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-2">
                    <div className="w-2.5 h-2.5 bg-red-400 rounded-full" />
                    <div className="w-2.5 h-2.5 bg-yellow-400 rounded-full" />
                    <div className="w-2.5 h-2.5 bg-green-400 rounded-full" />
                  </div>
                  <div className="text-xs text-muted-foreground font-medium">Invista Dashboard</div>
                </div>
                
                {/* Dashboard Content */}
                <div className="space-y-6">                  {/* Status Cards */}                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-chart-2/20 dark:to-chart-2/10 p-4 rounded-xl hover:shadow-md transition-all duration-300">
                      <div className="flex items-start justify-between h-full">
                        <div className="flex flex-col justify-center h-full">
                          <div className="text-2xl font-bold text-emerald-700 dark:text-chart-2 mb-1">234</div>
                          <div className="text-sm text-emerald-600 dark:text-chart-2/80 mb-1">Active Orders</div>
                          <div className="text-xs text-emerald-500 dark:text-chart-2/60">+8 today</div>
                        </div>
                        <div className="relative mt-1">
                          <ShoppingCart className="h-8 w-8 text-emerald-600 dark:text-chart-2" />
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-ping" />
                        </div>
                      </div>
                    </div>                    
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-primary/20 dark:to-primary/10 p-4 rounded-xl hover:shadow-md transition-all duration-300">
                      <div className="flex items-start justify-between h-full">
                        <div className="flex flex-col justify-center h-full">
                          <div className="text-2xl font-bold text-blue-700 dark:text-primary mb-1">12</div>
                          <div className="text-sm text-blue-600 dark:text-primary/80 mb-1">Low Stock</div>
                          <div className="text-xs text-orange-500">Needs attention</div>
                        </div>
                        <div className="relative mt-1">
                          <Bell className="h-8 w-8 text-blue-600 dark:text-primary animate-pulse" />
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-400 rounded-full" />
                        </div>
                      </div>
                    </div>
                  </div>
                    {/* Live Activity Feed */}
                  <div className="bg-slate-50 dark:bg-muted/50 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">Live Activity Feed</span>
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="text-xs text-muted-foreground">Live</span>
                      </div>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between py-2 px-3 bg-emerald-50 dark:bg-chart-2/10 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                          <span className="text-muted-foreground">Order #1234 shipped to Chicago</span>
                        </div>
                        <span className="text-emerald-600 font-medium">2m ago</span>
                      </div>
                      <div className="flex items-center justify-between py-2 px-3 bg-orange-50 dark:bg-chart-4/10 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-orange-500 rounded-full" />
                          <span className="text-muted-foreground">Low stock alert: iPhone Cases</span>
                        </div>
                        <span className="text-orange-600 font-medium">5m ago</span>
                      </div>
                      <div className="flex items-center justify-between py-2 px-3 bg-blue-50 dark:bg-primary/10 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full" />
                          <span className="text-muted-foreground">New supplier: TechParts Inc.</span>
                        </div>
                        <span className="text-blue-600 font-medium">8m ago</span>
                      </div>
                      <div className="flex items-center justify-between py-2 px-3 bg-indigo-50 dark:bg-chart-3/10 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-indigo-500 rounded-full" />
                          <span className="text-muted-foreground">Warehouse B at 85% capacity</span>
                        </div>
                        <span className="text-indigo-600 font-medium">12m ago</span>
                      </div>
                    </div>
                    
                    {/* Quick Actions */}
                    <div className="pt-2 border-t border-border/50">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Quick Actions</span>
                        <div className="flex space-x-1">
                          <button className="p-1 hover:bg-blue-100 dark:hover:bg-primary/20 rounded">
                            <Package className="h-3 w-3 text-blue-600 dark:text-primary" />
                          </button>
                          <button className="p-1 hover:bg-emerald-100 dark:hover:bg-chart-2/20 rounded">
                            <Bell className="h-3 w-3 text-emerald-600 dark:text-chart-2" />
                          </button>
                          <button className="p-1 hover:bg-indigo-100 dark:hover:bg-chart-3/20 rounded">
                            <FileText className="h-3 w-3 text-indigo-600 dark:text-chart-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Mini Chart */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">Inventory Levels</span>
                      <span className="text-xs text-emerald-600 dark:text-chart-2">+5.2%</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-3">
                        <div className="w-24 text-xs text-muted-foreground">Electronics</div>
                        <div className="flex-1 bg-slate-200 dark:bg-muted rounded-full h-2">
                          <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full w-4/5" />
                        </div>
                        <div className="text-xs text-muted-foreground">80%</div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-24 text-xs text-muted-foreground">Clothing</div>
                        <div className="flex-1 bg-slate-200 dark:bg-muted rounded-full h-2">
                          <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-2 rounded-full w-3/5" />
                        </div>
                        <div className="text-xs text-muted-foreground">60%</div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-24 text-xs text-muted-foreground">Home & Garden</div>
                        <div className="flex-1 bg-slate-200 dark:bg-muted rounded-full h-2">
                          <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-2 rounded-full w-2/3" />
                        </div>
                        <div className="text-xs text-muted-foreground">65%</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
                {/* Floating Cards - Better Positioned */}
              <div className="absolute -top-4 -right-4 lg:-top-6 lg:-right-6 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white p-3 lg:p-4 rounded-xl shadow-lg transform rotate-2 hover:rotate-0 transition-transform duration-300">
                <div className="flex items-center space-x-2">
                  <Truck className="h-4 lg:h-6 w-4 lg:w-6" />
                  <div>
                    <div className="text-sm lg:text-lg font-bold">34</div>
                    <div className="text-xs opacity-90">In Transit</div>
                  </div>
                </div>
              </div>
              
              <div className="absolute -bottom-4 -left-4 lg:-bottom-6 lg:-left-6 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white p-3 lg:p-4 rounded-xl shadow-lg transform -rotate-2 hover:rotate-0 transition-transform duration-300">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-4 lg:h-6 w-4 lg:w-6" />
                  <div>
                    <div className="text-sm lg:text-lg font-bold">↗ 23%</div>
                    <div className="text-xs opacity-90">Growth</div>
                  </div>
                </div></div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-12 bg-white/50 dark:bg-card/20 border-y border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <p className="text-sm text-muted-foreground font-medium mb-4">Trusted by 500+ companies across industries</p>
            
            {/* Industry Icons */}
            <div className="flex justify-center items-center space-x-8 opacity-60 hover:opacity-80 transition-opacity">
              <div className="flex items-center space-x-2 text-muted-foreground">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                  <Package className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-medium">E-commerce</span>
              </div>
              <div className="flex items-center space-x-2 text-muted-foreground">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-green-500 rounded-lg flex items-center justify-center">
                  <Warehouse className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-medium">Manufacturing</span>
              </div>
              <div className="flex items-center space-x-2 text-muted-foreground">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <Truck className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-medium">Logistics</span>
              </div>
              <div className="flex items-center space-x-2 text-muted-foreground">
                <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-medium">Retail</span>
              </div>
            </div>
          </div>
          
          {/* Key Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-3xl font-bold text-foreground">$2.3M</div>
              <div className="text-sm text-muted-foreground">Cost Savings</div>
              <div className="text-xs text-emerald-600 dark:text-chart-2">Average per client</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-foreground">45%</div>
              <div className="text-sm text-muted-foreground">Faster Processing</div>
              <div className="text-xs text-emerald-600 dark:text-chart-2">Order fulfillment</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-foreground">95%</div>
              <div className="text-sm text-muted-foreground">Accuracy Rate</div>
              <div className="text-xs text-emerald-600 dark:text-chart-2">Inventory tracking</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-foreground">24/7</div>
              <div className="text-sm text-muted-foreground">Support</div>
              <div className="text-xs text-emerald-600 dark:text-chart-2">Global coverage</div>
            </div>
          </div>        </div>
      </section>

      {/* Feature Highlight Section */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-white dark:from-muted/20 dark:to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center bg-blue-50 dark:bg-primary/10 text-blue-700 dark:text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Zap className="h-4 w-4 mr-2" />
              Core Capabilities
            </div>
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Everything You Need in One Platform
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              From multi-location inventory tracking to intelligent forecasting, 
              Invista provides the tools modern supply chains need to thrive.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Multi-Location Management */}
            <div className="bg-white dark:bg-card p-8 rounded-2xl border border-slate-200 dark:border-border shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mb-6">
                <Warehouse className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-4">Multi-Location Tracking</h3>
              <p className="text-muted-foreground mb-6">
                Monitor inventory levels across unlimited warehouses, stores, and distribution centers 
                with real-time synchronization and automated stock transfers.
              </p>
              <div className="space-y-3">
                <div className="flex items-center text-sm">
                  <CheckCircle className="h-4 w-4 text-emerald-500 mr-2" />
                  <span>Real-time stock levels</span>
                </div>
                <div className="flex items-center text-sm">
                  <CheckCircle className="h-4 w-4 text-emerald-500 mr-2" />
                  <span>Automated transfers</span>
                </div>
                <div className="flex items-center text-sm">
                  <CheckCircle className="h-4 w-4 text-emerald-500 mr-2" />
                  <span>Location-based analytics</span>
                </div>
              </div>
            </div>

            {/* Smart Forecasting */}
            <div className="bg-white dark:bg-card p-8 rounded-2xl border border-slate-200 dark:border-border shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-500 rounded-xl flex items-center justify-center mb-6">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-4">AI-Powered Forecasting</h3>
              <p className="text-muted-foreground mb-6">
                Leverage machine learning algorithms to predict demand patterns, optimize stock levels, 
                and prevent stockouts with intelligent reorder recommendations.
              </p>
              <div className="space-y-3">
                <div className="flex items-center text-sm">
                  <CheckCircle className="h-4 w-4 text-emerald-500 mr-2" />
                  <span>Demand prediction</span>
                </div>
                <div className="flex items-center text-sm">
                  <CheckCircle className="h-4 w-4 text-emerald-500 mr-2" />
                  <span>Seasonal adjustments</span>
                </div>
                <div className="flex items-center text-sm">
                  <CheckCircle className="h-4 w-4 text-emerald-500 mr-2" />
                  <span>Auto-reorder points</span>
                </div>
              </div>
            </div>

            {/* Supplier Integration */}
            <div className="bg-white dark:bg-card p-8 rounded-2xl border border-slate-200 dark:border-border shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center mb-6">
                <Users className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-4">Supplier Collaboration</h3>
              <p className="text-muted-foreground mb-6">
                Streamline supplier relationships with automated purchase orders, 
                real-time communication, and performance tracking dashboards.
              </p>
              <div className="space-y-3">
                <div className="flex items-center text-sm">
                  <CheckCircle className="h-4 w-4 text-emerald-500 mr-2" />
                  <span>Automated POs</span>
                </div>
                <div className="flex items-center text-sm">
                  <CheckCircle className="h-4 w-4 text-emerald-500 mr-2" />
                  <span>Supplier scorecards</span>
                </div>
                <div className="flex items-center text-sm">
                  <CheckCircle className="h-4 w-4 text-emerald-500 mr-2" />
                  <span>Communication hub</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="text-center mt-16">
            <div className="inline-flex items-center bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-chart-2/10 dark:to-primary/10 px-6 py-3 rounded-full">
              <span className="text-sm text-muted-foreground mr-3">Ready to transform your inventory management?</span>
              <button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105">
                Start Free Trial
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Why Traditional Inventory Systems Fail
            </h2>
            <p className="text-xl text-muted-foreground">Common pain points that slow down growing businesses</p>
          </div>          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="text-center p-6">
              <XCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">Fragmented Data</h3>
              <p className="text-muted-foreground">Multiple systems creating data silos and inconsistencies</p>
            </div>
            <div className="text-center p-6">
              <XCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">Manual Errors</h3>
              <p className="text-muted-foreground">Time-consuming manual processes leading to costly mistakes</p>
            </div>
            <div className="text-center p-6">
              <XCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No Real-Time Visibility</h3>
              <p className="text-muted-foreground">Delayed insights preventing proactive decision making</p>
            </div>
          </div>          <div className="text-center">
            <h3 className="text-3xl font-bold text-foreground mb-8">Invista Solves This</h3>
            <div className="inline-flex items-center bg-emerald-50 dark:bg-chart-2/10 text-emerald-700 dark:text-chart-2 px-4 py-2 rounded-full">
              <CheckCircle className="h-5 w-5 mr-2" />
              Unified. Automated. Real-Time.
            </div>
          </div>
        </div>
      </section>      {/* Features Section */}
      <section id="features" className="py-20 bg-slate-50 dark:bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">Core Features</h2>
            <p className="text-xl text-muted-foreground">Everything you need to manage your supply chain efficiently</p>
          </div>          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">            <div className="bg-white dark:bg-card p-6 rounded-xl border border-slate-200 dark:border dark:border-border hover:border-slate-300 dark:hover:border-border/60 transition-colors">
              <BarChart3 className="h-12 w-12 text-slate-700 dark:text-primary mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">Real-Time Inventory Monitoring</h3>
              <p className="text-muted-foreground">Track stock levels across all warehouses with live updates</p>
            </div>

            <div className="bg-white dark:bg-card p-6 rounded-xl border border-slate-200 dark:border dark:border-border hover:border-slate-300 dark:hover:border-border/60 transition-colors">
              <ShoppingCart className="h-12 w-12 text-emerald-700 dark:text-chart-2 mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">Order Management</h3>
              <p className="text-muted-foreground">Streamline purchase and customer orders in one platform</p>
            </div>

            <div className="bg-white dark:bg-card p-6 rounded-xl border border-slate-200 dark:border dark:border-border hover:border-slate-300 dark:hover:border-border/60 transition-colors">
              <FileText className="h-12 w-12 text-indigo-700 dark:text-chart-3 mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">Automated Invoicing</h3>
              <p className="text-muted-foreground">Generate reports and invoices automatically</p>
            </div>

            <div className="bg-white dark:bg-card p-6 rounded-xl border border-slate-200 dark:border dark:border-border hover:border-slate-300 dark:hover:border-border/60 transition-colors">
              <Truck className="h-12 w-12 text-amber-700 dark:text-chart-4 mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">Shipment Tracking</h3>
              <p className="text-muted-foreground">Monitor deliveries with real-time alerts and updates</p>
            </div>

            <div className="bg-white dark:bg-card p-6 rounded-xl border border-slate-200 dark:border dark:border-border hover:border-slate-300 dark:hover:border-border/60 transition-colors">
              <Bell className="h-12 w-12 text-rose-700 dark:text-chart-5 mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">Smart Alerts</h3>
              <p className="text-muted-foreground">Get notified for low stock and reorder points</p>
            </div>

            <div className="bg-white dark:bg-card p-6 rounded-xl border border-slate-200 dark:border dark:border-border hover:border-slate-300 dark:hover:border-border/60 transition-colors">
              <Shield className="h-12 w-12 text-slate-800 dark:text-destructive mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">Role-Based Access</h3>
              <p className="text-muted-foreground">Secure access control for different user roles</p>
            </div>
          </div>
        </div>
      </section>      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">How It Works</h2>
            <p className="text-xl text-muted-foreground">Get started in three simple steps</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-50 dark:bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <Users className="h-8 w-8 text-blue-700 dark:text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">1. Add Suppliers & Products</h3>
              <p className="text-muted-foreground">Set up your supplier network and product catalog in minutes</p>
            </div>

            <div className="text-center">
              <div className="bg-emerald-50 dark:bg-chart-2/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <Warehouse className="h-8 w-8 text-emerald-700 dark:text-chart-2" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">2. Track Stock Across Warehouses</h3>
              <p className="text-muted-foreground">Monitor inventory levels in real-time across all locations</p>
            </div>

            <div className="text-center">
              <div className="bg-indigo-50 dark:bg-chart-3/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-8 w-8 text-indigo-700 dark:text-chart-3" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">3. Fulfill Orders With Confidence</h3>
              <p className="text-muted-foreground">Process orders efficiently with complete visibility</p>
            </div>
          </div>
        </div>
      </section>      {/* Testimonials Section */}
      <section className="py-20 bg-slate-50 dark:bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-sm font-medium mb-4">
              ⭐ Customer Success Stories
            </div>
            <h2 className="text-4xl font-bold text-foreground mb-4">Trusted by 500+ Growing Businesses</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              See how companies like yours are transforming their inventory management and boosting their bottom line with Invista
            </p>
          </div>          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-card p-8 rounded-xl border border-slate-200 dark:border hover:border-slate-300 dark:hover:border-border/60 transition-all duration-200 hover:shadow-lg group">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
              <p className="text-muted-foreground mb-6 text-lg leading-relaxed">"Invista transformed our inventory management. We reduced stockouts by 80% and improved our cash flow significantly."</p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg mr-4">
                  SC
                </div>
                <div>
                  <div className="font-semibold text-foreground">Sarah Chen</div>
                  <div className="text-sm text-muted-foreground">Operations Manager</div>
                  <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">TechFlow Solutions</div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-card p-8 rounded-xl border border-slate-200 dark:border hover:border-slate-300 dark:hover:border-border/60 transition-all duration-200 hover:shadow-lg group">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
              <p className="text-muted-foreground mb-6 text-lg leading-relaxed">"The real-time visibility across our 5 warehouses has been a game-changer. No more manual spreadsheets!"</p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center text-white font-semibold text-lg mr-4">
                  MR
                </div>
                <div>
                  <div className="font-semibold text-foreground">Mike Rodriguez</div>
                  <div className="text-sm text-muted-foreground">Warehouse Manager</div>
                  <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">Global Logistics Co.</div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-card p-8 rounded-xl border border-slate-200 dark:border hover:border-slate-300 dark:hover:border-border/60 transition-all duration-200 hover:shadow-lg group">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
              <p className="text-muted-foreground mb-6 text-lg leading-relaxed">"As a supplier, Invista made it so much easier to manage orders and communicate with our partners."</p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center text-white font-semibold text-lg mr-4">
                  DK
                </div>
                <div>
                  <div className="font-semibold text-foreground">David Kim</div>
                  <div className="text-sm text-muted-foreground">Supply Partner</div>
                  <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">Prime Manufacturing</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-r from-slate-800 to-slate-900 dark:from-primary dark:via-primary dark:to-chart-3">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white dark:text-primary-foreground mb-4">
            Ready to modernize your supply chain?
          </h2>
          <p className="text-xl text-slate-200 dark:text-primary-foreground/80 mb-8">
            Join hundreds of businesses already using Invista to streamline their operations
          </p>
          <div className="space-x-4">
            <button className="bg-white text-slate-800 dark:bg-background dark:text-foreground px-8 py-4 rounded-xl font-semibold hover:bg-slate-50 dark:hover:bg-background/90 transition-colors inline-flex items-center">
              Try Invista Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
            <button className="border-2 border-white text-white dark:border-primary-foreground dark:text-primary-foreground px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-slate-800 dark:hover:bg-primary-foreground dark:hover:text-primary transition-colors">
              Schedule a Demo
            </button>
          </div>        </div>
      </section>

      {/* Floating CTA Button */}
      <div className={`fixed bottom-6 right-6 z-50 transition-all duration-500 ${showFloatingCTA ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
        <button className="group bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 flex items-center space-x-2">
          <Zap className="h-5 w-5 group-hover:scale-110 transition-transform" />
          <span className="font-semibold">Start Free Trial</span>
          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};

export default InvistaLanding;