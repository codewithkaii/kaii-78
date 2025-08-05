import { 
  Home, 
  Calendar, 
  Users, 
  Phone, 
  BarChart3, 
  Settings, 
  MessageSquare, 
  Zap,
  Building2
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

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

const menuItems = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Calendar", url: "/calendar", icon: Calendar },
  { title: "CRM", url: "/crm", icon: Users },
  { title: "Calls & Recordings", url: "/calls", icon: Phone },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
  { title: "Automation", url: "/automation", icon: Zap },
  { title: "Messages", url: "/messages", icon: MessageSquare },
];

const businessItems = [
  { title: "Company Profile", url: "/company", icon: Building2 },
];

const settingsItems = [
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { collapsed } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-primary/20 text-primary font-medium" : "hover:bg-muted/50";

  return (
    <Sidebar
      className={collapsed ? "w-14" : "w-64"}
      collapsible
    >
      <SidebarContent>
        <div className="p-4">
          <h2 className={`font-bold text-xl ${collapsed ? 'hidden' : 'block'}`}>
            Lunivoice
          </h2>
          {collapsed && <div className="w-8 h-8 bg-primary rounded-full"></div>}
        </div>
        
        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? 'hidden' : 'block'}>
            Navigation
          </SidebarGroupLabel>
          
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className={getNavCls}>
                      <item.icon className="h-5 w-5" />
                      {!collapsed && <span className="ml-3">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? 'hidden' : 'block'}>
            Business
          </SidebarGroupLabel>
          
          <SidebarGroupContent>
            <SidebarMenu>
              {businessItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className={getNavCls}>
                      <item.icon className="h-5 w-5" />
                      {!collapsed && <span className="ml-3">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? 'hidden' : 'block'}>
            Account
          </SidebarGroupLabel>
          
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className={getNavCls}>
                      <item.icon className="h-5 w-5" />
                      {!collapsed && <span className="ml-3">{item.title}</span>}
                    </NavLink>
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