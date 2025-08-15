"use client";

import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faXTwitter,
  faFacebook,
  faInstagram,
} from "@fortawesome/free-brands-svg-icons";

import { Mail, FileText, Download, Shield, Heart } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-50 border-t border-slate-200 mt-auto">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-6 w-6 text-blue-600" />
              <span className="text-xl font-bold text-slate-900">
                PDF Store
              </span>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              Sua biblioteca digital completa. Mais de 1000 PDFs para download
              imediato com acesso vitalício e qualidade garantida.
            </p>

            {/* Social Media */}
            <div className="flex space-x-3">
              <Button variant="outline" size="icon">
                <FontAwesomeIcon icon={faFacebook} />
              </Button>
              <Button variant="outline" size="icon">
                <FontAwesomeIcon icon={faXTwitter} />
              </Button>
              <Button variant="outline" size="icon">
                <FontAwesomeIcon icon={faInstagram} />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-900">Links Rápidos</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/produtos"
                  className="text-sm text-slate-600 hover:text-blue-600 transition-colors"
                >
                  Todos os Produtos
                </Link>
              </li>
              <li>
                <Link
                  href="/ofertas"
                  className="text-sm text-slate-600 hover:text-blue-600 transition-colors"
                >
                  Ofertas Especiais
                </Link>
              </li>
              <li>
                <Link
                  href="/categorias"
                  className="text-sm text-slate-600 hover:text-blue-600 transition-colors"
                >
                  Categorias
                </Link>
              </li>
              <li>
                <Link
                  href="/novidades"
                  className="text-sm text-slate-600 hover:text-blue-600 transition-colors"
                >
                  Novidades
                </Link>
              </li>
              <li>
                <Link
                  href="/mais-vendidos"
                  className="text-sm text-slate-600 hover:text-blue-600 transition-colors"
                >
                  Mais Vendidos
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-900">Suporte</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/contato"
                  className="text-sm text-slate-600 hover:text-blue-600 transition-colors"
                >
                  Fale Conosco
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-sm text-slate-600 hover:text-blue-600 transition-colors"
                >
                  Perguntas Frequentes
                </Link>
              </li>
              <li>
                <Link
                  href="/como-baixar"
                  className="text-sm text-slate-600 hover:text-blue-600 transition-colors"
                >
                  Como Baixar
                </Link>
              </li>
              <li>
                <Link
                  href="/suporte-tecnico"
                  className="text-sm text-slate-600 hover:text-blue-600 transition-colors"
                >
                  Suporte Técnico
                </Link>
              </li>
              <li>
                <Link
                  href="/reembolso"
                  className="text-sm text-slate-600 hover:text-blue-600 transition-colors"
                >
                  Política de Reembolso
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-900">Newsletter</h3>
            <p className="text-sm text-slate-600">
              Receba novidades e ofertas exclusivas
            </p>
            <form className="space-y-2">
              <Input type="email" placeholder="Seu e-mail" className="h-9" />
              <Button type="submit" className="w-full h-9">
                <Mail className="h-4 w-4 mr-2" />
                Inscrever-se
              </Button>
            </form>

            {/* Features */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center space-x-2">
                <Download className="h-4 w-4 text-green-600" />
                <span className="text-xs text-slate-600">
                  Download Imediato
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-blue-600" />
                <span className="text-xs text-slate-600">Pagamento Seguro</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Bottom Footer */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-4">
            <p className="text-sm text-slate-600">
              © {currentYear} PDF Store. Todos os direitos reservados.
            </p>
          </div>

          <div className="flex flex-wrap justify-center md:justify-end items-center space-x-4 text-xs text-slate-500">
            <Link
              href="/privacidade"
              className="hover:text-blue-600 transition-colors"
            >
              Privacidade
            </Link>
            <Link
              href="/termos"
              className="hover:text-blue-600 transition-colors"
            >
              Termos de Uso
            </Link>
            <Link
              href="/cookies"
              className="hover:text-blue-600 transition-colors"
            >
              Cookies
            </Link>
            <Link
              href="/lgpd"
              className="hover:text-blue-600 transition-colors"
            >
              LGPD
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
