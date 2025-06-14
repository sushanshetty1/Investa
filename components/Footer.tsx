"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Package, 
  Twitter, 
  Linkedin, 
  Github, 
  Mail, 
  Phone, 
  MapPin,
  ArrowUpRight,
  Heart,
  Shield,
  Zap,
  Users,
  BarChart3,
  Truck,
  Building2,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

const Footer = () => {
  const pathname = usePathname();
  
  // Check if we're in dashboard routes (footer should be minimal for dashboard)
  const isDashboard = pathname?.startsWith("/dashboard") || 
                     pathname?.startsWith("/inventory") ||
                     pathname?.startsWith("/orders") ||
                     pathname?.startsWith("/suppliers") ||
                     pathname?.startsWith("/shipments") ||
                     pathname?.startsWith("/reports") ||
                     pathname?.startsWith("/products") ||
                     pathname?.startsWith("/customers") ||
                     pathname?.startsWith("/employees") ||
                     pathname?.startsWith("/warehouses") ||
                     pathname?.startsWith("/invoices") ||
                     pathname?.startsWith("/purchase-orders") ||
                     pathname?.startsWith("/audit");

  // Minimal footer for dashboard pages
  if (isDashboard) {
    return (
      <footer className="mt-auto bg-card/30 border-t border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-md flex items-center justify-center">
                <Package className="h-3 w-3 text-white" />
              </div>
              <span className="text-sm text-muted-foreground">
                © 2025 Invista. All rights reserved.
              </span>
            </div>
            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <Link href="/privacy" className="hover:text-foreground transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-foreground transition-colors">
                Terms
              </Link>
              <Link href="/support" className="hover:text-foreground transition-colors">
                Support
              </Link>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  // Full footer for marketing/landing pages
  return (
    <footer className="bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 dark:from-background dark:via-muted/10 dark:to-chart-3/5 border-t border-border/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {/* Company Info */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                    <Package className="h-6 w-6 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-background animate-pulse" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Invista
                </span>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Revolutionizing supply chain management with intelligent automation, 
                real-time tracking, and powerful analytics for modern businesses.
              </p>
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1">
                  <Shield className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm text-muted-foreground">SOC 2 Compliant</span>
                </div>
                <div className="w-1 h-1 bg-muted-foreground/40 rounded-full" />
                <div className="flex items-center space-x-1">
                  <Zap className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-muted-foreground">99.9% Uptime</span>
                </div>
              </div>
            </div>

            {/* Solutions */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-foreground">Solutions</h3>
              <ul className="space-y-3">
                {[
                  { name: "Inventory Management", icon: Package, href: "/solutions/inventory" },
                  { name: "Order Processing", icon: FileText, href: "/solutions/orders" },
                  { name: "Supplier Network", icon: Building2, href: "/solutions/suppliers" },
                  { name: "Logistics & Shipping", icon: Truck, href: "/solutions/logistics" },
                  { name: "Analytics & Reports", icon: BarChart3, href: "/solutions/analytics" },
                  { name: "Team Management", icon: Users, href: "/solutions/team" },
                ].map((item) => (
                  <li key={item.name}>
                    <Link 
                      href={item.href}
                      className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors group"
                    >
                      <item.icon className="h-4 w-4 group-hover:scale-110 transition-transform" />
                      <span>{item.name}</span>
                      <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-foreground">Resources</h3>
              <ul className="space-y-3">
                {[
                  { name: "Documentation", href: "/docs" },
                  { name: "API Reference", href: "/api-docs" },
                  { name: "Help Center", href: "/help" },
                  { name: "Blog", href: "/blog" },
                  { name: "Case Studies", href: "/case-studies" },
                  { name: "Webinars", href: "/webinars" },
                  { name: "Community", href: "/community" },
                  { name: "Status Page", href: "/status" },
                ].map((item) => (
                  <li key={item.name}>
                    <Link 
                      href={item.href}
                      className="text-muted-foreground hover:text-foreground transition-colors flex items-center group"
                    >
                      <span>{item.name}</span>
                      <ArrowUpRight className="h-3 w-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Newsletter & Contact */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-foreground">Stay Updated</h3>
              <p className="text-muted-foreground text-sm">
                Get the latest updates on new features, industry insights, and supply chain best practices.
              </p>
              
              {/* Newsletter Signup */}
              <div className="space-y-3">
                <div className="flex space-x-2">
                  <Input 
                    placeholder="Enter your email"
                    className="bg-background/50 border-border/60 focus:border-primary/60"
                  />
                  <Button size="sm" className="px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                    Subscribe
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  No spam. Unsubscribe at any time.
                </p>
              </div>

              {/* Contact Info */}
              <div className="space-y-3 pt-2">
                <h4 className="font-medium text-foreground">Contact Us</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span>hello@invista.com</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>+1 (555) 123-4567</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>San Francisco, CA</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Separator className="opacity-60" />

        {/* Bottom Footer */}
        <div className="py-8">
          <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
            {/* Copyright & Legal */}
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-6 text-sm text-muted-foreground">
              <span>© 2025 Invista Technologies, Inc. All rights reserved.</span>
              <div className="flex items-center space-x-4">
                <Link href="/privacy" className="hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
                <Link href="/terms" className="hover:text-foreground transition-colors">
                  Terms of Service
                </Link>
                <Link href="/cookies" className="hover:text-foreground transition-colors">
                  Cookie Policy
                </Link>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground hidden sm:block">Follow us:</span>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" className="h-9 w-9 p-0 hover:bg-accent/60">
                  <Twitter className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="h-9 w-9 p-0 hover:bg-accent/60">
                  <Linkedin className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="h-9 w-9 p-0 hover:bg-accent/60">
                  <Github className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Made with Love */}
          <div className="flex items-center justify-center space-x-2 mt-6 pt-6 border-t border-border/40">
            <span className="text-xs text-muted-foreground">Made with</span>
            <Heart className="h-3 w-3 text-red-500 animate-pulse" />
            <span className="text-xs text-muted-foreground">for the supply chain community</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;