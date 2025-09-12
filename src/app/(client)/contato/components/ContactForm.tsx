"use client";

import { Button } from "@/components/ui/button";
import { useFormStatus } from "react-dom";
import { ContactState, sendMessage } from "../_actions/send-message";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useActionState } from "react";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} size={"lg"} className="cursor-pointer">
      {pending ? "Enviando..." : "Enviar mensagem"}
    </Button>
  );
}

const initialState: ContactState = { ok: false };

export function ContactForm() {
  const [data, action] = useActionState(sendMessage, initialState);

  return (
    <form action={action} className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <Label htmlFor="name" className="mb-2 block text-base">
            Nome
          </Label>
          <Input
            id="name"
            name="name"
            placeholder="Seu nome"
            className="h-12 text-base px-4"
          >
            {data?.errors?.name && (
              <p className="mt-1 text-xs text-destructive">
                {data.errors.name.join(", ")}
              </p>
            )}
          </Input>
        </div>
        <div>
          <Label htmlFor="email" className="mb-2 block text-base">
            E-mail
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="voce@exemplo.com"
            className="h-12 text-base px-4"
          />
          {data?.errors?.email && (
            <p className="mt-1 text-xs text-destructive">
              {data.errors.email.join(", ")}
            </p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="subject" className="mb-2 block text-base">
          Assunto
        </Label>
        <Input
          id="subject"
          name="subject"
          placeholder="Assunto"
          className="h-12 text-base px-4"
        />
      </div>

      <div>
        <Label htmlFor="message" className="mb-2 block text-base">
          Mensagem
        </Label>
        <Textarea
          id="message"
          name="message"
          rows={6}
          placeholder="Como podemos ajudar?"
          className="text-base  min-[150px]:"
        />
        {data?.errors?.message && (
          <p className="mt-1 text-xs text-destructive">
            {data.errors.message.join(", ")}
          </p>
        )}
      </div>

      {/* Honeypot (não remover o name) */}
      <div aria-hidden="true" className="sr-only">
        <label>
          Não preencha este campo
          <input tabIndex={-1} autoComplete="off" name="company" type="text" />
        </label>
      </div>

      {data?.message && (
        <p
          role="status"
          className={`text-sm ${
            data.ok ? "text-green-600" : "text-destructive"
          }`}
        >
          {data.message}
        </p>
      )}

      <SubmitButton />
    </form>
  );
}
