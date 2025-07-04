"use server";

import OrderHistoryEmail from "@/email/OrderHistory";
import db from "@/lib/db";
import { Resend } from "resend";
import { z } from "zod";

const emailSchema = z.string().email();
const resend = new Resend(process.env.RESEND_API_KEY as string);

export async function emailOrderHistory(
  prevState: unknown,
  formData: FormData
): Promise<{ message?: string; error?: string }> {
  const result = emailSchema.safeParse(formData.get("email"));

  if (result.success == false) {
    return { error: "Email invalido" };
  }

  const user = await db.user.findUnique({
    where: { email: result.data },
    select: {
      email: true,
      orders: {
        select: {
          pricePaidInCents: true,
          id: true,
          createdAt: true,
          product: {
            select: {
              id: true,
              name: true,
              imagePath: true,
              description: true,
            },
          },
        },
      },
    },
  });

  if (user == null) {
    return {
      message:
        "Verifique seu e-mail para ver seu histórico de pedidos e baixar seus produtos",
    };
  }

  const orders = user.orders.map(async (order) => {
    const { id, createdAt, pricePaidInCents, product } = order;
    const downloadVerificationId = (
      await db.downloadVerification.create({
        data: {
          expiresAt: new Date(Date.now() + 24 * 1000 * 60 * 60),
          productId: product.id,
        },
      })
    ).id;
    return {
      id,
      createdAt,
      pricePaidInCents,
      downloadVerificationId,
      product: {
        name: product.name,
        imagePath: product.imagePath,
        description: product.description,
      },
    };
  });

  const data = await resend.emails.send({
    from: `Suporte <${process.env.SENDER_EMAIL}>`,
    to: user.email,
    subject: "Histórico de Pedidos",
    react: <OrderHistoryEmail orders={await Promise.all(orders)} />,
  });

  if (data.error) {
    return {
      error: "Ocorreu um erro ao enviar o seu email, tente novamente",
    };
  }

  return {
    message:
      "Verifique seu e-mail para ver seu histórico de pedidos e baixar seus produtos",
  };
}
