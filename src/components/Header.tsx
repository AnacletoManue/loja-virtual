"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/store/cart";
import { useMounted } from "@/lib/useMounted";
import { SITE, whatsappLink } from "@/lib/site";

const NAV = [
  { href: "/", label: "Início" },
  { href: "/produtos", label: "Produtos" },
];

export default function Header() {
  const path = usePathname();
  const mounted = useMounted();
  const { items } = useCart();

  if (path?.startsWith("/admin")) return null;

  const count = mounted ? items.reduce((s, i) => s + i.quantity, 0) : 0;
  const wa = whatsappLink();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl transition-all shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* LOGO DA LOJA */}
        <Link href="/" className="group flex items-center gap-2">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-r from-rose-600 via-amber-500 to-rose-500 font-black text-lg text-white shadow-md shadow-rose-600/20 transition-transform group-hover:scale-105">
            {SITE.name.charAt(0)}
          </span>
          <div className="flex flex-col">
            <span className="font-display text-xl font-black tracking-tight text-slate-900 leading-none">
              {SITE.name}
            </span>
            <span className="text-[10px] font-bold text-rose-600 uppercase tracking-widest mt-0.5">
              Moda & Estilo
            </span>
          </div>
        </Link>

        {/* NAVEGAÇÃO PRINCIPAL */}
        <nav className="flex items-center gap-1.5 sm:gap-2">
          {NAV.map((n) => {
            const active = n.href === "/" ? path === "/" : path.startsWith(n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                className={`rounded-full px-4 py-2 text-sm font-extrabold transition-all duration-200 ${
                  active
                    ? "bg-slate-900 text-white shadow-md"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                {n.label}
              </Link>
            );
          })}

          {/* BOTÃO ATENDIMENTO QUICK LINK */}
          <a
            href={wa}
            target="_blank"
            rel="noreferrer"
            aria-label="Falar no WhatsApp"
            className="hidden md:inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-50 px-3.5 py-2 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100"
          >
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>WhatsApp</span>
          </a>

          {/* BOTÃO DO CARRINHO */}
          <Link
            href="/carrinho"
            aria-label={`Carrinho, ${count} artigos`}
            className="relative ml-1 flex h-10 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-sm font-extrabold text-slate-800 shadow-sm transition-all duration-200 hover:border-rose-500 hover:text-rose-600 active:scale-95"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="shrink-0"
            >
              <path d="M6 7h12l-1 13H7L6 7Z" />
              <path d="M9 7a3 3 0 0 1 6 0" />
            </svg>
            <span className="hidden sm:inline">Carrinho</span>

            {/* BADGE DE CONTAGEM VIBRANTE */}
            {count > 0 && (
              <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-gradient-to-r from-rose-600 to-rose-500 px-1.5 text-[11px] font-black text-white shadow-md shadow-rose-600/40 animate-in zoom-in-50">
                {count}
              </span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
}