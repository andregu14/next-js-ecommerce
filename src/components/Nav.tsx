"use client";

import * as React from "react";
import Link from "next/link";

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { MenuIcon, ShoppingBag, UserRound } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { Separator } from "./ui/separator";

export function Nav() {
  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4 container mx-auto">
        {/* Menu telas pequenas */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant={"ghost"} size={"icon"}>
                <MenuIcon className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-60">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <div className="grid flex-1 auto-rows-min  *:data-[slot=link]:hover:bg-accent *:data-[slot=link]:px-3 *:data-[slot=link]:py-3">
                <Link data-slot="link" href="/">
                  Home
                </Link>
                <Separator />
                <Link data-slot="link" href="/produtos">
                  Produtos
                </Link>
                <Separator />
                <Link data-slot="link" href="/pedidos">
                  Meus Pedidos
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Logo */}
        <Link href="/" className="mr-6">
          <h1 className="text-xl font-bold">PDF Books</h1>
        </Link>

        {/* Links de navegacao */}
        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuLink
                asChild
                className={navigationMenuTriggerStyle()}
              >
                <Link href="/">Home</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink
                asChild
                className={navigationMenuTriggerStyle()}
              >
                <Link href="/produtos">Produtos</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuLink
                asChild
                className={navigationMenuTriggerStyle()}
              >
                <Link href="/pedidos">Pedidos</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        {/* Barra de pesquisa e icones de acao */}
        <div className="ml-auto flex items-center space-x-4">
          <Input
            type="search"
            placeholder="Pesquisar livros..."
            className="w-full sm:w-[300px]"
          />
          <Button variant="ghost" size="icon">
            <ShoppingBag className="h-5 w-5" />
            <span className="sr-only">Carrinho de Compras</span>
          </Button>
          <Button variant={"ghost"} size={"icon"}>
            <UserRound className="h-5 w-5" />
            <span className="sr-only">Perfil do Usuário</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
