import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { Metadata } from "next";
import { AdminSideBar } from "./_components/AdminSidebar";
import { Toaster } from "@/components/ui/sonner";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin",
  description: "Painel de administração do ecommerce",
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <SidebarProvider>
        <AdminSideBar />
        <SidebarInset>{children}</SidebarInset>
        <Toaster />
      </SidebarProvider>
    </>
  );
}
