import * as React from "react";
import {
  FolderIcon,
  LayoutDashboardIcon,
  UnfoldHorizontalIcon,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Link } from "@tanstack/react-router";
import { AppTitle } from "./app-title";
import { NavGroup } from "./nav-group";
import { sidebarData } from "./data/sidebar-data";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props} variant="sidebar">
      <SidebarHeader className="border-b border-sidebar-border p-3">
        <AppTitle />
      </SidebarHeader>
      <SidebarContent className="scrollbar-thin scrollbar-thumb-primary-foreground">
        {sidebarData.navGroups.map((props) => (
          <NavGroup key={props.title} {...props} />
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
