"use server";

import { Resend } from "resend";
import z from "zod";
import Contact from "@/email/Contact";

const resend = new Resend(process.env.RESEND_API_KEY as string);

const ContactSchema = z.object({
  name: z.string().min(2, "Informe seu nome"),
  email: z.string().email("E-mail inválido"),
  subject: z.string().max(120).optional(),
  message: z.string().min(10, "Mensagem muito curta"),
  company: z.string().optional(),
});

export type ContactState = {
  ok: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

export async function sendMessage(
  _prevState: ContactState,
  formData: FormData
): Promise<ContactState> {
  try {
    const raw = Object.fromEntries(formData.entries());

    const data = ContactSchema.safeParse(raw);

    if (!data.success) {
      const flattened = data.error.flatten().fieldErrors;
      return { ok: false, errors: flattened, message: "Corrija os campos." };
    }

    const { name, email, subject, message, company } = data.data;

    if (company && company.trim().length > 0) {
      return { ok: true, message: "Enviado com sucesso." };
    }

    const emailData = await resend.emails.send({
      from: `Suporte PDF Store <${process.env.SENDER_EMAIL}>`,
      to: email,
      replyTo: email,
      subject: subject || `Nova mensagem de ${name}`,
      react: <Contact name={name} email={email} message={message} />,
    });

    if (emailData.error) {
      return { ok: false, message: "Falha ao enviar. Tente novamente." };
    }

    return { ok: true, message: "Mensagem enviada. Obrigado!" };
  } catch (error) {
    return { ok: false, message: "Erro inesperado. Tente novamente." };
  }
}
