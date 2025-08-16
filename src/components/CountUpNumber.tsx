"use client";
import * as React from "react";
import { useCountUp } from "@/hooks/use-count-up";

type CountUpNumberProps = {
  end: number;
  start?: number;
  duration?: number;
  decimals?: number;
  className?: string;
  ariaLabel?: string;
};

export function CountUpNumber({
  end,
  start = 0,
  duration = 1800,
  decimals = 0,
  className,
  ariaLabel,
}: CountUpNumberProps) {
  const formatted = useCountUp({
    start,
    end,
    duration,
    decimals,
  });

  return (
    <span
      className={className}
      aria-label={ariaLabel}
      aria-live="polite"
      aria-atomic="true"
    >
      {formatted}
    </span>
  );
}
