"use client";

import * as React from "react";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
  IconCircleCheckFilled,
  IconCircleXFilled,
  IconDotsVertical,
  IconGripVertical,
  IconLayoutColumns,
  IconPlus,
  IconTrendingUp,
} from "@tabler/icons-react";
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  Row,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { toast } from "sonner";
import { z } from "zod";

import { useIsMobile } from "@/hooks/use-mobile";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency, formatNumber } from "@/lib/formatters";
import Link from "next/link";
import {
  ActiveToggleDropdownItem,
  DeleteDropdownItem,
} from "../produtos/_components/ProductActions";
import {
  deleteProduct,
  toggleProductAvailability,
  updateProduct,
} from "../_actions/products";
import { subMonths } from "date-fns";
import Image from "next/image";
import { useFormStatus } from "react-dom";
import { deleteUser } from "../_actions/users";
import { deleteOrder } from "../_actions/orders";

// Schema for Products
export const schema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  priceInCents: z.number(),
  isAvailableForPurchase: z.boolean(),
  _count: z.object({ orders: z.number() }),
  imagePath: z.string(),
});

export const clientSchema = z.object({
  id: z.string(),
  email: z.string(),
  orders: z.array(
    z.object({
      pricePaidInCents: z.number(),
    })
  ),
});

export const ordersSchema = z.object({
  id: z.string(),
  pricePaidInCents: z.number(),
  product: z.object({ name: z.string() }),
  user: z.object({ email: z.string() }),
});

// Create a separate component for the drag handle
function DragHandle({ id }: { id: string }) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="text-muted-foreground size-7 hover:bg-transparent cursor-grab active:cursor-grabbing"
    >
      <IconGripVertical className="text-muted-foreground size-3" />
      <span className="sr-only">Arraste para reordenar</span>
    </Button>
  );
}

function DraggableRow<T extends { id: string }>({ row }: { row: Row<T> }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: row.original.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      {...attributes}
      data-state={row.getIsSelected() && "selected"}
      className={`relative ${isDragging ? "z-50 opacity-50" : "z-0"}`}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id}>
          {cell.column.id === "drag" ? (
            <div {...listeners} className="cursor-grab active:cursor-grabbing">
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </div>
          ) : (
            flexRender(cell.column.columnDef.cell, cell.getContext())
          )}
        </TableCell>
      ))}
    </TableRow>
  );
}

