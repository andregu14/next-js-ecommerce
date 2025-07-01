"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency } from "@/lib/formatters";
import { useActionState, useRef, useState } from "react";
import { addProduct, updateProduct } from "../../_actions/products";
import { useFormStatus } from "react-dom";
import { Product } from "@/generated/prisma";
import Image from "next/image";

export function ProductForm({ product }: { product?: Product | null }) {
  const [priceInCents, setPriceInCents] = useState<string | number>(
    product?.priceInCents || ""
  );
  const [fileName, setFileName] = useState<string>(
    "Nenhum arquivo selecionado"
  );
  const [imageName, setImageName] = useState<string>(
    "Nenhuma imagem selecionada"
  );

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const [error, action] = useActionState(
    product == null ? addProduct : updateProduct.bind(null, product.id),
    {}
  );

  return (
    <form action={action} className="space-y-8">
      <div className="space-y-2">
        <Label htmlFor="name">Nome</Label>
        <Input
          type="text"
          id="name"
          name="name"
          placeholder="Digite o nome do produto"
          defaultValue={product?.name || ""}
          required
        />
        {error.name && <div className="text-destructive">{error.name}</div>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="name">Preço em centavos</Label>
        <Input
          type="number"
          id="priceInCents"
          name="priceInCents"
          required
          value={priceInCents}
          placeholder="Digite o preço em centavos"
          onChange={(e) => setPriceInCents(Number(e.target.value))}
        />
        <div className="text-muted-foreground">
          {formatCurrency(Number(priceInCents || 0) / 100)}
        </div>
        {error.priceInCents && (
          <div className="text-destructive">{error.priceInCents}</div>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="Digite uma descrição para o seu produto"
          required
          defaultValue={product?.description || ""}
        />
        {error.description && (
          <div className="text-destructive">{error.description}</div>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="file">Arquivo</Label>
        <input
          ref={fileInputRef}
          type="file"
          id="file"
          name="file"
          required={product === null}
          className="hidden"
          onChange={(e) =>
            setFileName(
              e.target.files?.[0]?.name || "Nenhum arquivo selecionado"
            )
          }
        />
        <button
          type="button"
          className="px-4 py-2 border rounded bg-gray-100 hover:bg-gray-200"
          onClick={() => fileInputRef.current?.click()}
        >
          Selecionar arquivo
        </button>
        <span className="ml-2 text-muted-foreground">
          {product ? product.filePath : fileName}
        </span>
        {error.file && <div className="text-destructive">{error.file}</div>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="image">Imagem</Label>
        <input
          ref={imageInputRef}
          type="file"
          id="image"
          name="image"
          accept="image/*"
          required={product === null}
          className="hidden"
          onChange={(e) =>
            setImageName(
              e.target.files?.[0]?.name || "Nenhuma imagem selecionada"
            )
          }
        />
        <button
          type="button"
          className="px-4 py-2 border rounded bg-gray-100 hover:bg-gray-200"
          onClick={() => imageInputRef.current?.click()}
        >
          Selecionar imagem
        </button>
        <span className="ml-2 text-muted-foreground">
          {product ? product.imagePath : imageName}
        </span>
        {product != null && (
          <Image
            src={product.imagePath}
            height={400}
            width={400}
            alt="Imagem do produto"
          />
        )}
        {error.image && <div className="text-destructive">{error.image}</div>}
      </div>
      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Salvando..." : "Salvar"}
    </Button>
  );
}
