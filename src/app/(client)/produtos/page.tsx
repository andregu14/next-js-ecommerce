import cache from "@/lib/cache";
import db from "@/lib/db";
import { Suspense } from "react";
import ProductsClient from "./components/ui/products-client";
import { generateMockRating } from "@/lib/mock-ratings";
import { generateMockDiscount } from "@/lib/mock-discount";

type PageProps = {
  searchParams: {
    query?: string;
    orderBy?: "name" | "createdAt" | "priceInCents";
  };
};

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
    const productsRaw = await db.product.findMany({
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
    if (productsRaw.length > PAGE_SIZE) {
      const nextItem = productsRaw[PAGE_SIZE - 1]; // Use o último item da página atual como cursor
      nextCursor = nextItem.id;
      productsRaw.length = PAGE_SIZE;
    }

    const products = productsRaw.map((product) => {
      const { rating, reviewCount } = generateMockRating();
      const mockDiscount = generateMockDiscount(product.priceInCents);
      return {
        ...product,
        rating: rating,
        reviewCount: reviewCount,
        discountCents: mockDiscount,
      };
    });

    return { products, nextCursor };
  },
  ["/produtos", "getProductsPage"]
);

export default async function ProductsPage({ searchParams }: PageProps) {
  const params = await Promise.resolve(searchParams);
  const query = (params?.query || "").trim() || undefined;
  const orderBy =
    (params?.orderBy as "name" | "createdAt" | "priceInCents") || "createdAt";

  const initialProducts = await getProductsPage(undefined, query, orderBy);

  return (
    <main>
      <section className="mx-auto max-w-screen-md md:max-w-3xl lg:max-w-5xl xl:max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
          Todos os Produtos
        </h1>
      </section>

      <Suspense>
        <ProductsClient
          initialData={initialProducts}
          initialQuery={query || ""}
          initialOrderBy={orderBy}
        />
      </Suspense>
    </main>
  );
}

export type ProductsPageData = Awaited<ReturnType<typeof getProductsPage>>;
export { getProductsPage, PAGE_SIZE };
