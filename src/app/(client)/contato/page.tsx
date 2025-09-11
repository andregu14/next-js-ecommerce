import { ContactForm } from "./components/ContactForm";

export default function ContactPage () {
    return (
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold tracking-tight">Fale Conosco</h1>
            <p className="mt-2 text-muted-foreground">
                Envie uma mensagem e retornaremos o mais breve possível.
            </p>
            <div className="mt-8">
                <ContactForm />
            </div>
        </div>
    )
}