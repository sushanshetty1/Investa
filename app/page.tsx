import React from 'react';
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
  Zap
} from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';

const InvistaLanding = () => {
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
      <section className="bg-gradient-to-br from-muted/30 to-primary/10 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium mb-4">
                <Zap className="h-4 w-4 mr-1" />
                Integrated Inventory & Supply Chain Made Simple
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
                Fastrack Open Innovation Through
                <span className="text-primary block">Invista</span>
              </h1>
              
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                A unified platform to streamline inventory tracking, supplier collaboration, 
                and logistics for growing businesses. Real-Time Visibility. Centralized Operations. 
                Smarter Decisions.
              </p>              {/* Key Metrics */}
              <div className="grid grid-cols-3 gap-6 mb-8">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Warehouse className="h-6 w-6 text-muted-foreground mr-1" />
                  </div>
                  <div className="text-2xl font-bold text-foreground">10+</div>
                  <div className="text-sm text-muted-foreground">Warehouses</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <RefreshCw className="h-6 w-6 text-muted-foreground mr-1" />
                  </div>
                  <div className="text-2xl font-bold text-foreground">1000+</div>
                  <div className="text-sm text-muted-foreground">Orders Processed</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Lock className="h-6 w-6 text-muted-foreground mr-1" />
                  </div>
                  <div className="text-2xl font-bold text-foreground">99.9%</div>
                  <div className="text-sm text-muted-foreground">Uptime</div>
                </div>
              </div>
            </div>            {/* CTA Cards */}
            <div className="space-y-4">
              <div className="bg-primary rounded-3xl p-8 text-primary-foreground transform hover:scale-105 transition-transform cursor-pointer">
                <h3 className="text-2xl font-bold mb-2">For Businesses</h3>
                <p className="text-primary-foreground/80 mb-6">
                  Track multi-location inventory & automate purchase orders
                </p>
                <button className="bg-background text-foreground px-6 py-3 rounded-xl font-semibold hover:bg-background/90 transition-colors">
                  View Dashboard
                </button>
              </div>
              
              <div className="bg-chart-2 rounded-3xl p-8 text-white transform hover:scale-105 transition-transform cursor-pointer">
                <h3 className="text-2xl font-bold mb-2">For Suppliers</h3>
                <p className="text-white/80 mb-6">
                  Manage catalogs, orders & improve delivery visibility
                </p>
                <button className="bg-foreground text-background px-6 py-3 rounded-xl font-semibold hover:bg-foreground/90 transition-colors">
                  Partner With Us
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>      {/* Problem Section */}
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
          </div>

          <div className="text-center">
            <h3 className="text-3xl font-bold text-foreground mb-8">Invista Solves This</h3>
            <div className="inline-flex items-center bg-chart-2/10 text-chart-2 px-4 py-2 rounded-full">
              <CheckCircle className="h-5 w-5 mr-2" />
              Unified. Automated. Real-Time.
            </div>
          </div>
        </div>
      </section>      {/* Features Section */}
      <section id="features" className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">Core Features</h2>
            <p className="text-xl text-muted-foreground">Everything you need to manage your supply chain efficiently</p>
          </div>          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-card p-6 rounded-xl border border-border hover:shadow-md transition-shadow">
              <BarChart3 className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">Real-Time Inventory Monitoring</h3>
              <p className="text-muted-foreground">Track stock levels across all warehouses with live updates</p>
            </div>

            <div className="bg-card p-6 rounded-xl border border-border hover:shadow-md transition-shadow">
              <ShoppingCart className="h-12 w-12 text-chart-2 mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">Order Management</h3>
              <p className="text-muted-foreground">Streamline purchase and customer orders in one platform</p>
            </div>

            <div className="bg-card p-6 rounded-xl border border-border hover:shadow-md transition-shadow">
              <FileText className="h-12 w-12 text-chart-3 mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">Automated Invoicing</h3>
              <p className="text-muted-foreground">Generate reports and invoices automatically</p>
            </div>

            <div className="bg-card p-6 rounded-xl border border-border hover:shadow-md transition-shadow">
              <Truck className="h-12 w-12 text-chart-4 mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">Shipment Tracking</h3>
              <p className="text-muted-foreground">Monitor deliveries with real-time alerts and updates</p>
            </div>

            <div className="bg-card p-6 rounded-xl border border-border hover:shadow-md transition-shadow">
              <Bell className="h-12 w-12 text-chart-5 mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">Smart Alerts</h3>
              <p className="text-muted-foreground">Get notified for low stock and reorder points</p>
            </div>

            <div className="bg-card p-6 rounded-xl border border-border hover:shadow-md transition-shadow">
              <Shield className="h-12 w-12 text-destructive mb-4" />
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
              <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">1. Add Suppliers & Products</h3>
              <p className="text-muted-foreground">Set up your supplier network and product catalog in minutes</p>
            </div>

            <div className="text-center">
              <div className="bg-chart-2/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <Warehouse className="h-8 w-8 text-chart-2" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">2. Track Stock Across Warehouses</h3>
              <p className="text-muted-foreground">Monitor inventory levels in real-time across all locations</p>
            </div>

            <div className="text-center">
              <div className="bg-chart-3/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-8 w-8 text-chart-3" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">3. Fulfill Orders With Confidence</h3>
              <p className="text-muted-foreground">Process orders efficiently with complete visibility</p>
            </div>
          </div>
        </div>
      </section>      {/* Testimonials Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">Trusted by Growing Businesses</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card p-6 rounded-xl border border-border">
              <p className="text-muted-foreground mb-4">"Invista transformed our inventory management. We reduced stockouts by 80% and improved our cash flow significantly."</p>
              <div className="font-semibold text-foreground">Sarah Chen</div>
              <div className="text-sm text-muted-foreground">Operations Manager</div>
            </div>

            <div className="bg-card p-6 rounded-xl border border-border">
              <p className="text-muted-foreground mb-4">"The real-time visibility across our 5 warehouses has been a game-changer. No more manual spreadsheets!"</p>
              <div className="font-semibold text-foreground">Mike Rodriguez</div>
              <div className="text-sm text-muted-foreground">Warehouse Manager</div>
            </div>

            <div className="bg-card p-6 rounded-xl border border-border">
              <p className="text-muted-foreground mb-4">"As a supplier, Invista made it so much easier to manage orders and communicate with our partners."</p>
              <div className="font-semibold text-foreground">David Kim</div>
              <div className="text-sm text-muted-foreground">Supply Partner</div>
            </div>
          </div>
        </div>
      </section>      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary via-primary to-chart-3">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-primary-foreground mb-4">
            Ready to modernize your supply chain?
          </h2>
          <p className="text-xl text-primary-foreground/80 mb-8">
            Join hundreds of businesses already using Invista to streamline their operations
          </p>
          <div className="space-x-4">
            <button className="bg-background text-foreground px-8 py-4 rounded-xl font-semibold hover:bg-background/90 transition-colors inline-flex items-center">
              Try Invista Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
            <button className="border-2 border-primary-foreground text-primary-foreground px-8 py-4 rounded-xl font-semibold hover:bg-primary-foreground hover:text-primary transition-colors">
              Schedule a Demo
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default InvistaLanding;