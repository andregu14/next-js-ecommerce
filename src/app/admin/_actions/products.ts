"use server";

import db from "@/lib/db";
import { z } from "zod";
import fs from "fs/promises";
import * as path from "path";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

// Schema de validação
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];
const ACCEPTED_FILE_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
];

const addSchema = z.object({
  name: z
    .string()
    .min(3, { message: "Nome deve ter pelo menos 3 caracteres" })
    .max(100, { message: "Nome não pode exceder 100 caracteres" })
    .regex(/^[a-zA-ZÀ-ÿ0-9\s\-_.]+$/, {
      message: "Nome contém caracteres inválidos",
    }),

  priceInCents: z
    .string()
    .transform((val) => parseInt(val))
    .refine((val) => !isNaN(val) && val >= 100, {
      message: "Preço mínimo é R$ 1,00",
    })
    .refine((val) => val <= 1000000, {
      message: "Preço máximo é R$ 10.000,00",
    }),

  description: z
    .string()
    .min(10, { message: "Descrição deve ter pelo menos 10 caracteres" })
    .max(1000, { message: "Descrição não pode exceder 1000 caracteres" }),

  image: z
    .instanceof(File, { message: "Selecione uma imagem" })
    .refine((file) => file.size > 0, {
      message: "Arquivo de imagem está vazio",
    })
    .refine((file) => file.size <= MAX_FILE_SIZE, {
      message: "Imagem deve ter no máximo 5MB",
    })
    .refine((file) => ACCEPTED_IMAGE_TYPES.includes(file.type), {
      message: "Formato de imagem inválido. Use JPEG, PNG ou WebP",
    }),

  file: z
    .instanceof(File, { message: "Selecione um arquivo" })
    .refine((file) => file.size > 0, { message: "Arquivo está vazio" })
    .refine((file) => file.size <= MAX_FILE_SIZE, {
      message: "Arquivo deve ter no máximo 5MB",
    })
    .refine((file) => ACCEPTED_FILE_TYPES.includes(file.type), {
      message: "Formato de arquivo inválido. Use PDF, DOC, DOCX ou TXT",
    }),
});

// Função para sanitizar nome de arquivo
function sanitizeFileName(fileName: string): string {
  return fileName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove acentos
    .replace(/[^a-zA-Z0-9.-]/g, "_") // Substitui caracteres especiais por _
    .toLowerCase();
}

// Função para verificar se diretório existe
async function ensureDirectoryExists(dirPath: string): Promise<void> {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
  }
}

// Função para salvar arquivo
async function saveFile(
  file: File,
  directory: string,
  prefix: string = ""
): Promise<string> {
  const sanitizedName = sanitizeFileName(file.name);
  const fileName = `${prefix}${crypto.randomUUID()}-${sanitizedName}`;
  const filePath = path.join(directory, fileName);

  await ensureDirectoryExists(directory);

  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(filePath, buffer);

  return fileName;
}

export async function addProduct(prevState: unknown, formData: FormData) {
  try {
    // Validação dos dados
    const result = addSchema.safeParse({
      name: formData.get("name"),
      priceInCents: formData.get("priceInCents"),
      description: formData.get("description"),
      image: formData.get("image"),
      file: formData.get("file"),
    });

    if (!result.success) {
      console.error("Erro de validação:", result.error);
      return result.error.formErrors.fieldErrors;
    }

    const data = result.data;

    // Verificar se produto com mesmo nome já existe
    const existingProduct = await db.product.findFirst({
      where: {
        name: data.name,
      },
    });

    if (existingProduct) {
      return {
        name: ["Já existe um produto com este nome"],
      };
    }

    // Salvar arquivos
    const [savedFileName, savedImageName] = await Promise.all([
      saveFile(data.file, "products", "file_"),
      saveFile(data.image, path.join("public", "products"), "img_"),
    ]);

    const filePath = path.join("products", savedFileName);
    const imagePath = `/products/${savedImageName}`;

    // Criar produto no banco
    const product = await db.product.create({
      data: {
        isAvailableForPurchase: false,
        name: data.name.trim(),
        description: data.description.trim(),
        priceInCents: data.priceInCents,
        filePath,
        imagePath,
      },
    });

    console.log("Produto criado com sucesso:", {
      id: product.id,
      name: product.name,
      priceInCents: product.priceInCents,
    });

    // Revalidar páginas
    revalidatePath("/");
    revalidatePath("/produtos");
    revalidatePath("/admin/produtos");
  } catch (error) {
    console.error("Erro ao criar produto:", error);

    return {
      _form: ["Ocorreu um erro interno. Tente novamente em alguns minutos."],
    };
  }

  // Redirecionar apenas em caso de sucesso
  redirect("/admin/produtos?success=produto-criado");
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
    return { success: false, errors: result.error.formErrors.fieldErrors };
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

  return { success: true };
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
