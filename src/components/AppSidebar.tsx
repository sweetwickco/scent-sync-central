import { 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  Lightbulb, 
  Calendar, 
  Wrench, 
  Box, 
  Cog,
  FileText 
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

const navigationItems = [
  { title: "Inventory", value: "inventory", icon: Package },
  { title: "Listings", value: "listings", icon: ShoppingCart },
  { title: "Optimizer", value: "listings-optimizer", icon: TrendingUp },
  { title: "Ideas", value: "design-ideas", icon: Lightbulb },
  { title: "Planning", value: "planning", icon: Calendar },
  { title: "Supplies", value: "supplies", icon: Wrench },
  { title: "Products", value: "products", icon: Box },
  { title: "Production", value: "production", icon: Cog },
  { title: "Docs", value: "docs", icon: FileText },
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
      <SidebarContent className="bg-background">
        <SidebarGroup>
          <SidebarGroupLabel className="text-foreground/70">Business Tools</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.value}>
                  <SidebarMenuButton 
                    className={`${getNavClassName(item.value)} transition-all duration-200 hover-scale`}
                    onClick={() => handleNavigation(item.value)}
                  >
                    <item.icon className="h-4 w-4" />
                    {!collapsed && <span className="animate-fade-in">{item.title}</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}