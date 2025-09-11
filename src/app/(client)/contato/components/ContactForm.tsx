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
    <Button type="submit" disabled={pending}>
      {pending ? "Enviando..." : "Enviar mensagem"}
    </Button>
  );
}

const initialState: ContactState = { ok: false };

export function ContactForm() {
  const [data, action] = useActionState(sendMessage, initialState);

  return (
    <form action={action} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="name" className="mb-1 block">
            Nome
          </Label>
          <Input id="name" name="name" placeholder="Seu nome">
            {data?.errors?.name && (
              <p className="mt-1 text-xs text-destructive">
                {data.errors.name.join(", ")}
              </p>
            )}
          </Input>
        </div>
        <div>
          <Label htmlFor="email" className="mb-1 block">
            E-mail
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="voce@exemplo.com"
          />
          {data?.errors?.email && (
            <p className="mt-1 text-xs text-destructive">
              {data.errors.email.join(", ")}
            </p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="subject" className="mb-1 block">
          Assunto
        </Label>
        <Input id="subject" name="subject" placeholder="Assunto" />
      </div>

      <div>
        <Label htmlFor="message" className="mb-1 block">
          Mensagem
        </Label>
        <Textarea
          id="message"
          name="message"
          rows={6}
          placeholder="Como podemos ajudar?"
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
