"use client";

import { usePathname } from "next/navigation";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";

function isActive(pathname: string, href: string, { exact = false } = {}) {
  if (exact) return pathname === href;

  return pathname === href || pathname.startsWith(href + "/");
}

export function NavMenu() {
  const pathname = usePathname();

  return (
    <NavigationMenu>
      <NavigationMenuList className="gap-1">
        <NavigationMenuItem>
          <NavigationMenuLink
            href="/"
            className={cn(
              navigationMenuTriggerStyle(),
              "bg-transparent hover:bg-transparent",
              "text-foreground/80 hover:text-foreground",
              "data-[active]:text-primary",
              "relative after:absolute after:left-1/2 after:-translate-x-1/2",
              "after:-bottom-1 after:h-[2px] after:w-0 after:rounded-full after:bg-primary",
              "hover:after:w-4 transition-all",
              isActive(pathname, "/", { exact: true })
                ? "text-primary after:w-6"
                : "after:w-0 hover:after:w-4"
            )}
          >
            Início
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink
            href="/produtos"
            className={cn(
              navigationMenuTriggerStyle(),
              "bg-transparent hover:bg-transparent",
              "text-foreground/80 hover:text-foreground",
              "relative after:absolute after:left-1/2 after:-translate-x-1/2",
              "after:-bottom-1 after:h-[2px] after:w-0 after:rounded-full after:bg-primary",
              "hover:after:w-4 transition-all",
              isActive(pathname, "/produtos")
                ? "text-primary after:w-6"
                : "after:w-0 hover:after:w-4"
            )}
          >
            Produtos
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink
            href="/ofertas"
            className={cn(
              navigationMenuTriggerStyle(),
              "bg-transparent hover:bg-transparent",
              "text-foreground/80 hover:text-foreground",
              "relative after:absolute after:left-1/2 after:-translate-x-1/2",
              "after:-bottom-1 after:h-[2px] after:w-0 after:rounded-full after:bg-primary",
              "hover:after:w-4 transition-all",
              isActive(pathname, "/ofertas", { exact: true })
                ? "text-primary after:w-6"
                : "after:w-0 hover:after:w-4"
            )}
          >
            Ofertas
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink
            href="/contato"
            className={cn(
              navigationMenuTriggerStyle(),
              "bg-transparent hover:bg-transparent",
              "text-foreground/80 hover:text-foreground",
              "relative after:absolute after:left-1/2 after:-translate-x-1/2",
              "after:-bottom-1 after:h-[2px] after:w-0 after:rounded-full after:bg-primary",
              "hover:after:w-4 transition-all",
              isActive(pathname, "/contato", { exact: true })
                ? "text-primary after:w-6"
                : "after:w-0 hover:after:w-4"
            )}
          >
            Contato
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}
