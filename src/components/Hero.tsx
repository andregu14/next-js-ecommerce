"use client"

import Link from "next/link";
import { CountUpNumber } from "./CountUpNumber";
import { Button } from "./ui/button";

export function Hero() {
  return (
    <section className="relative">
      <div className="mx-auto max-w-screen-md md:max-w-3xl lg:max-w-5xl xl:max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-balance">
              Mais de {""}
              <CountUpNumber
                end={1622}
                start={1002}
                duration={1800}
                className="tabular-nums"
                ariaLabel="mais de mil PDFs"
              />{" "}
              {""} PDFs para download imediato
            </h1>
            <p className="mt-3 text-muted-foreground max-w-prose">
              Baixe imediatamente, acesse quando quiser e organize sua
              biblioteca digital com facilidade.
            </p>
            <div className="mt-6 flex gap-3">
              <Button asChild size="lg">
                <Link href="/produtos" aria-label="Explorar PDFs">
                  Explorar PDFs
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/ofertas" aria-label="Ver ofertas de PDFs">
                  Ofertas
                </Link>
              </Button>
            </div>
            <dl className="mt-12 flex flex-row text-sm text-muted-foreground gap-10">
              <dt className="sr-only">Entrega</dt>
              <dd>Download imediato</dd>
              <dt className="sr-only">Acesso</dt>
              <dd>Acesso vitalício</dd>
              <dt className="sr-only">Qualidade</dt>
              <dd>Arquivos otimizados</dd>
            </dl>
          </div>

          {/* Placeholder de imagem */}
          <div className="relative aspect-[4/3] rounded-2xl bg-muted overflow-hidden">
            <div className="absolute inset-0 grid place-items-center text-muted-foreground">
              Capa/Ilustração
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
