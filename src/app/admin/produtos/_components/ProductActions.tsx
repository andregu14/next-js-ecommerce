"use client";

import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useTransition } from "react";
import {
  deleteProduct,
  toggleProductAvailability,
} from "../../_actions/products";
import { DeleteDialog } from "../../_components/ui/alert-dialog";

export function ActiveToggleDropdownItem({
  id,
  isAvailableForPurchase,
  name,
  onToggle,
}: {
  id: string;
  isAvailableForPurchase: boolean;
  name: string
  onToggle?: (id: string, isAvailable: boolean, name: string) => void;
}) {
  const [isPending, startTransition] = useTransition();
  return (
    <DropdownMenuItem
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          if (onToggle) {
            onToggle(id, !isAvailableForPurchase, name);
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

  const handleDelete = () => {
    startTransition(async () => {
      if (onDelete) {
        onDelete(id);
      } else {
        await deleteProduct(id);
      }
    });
  };

  return (
    <DeleteDialog
      title="Deletar item"
      description="Tem certeza que deseja deletar este item? Esta ação não pode ser desfeita."
      onConfirm={handleDelete}
      disabled={isPending}
    >
      <DropdownMenuItem
        variant="destructive"
        disabled={disabled || isPending}
        onSelect={(e) => {
          e.preventDefault();
        }}
      >
        {isPending ? "Deletando..." : "Deletar"}
      </DropdownMenuItem>
    </DeleteDialog>
  );
}
