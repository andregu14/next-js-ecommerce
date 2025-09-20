"use client"

import { cn } from "@/lib/utils";

type PriceProps = {
  cents: number;
  className?: string;
};

export function Price({ cents, className }: PriceProps) {
  const value = cents / 100;
  const parts = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).formatToParts(value);

  const currency = parts.find((p) => p.type === "currency")?.value ?? "R$";
  const integer = parts.find((p) => p.type === "integer")?.value ?? "0";
  const fraction = parts.find((p) => p.type === "fraction")?.value ?? "00";
  const decimal = parts.find((p) => p.type === "decimal")?.value ?? ",";

  return (
    <span
      className={cn("inline-flex items-baseline tabular-nums leading-none", className)}
    >
      <span className="mr-1 text-xs text-muted-foreground">{currency}</span>
      <span className="text-xl font-semibold">{integer}</span>
      <span className="px-0.5 align-baseline">{decimal}</span>
      <span className="text-[0.75em] align-baseline">{fraction}</span>
    </span>
  );
}
