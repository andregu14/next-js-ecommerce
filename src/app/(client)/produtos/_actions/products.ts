"use server";

import db from "@/lib/db";

const PAGE_SIZE = 12;

// Funcao sem cache
async function getProductsPageNoCache(
  cursor?: string,
  query?: string,
  orderBy: "name" | "createdAt" | "priceInCents" = "name"
) {
  const where = {
    isAvailableForPurchase: true,
    ...(query
      ? {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const products = await db.product.findMany({
    where,
    orderBy:
      orderBy === "name"
        ? { name: "asc" }
        : orderBy === "createdAt"
        ? { createdAt: "desc" }
        : { priceInCents: "asc" },
    take: PAGE_SIZE + 1,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    select: {
      id: true,
      name: true,
      description: true,
      imagePath: true,
      priceInCents: true,
      createdAt: true,
    },
  });

  let nextCursor: string | null = null;
  if (products.length > PAGE_SIZE) {
    const next = products.pop();
    nextCursor = next!.id;
  }

  return { products, nextCursor };
}

// carregar mais produtos
export async function loadMoreProducts(
  cursor: string,
  query?: string,
  orderBy: "name" | "createdAt" | "priceInCents" = "name"
) {
  return await getProductsPageNoCache(cursor, query, orderBy);
}
