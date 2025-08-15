"use client";

import { emailOrderHistory } from "@/actions/orders";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

export default function MyOrdersPage() {
  const [data, action] = useActionState(emailOrderHistory, {});
  return (
    <form
      action={action}
      className="max-2-xl mx-auto  flex items-center justify-center p-4 my-20"
    >
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Meus Pedidos</CardTitle>
          <CardDescription>
            Digite o seu email para receber seu historico de compras e os links
            para download
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input type="email" required name="email" id="email" />
            {data.error && <div className="text-destructive">{data.error}</div>}
          </div>
        </CardContent>
        <CardFooter>
          {data.message ? <p>{data.message}</p> : <SubmitButton />}
        </CardFooter>
      </Card>
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button className="w-full" size={"lg"} disabled={pending} type="submit">
      {pending ? "Enviando..." : "Enviar"}
    </Button>
  );
}
