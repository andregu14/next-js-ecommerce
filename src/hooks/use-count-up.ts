import { useEffect, useRef, useState } from "react";

type UseCountUpProps = {
  start?: number;
  end: number;
  duration?: number;
  decimals?: number;
  easing?: (t: number) => number;
};

const defaultEasing = (t: number) => 1 - Math.pow(1 - t, 3);

export function useCountUp({
  start = 0,
  end,
  duration = 1800,
  decimals = 0,
  easing = defaultEasing,
}: UseCountUpProps) {
  const [value, setValue] = useState<number>(start);
  const rafRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    let isActive = true;
    const startTime = performance.now();

    const animate = (now: number) => {
      if (!isActive) return;
      const elapsed = now - startTime;
      const t = Math.min(1, duration === 0 ? 1 : elapsed / duration);
      const eased = easing(t);
      const current = start + (end - start) * eased;
      setValue(current);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setValue(end);
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      isActive = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [start, end, duration, easing]);

  const formatted = Number(value).toLocaleString("pt-BR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return formatted;
}
