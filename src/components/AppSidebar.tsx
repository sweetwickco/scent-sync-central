import { 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  Lightbulb, 
  Calendar, 
  Wrench, 
  Box, 
  Cog,
  FileText,
  BarChart3,
  ShoppingBag,
  Users,
  Zap,
  Megaphone,
  ChevronRight
} from "lucide-react";
import { NavLink, useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const navigationCategories = [
  {
    label: "Sell",
    items: [
      { title: "Inventory", value: "inventory", icon: Package },
      { title: "Listings", value: "listings", icon: ShoppingCart },
      { title: "Orders", value: "orders", icon: ShoppingBag },
    ]
  },
  {
    label: "Make",
    items: [
      { title: "Production", value: "production", icon: Cog },
      { title: "Supplies", value: "supplies", icon: Wrench },
      { title: "Products", value: "products", icon: Box },
    ]
  },
  {
    label: "Grow",
    items: [
      { title: "Ideas", value: "design-ideas", icon: Lightbulb },
      { title: "Planning", value: "planning", icon: Calendar },
      { title: "Campaigns", value: "campaigns", icon: Megaphone },
      { title: "Automations", value: "automations", icon: Zap },
      { title: "Customers", value: "customers", icon: Users },
    ]
  },
  {
    label: "Track",
    items: [
      { title: "Performance", value: "performance", icon: BarChart3 },
      { title: "Optimizer", value: "listings-optimizer", icon: TrendingUp },
    ]
  },
  {
    label: "Resources",
    items: [
      { title: "Docs", value: "docs", icon: FileText },
    ]
  }
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const activeTab = searchParams.get('tab') || 'inventory';
  const [openCategory, setOpenCategory] = useState<string | null>(null);

  const handleNavigation = (value: string) => {
    if (value === 'docs') {
      navigate('/docs');
    } else if (value === 'inventory') {
      navigate('/');
    } else {
      navigate(`/?tab=${value}`);
    }
  };

  // Determine which item should be active based on current route
  const getActiveValue = () => {
    if (location.pathname.startsWith('/docs')) {
      return 'docs';
    }
    return activeTab;
  };

  // Find which category contains the active tab
  const getActiveCategoryLabel = () => {
    const currentActive = getActiveValue();
    const activeCategory = navigationCategories.find(category =>
      category.items.some(item => item.value === currentActive)
    );
    return activeCategory?.label || null;
  };

  // Initialize open category based on active tab
  useEffect(() => {
    const activeCategoryLabel = getActiveCategoryLabel();
    if (activeCategoryLabel && openCategory === null) {
      setOpenCategory(activeCategoryLabel);
    }
  }, [activeTab, location.pathname]);

  const handleCategoryClick = (categoryLabel: string) => {
    setOpenCategory(openCategory === categoryLabel ? null : categoryLabel);
  };

  const getNavClassName = (value: string) => {
    const currentActive = getActiveValue();
    const isActive = currentActive === value;
    return isActive 
      ? "bg-primary/10 text-primary font-medium border-r-2 border-primary mr-12" 
      : "text-muted-foreground hover:text-foreground hover:bg-muted/50 mr-12";
  };

  return (
    <Sidebar className={`transition-all duration-300 ${collapsed ? "w-14" : "w-60"} bg-background border-r border-border`}>
      <SidebarContent className="bg-background">
        {/* Logo Section */}
        <div className="px-4 py-6 border-b border-border">
          {!collapsed && (
            <h1 className="font-playfair text-xl font-bold tracking-wide text-foreground uppercase">
              SWEET WICK
            </h1>
          )}
        </div>
        
        {/* Navigation Section */}
        <div className="space-y-1 pt-4 pr-2">
        {navigationCategories.map((category) => {
          const isOpen = openCategory === category.label;
          return (
            <SidebarGroup key={category.label} className="py-1">
              <SidebarGroupLabel 
                className="text-foreground/70 text-xs px-3 py-2 cursor-pointer hover:text-foreground transition-colors flex items-center justify-between group"
                onClick={() => handleCategoryClick(category.label)}
              >
                {!collapsed && <span>{category.label}</span>}
                {!collapsed && (
                  <ChevronRight 
                    className={`h-3 w-3 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}
                  />
                )}
              </SidebarGroupLabel>
              {isOpen && (
                <SidebarGroupContent className="space-y-0 pr-2">
                  <SidebarMenu className="space-y-0">
                    {category.items.map((item) => (
                      <SidebarMenuItem key={item.value}>
                        <SidebarMenuButton 
                          className={`${getNavClassName(item.value)} transition-all duration-200 hover-scale h-8 px-3 ml-2`}
                          onClick={() => handleNavigation(item.value)}
                        >
                          <item.icon className="h-4 w-4" />
                          {!collapsed && <span className="animate-fade-in text-sm">{item.title}</span>}
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              )}
            </SidebarGroup>
          );
        })}
        </div>
      </SidebarContent>
    </Sidebar>
  );
}