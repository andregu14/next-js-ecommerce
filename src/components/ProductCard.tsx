"use client";

import Image from "next/image";
import Link from "next/link";
import { formatCurrency } from "@/lib/formatters";
import { RatingStars } from "./RatingStars";

type ProductCardProps = {
  id: string;
  name: string;
  description?: string | null;
  priceInCents: number;
  imagePath?: string | null;
  variant?: "popular" | "new";
  rating?: number;
  reviewCount?: number;
};

export function ProductCard({
  id,
  name,
  description,
  priceInCents,
  imagePath,
  variant,
  rating = 2.5,
  reviewCount = 128,
}: ProductCardProps) {
  const price = formatCurrency(priceInCents / 100);

  const base =
    "group relative overflow-hidden ring-1 ring-foreground/10 transition-transform duration-200 hover:-translate-y-0.5 rounded-tr-4xl";
  const bg =
    variant === "popular"
      ? "bg-gradient-to-br from-sky-500/10 via-indigo-500/10 to-blue-600/10"
      : variant === "new"
        ? "bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-rose-500/10"
        : "bg-card";

  return (
    <Link
      href={`/produto/${id}`}
      className={`${base} ${bg}`}
      aria-label={`Ver detalhes de ${name}`}
    >
      {/* Imagem */}
      <div className="relative aspect-[4/5] w-full overflow-hidden">
        <Image
          src={imagePath || "/placeholder.svg"}
          alt={name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          sizes="(min-width: 1280px) 320px, (min-width: 1024px) 25vw, 50vw"
          priority={variant === "popular"}
        />
      </div>

      {/* Conteúdo */}
      <div className="p-4">
        <h3 className="line-clamp-2 font-semibold tracking-tight">{name}</h3>
        {description ? (
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
            {description}
          </p>
        ) : null}

        {typeof rating === "number" && typeof reviewCount === "number" && (
          <div className="mt-3">
            <RatingStars
              rating={rating}
              count={reviewCount}
              variant={variant === "new" ? "new" : "popular"}
              size={16}
            />
          </div>
        )}

        <div className="mt-3 text-lg font-bold">{price}</div>
      </div>
    </Link>
  );
}
