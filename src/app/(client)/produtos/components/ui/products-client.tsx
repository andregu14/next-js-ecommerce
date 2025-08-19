"use client";

import * as React from "react";
import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProductCard, ProductCardSkeleton } from "@/components/ProductCard";
import {
  Search,
  ArrowDownAZ,
  CalendarClock,
  CircleDollarSign,
} from "lucide-react";
import { getProductsPage, PAGE_SIZE, ProductsPageData } from "../../page";

type Props = {
  initialData: ProductsPageData;
};

export default function ProductsClient({ initialData }: Props) {
  const [items, setItems] = useState(initialData.products);
  const [nextCursor, setNextCursor] = useState<string | null>(
    initialData.nextCursor
  );
  const [loadingMore, setLoadingMore] = useState(false);

  // Controles
  const [query, setQuery] = useState("");
  const [orderBy, setOrderBy] = useState<"name" | "createdAt" | "priceInCents">(
    "createdAt"
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let base = items;
    if (q) {
      base = items.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.description ?? "").toLowerCase().includes(q)
      );
    }
    // Ordenação client-side para o que já está carregado
    const sorted = [...base].sort((a, b) => {
      if (orderBy === "name") return a.name.localeCompare(b.name);
      if (orderBy === "createdAt")
        return +new Date(b.createdAt) - +new Date(a.createdAt);
      // priceInCents
      return a.priceInCents - b.priceInCents;
    });
    return sorted;
  }, [items, query, orderBy]);

  return (
    <>
      {/* Controles */}
      <section className="sticky top-[64px] z-30 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="mx-auto max-w-screen-md md:max-w-3xl lg:max-w-5xl xl:max-w-7xl px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Busca */}
            <div className="relative w-full sm:max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar PDFs..."
                className="pl-9"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            {/* Ordenação + contagem */}
            <div className="flex items-center gap-3">
              <Select value={orderBy} onValueChange={(v: any) => setOrderBy(v)}>
                <SelectTrigger className="w-[190px]">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">
                    <div className="inline-flex items-center gap-2">
                      <ArrowDownAZ className="h-4 w-4" /> Nome (A–Z)
                    </div>
                  </SelectItem>
                  <SelectItem value="createdAt">
                    <div className="inline-flex items-center gap-2">
                      <CalendarClock className="h-4 w-4" /> Recentes
                    </div>
                  </SelectItem>
                  <SelectItem value="priceInCents">
                    <div className="inline-flex items-center gap-2">
                      <CircleDollarSign className="h-4 w-4" /> Preço
                      (menor→maior)
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>

              <span className="text-sm text-muted-foreground">
                Mostrando {filtered.length}
                <span className="mx-1">de</span>
                {items.length}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="py-6 sm:py-8 my-12">
        <div className="mx-auto max-w-screen-md md:max-w-3xl lg:max-w-5xl xl:max-w-7xl px-4 sm:px-6 lg:px-8">
          {filtered.length === 0 ? (
            <EmptyState onClear={() => setQuery("")} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6">
              {filtered.map((p) => (
                <ProductCard
                  key={p.id}
                  id={p.id}
                  name={p.name}
                  description={p.description ?? ""}
                  imagePath={p.imagePath ?? ""}
                  priceInCents={p.priceInCents}
                />
              ))}
            </div>
          )}

          {/* TODO Carregar mais */}
        </div>
      </section>
    </>
  );
}

function EmptyState({ onClear }: { onClear: () => void }) {
  return (
    <div className="border rounded-xl bg-card p-8 text-center">
      <h3 className="text-base sm:text-lg font-medium">Nada encontrado</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Tente outro termo ou limpe a busca.
      </p>
      <div className="mt-4">
        <Button variant="outline" onClick={onClear}>
          Limpar busca
        </Button>
      </div>
    </div>
  );
}