export function DashboardDataTable({
  productsData: initialProductsData = [],
  clientsData: initialClientsData = [],
  ordersData: initialOrdersData = [],
  dataType,
}: {
  productsData?: z.infer<typeof schema>[];
  clientsData?: z.infer<typeof clientSchema>[];
  ordersData?: z.infer<typeof ordersSchema>[];
  dataType?: "products" | "clients" | "orders";
}) {
  // State management for Products Table
  const [productsData, setProductsData] = React.useState(initialProductsData);
  const [productsSorting, setProductsSorting] = React.useState<SortingState>(
    []
  );
  const [productsColumnFilters, setProductsColumnFilters] =
    React.useState<ColumnFiltersState>([]);
  const [productsColumnVisibility, setProductsColumnVisibility] =
    React.useState<VisibilityState>({});
  const [productsRowSelection, setProductsRowSelection] = React.useState({});

  // State management for Clients Table
  const [clientsData, setClientsData] = React.useState(initialClientsData);
  const [clientsSorting, setClientsSorting] = React.useState<SortingState>([]);
  const [clientsColumnFilters, setClientsColumnFilters] =
    React.useState<ColumnFiltersState>([]);
  const [clientsColumnVisibility, setClientsColumnVisibility] =
    React.useState<VisibilityState>({});
  const [clientsRowSelection, setClientsRowSelection] = React.useState({});

  // State management for Orders Table
  const [ordersData, setOrdersData] = React.useState(initialOrdersData);
  const [ordersSorting, setOrdersSorting] = React.useState<SortingState>([]);
  const [ordersColumnFilters, setOrdersColumnFilters] =
    React.useState<ColumnFiltersState>([]);
  const [ordersColumnVisibility, setOrdersColumnVisibility] =
    React.useState<VisibilityState>({});
  const [ordersRowSelection, setOrdersRowSelection] = React.useState({});

  const [activeTab, setActiveTab] = React.useState(dataType || "products");

  const sortableId = React.useId();
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  );

  const productsDataIds = React.useMemo<UniqueIdentifier[]>(
    () => productsData.map((item) => item.id),
    [productsData]
  );

  const clientsDataIds = React.useMemo<UniqueIdentifier[]>(
    () => clientsData.map((item) => item.id),
    [clientsData]
  );

  const ordersDataIds = React.useMemo<UniqueIdentifier[]>(
    () => ordersData.map((item) => item.id),
    [ordersData]
  );

  const handleUpdateProduct = React.useCallback(
    (updateProduct: z.infer<typeof schema>) => {
      setProductsData((prev) =>
        prev.map((item) =>
          item.id === updateProduct.id ? updateProduct : item
        )
      );
    },
    []
  );

  // Columns definition for Products
  const productsColumns: ColumnDef<z.infer<typeof schema>>[] = [
    {
      id: "drag",
      header: () => null,
      cell: ({ row }) => <DragHandle id={row.original.id} />,
    },
    {
      accessorKey: "product",
      header: "Produto",
      cell: ({ row }) => {
        return (
          <TableCellViewer item={row.original} onUpdate={handleUpdateProduct} />
        );
      },
      enableHiding: false,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant="outline" className="text-muted-foreground px-1.5">
          {row.original.isAvailableForPurchase ? (
            <>
              <IconCircleCheckFilled className="fill-green-500 dark:fill-green-400" />{" "}
              <span>Habilitado</span>
            </>
          ) : (
            <>
              <IconCircleXFilled />
              <span>Desabilitado</span>
            </>
          )}
        </Badge>
      ),
    },
    {
      accessorKey: "valor",
      header: () => <div className="w-full text-right">Valor (R$)</div>,
      cell: ({ row }) => {
        return (
          <div className="w-full text-right">
            {formatCurrency(Number(row.original.priceInCents) / 100)}
          </div>
        );
      },
    },
    {
      accessorKey: "pedidos",
      header: () => <div className="w-full text-right">Pedidos</div>,
      cell: ({ row }) => {
        return (
          <div className="w-full text-right">
            {formatNumber(row.original._count.orders)}
          </div>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
                size="icon"
              >
                <IconDotsVertical />
                <span className="sr-only">Ações</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32">
              <DropdownMenuItem asChild>
                <a
                  download
                  href={`/admin/produtos/${row.original.id}/download`}
                >
                  Download
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/admin/produtos/${row.original.id}/editar`}>
                  Editar
                </Link>
              </DropdownMenuItem>
              <ActiveToggleDropdownItem
                id={row.original.id}
                isAvailableForPurchase={row.original.isAvailableForPurchase}
                onToggle={handleToggleAvailability}
              />
              <DropdownMenuSeparator />
              <DeleteDropdownItem
                id={row.original.id}
                onDelete={handleDeleteProduct}
              />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  // Columns definition for Clients
  const clientColumns: ColumnDef<z.infer<typeof clientSchema>>[] = [
    {
      id: "drag",
      header: () => null,
      cell: ({ row }) => <DragHandle id={row.original.id} />,
    },
    {
      accessorKey: "email",
      header: "Cliente",
      cell: ({ row }) => <div>{row.original.email}</div>,
    },
    {
      accessorKey: "Valor Gasto",
      header: () => <div className="w-full text-right">Valor Gasto (R$)</div>,
      cell: ({ row }) => (
        <div className="w-full text-right">
          {formatCurrency(
            row.original.orders.reduce(
              (sum, o) => o.pricePaidInCents + sum,
              0
            ) / 100
          )}
        </div>
      ),
    },
    {
      accessorKey: "Pedidos",
      header: () => <div className="w-full text-right">Pedidos</div>,
      cell: ({ row }) => (
        <div className="w-full text-right">
          {formatNumber(row.original.orders.length)}
        </div>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
                size="icon"
              >
                <IconDotsVertical />
                <span className="sr-only">Ações</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32">
              <DeleteDropdownItem
                id={row.original.id}
                onDelete={handleDeleteClient}
              />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  // Columns definition for Orders
  const ordersColumns: ColumnDef<z.infer<typeof ordersSchema>>[] = [
    {
      id: "drag",
      header: () => null,
      cell: ({ row }) => <DragHandle id={row.original.id} />,
    },
    {
      accessorKey: "id",
      header: "ID da Venda",
      cell: ({ row }) => (
        <div className="font-mono text-xs">
          {row.original.id.slice(0, 8)}...
        </div>
      ),
    },
    {
      accessorKey: "produto",
      header: "Produto",
      cell: ({ row }) => <div>{row.original.product.name}</div>,
    },
    {
      accessorKey: "cliente",
      header: "Cliente",
      cell: ({ row }) => <div>{row.original.user.email}</div>,
    },
    {
      accessorKey: "valor",
      header: () => <div className="w-full text-right">Valor Pago (R$)</div>,
      cell: ({ row }) => (
        <div className="w-full text-right">
          {formatCurrency(Number(row.original.pricePaidInCents) / 100)}
        </div>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
                size="icon"
              >
                <IconDotsVertical />
                <span className="sr-only">Ações</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32">
              <DropdownMenuItem asChild>
                <a download href={`/admin/vendas/${row.original.id}/download`}>
                  Download
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/admin/vendas/${row.original.id}/detalhes`}>
                  Ver Detalhes
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DeleteDropdownItem
                id={row.original.id}
                onDelete={handleDeleteOrder}
              />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  // React Table instance for Products
  const productsTable = useReactTable({
    data: productsData,
    columns: productsColumns,
    state: {
      sorting: productsSorting,
      columnFilters: productsColumnFilters,
      columnVisibility: productsColumnVisibility,
      rowSelection: productsRowSelection,
    },
    onSortingChange: setProductsSorting,
    onColumnFiltersChange: setProductsColumnFilters,
    onColumnVisibilityChange: setProductsColumnVisibility,
    onRowSelectionChange: setProductsRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  // React Table instance for Clients
  const clientsTable = useReactTable({
    data: clientsData,
    columns: clientColumns,
    state: {
      sorting: clientsSorting,
      columnFilters: clientsColumnFilters,
      columnVisibility: clientsColumnVisibility,
      rowSelection: clientsRowSelection,
    },
    onSortingChange: setClientsSorting,
    onColumnFiltersChange: setClientsColumnFilters,
    onColumnVisibilityChange: setClientsColumnVisibility,
    onRowSelectionChange: setClientsRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  // React Table instance for Orders
  const ordersTable = useReactTable({
    data: ordersData,
    columns: ordersColumns,
    state: {
      sorting: ordersSorting,
      columnFilters: ordersColumnFilters,
      columnVisibility: ordersColumnVisibility,
      rowSelection: ordersRowSelection,
    },
    onSortingChange: setOrdersSorting,
    onColumnFiltersChange: setOrdersColumnFilters,
    onColumnVisibilityChange: setOrdersColumnVisibility,
    onRowSelectionChange: setOrdersRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  // Use the correct table instance based on the active tab
  const table =
    activeTab === "products"
      ? productsTable
      : activeTab === "clients"
        ? clientsTable
        : ordersTable;

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!active || !over || active.id === over.id) {
      return;
    }

    // Explicitly handle state update for the "products" tab
    if (activeTab === "products") {
      setProductsData((prevData) => {
        const oldIndex = prevData.findIndex((item) => item.id === active.id);
        const newIndex = prevData.findIndex((item) => item.id === over.id);

        if (oldIndex === -1 || newIndex === -1) {
          return prevData; // Return original data if item not found
        }

        return arrayMove(prevData, oldIndex, newIndex);
      });
    }
    // Explicitly handle state update for the "clients" tab
    else if (activeTab === "clients") {
      setClientsData((prevData) => {
        const oldIndex = prevData.findIndex((item) => item.id === active.id);
        const newIndex = prevData.findIndex((item) => item.id === over.id);

        if (oldIndex === -1 || newIndex === -1) {
          return prevData; // Return original data if item not found
        }

        return arrayMove(prevData, oldIndex, newIndex);
      });
    } else if (activeTab === "orders") {
      setOrdersData((prevData) => {
        const oldIndex = prevData.findIndex((item) => item.id === active.id);
        const newIndex = prevData.findIndex((item) => item.id === over.id);

        if (oldIndex === -1 || newIndex === -1) {
          return prevData; // Return original data if item not found
        }

        return arrayMove(prevData, oldIndex, newIndex);
      });
    }
  }

  // Função para atualizar um produto
  const handleToggleAvailability = async (id: string, isAvailable: boolean) => {
    await toggleProductAvailability(id, isAvailable);
    setProductsData((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isAvailableForPurchase: isAvailable } : item
      )
    );
  };

  // Função para deletar um produto
  const handleDeleteProduct = async (id: string) => {
    await deleteProduct(id);
    setProductsData((prev) => prev.filter((item) => item.id !== id));
  };

  // Função para deletar um cliente
  const handleDeleteClient = async (id: string) => {
    await deleteUser(id);
    setClientsData((prev) => prev.filter((item) => item.id !== id));
  };

  // Função para deletar uma venda
  const handleDeleteOrder = async (id: string) => {
    await deleteOrder(id);
    setOrdersData((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <Tabs
      defaultValue={activeTab}
      value={activeTab}
      onValueChange={(value) =>
        setActiveTab(value as "products" | "clients" | "orders")
      }
      className="w-full flex-col justify-start gap-6"
    >
      <div
        className={`flex items-center ${dataType ? "justify-end" : "justify-between"}  px-4 lg:px-6`}
      >
        <Label htmlFor="view-selector" className="sr-only">
          Selecione a tabela
        </Label>
        {!dataType && (
          <>
            <Select
              defaultValue="products"
              onValueChange={(value) =>
                setActiveTab(value as "products" | "clients" | "orders")
              }
            >
              <SelectTrigger
                className="flex w-fit @4xl/main:hidden"
                size="sm"
                id="view-selector"
              >
                <SelectValue placeholder="Selecione uma tabela" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="products">Produtos</SelectItem>
                <SelectItem value="clients">Clientes</SelectItem>
                <SelectItem value="orders">Vendas</SelectItem>
              </SelectContent>
            </Select>
            <TabsList className="**:data-[slot=badge]:bg-muted-foreground/30 hidden **:data-[slot=badge]:size-5 **:data-[slot=badge]:rounded-full **:data-[slot=badge]:px-1 @4xl/main:flex">
              <TabsTrigger value="products">Produtos</TabsTrigger>
              <TabsTrigger value="clients">Clientes</TabsTrigger>
              <TabsTrigger value="orders">Vendas</TabsTrigger>
            </TabsList>
          </>
        )}
        <div className="flex align-middle gap-2">
          {activeTab === "products" && (
            <Button variant="outline" size="sm">
              <IconPlus />
              <Link
                href={"/admin/produtos/novo"}
                className=" lg:inline cursor-pointer"
              >
                Adicionar Produto
              </Link>
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <IconLayoutColumns />
                <span className="hidden lg:inline">Personalizar Colunas</span>
                <span className="lg:hidden">Colunas</span>
                <IconChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {table
                .getAllColumns()
                .filter(
                  (column) =>
                    typeof column.accessorFn !== "undefined" &&
                    column.getCanHide()
                )
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {/* Displaying column header as label */}
                      {typeof column.columnDef.header === "string"
                        ? column.columnDef.header
                        : column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      {/* Products Tab Content */}
      <TabsContent
        value="products"
        className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
      >
        <div className="overflow-hidden rounded-lg border">
          <DndContext
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={handleDragEnd}
            sensors={sensors}
            id={`${sortableId}-products`}
          >
            <Table>
              <TableHeader className="bg-muted sticky top-0 z-10">
                {productsTable.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id} colSpan={header.colSpan}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody className="**:data-[slot=table-cell]:first:w-8">
                {productsTable.getRowModel().rows?.length ? (
                  <SortableContext
                    items={productsDataIds}
                    strategy={verticalListSortingStrategy}
                  >
                    {productsTable.getRowModel().rows.map((row) => (
                      <DraggableRow key={row.original.id} row={row} />
                    ))}
                  </SortableContext>
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={productsColumns.length}
                      className="h-24 text-center"
                    >
                      Sem resultados.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </DndContext>
        </div>
        {/* Pagination for Products */}
        <div className="flex items-center justify-end px-4 mb-8">
          <div className="flex w-full items-center gap-8 lg:w-fit">
            <div className="hidden items-center gap-2 lg:flex">
              <Label htmlFor="rows-per-page" className="text-sm font-medium">
                Items por página
              </Label>
              <Select
                value={`${productsTable.getState().pagination.pageSize}`}
                onValueChange={(value) => {
                  productsTable.setPageSize(Number(value));
                }}
              >
                <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                  <SelectValue
                    placeholder={productsTable.getState().pagination.pageSize}
                  />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-fit items-center justify-center text-sm font-medium">
              Página {productsTable.getState().pagination.pageIndex + 1} de{" "}
              {productsTable.getPageCount()}
            </div>
            <div className="ml-auto flex items-center gap-2 lg:ml-0">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => productsTable.setPageIndex(0)}
                disabled={!productsTable.getCanPreviousPage()}
              >
                <span className="sr-only">Ir para a primeira página</span>
                <IconChevronsLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => productsTable.previousPage()}
                disabled={!productsTable.getCanPreviousPage()}
              >
                <span className="sr-only">Ir para a página anterior</span>
                <IconChevronLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => productsTable.nextPage()}
                disabled={!productsTable.getCanNextPage()}
              >
                <span className="sr-only">Ir para a proxima página</span>
                <IconChevronRight />
              </Button>
              <Button
                variant="outline"
                className="hidden size-8 lg:flex"
                size="icon"
                onClick={() =>
                  productsTable.setPageIndex(productsTable.getPageCount() - 1)
                }
                disabled={!productsTable.getCanNextPage()}
              >
                <span className="sr-only">Ir para a última página</span>
                <IconChevronsRight />
              </Button>
            </div>
          </div>
        </div>
      </TabsContent>

      {/* Clients Tab Content */}
      <TabsContent
        value="clients"
        className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
      >
        <div className="overflow-hidden rounded-lg border">
          <DndContext
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={handleDragEnd}
            sensors={sensors}
            id={`${sortableId}-clients`}
          >
            <Table>
              <TableHeader className="bg-muted sticky top-0 z-10">
                {clientsTable.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id} colSpan={header.colSpan}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody className="**:data-[slot=table-cell]:first:w-8">
                {clientsTable.getRowModel().rows?.length ? (
                  <SortableContext
                    items={clientsDataIds}
                    strategy={verticalListSortingStrategy}
                  >
                    {clientsTable.getRowModel().rows.map((row) => (
                      <DraggableRow key={row.original.id} row={row} />
                    ))}
                  </SortableContext>
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={clientColumns.length}
                      className="h-24 text-center"
                    >
                      Sem resultados.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </DndContext>
        </div>
        {/* Pagination for Clients */}
        <div className="flex items-center justify-end px-4 mb-8">
          <div className="flex w-full items-center gap-8 lg:w-fit">
            <div className="hidden items-center gap-2 lg:flex">
              <Label
                htmlFor="rows-per-page-clients"
                className="text-sm font-medium"
              >
                Items por página
              </Label>
              <Select
                value={`${clientsTable.getState().pagination.pageSize}`}
                onValueChange={(value) => {
                  clientsTable.setPageSize(Number(value));
                }}
              >
                <SelectTrigger
                  size="sm"
                  className="w-20"
                  id="rows-per-page-clients"
                >
                  <SelectValue
                    placeholder={clientsTable.getState().pagination.pageSize}
                  />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-fit items-center justify-center text-sm font-medium">
              Página {clientsTable.getState().pagination.pageIndex + 1} de{" "}
              {clientsTable.getPageCount()}
            </div>
            <div className="ml-auto flex items-center gap-2 lg:ml-0">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => clientsTable.setPageIndex(0)}
                disabled={!clientsTable.getCanPreviousPage()}
              >
                <span className="sr-only">Ir para a primeira página</span>
                <IconChevronsLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => clientsTable.previousPage()}
                disabled={!clientsTable.getCanPreviousPage()}
              >
                <span className="sr-only">Ir para a página anterior</span>
                <IconChevronLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => clientsTable.nextPage()}
                disabled={!clientsTable.getCanNextPage()}
              >
                <span className="sr-only">Ir para a proxima página</span>
                <IconChevronRight />
              </Button>
              <Button
                variant="outline"
                className="hidden size-8 lg:flex"
                size="icon"
                onClick={() =>
                  clientsTable.setPageIndex(clientsTable.getPageCount() - 1)
                }
                disabled={!clientsTable.getCanNextPage()}
              >
                <span className="sr-only">Ir para a última página</span>
                <IconChevronsRight />
              </Button>
            </div>
          </div>
        </div>
      </TabsContent>
      {/* Orders Tab Content */}
      <TabsContent
        value="orders"
        className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
      >
        <div className="overflow-hidden rounded-lg border">
          <DndContext
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={handleDragEnd}
            sensors={sensors}
            id={`${sortableId}-orders`}
          >
            <Table>
              <TableHeader className="bg-muted sticky top-0 z-10">
                {ordersTable.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id} colSpan={header.colSpan}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody className="**:data-[slot=table-cell]:first:w-8">
                {ordersTable.getRowModel().rows?.length ? (
                  <SortableContext
                    items={ordersDataIds}
                    strategy={verticalListSortingStrategy}
                  >
                    {ordersTable.getRowModel().rows.map((row) => (
                      <DraggableRow key={row.original.id} row={row} />
                    ))}
                  </SortableContext>
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={ordersColumns.length}
                      className="h-24 text-center"
                    >
                      Sem resultados.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </DndContext>
        </div>
        {/* Pagination for Orders */}
        <div className="flex items-center justify-end px-4 mb-8">
          <div className="flex w-full items-center gap-8 lg:w-fit">
            <div className="hidden items-center gap-2 lg:flex">
              <Label
                htmlFor="rows-per-page-orders"
                className="text-sm font-medium"
              >
                Items por página
              </Label>
              <Select
                value={`${ordersTable.getState().pagination.pageSize}`}
                onValueChange={(value) => {
                  ordersTable.setPageSize(Number(value));
                }}
              >
                <SelectTrigger
                  size="sm"
                  className="w-20"
                  id="rows-per-page-orders"
                >
                  <SelectValue
                    placeholder={ordersTable.getState().pagination.pageSize}
                  />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-fit items-center justify-center text-sm font-medium">
              Página {ordersTable.getState().pagination.pageIndex + 1} de{" "}
              {ordersTable.getPageCount()}
            </div>
            <div className="ml-auto flex items-center gap-2 lg:ml-0">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => ordersTable.setPageIndex(0)}
                disabled={!ordersTable.getCanPreviousPage()}
              >
                <span className="sr-only">Ir para a primeira página</span>
                <IconChevronsLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => ordersTable.previousPage()}
                disabled={!ordersTable.getCanPreviousPage()}
              >
                <span className="sr-only">Ir para a página anterior</span>
                <IconChevronLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => ordersTable.nextPage()}
                disabled={!ordersTable.getCanNextPage()}
              >
                <span className="sr-only">Ir para a proxima página</span>
                <IconChevronRight />
              </Button>
              <Button
                variant="outline"
                className="hidden size-8 lg:flex"
                size="icon"
                onClick={() =>
                  ordersTable.setPageIndex(ordersTable.getPageCount() - 1)
                }
                disabled={!ordersTable.getCanNextPage()}
              >
                <span className="sr-only">Ir para a última página</span>
                <IconChevronsRight />
              </Button>
            </div>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}

const getMonth = (index: number) => {
  const now = new Date();
  const date = subMonths(now, 5 - index);
  const month = date.toLocaleString("pt-BR", { month: "long" });
  return month.charAt(0).toUpperCase() + month.slice(1);
};

// TEMP data
const chartData = [
  { month: getMonth(0), vendas: 80, acessos: 186 },
  { month: getMonth(1), vendas: 200, acessos: 305 },
  { month: getMonth(2), vendas: 120, acessos: 237 },
  { month: getMonth(3), vendas: 73, acessos: 190 },
  { month: getMonth(4), vendas: 130, acessos: 209 },
  { month: getMonth(5), vendas: 140, acessos: 214 },
];

const chartConfig = {
  vendas: {
    label: "Vendas",
    color: "var(--primary)",
  },
  acessos: {
    label: "Acessos",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

function TableCellViewer({
  item,
  onUpdate,
}: {
  item: z.infer<typeof schema>;
  onUpdate: (updatedProduct: z.infer<typeof schema>) => void;
}) {
  const isMobile = useIsMobile();
  const [name, setName] = React.useState(item.name);
  const [status, setStatus] = React.useState(
    item.isAvailableForPurchase ? "Habilitado" : "Desabilitado"
  );
  const [priceRaw, setPriceRaw] = React.useState(String(item.priceInCents));
  const [error, action] = React.useActionState(
    async (prevState: any, formData: FormData) => {
      const result = await updateProduct.bind(null, item.id)(
        prevState,
        formData
      );

      if ("success" in result && result.success) {
        toast.success("Produto atualizado com sucesso!", {
          position: "top-center",
        });

        const updatedProduct = {
          ...item,
          name,
          priceInCents: Number(priceRaw),
          isAvailableForPurchase: status === "Habilitado",
        };

        onUpdate(updatedProduct);

        return {};
      }

      return result;
    },
    {}
  );

  function formatInputValue(raw: string) {
    if (!raw) return "";
    const cents = Number(raw);
    const reais = cents / 100;

    return reais.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  return (
    <Drawer direction={isMobile ? "bottom" : "right"}>
      <DrawerTrigger asChild>
        <Button variant="link" className="text-foreground w-fit px-0 text-left">
          {item.name}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="gap-1">
          <DrawerTitle>{item.name}</DrawerTitle>
          <DrawerDescription>Vendas nos últimos 6 meses</DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-4 overflow-y-auto px-4 text-sm">
          {!isMobile && (
            <>
              <Image
                src={item.imagePath}
                height={225}
                width={400}
                alt="Imagem do produto"
                className="w-full h-40 mx-auto my-2 rounded-lg object-contain aspect-video"
              />
              <Separator />
              <div className="grid gap-2">
                <div className="flex gap-2 leading-none font-medium">
                  Aumento do número de acessos em 5.2% esse mês
                  <IconTrendingUp className="size-4" />
                </div>
              </div>
              <ChartContainer config={chartConfig}>
                <AreaChart accessibilityLayer data={chartData}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => value.slice(0, 3)}
                    hide
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="dot" />}
                  />
                  <Area
                    dataKey="vendas"
                    type="natural"
                    fill="var(--color-vendas)"
                    fillOpacity={0.6}
                    stroke="var(--color-vendas)"
                    stackId="a"
                  />
                  <Area
                    dataKey="acessos"
                    type="natural"
                    fill="var(--color-acessos)"
                    fillOpacity={0.4}
                    stroke="var(--color-acessos)"
                    stackId="a"
                  />
                </AreaChart>
              </ChartContainer>
              <Separator />
            </>
          )}
          <form
            id={`product-form-${item.id}`}
            action={action}
            className="flex flex-col gap-4"
          >
            <div className="flex flex-col gap-3">
              <Label htmlFor="product">Produto</Label>
              <Input
                id="product"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-3">
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger id="status" className="w-full">
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Habilitado">Habilitado</SelectItem>
                    <SelectItem value="Desabilitado">Desabilitado</SelectItem>
                  </SelectContent>
                </Select>
                <input
                  type="hidden"
                  name="isAvailableForPurchase"
                  value={status === "Habilitado" ? "true" : "false"}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex flex-col gap-3">
                <Label htmlFor="priceInCents">Valor</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
                    <Badge variant="secondary">R$</Badge>
                  </span>
                  <Input
                    id="priceInCents"
                    className="pl-14"
                    value={formatInputValue(priceRaw)}
                    onChange={(e) => {
                      // Remove tudo que não for número
                      const raw = e.target.value.replace(/\D/g, "");
                      setPriceRaw(raw);
                    }}
                  />
                  <input type="hidden" name="priceInCents" value={priceRaw} />
                  <input
                    type="hidden"
                    name="description"
                    value={item.description}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <Label htmlFor="orders">Pedidos</Label>
                <Input id="orders" disabled defaultValue={item._count.orders} />
              </div>
            </div>
          </form>
        </div>
        <DrawerFooter>
          <SubmitButton formId={`product-form-${item.id}`} />
          <DrawerClose asChild>
            <Button variant="outline">Voltar</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

function SubmitButton({ formId }: { formId: string }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" form={formId} disabled={pending}>
      {pending ? "Atualizando..." : "Atualizar"}
    </Button>
  );
}
