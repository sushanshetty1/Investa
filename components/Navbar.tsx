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
  Building2
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
  const { user, logout, loading } = useAuth();
  const dropdownRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Handle scroll effect - must be called before any early returns
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
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Package className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Invista
              </span>
            </Link>
            <div className="flex items-center space-x-3">
              <ThemeToggle />
              <div className="w-8 h-8 bg-muted rounded-full animate-pulse" />
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
        { title: "All Items", href: "/inventory" },
        { title: "Add Item", href: "/inventory/add" },
        { title: "Low Stock", href: "/inventory/low-stock" },
        { title: "Adjustments", href: "/inventory/adjustments" },
        { title: "Reports", href: "/inventory/reports" },
      ]
    },
    {
      title: "Orders",
      href: "/orders",
      icon: FileText,
      items: [
        { title: "All Orders", href: "/orders" },
        { title: "Create Order", href: "/orders/create" },
        { title: "Pending", href: "/orders/pending" },
        { title: "Shipped", href: "/orders/shipped" },
        { title: "Delivered", href: "/orders/delivered" },
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

  // Check if we're in dashboard routes AND user is authenticated
  const isDashboard = user && (pathname?.startsWith("/dashboard") || 
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
        className="relative"
        ref={(el) => {
          if (el) {
            dropdownRefs.current[item.href] = el;
          }
        }}
      >
        <button
          onClick={() => onToggle(item.href)}
          className={`flex items-center h-9 px-2 text-xs rounded-md transition-colors whitespace-nowrap hover:bg-accent/50 focus:outline-none focus:ring-2 focus:ring-primary/20 ${
            isOpen ? 'bg-accent/60' : 'bg-transparent'
          }`}
        >
          <item.icon className="h-4 w-4 mr-1" />
          <span className="hidden 2xl:inline">{item.title}</span>
          <span className="2xl:hidden">{item.title.substring(0, 4)}</span>
          <ChevronDown className={`h-3 w-3 ml-1 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`} />
        </button>
        
        {isOpen && (          <div className="absolute top-full left-0 mt-1 p-2 min-w-[200px] bg-background border border-border rounded-md shadow-lg z-50 animate-in fade-in-0 zoom-in-95 duration-200">
            <div className="grid gap-1 w-48">
              {item.items.map((subItem: SubNavItem) => (
                <Link
                  key={subItem.href}
                  href={subItem.href}
                  onClick={() => setOpenDropdown(null)}
                  className="block px-3 py-2 text-sm rounded-md hover:bg-accent/60 transition-colors"
                >
                  {subItem.title}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Mobile Menu Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 xl:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? "bg-background/95 backdrop-blur-xl border-b border-border/60 shadow-lg shadow-black/5" 
          : "bg-background/80 backdrop-blur-sm border-b border-border/30"
      }`}>
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3 group flex-shrink-0">
              <div className="relative">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <Package className="h-5 w-5 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-background animate-pulse" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Invista
              </span>
            </Link>

            {/* Desktop Navigation */}
            {isDashboard ? (
              <div className="hidden xl:flex items-center flex-1 justify-center max-w-4xl">
                <div className="flex items-center space-x-1">
                  {dashboardNavItems.map((item) => (
                    <CustomDropdown
                      key={item.href}
                      item={item}
                      isOpen={openDropdown === item.href}
                      onToggle={handleDropdownToggle}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="hidden xl:flex items-center space-x-4 flex-1 justify-center">
                <Link href="#features" className="text-sm font-medium hover:text-primary transition-colors whitespace-nowrap">
                  Features
                </Link>
                <Link href="#how-it-works" className="text-sm font-medium hover:text-primary transition-colors whitespace-nowrap">
                  How it Works
                </Link>
                <Link href="/pricing" className="text-sm font-medium hover:text-primary transition-colors whitespace-nowrap">
                  Pricing
                </Link>
                <Link href="/contact" className="text-sm font-medium hover:text-primary transition-colors whitespace-nowrap">
                  Contact
                </Link>
              </div>
            )}

            {/* Right Side Actions */}
            <div className="flex items-center space-x-1 flex-shrink-0">
              {isDashboard && (
                <>
                  {/* Search */}
                  <div className="hidden lg:flex relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search..."
                      className="pl-9 pr-4 w-32 xl:w-48 h-9 bg-background/50 border-border/60 focus:border-primary/60 focus:bg-background text-sm"
                    />
                  </div>

                  {/* Notifications */}
                  <Button variant="ghost" size="sm" className="relative h-9 w-9 p-0 hover:bg-accent/60 flex-shrink-0">
                    <Bell className="h-4 w-4" />
                    <Badge className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 flex items-center justify-center text-[9px] bg-red-500 hover:bg-red-500">
                      3
                    </Badge>
                  </Button>
                </>
              )}

              {/* Theme Toggle */}
              <div className="flex-shrink-0">
                <ThemeToggle />
              </div>

              {/* User Menu / Auth Buttons */}
              {isDashboard ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-9 px-2 space-x-1 hover:bg-accent/60 flex-shrink-0">
                      <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <User className="h-3 w-3 text-white" />
                      </div>
                      <span className="hidden lg:block text-sm truncate max-w-[80px]">
                        {user?.email?.split('@')[0] || 'User'}
                      </span>
                      <ChevronDown className="h-3 w-3 hidden lg:block" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 mt-2">
                    <div className="px-2 py-1.5 text-sm text-muted-foreground">
                      {user?.email}
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => handleAuthAction("logout")}
                      className="cursor-pointer text-red-600 focus:text-red-600"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="hidden sm:flex items-center space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleAuthAction("login")}
                    className="h-9 hover:bg-accent/60"
                  >
                    Sign In
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => handleAuthAction("signup")}
                    className="h-9 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  >
                    Get Started
                  </Button>
                </div>
              )}

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden h-9 w-9 p-0 hover:bg-accent/60"
                onClick={() => setIsOpen(!isOpen)}
              >
                {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </Button>
            </div>
          </div>          {/* Mobile Menu */}
          <div className={`xl:hidden absolute top-full left-0 right-0 border-t border-border/60 bg-background/95 backdrop-blur-xl transition-all duration-300 ease-in-out z-40 ${
            isOpen ? 'max-h-screen opacity-100 visible' : 'max-h-0 opacity-0 invisible'
          }`}>
            <div className="container mx-auto px-4 max-w-7xl">
              <div className="py-2 space-y-1 max-h-[calc(100vh-4rem)] overflow-y-auto">
                {isDashboard ? (
                  <>
                    {/* Mobile Search */}
                    <div className="px-3 py-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search..."
                          className="pl-9 pr-4 bg-background/50 border-border/60 h-10"
                        />
                      </div>
                    </div>
                  
                    {/* Dashboard Navigation Items */}
                    {dashboardNavItems.map((item) => (
                      <div key={item.href} className="space-y-1">
                        <Link
                          href={item.href}
                          className="flex items-center px-3 py-3 text-sm font-medium rounded-md hover:bg-accent/60 transition-colors"
                          onClick={() => setIsOpen(false)}
                        >
                          <item.icon className="h-4 w-4 mr-3 text-muted-foreground" />
                          {item.title}
                        </Link>
                        {/* Sub-items for mobile */}
                        <div className="ml-8 space-y-1">
                          {item.items.slice(0, 3).map((subItem) => (
                            <Link
                              key={subItem.href}
                              href={subItem.href}
                              className="block px-3 py-2 text-xs text-muted-foreground rounded-md hover:bg-accent/40 transition-colors"
                              onClick={() => setIsOpen(false)}
                            >
                              {subItem.title}
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}
                    
                    {/* Mobile User Actions */}
                    <div className="border-t border-border/40 mt-4 pt-4 px-3">
                      <div className="flex items-center space-x-3 py-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <div className="text-sm font-medium">{user?.email?.split('@')[0] || 'User'}</div>
                          <div className="text-xs text-muted-foreground">{user?.email}</div>
                        </div>
                      </div>
                      <div className="space-y-1 mt-2">
                        <Button 
                          variant="ghost" 
                          className="w-full justify-start text-sm h-10"
                        >
                          <User className="mr-2 h-4 w-4" />
                          Profile
                        </Button>
                        <Button 
                          variant="ghost" 
                          className="w-full justify-start text-sm h-10"
                        >
                          <Settings className="mr-2 h-4 w-4" />
                          Settings
                        </Button>
                        <Button 
                          variant="ghost" 
                          className="w-full justify-start text-sm h-10 text-red-600 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                          onClick={() => {
                            handleAuthAction("logout");
                            setIsOpen(false);
                          }}
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          Logout
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <Link
                      href="#features"
                      className="block px-3 py-3 text-sm font-medium rounded-md hover:bg-accent/60 transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      Features
                    </Link>
                    <Link
                      href="#how-it-works"
                      className="block px-3 py-3 text-sm font-medium rounded-md hover:bg-accent/60 transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      How it Works
                    </Link>
                    <Link
                      href="/pricing"
                      className="block px-3 py-3 text-sm font-medium rounded-md hover:bg-accent/60 transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      Pricing
                    </Link>
                    <Link
                      href="/contact"
                      className="block px-3 py-3 text-sm font-medium rounded-md hover:bg-accent/60 transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      Contact
                    </Link>
                    <div className="border-t border-border/40 mt-4 pt-4 px-3 space-y-2">
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start h-10"
                        onClick={() => {
                          handleAuthAction("login");
                          setIsOpen(false);
                        }}
                      >
                        Sign In
                      </Button>
                      <Button 
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 h-10"
                        onClick={() => {
                          handleAuthAction("signup");
                          setIsOpen(false);
                        }}
                      >
                        Get Started
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;