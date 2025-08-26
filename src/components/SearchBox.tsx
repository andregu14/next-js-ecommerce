"use client";

import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Search } from "lucide-react";
import { Input } from "./ui/input";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "./ui/command";
import Link from "next/link";
import Image from "next/image";
import { formatCurrency } from "@/lib/formatters";
import { Button } from "./ui/button";

type SearchResult = {
  id: string;
  name: string;
  imagePath: string | null;
  priceInCents: number;
};

export function SearchBox({ className }: { className?: string }) {
  const router = useRouter();
  const [term, setTerm] = useState("");
  const [open, setOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const abortRef = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Debounce manual (300ms)
  const debouncedSearch = useMemo(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    return (value: string) => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        void search(value);
      }, 300);
    };
  }, []);

  async function search(q: string) {
    const query = q.trim();
    if (query.length < 2) {
      setResults([]);
      setOpen(false);
      setLoading(false);
      if (abortRef.current) abortRef.current.abort();
      return;
    }

    // cancela requisicao anterior
    if (abortRef.current) {
      abortRef.current.abort();
    }
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      setLoading(true);
      setOpen(true);

      const params = new URLSearchParams({ query, limit: "8" });
      const res = await fetch(`/api/search-products?${params.toString()}`, {
        signal: controller.signal,
        headers: { "cache-control": "no-store" },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch");
      }

      const data = (await res.json()) as { results: SearchResult[] };
      setResults(data.results);
    } catch (err: any) {
      if (err?.name !== "AbortError") {
        console.error("Search error:", err);
        setResults([]);
      }
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setTerm(value);
    debouncedSearch(value);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && term.trim().length >= 2) {
      router.push(`/produtos?query=${encodeURIComponent(term.trim())}`);
      setOpen(false);
      inputRef.current?.blur();
    }
    if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className={cn("relative w-full", className)}>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={inputRef}
            type="search"
            placeholder="Buscar produtos..."
            value={term}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (term.trim().length >= 2 && (results.length > 0 || loading)) {
                setOpen(true);
              }
            }}
            className={cn(
              "pl-9 pr-3 h-10 rounded-full",
              "bg-muted/60 hover:bg-muted/70",
              "focus-visible:ring-2 focus-visible:ring-primary/50",
              "transition-colors"
            )}
          />
        </div>
      </PopoverTrigger>

      <PopoverContent
        className="p-0 w-[560px]"
        align="start"
        sideOffset={8}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <Command shouldFilter={false}>
          <CommandList>
            {loading ? (
              <div className="p-4 text-sm text-muted-foreground">
                Carregando...
              </div>
            ) : results.length === 0 && term.trim().length >= 2 ? (
              <CommandEmpty>Nenhum resultado encontrado</CommandEmpty>
            ) : (
              <CommandGroup heading="Produtos">
                {results.map((p) => (
                  <CommandItem
                    key={p.id}
                    value={p.name}
                    className="p-0"
                    onSelect={() => {
                      setOpen(false);
                      router.push(`/produto/${p.id}`);
                    }}
                  >
                    <Link
                      href={`/produto/${p.id}`}
                      className="flex w-full items-center gap-3 p-3 hover:bg-accent"
                      onClick={() => setOpen(false)}
                    >
                      <div className="relative h-12 w-12 overflow-hidden rounded bg-muted">
                        {p.imagePath ? (
                          <Image
                            src={p.imagePath}
                            alt={p.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="h-full w-full" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-medium">{p.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {formatCurrency(p.priceInCents / 100)}
                        </div>
                      </div>
                    </Link>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>

          {term.trim().length >= 2 && (
            <div className="border-t p-2">
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  setOpen(false);
                  router.push(
                    `/produtos?query=${encodeURIComponent(term.trim())}`
                  );
                }}
              >
                Ver todos resultados para “{term.trim()}”
              </Button>
            </div>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  );
}
