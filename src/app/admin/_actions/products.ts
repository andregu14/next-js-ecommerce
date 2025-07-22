"use server";

import db from "@/lib/db";
import { z } from "zod";
import fs from "fs/promises";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

const addSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().min(1, "Descrição é obrigatória"),
  priceInCents: z.coerce.number().int().min(1, "Preço deve ser maior que zero"),
  file: z
    .any()
    .refine(
      (file) => file && typeof file === "object" && file.size > 0,
      "Obrigatório enviar um arquivo"
    ),
  image: z
    .any()
    .refine(
      (file) =>
        file &&
        typeof file === "object" &&
        file.size > 0 &&
        file.type &&
        file.type.startsWith("image/"),
      "Obrigatório enviar uma imagem válida"
    ),
});

export async function addProduct(prevState: unknown, formData: FormData) {
  const result = addSchema.safeParse(Object.fromEntries(formData.entries()));
  if (result.success === false) {
    console.error("Erro ao validar os dados do produto:", result.error);
    return result.error.formErrors.fieldErrors;
  }

  const data = result.data;

  await fs.mkdir("products", { recursive: true });
  const filePath = `products/${crypto.randomUUID()}-${data.file.name}`;
  await fs.writeFile(filePath, Buffer.from(await data.file.arrayBuffer()));

  await fs.mkdir("public/products", { recursive: true });
  const imagePath = `/products/${crypto.randomUUID()}-${data.image.name}`;
  await fs.writeFile(
    `public${imagePath}`,
    Buffer.from(await data.image.arrayBuffer())
  );

  await db.product.create({
    data: {
      isAvailableForPurchase: false,
      name: data.name,
      description: data.description,
      priceInCents: data.priceInCents,
      filePath,
      imagePath,
    },
  });

  console.log("Produto adicionado com sucesso:", data);
  revalidatePath("/");
  revalidatePath("/produtos");

  redirect("/admin/produtos");
}

const editSchema = addSchema.extend({
  file: z.any().optional(),
  image: z.any().optional(),
  isAvailableForPurchase: z.string(),
});

export async function updateProduct(
  id: string,
  prevState: unknown,
  formData: FormData
) {
  const result = editSchema.safeParse(Object.fromEntries(formData.entries()));
  if (result.success === false) {
    return result.error.formErrors.fieldErrors;
  }

  const data = result.data;
  const product = await db.product.findUnique({
    where: { id },
  });

  if (product === null) return notFound();

  let filePath = product.filePath;
  if (data.file != null && data.file.size > 0) {
    await fs.unlink(product.filePath);
    filePath = `products/${crypto.randomUUID()}-${data.file.name}`;
    await fs.writeFile(filePath, Buffer.from(await data.file.arrayBuffer()));
  }

  let imagePath = product.imagePath;
  if (data.image != null && data.image.size > 0) {
    await fs.unlink(`public${product.imagePath}`);
    imagePath = `/products/${crypto.randomUUID()}-${data.image.name}`;
    await fs.writeFile(
      `public${imagePath}`,
      Buffer.from(await data.image.arrayBuffer())
    );
  }

  await toggleProductAvailability(
    id,
    data.isAvailableForPurchase === "true" ? true : false
  );

  await db.product.update({
    where: { id },
    data: {
      name: data.name,
      description: data.description,
      priceInCents: data.priceInCents,
      filePath,
      imagePath,
    },
  });

  console.log("Produto alterado com sucesso:", data);
  revalidatePath("/");
  revalidatePath("/produtos");

  redirect("/admin/produtos");
}

export async function toggleProductAvailability(
  id: string,
  isAvailableForPurchase: boolean
) {
  await db.product.update({
    where: { id },
    data: { isAvailableForPurchase },
  });

  revalidatePath("/");
  revalidatePath("/produtos");
}

export async function deleteProduct(id: string) {
  const product = await db.product.delete({
    where: { id },
  });
  if (product === null) return notFound();

  await fs.unlink(product.filePath);
  await fs.unlink(`public${product.imagePath}`);

  revalidatePath("/");
  revalidatePath("/produtos");
}
