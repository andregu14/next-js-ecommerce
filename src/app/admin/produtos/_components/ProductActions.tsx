"use client";

import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useTransition } from "react";
import {
  deleteProduct,
  toggleProductAvailability,
} from "../../_actions/products";

export function ActiveToggleDropdownItem({
  id,
  isAvailableForPurchase,
  onToggle,
}: {
  id: string;
  isAvailableForPurchase: boolean;
  onToggle?: (id: string, isAvailable: boolean) => void;
}) {
  const [isPending, startTransition] = useTransition();
  return (
    <DropdownMenuItem
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          if (onToggle) {
            onToggle(id, !isAvailableForPurchase);
          } else {
            await toggleProductAvailability(id, !isAvailableForPurchase);
          }
        })
      }
    >
      {isAvailableForPurchase ? "Desabilitar" : "Habilitar"}
    </DropdownMenuItem>
  );
}

export function DeleteDropdownItem({
  id,
  disabled,
  onDelete,
}: {
  id: string;
  disabled?: boolean;
  onDelete?: (id: string) => void;
}) {
  const [isPending, startTransition] = useTransition();
  return (
    <DropdownMenuItem
      variant="destructive"
      disabled={disabled || isPending}
      onClick={() =>
        startTransition(async () => {
          if (onDelete) {
            onDelete(id);
          } else {
            await deleteProduct(id);
          }
        })
      }
    >
      Deletar
    </DropdownMenuItem>
  );
}
