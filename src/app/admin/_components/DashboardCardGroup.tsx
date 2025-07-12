import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency, formatNumber } from "@/lib/formatters";
import { TrendingDown, TrendingUp } from "lucide-react";

type SalesData = {
  amount: number;
  numberOfSales: number;
};

type UserData = {
  userCount: number;
  averegaValuePerUser: number;
};

type ProductData = {
  activeCount: number;
  inactiveCount: number;
};

export function DashboardCardGroup({
  salesData,
  userData,
  productData,
}: {
  salesData: SalesData;
  userData: UserData;
  productData: ProductData;
}) {
  return (
    <>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Vendas</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatCurrency(salesData.amount)}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {`${formatNumber(salesData.numberOfSales)} Novos Pedidos`}
            <TrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Total de vendas no mês
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Clientes</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatNumber(userData.userCount)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <TrendingDown />
              -20%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {`${formatCurrency(userData.averegaValuePerUser)} Valor Médio Gasto`}{" "}
            <TrendingDown className="size-4" />
          </div>
          <div className="text-muted-foreground">Total de clientes</div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Produtos à Venda</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {formatNumber(productData.activeCount)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <TrendingUp />
              +12.5%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Aumento do número de itens <TrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            {`${formatNumber(productData.inactiveCount)} Inativos`}
          </div>
        </CardFooter>
      </Card>
    </>
  );
}
