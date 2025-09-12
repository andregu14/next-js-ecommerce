import db from "@/lib/db";
import { notFound } from "next/navigation";
import Image from "next/image";
import { formatCurrency } from "@/lib/formatters";
import { Button } from "@/components/ui/button";
import { Metadata } from "next";

type ProductsPageProps = {
  params: {
    id: string;
  };
};

export async function generateMetadata({
  params,
}: ProductsPageProps): Promise<Metadata> {
  const { id } = await params;

  const product = await db.product.findUnique({ where: { id: id } });

  if (!product) {
    return {
      title: "Produto não encontrado",
    };
  }

  return {
    title: `${product.name} | PDF Store`,
    description: product.description,
  };
}

export default async function ProductPage({ params }: ProductsPageProps) {
  const { id } = await params;

  const product = await db.product.findUnique({
    where: { id: id },
  });

  if (!product) {
    notFound();
  }

  const price = formatCurrency(product.priceInCents / 100);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:gap-12">
        {/* Imagem */}
        <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
          <Image
            src={product.imagePath}
            alt={product.name}
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Detalhes */}
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold tracking-tight lg:text-4xl">
            {product.name}
          </h1>

          <p className="mt-4 text-3xl font font-semibold">{price}</p>

          <div className="mt-6">
            <h3 className="sr-only">Descrição</h3>
            <div className="space-y-6 text-base text-muted-foreground">
              <p>{product.description}</p>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-4">
            <Button size="lg">Adicionar ao Carrinho</Button>
            <Button size="lg" variant={"outline"}>
              Comprar Agora
            </Button>
          </div>

          <div className="mt-auto pt-8">
            <p className="text-sm text-muted-foreground">
              Download imediato após a compra.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
