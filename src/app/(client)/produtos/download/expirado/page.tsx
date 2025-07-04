import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Expired() {
    return (
        <>
        <h1 className="text-4xl mb-4">Download expirado</h1>
        <Button asChild size={"lg"}>
            <Link href={"/pedidos"}>Obter novo link</Link>
        </Button>
        </>
    )
}