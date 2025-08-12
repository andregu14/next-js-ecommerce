"use client";

import * as React from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MenuIcon, ShoppingBag, UserRound, Search } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { NavMenu } from "./NavMenu";

export function Nav() {
  return (
    <header
      className={cn(
        "sticky top-0 z-50",
        // Glass + border + shadow
        "backdrop-blur-xl bg-background/70 supports-[backdrop-filter]:bg-background/60",
        "border-b border-border/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
      )}
    >
      {/* Container */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Linha principal */}
        <div className="flex h-16 items-center gap-4">
          {/* Mobile menu */}
          <div className="flex lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <MenuIcon className="h-5 w-5" />
                  <span className="sr-only">Abrir menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[320px] p-0">
                <SheetHeader className="px-4 py-3">
                  <SheetTitle className="text-left">Menu</SheetTitle>
                </SheetHeader>
                <Separator />
                <nav className="flex flex-col px-2 py-3">
                  <Link
                    href="/"
                    className="rounded-md px-3 py-2 text-sm font-medium hover:bg-muted/70"
                  >
                    Início
                  </Link>
                  <Link
                    href="/produtos"
                    className="rounded-md px-3 py-2 text-sm font-medium hover:bg-muted/70"
                  >
                    Produtos
                  </Link>
                  <Link
                    href="/ofertas"
                    className="rounded-md px-3 py-2 text-sm font-medium hover:bg-muted/70"
                  >
                    Ofertas
                  </Link>
                  <Link
                    href="/contato"
                    className="rounded-md px-3 py-2 text-sm font-medium hover:bg-muted/70"
                  >
                    Contato
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>
          </div>

          {/* Logo */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-md px-2 py-1"
          >
            <span className="text-lg text-primary  font-black  tracking-tight">
              PDF Store
            </span>
          </Link>

          {/* Nav links (desktop) */}
          <div className="hidden lg:flex">
           <NavMenu />
          </div>

          {/* Espaçador */}
          <div className="flex-1" />

          {/* Busca */}
          <div className="hidden md:flex w-full max-w-md items-center">
            <div className="relative w-full">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar produtos..."
                className={cn(
                  "pl-9 pr-3 h-10 rounded-full",
                  "bg-muted/60 hover:bg-muted/70",
                  "focus-visible:ring-2 focus-visible:ring-primary/50",
                  "transition-colors"
                )}
              />
            </div>
          </div>

          {/* Ações */}
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="rounded-full">
              <UserRound className="h-5 w-5" />
              <span className="sr-only">Conta</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="relative rounded-full"
            >
              <ShoppingBag className="h-5 w-5" />
              <span className="sr-only">Carrinho</span>
              {/* Badge */}
              <span className="absolute -right-1 -top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium text-primary-foreground">
                2
              </span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
