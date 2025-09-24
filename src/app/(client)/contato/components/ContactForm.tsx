"use client";

import { Button } from "@/components/ui/button";
import { ContactState, sendMessage } from "../_actions/send-message";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useActionState, useEffect, useTransition } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";

const FormSchema = z.object({
  name: z
    .string()
    .min(3, "Nome deve ter pelo menos 3 caracteres")
    .max(100, { message: "Nome não pode exceder 100 caracteres" })
    .regex(/^[a-zA-ZÀ-ÿ0-9\s\-_.]+$/, {
      message: "Nome contém caracteres inválidos",
    }),
  email: z.string().email("E-mail inválido"),
  subject: z.string().max(120).optional(),
  message: z.string().min(10, "Mensagem muito curta"),
});

const initialState: ContactState = { ok: false };

type FormData = z.infer<typeof FormSchema>;

export function ContactForm() {
  const [isPending, startTransition] = useTransition();
  const form = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
      subject: "",
    },
  });

  const [state, action] = useActionState(sendMessage, initialState);

  useEffect(() => {
    if (!state.message) {
      return;
    }

    if (state.ok) {
      toast.success(state.message);
      form.reset();
    } else {
      toast.error(state.message);
    }
  }, [state, form]);

  // envia dados via FormData para a server action
  function onSubmit(data: FormData) {
    const formData = new FormData();

    formData.append("name", data.name);
    formData.append("email", data.email);
    formData.append("subject", data.subject ? data.subject : "");
    formData.append("message", data.message);

    // Chamar a action
    startTransition(() => {
      action(formData);
    });
  }

  function SubmitButton() {
    return (
      <Button
        type="submit"
        disabled={isPending}
        size={"lg"}
        className="cursor-pointer"
      >
        {isPending ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 dark:border-black  border-white mr-2"></div>
            Enviando...
          </>
        ) : (
          "Enviar"
        )}
      </Button>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 sm:grid-cols-2">
          {/* Nome */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="text-base">Nome</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="text"
                    placeholder="Seu nome"
                    className="h-12 text-base px-4"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="text-base">E-mail</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="email"
                    placeholder="voce@exemplo.com"
                    className="h-12 text-base px-4"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Assunto */}
        <FormField
          control={form.control}
          name="subject"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel className="text-base">Assunto</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="text"
                  placeholder="Assunto"
                  className="h-12 text-base px-4"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Mensagem */}
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel className="text-base">Mensagem</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Como podemos ajudar?"
                  className="text-base min-h-32"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <SubmitButton />
      </form>
    </Form>
  );
}
