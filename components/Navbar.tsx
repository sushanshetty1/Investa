"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  X,
  User,
  Settings,
  LogOut,
  Bell,
  Search,
  ChevronDown,
  Package,
  BarChart3,
  Truck,
  Home,
  FileText,
  Building2,
  Zap
} from "lucide-react";

// Type definitions
interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  items: SubNavItem[];
}

interface SubNavItem {
  title: string;
  href: string;
}

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, loading, userType, hasCompanyAccess } = useAuth();
  const dropdownRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const nav = document.querySelector('nav');
      if (isOpen && nav && !nav.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Handle dropdown clicks outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openDropdown && dropdownRefs.current[openDropdown]) {
        const dropdownElement = dropdownRefs.current[openDropdown];
        if (dropdownElement && !dropdownElement.contains(event.target as Node)) {
          setOpenDropdown(null);
        }
      }
    };

    if (openDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openDropdown]);
  // Show loading state while auth is being determined
  if (loading) {
    return (
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border/30">
        <div className="mx-4 md:mx-8 px-2 sm:px-4">
          <div className="flex items-center justify-between h-20">
            <Link href="/" className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-7 h-7 sm:w-8 sm:h-8 lg:w-9 lg:h-9 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Package className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
              </div>
              <span className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Invista
              </span>
            </Link>
            <div className="flex items-center space-x-2 sm:space-x-3">
              <ThemeToggle />
              <div className="w-6 h-6 sm:w-7 sm:h-7 bg-muted rounded-full animate-pulse" />
            </div>
          </div>
        </div>
      </nav>
    );
  }

  const dashboardNavItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: Home,
      items: [
        { title: "Overview", href: "/dashboard" },
        { title: "Analytics", href: "/dashboard/analytics" },
        { title: "Notifications", href: "/dashboard/notifications" },
        { title: "Settings", href: "/dashboard/settings" },
      ]
    },
    {
      title: "Inventory",
      href: "/inventory",
      icon: Package,
      items: [
        { title: "Products", href: "/inventory/products" },
        { title: "Stock Management", href: "/inventory/stock" },
        { title: "Suppliers", href: "/inventory/suppliers" },
        { title: "Categories", href: "/inventory/categories" },
        { title: "Low Stock Alerts", href: "/inventory/alerts" },
        { title: "Stock Adjustments", href: "/inventory/adjustments" },
        { title: "Reports", href: "/inventory/reports" },
      ]
    },
    {
      title: "Orders",
      href: "/orders",
      icon: FileText,
      items: [
        { title: "Customer Orders", href: "/orders" },
        { title: "Create Order", href: "/orders/create" },
        { title: "Pending Orders", href: "/orders?status=PENDING" },
        { title: "Processing", href: "/orders?status=PROCESSING" },
        { title: "Shipped Orders", href: "/orders?status=SHIPPED" },
        { title: "Order Analytics", href: "/orders/analytics" },
      ]
    },
    {
      title: "Purchase Orders",
      href: "/purchase-orders",
      icon: Truck,
      items: [
        { title: "All Purchase Orders", href: "/purchase-orders" },
        { title: "Create PO", href: "/purchase-orders/create" },
        { title: "Pending Approval", href: "/purchase-orders?status=PENDING_APPROVAL" },
        { title: "Awaiting Delivery", href: "/purchase-orders?status=APPROVED" },
        { title: "Reorder Suggestions", href: "/purchase-orders?tab=reorder" },
        { title: "Goods Receipt", href: "/purchase-orders/goods-receipt" },
      ]
    },
    {
      title: "Suppliers",
      href: "/suppliers",
      icon: Building2,
      items: [
        { title: "All Suppliers", href: "/suppliers" },
        { title: "Add Supplier", href: "/suppliers/add" },
        { title: "Performance", href: "/suppliers/performance" },
      ]
    },
    {
      title: "Logistics",
      href: "/shipments",
      icon: Truck,
      items: [
        { title: "Shipments", href: "/shipments" },
        { title: "Purchase Orders", href: "/purchase-orders" },
        { title: "Tracking", href: "/shipments/tracking" },
      ]
    },
    {
      title: "Reports",
      href: "/reports",
      icon: BarChart3,
      items: [
        { title: "Inventory Reports", href: "/reports/inventory" },
        { title: "Sales Reports", href: "/reports/sales" },
        { title: "Financial Reports", href: "/reports/financial" },
        { title: "Custom Reports", href: "/reports/custom" },
      ]
    }
  ];

  // Check if we're in dashboard routes
  const isDashboard = user && hasCompanyAccess && (pathname?.startsWith("/dashboard") ||
    pathname?.startsWith("/inventory") ||
    pathname?.startsWith("/orders") ||
    pathname?.startsWith("/profile") ||
    pathname?.startsWith("/suppliers") ||
    pathname?.startsWith("/shipments") ||
    pathname?.startsWith("/reports") ||
    pathname?.startsWith("/products") ||
    pathname?.startsWith("/customers") ||
    pathname?.startsWith("/employees") ||
    pathname?.startsWith("/warehouses") ||
    pathname?.startsWith("/invoices") ||
    pathname?.startsWith("/purchase-orders") ||
    pathname?.startsWith("/audit"));

  const handleAuthAction = async (action: string) => {
    if (action === "login") {
      router.push("/auth/login");
    } else if (action === "signup") {
      router.push("/auth/signUp");
    } else if (action === "logout") {
      await logout();
    }
  };

  const handleDropdownToggle = (itemHref: string) => {
    setOpenDropdown(openDropdown === itemHref ? null : itemHref);
  };

  const CustomDropdown = ({ item, isOpen, onToggle }: {
    item: NavItem;
    isOpen: boolean;
    onToggle: (href: string) => void;
  }) => {
    return (
      <div
        className="relative group"
        ref={(el) => {
          if (el) {
            dropdownRefs.current[item.href] = el;
          }
        }}
      >        {/* Glow effect on hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition-all duration-300" /><button
          onClick={() => onToggle(item.href)}
          className={`relative flex items-center h-8 px-3 text-xs rounded-lg transition-all duration-300 whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-primary/20 border group-hover:border-primary/40 group-hover:shadow-lg group-hover:shadow-primary/10 font-medium ${isOpen
            ? 'bg-primary/10 dark:bg-primary/20 border-primary/50 text-primary shadow-lg shadow-primary/20'
            : 'bg-background/60 dark:bg-background/40 border-border/30 dark:border-border/20 hover:bg-accent/60 dark:hover:bg-accent/40'
            }`}
        >
          <item.icon className="h-4 w-4 mr-2 flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
          <span className="hidden md:inline font-medium">{item.title}</span>
          <span className="md:hidden font-medium">{item.title.substring(0, 1)}</span>
          <ChevronDown className={`h-3 w-3 ml-2 hidden sm:block flex-shrink-0 transition-all duration-300 ${isOpen ? 'rotate-180 text-primary' : 'group-hover:rotate-12'
            }`} />

          {/* Active indicator */}
          {pathname?.startsWith(item.href) && (
            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
          )}
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 mt-2 p-2 min-w-[220px] sm:min-w-[240px] max-w-[320px] bg-background/95 dark:bg-background/90 backdrop-blur-xl border border-border/50 dark:border-border/30 rounded-xl shadow-2xl shadow-black/20 dark:shadow-black/40 z-50 animate-in fade-in-0 zoom-in-95 duration-300">
            {/* Subtle glow inside dropdown */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-purple-500/5 rounded-xl pointer-events-none" />

            <div className="relative grid gap-1 w-full">
              {item.items.map((subItem: SubNavItem, index: number) => (
                <Link
                  key={subItem.href}
                  href={subItem.href}
                  onClick={() => setOpenDropdown(null)}
                  className="group/item block px-3 py-2.5 text-sm rounded-lg hover:bg-accent/60 dark:hover:bg-accent/40 transition-all duration-300 border border-transparent hover:border-primary/20 relative overflow-hidden"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity duration-300" />
                  <span className="relative text-foreground/80 group-hover/item:text-primary transition-colors duration-300">
                    {subItem.title}
                  </span>
                  {pathname === subItem.href && (
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 w-1.5 h-1.5 bg-primary rounded-full" />
                  )}
                </Link>
              ))}
            </div>          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Mobile Menu Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Single Line Futuristic Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled
        ? "bg-background/95 dark:bg-background/85 backdrop-blur-2xl border-b border-border/80 dark:border-border/40 shadow-2xl shadow-primary/10 dark:shadow-primary/20"
        : "bg-background/80 dark:bg-background/70 backdrop-blur-xl border-b border-border/40 dark:border-border/20"
        }`}>
        {/* Animated aurora background effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-cyan-500/5 dark:from-blue-500/10 dark:via-purple-500/10 dark:to-cyan-500/10 opacity-0 hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />

        {/* Flowing particles effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute w-2 h-2 bg-primary/20 rounded-full animate-ping" style={{ top: '20%', left: '10%', animationDelay: '0s' }} />
          <div className="absolute w-1 h-1 bg-purple-500/20 rounded-full animate-ping" style={{ top: '60%', left: '80%', animationDelay: '2s' }} />
          <div className="absolute w-1.5 h-1.5 bg-cyan-500/20 rounded-full animate-ping" style={{ top: '40%', left: '60%', animationDelay: '4s' }} />        </div>

        {isDashboard ? (
          /* SINGLE LINE LAYOUT FOR DASHBOARD */          <div className="relative mx-4 md:mx-8 px-2 sm:px-4">
            <div className="flex items-center justify-between h-12 gap-4">

              {/* Enhanced Logo */}
              <Link href="/" className="flex items-center space-x-3 group flex-shrink-0 relative">
                <div className="relative">
                  <div className="absolute inset-0 w-10 h-10 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-xl blur-lg opacity-40 group-hover:opacity-70 transition-all duration-500 group-hover:scale-150" />
                  <div className="absolute inset-0 w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-xl blur-md opacity-30 group-hover:opacity-60 transition-all duration-300 group-hover:scale-125" />

                  <div className="relative w-10 h-10 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-all duration-300 border-2 border-white/20 dark:border-white/10 shadow-2xl">
                    <Package className="h-6 w-6 text-white drop-shadow-lg" />
                  </div>

                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-background shadow-lg">
                    <div className="absolute inset-0 w-3 h-3 bg-emerald-400 rounded-full animate-ping opacity-75" />
                    <div className="absolute inset-1 w-1 h-1 bg-white rounded-full animate-pulse" />
                  </div>
                </div>

                <div className="relative">
                  <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent group-hover:from-blue-500 group-hover:via-indigo-500 group-hover:to-purple-500 transition-all duration-300">
                    Invista
                  </span>
                  <div className="text-xs text-muted-foreground font-medium tracking-wider">
                    Supply Chain Intelligence
                  </div>
                  <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:w-full transition-all duration-500" />
                </div>
              </Link>

              {/* Search Bar - COMMENTED OUT */}
              {/* 
              <div className="hidden lg:flex relative group flex-shrink-0 w-80">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-all duration-300" />
                <div className="relative w-full bg-background/60 dark:bg-background/40 backdrop-blur-sm border border-border/50 dark:border-border/30 rounded-xl overflow-hidden group-hover:border-primary/50 transition-all duration-300">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
                  <Input
                    placeholder="Search products, orders, suppliers..."
                    className="pl-12 pr-20 h-12 bg-transparent border-0 focus:ring-0 focus:border-0 text-sm placeholder:text-muted-foreground/60 font-medium w-full"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                    <kbd className="pointer-events-none inline-flex h-6 select-none items-center gap-1 rounded border bg-muted px-2 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                      <span className="text-xs">⌘</span>K
                    </kbd>
                  </div>
                </div>
              </div>
              */}              {/* Main Navigation */}
              <div className="hidden lg:flex items-center justify-center flex-1">
                <div className="flex items-center space-x-1 bg-muted/30 dark:bg-muted/20 rounded-xl px-2 py-1 border border-border/40 dark:border-border/20 backdrop-blur-sm">
                  {dashboardNavItems.map((item) => (
                    <CustomDropdown
                      key={item.href}
                      item={item}
                      isOpen={openDropdown === item.href}
                      onToggle={handleDropdownToggle}
                    />
                  ))}
                </div>
              </div>              {/* Right Actions - Notifications, Theme, User Menu, Mobile Menu */}
              <div className="flex items-center space-x-4 flex-shrink-0">
                {/* Notifications */}
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-all duration-300" />
                  <Button variant="ghost" size="sm" className="relative h-10 w-10 p-0 hover:bg-accent/60 dark:hover:bg-accent/40 flex-shrink-0 border border-border/30 dark:border-border/20 hover:border-primary/50 transition-all duration-300 rounded-xl">
                    <Bell className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[9px] bg-gradient-to-r from-red-500 to-orange-500 border-2 border-background shadow-lg animate-pulse font-bold">
                      3
                    </Badge>
                  </Button>
                </div>

                {/* Theme Toggle */}
                <ThemeToggle />

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-10 px-3 space-x-2 hover:bg-accent/60 dark:hover:bg-accent/40 flex-shrink-0 border border-border/30 dark:border-border/20 hover:border-primary/50 transition-all duration-300 group rounded-xl">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full blur opacity-50 group-hover:opacity-80 transition-all duration-300 group-hover:scale-150" />
                        <div className="relative w-7 h-7 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center border-2 border-white/20 shadow-lg">
                          <User className="h-4 w-4 text-white" />
                        </div>
                      </div>
                      <div className="hidden xl:block text-left min-w-0">
                        <div className="text-sm font-medium truncate max-w-[120px]">
                          {user?.email?.split('@')[0] || 'User'}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {userType === 'company' ? 'Company Admin' : 'Individual User'}
                        </div>
                      </div>
                      <ChevronDown className="h-3 w-3 group-hover:rotate-180 transition-transform duration-300" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64 mt-2 bg-background/95 dark:bg-background/90 backdrop-blur-xl border border-border/50 dark:border-border/30 shadow-2xl rounded-xl">
                    <div className="px-3 py-2 border-b border-border/30">
                      <div className="text-sm font-medium">{user?.email}</div>
                      <div className="text-xs text-muted-foreground">{userType === 'company' ? 'Company Administrator' : 'Individual User'}</div>
                    </div>
                    <DropdownMenuItem
                      className="cursor-pointer hover:bg-accent/60 dark:hover:bg-accent/40 mx-1 my-1 rounded-lg"
                      onClick={() => router.push(userType === 'company' ? '/company-profile' : '/user-profile')}
                    >
                      <User className="mr-3 h-4 w-4" />
                      {userType === 'company' ? 'Company Profile' : 'User Profile'}
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer hover:bg-accent/60 dark:hover:bg-accent/40 mx-1 my-1 rounded-lg">
                      <Settings className="mr-3 h-4 w-4" />
                      Settings & Preferences
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="mx-1" />
                    <DropdownMenuItem
                      onClick={() => handleAuthAction("logout")}
                      className="cursor-pointer text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 mx-1 my-1 rounded-lg"
                    >
                      <LogOut className="mr-3 h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Mobile Menu Button */}
                <div className="relative group lg:hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-all duration-300" />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="relative lg:hidden h-10 w-10 p-0 hover:bg-accent/60 dark:hover:bg-accent/40 border border-border/30 dark:border-border/20 hover:border-primary/50 transition-all duration-300 rounded-xl"
                    onClick={() => setIsOpen(!isOpen)}
                  >
                    {isOpen ? (
                      <X className="h-4 w-4 rotate-90 group-hover:rotate-180 transition-transform duration-300" />
                    ) : (
                      <Menu className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />)}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* SINGLE DECK LAYOUT FOR MARKETING PAGES */
          <div className="relative mx-4 md:mx-8 px-2 sm:px-4">
            <div className="flex items-center justify-between h-20">

              {/* Logo */}
              <Link href="/" className="flex items-center space-x-3 group flex-shrink-0 relative">
                <div className="relative">
                  <div className="absolute inset-0 w-9 h-9 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-lg blur-md opacity-50 group-hover:opacity-80 transition-all duration-300 group-hover:scale-125" />
                  <div className="relative w-9 h-9 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-all duration-300 border border-white/20 dark:border-white/10">
                    <Package className="h-6 w-6 text-white drop-shadow-sm" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full border border-background shadow-lg">
                    <div className="absolute inset-0 w-2 h-2 bg-emerald-400 rounded-full animate-ping opacity-75" />
                  </div>
                </div>
                <div className="relative">
                  <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent truncate group-hover:from-blue-500 group-hover:via-indigo-500 group-hover:to-purple-500 transition-all duration-300">
                    Invista
                  </span>
                  <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:w-full transition-all duration-300" />
                </div>
              </Link>              {/* Marketing Navigation */}
              <div className="hidden md:flex items-center gap-8 flex-1 justify-center">
                <div className="flex items-center gap-8 bg-muted/20 dark:bg-muted/10 rounded-full px-10 py-4 border border-border/30 dark:border-border/20 backdrop-blur-sm">
                  <Link href="#features" className="text-sm font-medium text-foreground/80 hover:text-primary transition-all duration-300 relative group whitespace-nowrap">
                    Features
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
                  </Link>
                  <Link href="#how-it-works" className="text-sm font-medium text-foreground/80 hover:text-primary transition-all duration-300 relative group whitespace-nowrap">
                    How it Works
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
                  </Link>
                  <Link href="/pricing" className="text-sm font-medium text-foreground/80 hover:text-primary transition-all duration-300 relative group whitespace-nowrap">
                    Pricing
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
                  </Link>
                  <Link href="/contact" className="text-sm font-medium text-foreground/80 hover:text-primary transition-all duration-300 relative group whitespace-nowrap">
                    Contact
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
                  </Link>
                </div>
              </div>

              {/* Auth Actions */}
              <div className="flex items-center space-x-3 flex-shrink-0">
                <ThemeToggle />

                <div className="hidden sm:flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleAuthAction("login")}
                    className="h-9 px-4 text-sm hover:bg-accent/60 dark:hover:bg-accent/40 border border-border/30 dark:border-border/20 hover:border-primary/50 transition-all duration-300 rounded-xl"
                  >
                    Sign In
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        size="sm"
                        className="h-9 px-4 text-sm bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 dark:from-blue-500 dark:to-indigo-500 dark:hover:from-blue-600 dark:hover:to-indigo-600 border border-primary/20 shadow-lg hover:shadow-primary/25 transition-all duration-300 group relative overflow-hidden rounded-xl"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <span className="relative hidden sm:inline-flex items-center">
                          Get Started
                          <Zap className="ml-2 h-3 w-3" />
                        </span>
                        <span className="relative sm:hidden">Start</span>
                        <ChevronDown className="ml-2 h-3 w-3 group-hover:rotate-180 transition-transform duration-300" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 bg-background/95 dark:bg-background/90 backdrop-blur-xl border border-border/50 dark:border-border/30 shadow-xl rounded-xl">
                      <DropdownMenuItem
                        onClick={() => router.push("/auth/company-signup")}
                        className="cursor-pointer hover:bg-accent/60 dark:hover:bg-accent/40 mx-1 my-1 rounded-lg"
                      >
                        <Building2 className="mr-3 h-4 w-4" />
                        Create Company Account
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleAuthAction("signup")}
                        className="cursor-pointer hover:bg-accent/60 dark:hover:bg-accent/40 mx-1 my-1 rounded-lg"
                      >
                        <User className="mr-3 h-4 w-4" />
                        Join as Individual
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Mobile Menu Button */}
                <div className="relative group md:hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-all duration-300" />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="relative md:hidden h-9 w-9 p-0 hover:bg-accent/60 dark:hover:bg-accent/40 border border-border/30 dark:border-border/20 hover:border-primary/50 transition-all duration-300 rounded-xl"
                    onClick={() => setIsOpen(!isOpen)}
                  >
                    {isOpen ? (
                      <X className="h-4 w-4 rotate-90 group-hover:rotate-180 transition-transform duration-300" />
                    ) : (
                      <Menu className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Mobile Menu */}
        <div className={`lg:hidden absolute top-full left-0 right-0 border-t border-border/60 dark:border-border/40 bg-background/95 dark:bg-background/90 backdrop-blur-2xl transition-all duration-500 ease-in-out z-40 mobile-menu-scroll ${isOpen ? 'max-h-[85vh] opacity-100 visible overflow-y-auto' : 'max-h-0 opacity-0 invisible overflow-hidden'
          }`}>
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-purple-500/5 pointer-events-none" />

          <div className="relative mx-4 md:mx-8 px-2 py-6">
            <div className="space-y-6">
              {isDashboard ? (
                <>
                  {/* Mobile Search */}
                  <div className="px-2 py-3">
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-all duration-300" />
                      <div className="relative bg-background/60 dark:bg-background/40 backdrop-blur-sm border border-border/50 dark:border-border/30 rounded-2xl overflow-hidden group-hover:border-primary/50 transition-all duration-300">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
                        <Input
                          placeholder="Search everything..."
                          className="pl-12 pr-16 bg-transparent border-0 focus:ring-0 focus:border-0 h-14 w-full text-base placeholder:text-muted-foreground/60 font-medium"
                        />
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                          <kbd className="pointer-events-none inline-flex h-6 select-none items-center gap-1 rounded border bg-muted px-2 font-mono text-xs font-medium text-muted-foreground opacity-100">
                            ⌘K
                          </kbd>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Mobile Navigation */}
                  <div className="space-y-3">
                    {dashboardNavItems.map((item, index) => (
                      <div key={item.href} className="space-y-2">
                        <Link
                          href={item.href}
                          className="flex items-center px-5 py-4 text-base font-semibold rounded-2xl hover:bg-accent/60 dark:hover:bg-accent/40 transition-all duration-300 border border-transparent hover:border-primary/20 group relative overflow-hidden"
                          onClick={() => setIsOpen(false)}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          <div className="relative flex items-center w-full">
                            <div className="relative">
                              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition-all duration-300" />
                              <div className="relative w-10 h-10 bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-all duration-300 border border-border/30">
                                <item.icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
                              </div>
                            </div>
                            <span className="ml-4 group-hover:translate-x-1 transition-transform duration-300">{item.title}</span>
                            {pathname?.startsWith(item.href) && (
                              <div className="ml-auto w-3 h-3 bg-primary rounded-full animate-pulse" />
                            )}
                          </div>
                        </Link>

                        <div className="ml-8 space-y-1 border-l-2 border-gradient-to-b from-primary/30 to-purple-500/30 pl-6">
                          {item.items.map((subItem, subIndex) => (
                            <Link
                              key={subItem.href}
                              href={subItem.href}
                              className="block px-4 py-3 text-sm text-muted-foreground rounded-xl hover:bg-accent/40 dark:hover:bg-accent/30 transition-all duration-300 hover:text-primary relative group"
                              onClick={() => setIsOpen(false)}
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
                              <span className="relative group-hover:translate-x-2 transition-transform duration-300">
                                {subItem.title}
                              </span>
                              {pathname === subItem.href && (
                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-primary rounded-full" />
                              )}
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Mobile User Profile */}
                  <div className="border-t border-border/40 dark:border-border/20 pt-6">
                    <div className="flex items-center space-x-4 py-4 px-3 rounded-2xl bg-gradient-to-r from-muted/30 to-muted/20 border border-border/30 dark:border-border/20">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full blur opacity-50" />
                        <div className="relative w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center border-2 border-white/20 shadow-lg">
                          <User className="h-6 w-6 text-white" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-base font-semibold truncate">{user?.email?.split('@')[0] || 'User'}</div>
                        <div className="text-sm text-muted-foreground truncate">{user?.email}</div>
                        <div className="text-xs text-primary font-medium">{userType === 'company' ? 'Company Admin' : 'Individual User'}</div>
                      </div>
                    </div>

                    <div className="space-y-2 mt-4">
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-base h-14 rounded-2xl hover:bg-accent/60 dark:hover:bg-accent/40 border border-transparent hover:border-primary/20 group relative overflow-hidden"
                        onClick={() => {
                          router.push(userType === 'company' ? '/company-profile' : '/user-profile');
                          setIsOpen(false);
                        }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <User className="mr-4 h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                        <span className="group-hover:translate-x-1 transition-transform duration-300">
                          {userType === 'company' ? 'Company Profile' : 'User Profile'}
                        </span>
                      </Button>

                      <Button
                        variant="ghost"
                        className="w-full justify-start text-base h-14 rounded-2xl hover:bg-accent/60 dark:hover:bg-accent/40 border border-transparent hover:border-primary/20 group relative overflow-hidden"
                        onClick={() => {
                          router.push('/dashboard/settings');
                          setIsOpen(false);
                        }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <Settings className="mr-4 h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                        <span className="group-hover:translate-x-1 transition-transform duration-300">Settings & Preferences</span>
                      </Button>

                      <Button
                        variant="ghost"
                        className="w-full justify-start text-base h-14 rounded-2xl text-red-600 dark:text-red-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 border border-transparent hover:border-red-200 dark:hover:border-red-800 group relative overflow-hidden"
                        onClick={() => {
                          handleAuthAction("logout");
                          setIsOpen(false);
                        }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <LogOut className="mr-4 h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                        <span className="group-hover:translate-x-1 transition-transform duration-300">Sign Out</span>
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Marketing Mobile Menu */}
                  <div className="space-y-3">
                    {[
                      { href: "#features", title: "Features" },
                      { href: "#how-it-works", title: "How it Works" },
                      { href: "/pricing", title: "Pricing" },
                      { href: "/contact", title: "Contact" }
                    ].map((link, index) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="flex items-center px-5 py-4 text-base font-semibold rounded-2xl hover:bg-accent/60 dark:hover:bg-accent/40 transition-all duration-300 border border-transparent hover:border-primary/20 group relative overflow-hidden"
                        onClick={() => setIsOpen(false)}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <span className="relative group-hover:translate-x-1 transition-transform duration-300">
                          {link.title}
                        </span>
                      </Link>
                    ))}
                  </div>

                  {/* Mobile Auth Actions */}
                  <div className="border-t border-border/40 dark:border-border/20 pt-6 space-y-3">
                    <Button
                      variant="ghost"
                      className="w-full justify-start h-14 rounded-2xl hover:bg-accent/60 dark:hover:bg-accent/40 border border-transparent hover:border-primary/20 group relative overflow-hidden text-base"
                      onClick={() => {
                        handleAuthAction("login");
                        setIsOpen(false);
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <span className="relative group-hover:translate-x-1 transition-transform duration-300">Sign In</span>
                    </Button>

                    <Button
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 dark:from-blue-500 dark:to-indigo-500 dark:hover:from-blue-600 dark:hover:to-indigo-600 h-14 rounded-2xl shadow-lg hover:shadow-primary/25 transition-all duration-300 group relative overflow-hidden text-base"
                      onClick={() => {
                        router.push("/auth/company-signup");
                        setIsOpen(false);
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <Building2 className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                      <span className="relative">Create Company Account</span>
                    </Button>

                    <Button
                      variant="outline"
                      className="w-full h-14 rounded-2xl border-border/50 dark:border-border/30 hover:border-primary/50 hover:bg-accent/60 dark:hover:bg-accent/40 transition-all duration-300 group relative overflow-hidden text-base"
                      onClick={() => {
                        handleAuthAction("signup");
                        setIsOpen(false);
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <User className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                      <span className="relative">Join as Individual</span>
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
