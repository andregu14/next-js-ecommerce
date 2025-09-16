import { Suspense } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/ProductCard";
import { Product } from "@/generated/prisma";
import cache from "@/lib/cache";
import db from "@/lib/db";
import { SectionDivider } from "@/components/SectionDivider";
import { Hero } from "@/components/Hero";
import { ProductSection } from "@/components/ProductSection";

const getMostPopularProducts = cache(
  () => {
    return db.product.findMany({
      where: { isAvailableForPurchase: true },
      orderBy: { orders: { _count: "desc" } },
      take: 8,
    });
  },
  ["/", "getMostPopularProducts"],
  { revalidate: 60 * 60 * 24 }
);

const getNewestProducts = cache(() => {
  return db.product.findMany({
    where: { isAvailableForPurchase: true },
    orderBy: { createdAt: "desc" },
    take: 8,
  });
}, ["/", "getNewestProducts"]);

export default function HomePage() {
  return (
    <main>
      <Hero />

      <ProductSection tone="vividBlue">
        <ProductGridSection
          title="Mais populares"
          hrefAll="/produtos?orderBy=priceInCents"
        >
          <Suspense fallback={<ProductGridSkeleton />}>
            <ProductSuspense
              productsFetcher={getMostPopularProducts}
              variant="popular"
            />
          </Suspense>
        </ProductGridSection>
      </ProductSection>

      <SectionDivider label="Descubra as novidades" />

      <ProductSection tone="vividSunset">
        <ProductGridSection
          title="Lançamentos"
          hrefAll="/produtos?orderBy=createdAt"
        >
          <Suspense fallback={<ProductGridSkeleton />}>
            <ProductSuspense
              productsFetcher={getNewestProducts}
              variant="new"
            />
          </Suspense>
        </ProductGridSection>
      </ProductSection>
    </main>
  );
}

function ProductGridSection({
  title,
  hrefAll,
  children,
}: {
  title: string;
  hrefAll: string;
  children: React.ReactNode;
}) {
  return (
    <section className="py-10 sm:py-12 lg:py-16">
      <div className="mx-auto max-w-screen-md md:max-w-3xl lg:max-w-5xl xl:max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">
            {title}
          </h2>
          <Button asChild variant="ghost" className="gap-1">
            <Link href={hrefAll} aria-label={`Ver todos em ${title}`}>
              Ver todos
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="mt-6">{children}</div>
      </div>
    </section>
  );
}

async function ProductSuspense({
  productsFetcher,
  variant = "popular",
}: {
  productsFetcher: () => Promise<Product[]>;
  variant: "popular" | "new";
}) {
  const products = await productsFetcher();

  if (!products || products.length === 0) {
    return (
      <EmptyState
        title="Nada por aqui ainda"
        description="Assim que novos PDFs estiverem disponíveis, eles aparecerão aqui."
        cta={{ href: "/produtos", label: "Explorar catálogo" }}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((p) => (
        <ProductCard
          key={p.id}
          id={p.id}
          name={p.name}
          description={p.description}
          priceInCents={p.priceInCents}
          imagePath={p.imagePath}
          variant={variant}
        />
      ))}
    </div>
  );
}

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-6 gap-4 sm:gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-xl border bg-card p-3 animate-pulse">
          <div className="aspect-[4/5] rounded-lg bg-muted" />
          <div className="mt-3 h-4 w-3/4 bg-muted rounded" />
          <div className="mt-2 h-4 w-1/3 bg-muted rounded" />
          <div className="mt-3 h-9 w-full bg-muted rounded" />
        </div>
      ))}
    </div>
  );
}

function EmptyState({
  title,
  description,
  cta,
}: {
  title: string;
  description?: string;
  cta?: { href: string; label: string };
}) {
  return (
    <div className="border rounded-xl bg-card p-8 text-center">
      <h3 className="text-base sm:text-lg font-medium">{title}</h3>
      {description ? (
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      ) : null}
      {cta ? (
        <div className="mt-4">
          <Button asChild>
            <Link href={cta.href}>{cta.label}</Link>
          </Button>
        </div>
      ) : null}
    </div>
  );
}
