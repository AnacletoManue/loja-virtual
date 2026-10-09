"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SITE, whatsappLink } from "@/lib/site";

export default function Footer() {
  const path = usePathname();
  if (path?.startsWith("/admin")) return null;

  return (
    <footer className="relative mt-20 overflow-hidden border-t border-slate-800 bg-slate-900 text-white">
      {/* Luzes decorativas de fundo */}
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-rose-600/10 blur-3xl" />
      <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-amber-500/10 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-4">
          {/* Marca e Logotipo */}
          <div className="space-y-4 sm:col-span-2">
            <Link href="/" className="inline-flex items-center gap-3">
              {/* LOGOTIPO EM IMAGEM */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.jpg"
                alt={SITE.name}
                className="h-10 w-auto object-contain transition-transform hover:scale-105"
              />
              <span className="font-display text-2xl font-black tracking-tight text-white">
                {SITE.name}
              </span>
            </Link>

            <p className="max-w-sm text-sm font-medium leading-relaxed text-slate-400">
              {SITE.tagline}. As melhores novidades de vestuário com entrega rápida e pagamento prático em {SITE.city}.
            </p>

            <div className="flex items-center gap-2 pt-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Atendimento Ativo em {SITE.city}
              </span>
            </div>
          </div>

          {/* Links de Navegação */}
          <div className="space-y-3 text-sm">
            <p className="font-display text-base font-bold uppercase tracking-wider text-rose-400">
              Navegação
            </p>
            <ul className="space-y-2.5 font-medium text-slate-300">
              <li>
                <Link
                  href="/"
                  className="inline-block transition hover:translate-x-1 hover:text-rose-400"
                >
                  Página Inicial
                </Link>
              </li>
              <li>
                <Link
                  href="/produtos"
                  className="inline-block transition hover:translate-x-1 hover:text-rose-400"
                >
                  Catálogo de Produtos
                </Link>
              </li>
              <li>
                <Link
                  href="/carrinho"
                  className="inline-block transition hover:translate-x-1 hover:text-rose-400"
                >
                  O meu Carrinho
                </Link>
              </li>
            </ul>
          </div>

          {/* Contacto & WhatsApp */}
          <div className="space-y-4 text-sm">
            <p className="font-display text-base font-bold uppercase tracking-wider text-amber-400">
              Apoio ao Cliente
            </p>
            <p className="font-medium leading-snug text-slate-300">
              Dúvidas com tamanhos ou encomendas? Fale connosco diretamente.
            </p>

            <a
              href={whatsappLink()}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2.5 rounded-2xl bg-[#25D366] px-5 py-3 font-extrabold text-white shadow-lg shadow-[#25D366]/20 transition-all duration-300 hover:scale-105 hover:bg-[#22bf5b] active:scale-95"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-5 w-5"
              >
                <path d="M4 5h16v11H9l-5 4z" />
              </svg>
              <span>Falar no WhatsApp</span>
            </a>
          </div>
        </div>

        {/* Rodapé Direitos */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-800 pt-8 text-center text-xs font-medium text-slate-500 sm:flex-row">
          <p>© {new Date().getFullYear()} {SITE.name}. Todos os direitos reservados.</p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Pagamentos: Express • TPA • Dinheiro</span>
          </div>
        </div>
      </div>
    </footer>
  );
}