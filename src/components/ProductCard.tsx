"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { ShoppingBag } from "lucide-react";
import { FileText, Eye } from "lucide-react";
import { formatCurrency } from "@/lib/formatters";

type ProductCardProps = {
  id: string;
  name: string;
  description?: string | null;
  priceInCents: number;
  imagePath?: string | null;
};

export function ProductCard(props: ProductCardProps) {
  const { id, name, description, priceInCents, imagePath } = props;

  const price = formatCurrency(priceInCents / 100);

  return (
    <Card className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow duration-200 h-full flex flex-col">
      <CardHeader className="p-6">
        <div className="relative aspect-[4/5] w-full overflow-hidden">
          {imagePath ? (
            <Image
              src={imagePath}
              alt={`Capa do PDF ${name}`}
              
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-contain transition-transform duration-300 group-hover:scale-[1.03]"
              priority={false}
            />
          ) : (
            <div className="absolute inset-0 grid place-items-center bg-muted text-muted-foreground">
              <FileText className="h-8 w-8" />
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-6 pt-0">
        <Link
          href={`/produtos/${id}`}
          className="block"
          aria-label={`Ver detalhes de ${name}`}
        >
          <h3 className="text-sm font-medium leading-tight line-clamp-2">
            {name}
          </h3>
        </Link>
        {description ? (
          <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
            {description}
          </p>
        ) : null}
        <div className="mt-2 flex items-center gap-2 text-sm">
          <span className="font-semibold">{price}</span>
        </div>
      </CardContent>

      <CardFooter className="p-6 pt-0">
        <div className="flex gap-2 w-full">
          <Button asChild className="flex-1">
            <Link href={`/produtos/${id}/checkout`}>
              <ShoppingBag className="w-4 h-4 mr-1" />
              Comprar
            </Link>
          </Button>

          <Button variant="outline" asChild className="flex-1">
            <Link href={`/produtos/${id}`}>
              <Eye className="w-4 h-4 mr-1" />
              Ver
            </Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="rounded-xl border bg-card">
      <div className="aspect-[4/5] w-full bg-muted animate-pulse" />
      <div className="p-3">
        <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
        <div className="mt-2 h-3 w-1/2 bg-muted rounded animate-pulse" />
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="h-9 bg-muted rounded animate-pulse" />
          <div className="h-9 bg-muted rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}
