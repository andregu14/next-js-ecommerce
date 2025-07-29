"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  useActionState,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import { addProduct } from "../../_actions/products";
import { Upload, ImageIcon, FileIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Validação mais robusta
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

const FormSchema = z.object({
  name: z
    .string()
    .min(3, { message: "Nome deve ter pelo menos 3 caracteres" })
    .max(100, { message: "Nome não pode exceder 100 caracteres" })
    .regex(/^[a-zA-ZÀ-ÿ0-9\s\-_.]+$/, {
      message: "Nome contém caracteres inválidos",
    }),

  priceInCents: z
    .string()
    .min(1, { message: "Preço é obrigatório" })
    .refine(
      (val) => {
        const numericValue = val.replace(/\D/g, "");
        const price = parseInt(numericValue);
        return !isNaN(price) && price >= 100;
      },
      { message: "Preço mínimo é R$ 1,00" }
    )
    .refine(
      (val) => {
        const numericValue = val.replace(/\D/g, "");
        const price = parseInt(numericValue);
        return price <= 1000000;
      },
      { message: "Preço máximo é R$ 10.000,00" }
    ),

  description: z
    .string()
    .min(10, { message: "Descrição deve ter pelo menos 10 caracteres" })
    .max(1000, { message: "Descrição não pode exceder 1000 caracteres" }),

  image: z
    .instanceof(File, { message: "Selecione uma imagem" })
    .refine((file) => file.size <= MAX_FILE_SIZE, {
      message: "Imagem deve ter no máximo 5MB",
    })
    .refine((file) => ACCEPTED_IMAGE_TYPES.includes(file.type), {
      message: "Formato de imagem inválido. Use JPEG, PNG ou WebP",
    }),

  file: z
    .instanceof(File, { message: "Selecione um arquivo" })
    .refine((file) => file.size <= MAX_FILE_SIZE, {
      message: "Arquivo deve ter no máximo 5MB",
    })
    .refine((file) => ACCEPTED_FILE_TYPES.includes(file.type), {
      message: "Formato de arquivo inválido. Use PDF, DOC, DOCX ou TXT",
    }),
});

type FormData = z.infer<typeof FormSchema>;

export function ProductForm() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string>("");
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: "",
      priceInCents: "",
      description: "",
      image: undefined,
      file: undefined,
    },
  });

  const [error, action] = useActionState(addProduct, {});

  // Exibir erros do servidor
  useEffect(() => {
    if (error && Object.keys(error).length > 0) {
      Object.entries(error).forEach(([field, messages]) => {
        if (Array.isArray(messages) && messages.length > 0) {
          form.setError(field as keyof FormData, {
            type: "server",
            message: messages[0],
          });
        }
      });
      toast.error("Erro ao salvar produto", {
        description: "Verifique os campos e tente novamente",
      });
    }
  }, [error, form]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue("image", file);
      form.trigger("image"); // Trigger validation

      console.log("imagem selecionada:", file.name);
      // Criar preview
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue("file", file);
      form.trigger("file"); // Trigger validation
      setSelectedFileName(file.name);
    }
  };

  function formatInputValue(raw: string) {
    if (!raw) return "";
    const cents = Number(raw);
    const reais = cents / 100;

    return reais.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  // Função para converter valor formatado para centavos
  function formatToCents(formattedValue: string): string {
    const numericValue = formattedValue.replace(/\D/g, "");
    return numericValue;
  }

  // envia dados via FormData para a server action
  function onSubmit(data: FormData) {
    const formData = new FormData();

    // Converter preço formatado para centavos
    const priceInCents = formatToCents(data.priceInCents);

    formData.append("name", data.name);
    formData.append("priceInCents", priceInCents);
    formData.append("description", data.description);
    formData.append("image", data.image);
    formData.append("file", data.file);

    // Chamar a action
    startTransition(() => {
      action(formData);
    });
  }

  function SubmitButton() {
    return (
      <Button type="submit" disabled={isPending} size="lg" className="min-w-32">
        {isPending ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Salvando...
          </>
        ) : (
          "Salvar Produto"
        )}
      </Button>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-4">
            <Upload className="h-6 w-6" />
            Adicionar Novo Produto
          </CardTitle>
          <CardDescription>
            Preencha as informações do produto que será disponibilizado para
            venda
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Nome do Produto */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold">
                        Nome do Produto *
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="text"
                          placeholder="Ex: Curso de React Avançado"
                          className="h-12"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Preço */}
                <FormField
                  control={form.control}
                  name="priceInCents"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold">
                        Preço *
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Badge
                            variant="secondary"
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5"
                          >
                            R$
                          </Badge>
                          <Input
                            {...field}
                            className="h-12 pl-10"
                            placeholder="0,00"
                            onChange={(e) => {
                              // Remove tudo que não for número
                              const raw = e.target.value.replace(/\D/g, "");
                              const formatted = formatInputValue(raw);
                              field.onChange(formatted);
                            }}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Descrição */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold">
                      Descrição do Produto *
                    </FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Descreva detalhadamente o produto, seus benefícios e características..."
                          className="min-h-32"
                        />
                      </FormControl>
                      <div className="text-sm text-muted-foreground text-right absolute -bottom-6 right-0">
                        {field.value?.length || 0}/1000 caracteres
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid md:grid-cols-2 gap-6 pt-2">
                {/* Upload de Imagem */}
                <FormField
                  control={form.control}
                  name="image"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold">
                        Imagem do Produto *
                      </FormLabel>
                      <FormControl>
                        <div className="space-y-4">
                          <div
                            className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center cursor-pointer hover:border-muted-foreground/50 transition-colors"
                            onClick={() => imageInputRef.current?.click()}
                          >
                            {imagePreview ? (
                              <div className="space-y-2">
                                <img
                                  src={imagePreview}
                                  alt="Preview"
                                  className="mx-auto max-h-32 rounded-md object-cover"
                                />
                                <p className="text-sm text-muted-foreground">
                                  Clique para alterar a imagem
                                </p>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                                <div>
                                  <p className="text-sm font-medium">
                                    Clique para selecionar uma imagem
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    PNG, JPG, WebP até 5MB
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                          <Input
                            ref={imageInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageChange}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Upload de Arquivo */}
                <FormField
                  control={form.control}
                  name="file"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold">
                        Arquivo do Produto *
                      </FormLabel>
                      <FormControl>
                        <div className="space-y-4">
                          <div
                            className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center cursor-pointer hover:border-muted-foreground/50 transition-colors"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <div className="space-y-2">
                              <FileIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                              <div>
                                <p className="text-sm font-medium">
                                  {selectedFileName ||
                                    "Clique para selecionar o arquivo"}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  PDF, DOC, DOCX, TXT até 5MB
                                </p>
                              </div>
                            </div>
                          </div>
                          <Input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf,.doc,.docx,.txt"
                            className="hidden"
                            onChange={handleFileChange}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end pt-6">
                <SubmitButton />
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
