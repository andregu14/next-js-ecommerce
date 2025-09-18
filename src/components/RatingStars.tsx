// components/RatingStars.tsx
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

function StarIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" {...props}>
      <path
        d="M10 1.6l2.5 5.1 5.6.8-4 4 1 5.6-5-2.7-5 2.7 1-5.6-4-4 5.6-.8L10 1.6z"
        fill="currentColor"
      />
    </svg>
  );
}

type RatingStarsProps = {
  rating: number;
  count: number;
  size?: number;
  variant?: "popular" | "new";
  className?: string;
};

export function RatingStars({
  rating,
  count,
  size = 16,
  variant = "popular",
  className,
}: RatingStarsProps) {
  // Limita e calcula preenchimento percentual da sobreposição (0..100%)
  const clamped = Math.max(0, Math.min(5, rating));
  const percent = (clamped / 5) * 100;

  const fillClass =
    variant === "popular" ? "text-indigo-500" : "text-orange-500";

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* nota a esquerda */}
      <span className="text-sm font-medium tabular-nums">
        {clamped.toFixed(1)}
      </span>

      {/* Wrapper das estrelas (base + overlay) */}
      <div
        className="relative"
        style={{ width: `${size * 5}px`, height: `${size}px` }}
        aria-hidden="true"
      >
        {/* Base neutra (cinza) */}
        <div className="absolute inset-0 flex">
          {Array.from({ length: 5 }).map((_, i) => (
            <StarIcon
              key={`base-${i}`}
              className="text-foreground/25"
              width={size}
              height={size}
            />
          ))}
        </div>

        {/* Overlay colorida */}
        <div
          className={"absolute inset-0 overflow-hidden"}
          style={{
            mask: `linear-gradient(to right, white ${percent}%, transparent ${percent}%`,
          }}
        >
          <div className="flex">
            {Array.from({ length: 5 }).map((_, i) => (
              <StarIcon
                key={`fill-${i}`}
                className={fillClass}
                width={size}
                height={size}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Contagem a direita */}
      <span className="text-sm text-muted-foreground">
        ({count.toLocaleString("pt-BR")})
      </span>

      <span className="sr-only">
        {clamped.toFixed(1)} de 5 estrelas baseado em {count} avaliações
      </span>
    </div>
  );
}
