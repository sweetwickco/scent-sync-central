import { 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  Lightbulb, 
  Calendar, 
  Wrench, 
  Box, 
  Cog 
} from "lucide-react";
import { NavLink, useSearchParams } from "react-router-dom";

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
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'inventory';

  const handleNavigation = (value: string) => {
    if (value === 'inventory') {
      setSearchParams({});
    } else {
      setSearchParams({ tab: value });
    }
  };

  const getNavClassName = (value: string) => {
    const isActive = activeTab === value;
    return isActive ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" : "hover:bg-sidebar-accent/50";
  };

  return (
    <Sidebar className={collapsed ? "w-14" : "w-60"}>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Business Tools</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.value}>
                  <SidebarMenuButton 
                    className={getNavClassName(item.value)}
                    onClick={() => handleNavigation(item.value)}
                  >
                    <item.icon className="h-4 w-4" />
                    {!collapsed && <span>{item.title}</span>}
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