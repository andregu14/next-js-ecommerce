import db from "@/lib/db";
import { AdminHeader } from "./_components/ui/admin-header";
import { SalesChart } from "./_components/SalesChart";
import { DashboardCardGroup } from "./_components/DashboardCardGroup";
import { subMonths, startOfMonth } from "date-fns";
import { UsersChart } from "./_components/UsersChart";

async function getSalesData() {
  const now = new Date();
  const startDate = startOfMonth(subMonths(now, 5));

  const salesByMonth = await db.order.groupBy({
    by: ["createdAt"],
    _sum: { pricePaidInCents: true },
    _count: true,
    where: {
      createdAt: {
        gte: startDate,
      },
    },
  });

  const chartData = [];
  for (let i = 0; i < 6; i++) {
    const date = subMonths(now, 5 - i);
    const month = date.toLocaleString("pt-BR", { month: "long" });
    const year = date.getFullYear();
    // Encontrar vendas desse mes
    const vendas = salesByMonth
      .filter((item) => {
        const d = new Date(item.createdAt);
        return d.getMonth() === date.getMonth() && d.getFullYear() === year;
      })
      .reduce((acc, item) => acc + (item._sum.pricePaidInCents ?? 0) / 100, 0);

    chartData.push({
      month: month.charAt(0).toUpperCase() + month.slice(1),
      vendas,
    });
  }

  // Calcular o número de vendas do mês atual
  const mesAtual = now.getMonth();
  const anoAtual = now.getFullYear();
  const numberOfSales = salesByMonth
    .filter((item) => {
      const d = new Date(item.createdAt);
      return d.getMonth() === mesAtual && d.getFullYear() === anoAtual;
    })
    .reduce((acc, item) => acc + (item._count ?? 0), 0);

  return {
    amount: chartData[5].vendas, // mostra o valor das vendas no mes atual
    numberOfSales,
    chartData,
  };
}

async function getUserData() {
  const now = new Date();
  const startDate = startOfMonth(subMonths(now, 5));

  const usersByMonth = await db.user.groupBy({
    by: ["createdAt"],
    _count: true,
    where: {
      createdAt: {
        gte: startDate,
      },
    },
  });

  const chartData = [];
  for (let i = 0; i < 6; i++) {
    const date = subMonths(now, 5 - i);
    const month = date.toLocaleString("pt-BR", { month: "long" });
    const year = date.getFullYear();
    // Encontrar numero de usuario desse mes
    const clientes = usersByMonth
      .filter((item) => {
        const d = new Date(item.createdAt);
        return d.getMonth() === date.getMonth() && d.getFullYear() === year;
      })
      .reduce((acc, item) => acc + (item._count ?? 0), 0);

    chartData.push({
      month: month.charAt(0).toUpperCase() + month.slice(1),
      clientes,
    });
  }

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
    chartData,
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
            <DashboardCardGroup
              salesData={salesData}
              userData={userData}
              productData={productData}
            />
          </div>
          <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @5xl/main:grid-cols-2 mb-8 ">
            <SalesChart chartData={salesData.chartData} />
            <UsersChart chartData={userData.chartData} />
          </div>
        </div>
      </div>
    </>
  );
}
