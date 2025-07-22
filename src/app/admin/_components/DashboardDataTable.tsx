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

export const schema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  priceInCents: z.number(),
  isAvailableForPurchase: z.boolean(),
  _count: z.object({ orders: z.number() }),
  imagePath: z.string(),
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

function DraggableRow({ row }: { row: Row<z.infer<typeof schema>> }) {
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
  data: initialData,
}: {
  data: z.infer<typeof schema>[];
}) {
  const [data, setData] = React.useState(() => initialData);
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const sortableId = React.useId();
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  );

  const dataIds = React.useMemo<UniqueIdentifier[]>(
    () => data.map((item) => item.id),
    [data]
  );

  const columns: ColumnDef<z.infer<typeof schema>>[] = [
    {
      id: "drag",
      header: () => null,
      cell: ({ row }) => <DragHandle id={row.original.id} />,
    },
    {
      accessorKey: "product",
      header: "Produto",
      cell: ({ row }) => {
        return <TableCellViewer item={row.original} />;
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

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    getRowId: (row) => row.id.toString(),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!active || !over || active.id === over.id) {
      return;
    }

    setData((prevData) => {
      const oldIndex = prevData.findIndex((item) => item.id === active.id);
      const newIndex = prevData.findIndex((item) => item.id === over.id);

      if (oldIndex === -1 || newIndex === -1) {
        return prevData;
      }

      return arrayMove(prevData, oldIndex, newIndex);
    });
  }

  // Função para atualizar um produto
  const handleToggleAvailability = async (id: string, isAvailable: boolean) => {
    await toggleProductAvailability(id, isAvailable);
    setData((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isAvailableForPurchase: isAvailable } : item
      )
    );
  };

  // Função para deletar um produto
  const handleDeleteProduct = async (id: string) => {
    await deleteProduct(id);
    setData((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <Tabs defaultValue="sales" className="w-full flex-col justify-start gap-6">
      <div className="flex items-center justify-between px-4 lg:px-6">
        <Label htmlFor="view-selector" className="sr-only">
          View
        </Label>
        <Select defaultValue="sales">
          <SelectTrigger
            className="flex w-fit @4xl/main:hidden"
            size="sm"
            id="view-selector"
          >
            <SelectValue placeholder="Selecione uma tabela" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sales">Vendas</SelectItem>
            <SelectItem value="clients">Clientes</SelectItem>
          </SelectContent>
        </Select>
        <TabsList className="**:data-[slot=badge]:bg-muted-foreground/30 hidden **:data-[slot=badge]:size-5 **:data-[slot=badge]:rounded-full **:data-[slot=badge]:px-1 @4xl/main:flex">
          <TabsTrigger value="sales">Vendas</TabsTrigger>
          <TabsTrigger value="clients">Clientes</TabsTrigger>
        </TabsList>
        <div className="flex items-center gap-2">
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
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <TabsContent
        value="sales"
        className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
      >
        <div className="overflow-hidden rounded-lg border">
          <DndContext
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={handleDragEnd}
            sensors={sensors}
            id={sortableId}
          >
            <Table>
              <TableHeader className="bg-muted sticky top-0 z-10">
                {table.getHeaderGroups().map((headerGroup) => (
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
                {table.getRowModel().rows?.length ? (
                  <SortableContext
                    items={dataIds}
                    strategy={verticalListSortingStrategy}
                  >
                    {table.getRowModel().rows.map((row) => (
                      <DraggableRow key={row.original.id} row={row} />
                    ))}
                  </SortableContext>
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
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
        <div className="flex items-center justify-end px-4 mb-8">
          <div className="flex w-full items-center gap-8 lg:w-fit">
            <div className="hidden items-center gap-2 lg:flex">
              <Label htmlFor="rows-per-page" className="text-sm font-medium">
                Items por página
              </Label>
              <Select
                value={`${table.getState().pagination.pageSize}`}
                onValueChange={(value) => {
                  table.setPageSize(Number(value));
                }}
              >
                <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                  <SelectValue
                    placeholder={table.getState().pagination.pageSize}
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
              Página {table.getState().pagination.pageIndex + 1} de{" "}
              {table.getPageCount()}
            </div>
            <div className="ml-auto flex items-center gap-2 lg:ml-0">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Ir para a primeira página</span>
                <IconChevronsLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <span className="sr-only">Ir para a página anterior</span>
                <IconChevronLeft />
              </Button>
              <Button
                variant="outline"
                className="size-8"
                size="icon"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Ir para a proxima página</span>
                <IconChevronRight />
              </Button>
              <Button
                variant="outline"
                className="hidden size-8 lg:flex"
                size="icon"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <span className="sr-only">Ir para a última página</span>
                <IconChevronsRight />
              </Button>
            </div>
          </div>
        </div>
      </TabsContent>
      <TabsContent value="clients" className="flex flex-col px-4 lg:px-6">
        <div className="aspect-video w-full flex-1 rounded-lg border border-dashed">
          <span>TODO</span>
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

function TableCellViewer({ item }: { item: z.infer<typeof schema> }) {
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
          position: "top-center"
        });
        // Recarrega a página após um pequeno delay para mostrar o toast
        setTimeout(() => {
          // window.location.reload();
        }, 1000);
        return {};
      }

      return result || {};
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
