"use client";

import Link from "next/link";
import { CountUpNumber } from "./CountUpNumber";
import { Button } from "./ui/button";

export function Hero() {
  return (
    <section className="relative">
      <div className="mx-auto max-w-screen-md md:max-w-3xl lg:max-w-5xl xl:max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight text-balance">
              <span className="block">
                Mais de{" "}
                <span className="relative inline-flex items-baseline">
                  <span className="tabular-nums bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                    <CountUpNumber end={11846} start={10504} duration={2000} />
                  </span>
                  <span className="ml-1 align-super text-sm/none text-primary/80">
                    +
                  </span>
                  {/* underline */}
                  <span
                    aria-hidden
                    className="absolute left-0 right-0 -bottom-1 h-[3px] rounded-full bg-primary/60 blur-[0.5px]"
                  />
                </span>{" "}
                PDFs
              </span>

              <span className="block text-foreground/90">
                para download imediato
              </span>
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
