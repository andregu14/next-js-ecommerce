"use client";

import * as React from "react";
import { useState, useMemo, useTransition, useEffect } from "react";
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
  Loader2,
} from "lucide-react";
import { ProductsPageData } from "../../page";
import { loadMoreProducts } from "../../_actions/products";
import { useSearchParams } from "next/navigation";

type Props = {
  initialData: ProductsPageData;
  initialQuery: string;
  initialOrderBy: "name" | "createdAt" | "priceInCents";
};

export default function ProductsClient({
  initialData,
  initialOrderBy,
  initialQuery,
}: Props) {
  const [items, setItems] = useState(initialData.products);
  const [nextCursor, setNextCursor] = useState<string | null>(
    initialData.nextCursor
  );
  const [isPending, startTransition] = useTransition();
  const searchParams = useSearchParams();

  // Controles
  const [query, setQuery] = useState(initialQuery);
  const [orderBy, setOrderBy] = useState<"name" | "createdAt" | "priceInCents">(
    initialOrderBy
  );

  // Atualiza o estado dos items quando a query mudar
  useEffect(() => {
    const urlQuery = (searchParams.get("query") || "").trim();
    const urlOrderBy =
      (searchParams.get("orderBy") as "name" | "createdAt" | "priceInCents") ||
      "createdAt";

    if (urlQuery !== query || urlOrderBy !== orderBy) {
      setQuery(urlQuery);
      setOrderBy(urlOrderBy);
      startTransition(async () => {
        try {
          const result = await loadMoreProducts("", urlQuery, urlOrderBy);
          setItems(result.products);
          setNextCursor(result.nextCursor);
        } catch (e) {
          console.error("Erro ao sincronizar filtros via URL:", e);
        }
      });
    }
  }, [searchParams]);

  // Funcao para carregar mais produtos
  const handleLoadMore = async () => {
    if (!nextCursor || isPending) return;

    startTransition(async () => {
      try {
        const result = await loadMoreProducts(nextCursor, query, orderBy);

        // Adicionar novos produtos no fim da lista
        setItems((prev) => [...prev, ...result.products]);
        setNextCursor(result.nextCursor);
      } catch (error) {
        console.error("Erro ao carregar mais produtos:", error);
      }
    });
  };

  const handleFilterChange = async (
    newQuery?: string,
    newOrderBy?: typeof orderBy
  ) => {
    const finalQuery = newQuery !== undefined ? newQuery : query;
    const finalOrderBy = newOrderBy !== undefined ? newOrderBy : orderBy;

    startTransition(async () => {
      try {
        // Resetar para primeira pagina com novos filtros
        const result = await loadMoreProducts("", finalQuery, finalOrderBy);
        setItems(result.products);
        setNextCursor(result.nextCursor);
      } catch (error) {
        console.error("Erro ao filtrar produtos:", error);
      }
    });
  };

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
                placeholder="Buscar produtos..."
                className="pl-9"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleFilterChange(query, orderBy);
                  }
                }}
              />
            </div>

            {/* Ordenação */}
            <div className="flex items-center gap-3">
              <Select
                value={orderBy}
                onValueChange={(v) => {
                  const newOrderBy = v as typeof orderBy;
                  setOrderBy(newOrderBy);
                  handleFilterChange(undefined, newOrderBy);
                }}
              >
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
                {filtered.length} produto{filtered.length !== 1 ? "s" : ""}{" "}
                encontrado{filtered.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="py-6 sm:py-8 my-12">
        <div className="mx-auto max-w-screen-md md:max-w-3xl lg:max-w-5xl xl:max-w-7xl px-4 sm:px-6 lg:px-8">
          {filtered.length === 0 ? (
            <EmptyState
              onClear={() => {
                setQuery("");
                handleFilterChange("", orderBy);
              }}
            />
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

          {/* Carregar mais */}
          {nextCursor && (
            <div className="flex justify-center mt-8">
              <Button
                onClick={handleLoadMore}
                disabled={isPending}
                variant="outline"
                size="lg"
                className="min-w-32"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Carregando...
                  </>
                ) : (
                  "Ver mais"
                )}
              </Button>
            </div>
          )}

          {/* Loading skeletons para quando está carregando */}
          {isPending && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <ProductCardSkeleton key={`skeleton-${i}`} />
              ))}
            </div>
          )}
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
