import { Nav, NavLink } from "@/components/Nav";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin",
  description: "Painel de administração do ecommerce",
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Nav>
        <NavLink href={"/admin"}>Dashboard</NavLink>
        <NavLink href={"/admin/produtos"}>Produtos</NavLink>
        <NavLink href={"/admin/usuarios"}>Clientes</NavLink>
        <NavLink href={"/admin/pedidos"}>Vendas</NavLink>
      </Nav>
      <div className="container m-6">{children}</div>
    </>
  );
}
