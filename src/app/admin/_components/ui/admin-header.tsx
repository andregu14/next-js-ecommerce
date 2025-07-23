import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import React from "react";
import { ModeToggle } from "../ModeToggle";

type PreviousPageProps = {
  title: string;
  url: string;
};

type AdminHeaderProps = {
  currentPage: string;
  previousPage?: PreviousPageProps[];
};

export function AdminHeader({ currentPage, previousPage }: AdminHeaderProps) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-2">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mr-2 data-[orientation=vertical]:h-4"
        />
        <Breadcrumb>
          <BreadcrumbList>
            {previousPage && (
              <>
                {previousPage.map((page) => (
                  <React.Fragment key={page.url}>
                    <BreadcrumbItem className="hidden md:block">
                      <BreadcrumbLink href={page.url}>
                        {page.title}
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator className="hidden md:block" />
                  </React.Fragment>
                ))}
              </>
            )}
            <BreadcrumbItem>
              <BreadcrumbPage>{currentPage}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className="px-4">
      <ModeToggle />
      </div>

    </header>
  );
}
