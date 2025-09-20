"use client";

import { formatCurrency } from "@/lib/formatters";
import { cn } from "@/lib/utils";

type PriceProps = {
  cents: number;
  discountCents?: number;
  className?: string;
};

function toPartsBR(cents: number) {
  const value = cents / 100;
  const parts = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).formatToParts(value);
  return {
    currency: parts.find((p) => p.type === "currency")?.value ?? "R$",
    integer: parts.find((p) => p.type === "integer")?.value ?? "0",
    fraction: parts.find((p) => p.type === "fraction")?.value ?? "00",
    decimal: parts.find((p) => p.type === "decimal")?.value ?? ",",
  };
}

function PriceTokens({
  cents,
  className,
}: {
  cents: number;
  className?: string;
}) {
  const { currency, integer, fraction, decimal } = toPartsBR(cents);

  return (
    <span
      className={cn(
        "inline-flex items-baseline tabular-nums leading-none",
        className
      )}
    >
      <span className="mr-1 text-xs text-muted-foreground">{currency}</span>
      <span className="text-xl font-semibold">{integer}</span>
      <span className="px-0.5 align-baseline">{decimal}</span>
      <span className="text-[0.75em] align-baseline">{fraction}</span>
    </span>
  );
}

export function Price({ cents, discountCents, className }: PriceProps) {
  const hasDiscount =
    typeof discountCents === "number" && discountCents! < cents;

  if (!hasDiscount) {
    return <PriceTokens cents={cents} className={className} />;
  }

  return (
    <div
      className={cn("flex items-baseline gap-2", className)}
      aria-label={`Preço com desconto: ${discountCents! / 100} reais; preço anterior: ${cents / 100} reais.`}
    >
      <PriceTokens cents={discountCents!} />

      <span className="inline-flex items-baseline gap-1 text-muted-foreground">
        {discountCents && <span className="text-xs">De:</span>}
        <span className="tabular-nums  text-xs line-through text-muted-foreground">
          {formatCurrency(cents / 100)}
        </span>
      </span>
    </div>
  );
}
