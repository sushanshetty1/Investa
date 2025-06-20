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
        <div className="container mx-auto px-2 sm:px-3 lg:px-4 max-w-7xl">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-1 sm:space-x-2">
              <div className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Package className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-white" />
              </div>
              <span className="text-base sm:text-lg lg:text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Invista
              </span>
            </Link>
            <div className="flex items-center space-x-1 sm:space-x-2">
              <ThemeToggle />
              <div className="w-5 h-5 sm:w-6 sm:h-6 bg-muted rounded-full animate-pulse" />
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
        { title: "Settings", href: "/dashboard/settings" },
      ]
    }, {
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
      ]
    }, {
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
  };  const CustomDropdown = ({ item, isOpen, onToggle }: {
    item: NavItem;
    isOpen: boolean;
    onToggle: (href: string) => void;
  }) => {
    const isActive = pathname?.startsWith(item.href);
    const dropdownRef = useRef<HTMLDivElement>(null);
    
    const getDropdownClasses = () => {
      if (!dropdownRef.current) return "absolute top-full left-0 mt-1";
      
      const rect = dropdownRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      
      // Check if dropdown would overflow on the right
      if (rect.left + 300 > viewportWidth) {
        return "absolute top-full right-0 mt-1";
      }
      
      return "absolute top-full left-0 mt-1";
    };
    
    return (
      <div
        className="relative"
        ref={(el) => {
          if (el) {
            dropdownRefs.current[item.href] = el;
          }
        }}
      ><button
          onClick={() => onToggle(item.href)}
          className={`flex items-center h-9 px-2 lg:px-3 text-sm font-medium rounded-lg transition-all duration-200 whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-primary/20 group min-w-0 ${
            isActive 
              ? 'bg-gradient-to-r from-blue-600/10 to-indigo-600/10 text-blue-700 dark:text-blue-300 border border-blue-200/50 dark:border-blue-800/50' 
              : isOpen 
                ? 'bg-accent/80 text-accent-foreground' 
                : 'hover:bg-accent/60 text-muted-foreground hover:text-foreground'
          }`}
        >
          <item.icon className={`h-4 w-4 mr-1 lg:mr-2 flex-shrink-0 transition-colors ${
            isActive ? 'text-blue-600 dark:text-blue-400' : 'group-hover:text-foreground'
          }`} />          <span className="hidden lg:inline truncate max-w-[70px] xl:max-w-[90px]">{item.title}</span>
          <span className="lg:hidden truncate max-w-[50px]">{item.title.length > 6 ? item.title.substring(0, 6) + '...' : item.title}</span>
          <ChevronDown className={`h-3 w-3 ml-1 lg:ml-2 flex-shrink-0 transition-all duration-200 ${
            isOpen ? 'rotate-180' : ''
          } ${isActive ? 'text-blue-600 dark:text-blue-400' : ''}`} />
        </button>        {isOpen && (
          <div 
            ref={dropdownRef}
            className={`${getDropdownClasses()} p-1 min-w-[200px] max-w-[300px] bg-background/95 backdrop-blur-xl border border-border/60 rounded-lg shadow-xl shadow-black/5 z-50 animate-in fade-in-0 zoom-in-95 duration-200`}
          >
            <div className="py-1 max-h-[300px] overflow-y-auto">
              {item.items.map((subItem: SubNavItem) => (
                <Link
                  key={subItem.href}
                  href={subItem.href}
                  onClick={() => setOpenDropdown(null)}
                  className={`block px-3 py-2 text-xs font-medium rounded-md transition-all duration-150 truncate ${
                    pathname === subItem.href 
                      ? 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 text-blue-700 dark:text-blue-300' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/60'
                  }`}
                  title={subItem.title}
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
    <>      {/* Mobile Menu Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? "bg-background/98 backdrop-blur-xl border-b border-border/60 shadow-lg shadow-black/5" 
          : "bg-background/95 backdrop-blur-lg border-b border-border/40"
      }`}>        <div className="max-w-7xl mx-auto px-3 lg:px-4 xl:px-6 navbar-container">
          <div className="flex items-center justify-between h-16 min-w-0">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 group flex-shrink-0">
              <div className="relative">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-105 transition-all duration-200 shadow-md">
                  <Package className="h-4 w-4 text-white" />
                </div>
                <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full border border-background animate-pulse" />
              </div>
              <span className="text-lg lg:text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Invista
              </span>
            </Link>{/* Desktop Navigation */}
            {isDashboard ? (
              <div className="hidden lg:flex items-center flex-1 max-w-4xl mx-4 overflow-hidden">
                <div className="flex items-center space-x-1 overflow-x-auto scrollbar-hide min-w-0 flex-1">
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
              <div className="hidden lg:flex items-center gap-6 flex-1 justify-center">
                <Link href="#features" className="text-sm font-medium hover:text-primary transition-colors relative group">
                  Features
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-200 group-hover:w-full"></span>
                </Link>
                <Link href="#how-it-works" className="text-sm font-medium hover:text-primary transition-colors relative group">
                  How it Works
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-200 group-hover:w-full"></span>
                </Link>
                <Link href="/pricing" className="text-sm font-medium hover:text-primary transition-colors relative group">
                  Pricing
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-200 group-hover:w-full"></span>
                </Link>
                <Link href="/contact" className="text-sm font-medium hover:text-primary transition-colors relative group">
                  Contact
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-200 group-hover:w-full"></span>
                </Link>
              </div>
            )}            {/* Right Side Actions */}
            <div className="flex items-center space-x-1 lg:space-x-2 flex-shrink-0">
              {isDashboard && (
                <>
                  {/* Search - Hidden on mobile */}
                  <div className="hidden md:flex relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search..."
                      className="pl-9 pr-4 w-40 lg:w-56 xl:w-64 h-9 bg-background/60 backdrop-blur-sm border border-border/60 rounded-lg focus:border-primary/60 focus:bg-background text-sm"
                    />
                  </div>

                  {/* Notifications */}
                  <Button variant="ghost" size="sm" className="relative h-9 w-9 p-0 hover:bg-accent/60 rounded-lg flex-shrink-0 group">
                    <Bell className="h-4 w-4 group-hover:scale-110 transition-transform" />
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700">
                      3
                    </Badge>
                  </Button>
                </>
              )}

              {/* Theme Toggle */}
              <div className="flex-shrink-0">
                <ThemeToggle />
              </div>

              {/* User Menu / Auth Buttons */}              {isDashboard ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-9 px-2 lg:px-3 space-x-1 lg:space-x-2 hover:bg-accent/60 rounded-lg flex-shrink-0 group min-w-0">
                      <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform flex-shrink-0">
                        <User className="h-3 w-3 text-white" />
                      </div>
                      <span className="hidden lg:block text-sm font-medium truncate max-w-[60px] xl:max-w-[80px]">
                        {user?.email?.split('@')[0] || 'User'}
                      </span>
                      <ChevronDown className="h-3 w-3 hidden lg:block group-hover:rotate-180 transition-transform flex-shrink-0" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 mt-1 bg-background/95 backdrop-blur-xl border border-border/60 shadow-xl rounded-lg">
                    <div className="px-3 py-2 border-b border-border/40">
                      <p className="text-sm font-medium text-foreground truncate">{user?.email?.split('@')[0] || 'User'}</p>
                      <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    </div>
                    <Link href="/profile">
                      <DropdownMenuItem className="cursor-pointer h-9 px-3 rounded-md text-sm">
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </DropdownMenuItem>
                    </Link>
                    <DropdownMenuItem className="cursor-pointer h-9 px-3 rounded-md text-sm">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="my-1" />
                    <DropdownMenuItem 
                      onClick={() => handleAuthAction("logout")}
                      className="cursor-pointer text-red-600 focus:text-red-600 h-9 px-3 rounded-md text-sm"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>              ) : (
                <div className="hidden sm:flex items-center space-x-2 lg:space-x-3">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleAuthAction("login")}
                    className="h-9 px-3 lg:px-4 text-sm font-medium hover:bg-accent/60 rounded-lg"
                  >
                    Sign In
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => handleAuthAction("signup")}
                    className="h-9 px-4 lg:px-5 text-sm font-medium bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-lg shadow-md hover:shadow-lg transition-all"
                  >
                    Get Started
                  </Button>
                </div>
              )}{/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden h-9 w-9 p-0 hover:bg-accent/60 rounded-lg"
                onClick={() => setIsOpen(!isOpen)}
              >
                {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </Button>
            </div>
          </div>{/* Mobile Menu */}
          <div className={`lg:hidden absolute top-full left-0 right-0 border-t border-border/60 bg-background/98 backdrop-blur-xl transition-all duration-300 ease-in-out z-40 ${
            isOpen ? 'max-h-screen opacity-100 visible' : 'max-h-0 opacity-0 invisible'
          }`}>            <div className="container mx-auto px-3 lg:px-4 xl:px-6 max-w-7xl">
              <div className="py-4 space-y-2 max-h-[calc(100vh-4rem)] overflow-y-auto">
                {isDashboard ? (
                  <>
                    {/* Mobile Search */}
                    <div className="px-2 py-3">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search..."
                          className="pl-10 pr-4 bg-background/60 border-border/60 h-11 rounded-lg font-medium"
                        />
                      </div>
                    </div>

                    {/* Dashboard Navigation Items */}
                    {dashboardNavItems.map((item) => (
                      <div key={item.href} className="space-y-1">
                        <Link
                          href={item.href}
                          className={`flex items-center px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-200 ${
                            pathname?.startsWith(item.href)
                              ? 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 text-blue-700 dark:text-blue-300 border border-blue-200/50 dark:border-blue-800/30'
                              : 'hover:bg-accent/60'
                          }`}
                          onClick={() => setIsOpen(false)}
                        >
                          <item.icon className="h-5 w-5 mr-3 text-muted-foreground" />
                          {item.title}
                        </Link>
                        {/* Sub-items for mobile */}
                        <div className="ml-8 space-y-1">
                          {item.items.slice(0, 4).map((subItem) => (
                            <Link
                              key={subItem.href}
                              href={subItem.href}
                              className={`block px-4 py-2 text-sm rounded-lg transition-all duration-150 ${
                                pathname === subItem.href
                                  ? 'text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/10'
                                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/40'
                              }`}
                              onClick={() => setIsOpen(false)}
                            >
                              {subItem.title}
                            </Link>
                          ))}
                        </div>
                      </div>
                    ))}

                    {/* Mobile User Actions */}
                    <div className="border-t border-border/40 mt-6 pt-4 px-2">
                      <div className="flex items-center space-x-3 py-3 px-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-sm">
                          <User className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold">{user?.email?.split('@')[0] || 'User'}</div>
                          <div className="text-xs text-muted-foreground">{user?.email}</div>
                        </div>
                      </div>
                      <div className="space-y-1 mt-3">
                        <Link href="/profile">
                          <Button 
                            variant="ghost" 
                            className="w-full justify-start text-sm h-11 rounded-lg font-medium"
                            onClick={() => setIsOpen(false)}
                          >
                            <User className="mr-3 h-4 w-4" />
                            Profile
                          </Button>
                        </Link>
                        <Button 
                          variant="ghost" 
                          className="w-full justify-start text-sm h-11 rounded-lg font-medium"
                        >
                          <Settings className="mr-3 h-4 w-4" />
                          Settings
                        </Button>
                        <Button 
                          variant="ghost" 
                          className="w-full justify-start text-sm h-11 text-red-600 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg font-medium"
                          onClick={() => {
                            handleAuthAction("logout");
                            setIsOpen(false);
                          }}
                        >
                          <LogOut className="mr-3 h-4 w-4" />
                          Logout
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <Link
                      href="#features"
                      className="block px-4 py-3 text-sm font-semibold rounded-lg hover:bg-accent/60 transition-all duration-200"
                      onClick={() => setIsOpen(false)}
                    >
                      Features
                    </Link>
                    <Link
                      href="#how-it-works"
                      className="block px-4 py-3 text-sm font-semibold rounded-lg hover:bg-accent/60 transition-all duration-200"
                      onClick={() => setIsOpen(false)}
                    >
                      How it Works
                    </Link>
                    <Link
                      href="/pricing"
                      className="block px-4 py-3 text-sm font-semibold rounded-lg hover:bg-accent/60 transition-all duration-200"
                      onClick={() => setIsOpen(false)}
                    >
                      Pricing
                    </Link>
                    <Link
                      href="/contact"
                      className="block px-4 py-3 text-sm font-semibold rounded-lg hover:bg-accent/60 transition-all duration-200"
                      onClick={() => setIsOpen(false)}
                    >
                      Contact
                    </Link>
                    <div className="border-t border-border/40 mt-6 pt-4 px-2 space-y-3">
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start h-11 rounded-lg font-medium"
                        onClick={() => {
                          handleAuthAction("login");
                          setIsOpen(false);
                        }}
                      >
                        Sign In
                      </Button>
                      <Button 
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 h-11 rounded-lg font-medium shadow-lg"
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