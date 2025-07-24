import db from "@/lib/db";

import { AdminHeader } from "../_components/ui/admin-header";
import { DashboardDataTable } from "../_components/DashboardDataTable";

export default async function UsersPage() {
  const clientsData = await db.user.findMany({
    select: {
      id: true,
      email: true,
      orders: { select: { pricePaidInCents: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <AdminHeader
        currentPage="Clientes"
        previousPage={[{ title: "Dashboard", url: "/admin" }]}
      />
      <DashboardDataTable clientsData={clientsData} dataType="clients" />
    </>
  );
}
