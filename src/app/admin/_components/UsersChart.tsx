"use client";

import { TrendingDown, TrendingUp } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartConfig = {
  desktop: {
    label: "Clientes",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig;

type ChartData = {
  month: string;
  clientes: number;
};

export function UsersChart({ chartData }: { chartData: ChartData[] }) {
  function getSalesVariation({ chartData }: { chartData: ChartData[] }) {
    if (!chartData || chartData.length < 2) return null;
    const current = chartData[chartData.length - 1].clientes;
    const previous = chartData[chartData.length - 2].clientes;
    if (previous === 0) {
      return (
        <>
          {current > 0
            ? "Aumento de 100%"
            : "Sem novos usuários no mês anterior"}
          <TrendingUp className="h-4 w-4" />
        </>
      );
    }

    const percent = ((current - previous) / previous) * 100;
    const text =
      percent === 0
        ? "Sem variação em relação ao mês anterior"
        : percent > 0
          ? `Aumento de ${percent.toFixed(1)}% em relação ao mês anterior`
          : `Queda de ${Math.abs(percent).toFixed(1)}% em relação ao mês anterior`;
    return (
      <>
        {text}
        {percent > 0 ? (
          <TrendingUp className="h-4 w-4" />
        ) : (
          <TrendingDown className="h-4 w-4" />
        )}
      </>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Clientes</CardTitle>
        <CardDescription>Novos Clientes nos últimos 6 meses</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" hideLabel />}
            />
            <Area
              dataKey="clientes"
              type="linear"
              fill="var(--color-desktop)"
              fillOpacity={0.4}
              stroke="var(--color-desktop)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 leading-none font-medium">
              {getSalesVariation({ chartData })}
            </div>
            <div className="text-muted-foreground flex items-center gap-2 leading-none">
              {(() => {
                const now = new Date();
                const start = new Date(
                  now.getFullYear(),
                  now.getMonth() - 5,
                  1
                );
                const mesAtual = now.toLocaleString("pt-BR", { month: "long" });
                const mesInicio = start.toLocaleString("pt-BR", {
                  month: "long",
                });
                const anoInicio = start.getFullYear();
                const anoAtual = now.getFullYear();
                return `${mesInicio.charAt(0).toUpperCase() + mesInicio.slice(1)} - ${mesAtual.charAt(0).toUpperCase() + mesAtual.slice(1)} ${anoInicio === anoAtual ? anoAtual : anoInicio + " - " + anoAtual}`;
              })()}
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
