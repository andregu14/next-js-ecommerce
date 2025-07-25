"use client";

import * as React from "react";
import {
  HandCoins,
  Users2,
  Package,
  Command,
  LifeBuoy,
  Send,
  LucideLayoutDashboard,
} from "lucide-react";

import { NavMain } from "../_components/ui/nav-main";
import { NavSecondary } from "../_components/ui/nav-secondary";
import { NavUser } from "../_components/ui/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const data = {
  user: {
    name: "admin",
    email: "admin@exemplo.com",
    avatar: "/assets/photo-placeholder.png",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/admin",
      icon: LucideLayoutDashboard,
    },
    {
      title: "Produtos",
      url: "/admin/produtos",
      icon: Package,
    },
    {
      title: "Clientes",
      url: "/admin/clientes",
      icon: Users2,
    },
    {
      title: "Vendas",
      url: "/admin/pedidos",
      icon: HandCoins,
    },
  ],
  navSecondary: [
    {
      title: "Suporte",
      url: "#",
      icon: LifeBuoy,
    },
    {
      title: "Feedback",
      url: "#",
      icon: Send,
    },
  ],
};

export function AdminSideBar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/admin">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Ecommerce</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
