import { Nav } from "@/components/Nav";
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
      <Nav />
      <div className="container m-6">{children}</div>
    </>
  );
}
