import { TrendingUp, TrendingDown } from "lucide-react";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import db from "@/lib/db";
import { formatCurrency, formatNumber } from "@/lib/formatters";
import { AdminHeader } from "./_components/ui/admin-header";
import { Badge } from "@/components/ui/badge";

async function getSalesData() {
  const data = await db.order.aggregate({
    _sum: { pricePaidInCents: true },
    _count: true,
  });

  return {
    amount: (data._sum.pricePaidInCents || 0) / 100,
    numberOfSales: data._count,
  };
}

async function getUserData() {
  const [userCount, orderData] = await Promise.all([
    db.user.count(),
    db.order.aggregate({
      _sum: { pricePaidInCents: true },
    }),
  ]);

  return {
    userCount,
    averegaValuePerUser:
      userCount === 0
        ? 0
        : (orderData._sum.pricePaidInCents || 0) / userCount / 100,
  };
}

async function getProductData() {
  const [activeCount, inactiveCount] = await Promise.all([
    db.product.count({ where: { isAvailableForPurchase: true } }),
    db.product.count({ where: { isAvailableForPurchase: false } }),
  ]);
  return {
    activeCount,
    inactiveCount,
  };
}

export default async function AdminDashboard() {
  const [salesData, userData, productData] = await Promise.all([
    getSalesData(),
    getUserData(),
    getProductData(),
  ]);

  return (
    <>
      <AdminHeader currentPage="Dashboard" />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
              <Card className="@container/card">
                <CardHeader>
                  <CardDescription>Vendas</CardDescription>
                  <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                    {formatCurrency(salesData.amount)}
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
                    {`${formatNumber(salesData.numberOfSales)} Novos Pedidos`}{" "}
                    <TrendingUp className="size-4" />
                  </div>
                  <div className="text-muted-foreground">
                    Vendas nos últimos 6 meses
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
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

type DashboardCardProps = {
  title: string;
  subtitle: string;
  body: string;
};

function DashboardCard({ title, subtitle, body }: DashboardCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{subtitle}</CardDescription>
      </CardHeader>
      <CardContent>
        <p>{body}</p>
      </CardContent>
    </Card>
  );
}
