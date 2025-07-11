import { AdminHeader } from "../../_components/ui/admin-header";
import { ProductForm } from "../_components/ProductForm";

export default function NewProductPage() {
  return (
    <>
    <AdminHeader currentPage="Novo" previousPage={[{title: "Dashboard", url: "/admin"}, {title: "Produtos", url: "/admin/produtos"}]} />
      <ProductForm />
    </>
  );
}
