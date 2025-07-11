"use client";

import * as React from "react";
import {
  BookOpen,
  Bot,
  Command,
  LifeBuoy,
  Send,
  Settings2,
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
import { usePathname } from "next/navigation";

const data = {
  user: {
    name: "admin",
    email: "admin@exemplo.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/admin",
      icon: LucideLayoutDashboard,
      items: [
        {
          title: "Vendas",
          url: "/admin/pedidos",
        },
      ],
    },
    {
      title: "Produtos",
      url: "/admin/produtos",
      icon: Bot,
    },
    {
      title: "Clientes",
      url: "/admin/clientes",
      icon: BookOpen,
    },
    {
      title: "Vendas",
      url: "/admin/pedidos",
      icon: Settings2,
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
