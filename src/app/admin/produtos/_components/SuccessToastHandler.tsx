"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

export function SuccessToastHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const hasShownToast = useRef(false);

  useEffect(() => {
    const success = searchParams.get("success");

    if (success && !hasShownToast.current) {
      hasShownToast.current = true;
      
      const url = new URL(window.location.href);
      url.searchParams.delete("success");
      router.replace(url.pathname + url.search, { scroll: false });

      if (success === "produto-criado") {
        toast.success("Produto criado com sucesso!", {
          description:
            "O produto foi adicionado ao catálogo e está disponível para edição.",
          duration: 5000,
          position: "top-center",
        });
      }
    }
  }, [searchParams, router]);

  return null;
}
