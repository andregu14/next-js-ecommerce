import db from "@/lib/db";
import { ProductForm } from "../../_components/ProductForm";
import { AdminHeader } from "@/app/admin/_components/ui/admin-header";

export default async function EditProductPage(props: {
  params: { id: string };
}) {
  const { params } = props;
  const { id } = await params;
  const product = await db.product.findUnique({ where: { id } });
  return (
    <>
      <AdminHeader
        currentPage="Editar"
        previousPage={[
          { title: "Dashboard", url: "/admin" },
          { title: "Produtos", url: "/admin/produtos" },
        ]}
      />
      <ProductForm product={product} />
    </>
  );
}
