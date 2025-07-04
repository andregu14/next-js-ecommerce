import { Nav, NavLink } from "@/components/Nav";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Ecommerce Website",
  description: "Created with nextjs",
};

export default function Layout({
  children, 
}: Readonly<{
  children: React.ReactNode; 
}>) {
  return (
    <>
      <Nav>
        <NavLink href={"/"}>Home</NavLink>
        <NavLink href={"/produtos"}>Produtos</NavLink>
        <NavLink href={"/pedidos"}>Meus Pedidos</NavLink>
      </Nav>
      <div className="container m-6">{children}</div>
    </>
  );
}
