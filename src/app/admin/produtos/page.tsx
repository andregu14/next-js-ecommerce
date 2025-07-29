import db from "@/lib/db";
import { AdminHeader } from "../_components/ui/admin-header";
import { DashboardDataTable } from "../_components/DashboardDataTable";
import { Suspense } from "react";
import { SuccessToastHandler } from "./_components/SuccessToastHandler";

export default async function AdminProductsPage() {
  const products = await db.product.findMany({
    select: {
      id: true,
      name: true,
      imagePath: true,
      description: true,
      priceInCents: true,
      isAvailableForPurchase: true,
      _count: { select: { orders: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  if (products.length === 0) {
    return (
      <div className="text-muted-foreground">Nenhum produto cadastrado.</div>
    );
  }

  return (
    <>
      <AdminHeader
        previousPage={[{ title: "Dashboard", url: "/admin" }]}
        currentPage="Produtos"
      />
      <DashboardDataTable productsData={products} dataType="products" />
      <Suspense fallback={null}>
        <SuccessToastHandler />
      </Suspense>
    </>
  );
}
