import db from "@/lib/db";
import { PageHeader } from "../../../_components/PageHeader";
import { ProductForm } from "../../_components/ProductForm";

export default async function EditProductPage(props: {
  params: { id: string };
}) {
  const { params } = props;
  const { id } = await params;
  const product = await db.product.findUnique({ where: { id } });
  return (
    <>
      <PageHeader>Editar Produto</PageHeader>
      <ProductForm product={product} />
    </>
  );
}
