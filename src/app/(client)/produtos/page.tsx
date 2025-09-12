import cache from "@/lib/cache";
import db from "@/lib/db";
import { Suspense } from "react";
import ProductsClient from "./components/ui/products-client";

type PageProps = {
  searchParams:  {
    query?: string
    orderBy?: "name" | "createdAt" | "priceInCents"
  }
}

const PAGE_SIZE = 10;

const getProductsPage = cache(
  async (
    cursor?: string,
    query?: string,
    orderBy: "name" | "createdAt" | "priceInCents" = "name"
  ) => {
    const where = {
      isAvailableForPurchase: true,
      ...(query
        ? {
            OR: [
              { name: { contains: query } },
              { description: { contains: query } },
            ],
          }
        : {}),
    };

    // Pegue PAGE_SIZE + 1 itens para saber se há mais páginas
    const products = await db.product.findMany({
      where,
      orderBy:
        orderBy === "name"
          ? { name: "asc" }
          : orderBy === "createdAt"
            ? { createdAt: "desc" }
            : { priceInCents: "asc" },
      take: PAGE_SIZE + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}), // Skip 1 quando usar cursor para evitar duplicata
      select: {
        id: true,
        name: true,
        description: true,
        imagePath: true,
        priceInCents: true,
        createdAt: true,
      },
    });

    // Se temos mais que PAGE_SIZE itens, há mais páginas
    let nextCursor: string | null = null;
    if (products.length > PAGE_SIZE) {
      const nextItem = products[PAGE_SIZE - 1]; // Use o último item da página atual como cursor
      nextCursor = nextItem.id;
      products.length = PAGE_SIZE;
    }

    return { products, nextCursor };
  },
  ["/produtos", "getProductsPage"]
);

export default async function ProductsPage({searchParams}: PageProps) {
  const params = await Promise.resolve(searchParams)
  const query = (params?.query || "").trim() || undefined
  const orderBy = (params?.orderBy as "name" | "createdAt" | "priceInCents") || "createdAt"

  const initialProducts = await getProductsPage(
    undefined,
    query,
    orderBy
  );

  return (
    <main>
      <section className="mx-auto max-w-screen-md md:max-w-3xl lg:max-w-5xl xl:max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
          Todos os Produtos
        </h1>
      </section>

      <Suspense>
        <ProductsClient initialData={initialProducts} initialQuery={query || ""} initialOrderBy={orderBy} />
      </Suspense>
    </main>
  );
}

export type ProductsPageData = Awaited<ReturnType<typeof getProductsPage>>;
export { getProductsPage, PAGE_SIZE };
