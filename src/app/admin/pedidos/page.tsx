import db from "@/lib/db";

import { AdminHeader } from "../_components/ui/admin-header";
import { DashboardDataTable } from "../_components/DashboardDataTable";

export default async function OrdersPage() {
  const ordersData = await db.order.findMany({
    select: {
      id: true,
      pricePaidInCents: true,
      product: { select: { name: true } },
      user: { select: { email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <AdminHeader
        currentPage="Pedidos"
        previousPage={[{ title: "Dashboard", url: "/admin" }]}
      />
      <DashboardDataTable ordersData={ordersData} dataType="orders" />
    </>
  );
}