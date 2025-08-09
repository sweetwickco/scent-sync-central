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
  Megaphone
} from "lucide-react";
import { NavLink, useSearchParams, useNavigate, useLocation } from "react-router-dom";

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

  const getNavClassName = (value: string) => {
    const currentActive = getActiveValue();
    const isActive = currentActive === value;
    return isActive 
      ? "bg-primary/10 text-primary font-medium border-r-2 border-primary" 
      : "text-muted-foreground hover:text-foreground hover:bg-muted/50";
  };

  return (
    <Sidebar className={`transition-all duration-300 ${collapsed ? "w-14" : "w-60"} bg-background border-r border-border`}>
      <SidebarContent className="bg-background space-y-1">
        {navigationCategories.map((category) => (
          <SidebarGroup key={category.label} className="py-1">
            <SidebarGroupLabel className="text-foreground/70 text-xs px-3 py-1">{category.label}</SidebarGroupLabel>
            <SidebarGroupContent className="space-y-0">
              <SidebarMenu className="space-y-0">
                {category.items.map((item) => (
                  <SidebarMenuItem key={item.value}>
                    <SidebarMenuButton 
                      className={`${getNavClassName(item.value)} transition-all duration-200 hover-scale h-8 px-3`}
                      onClick={() => handleNavigation(item.value)}
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span className="animate-fade-in text-sm">{item.title}</span>}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}