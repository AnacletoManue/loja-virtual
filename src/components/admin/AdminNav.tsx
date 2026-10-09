"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/admin/actions";

const LINKS = [
  {
    href: "/admin",
    label: "Resumo",
    exact: true,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
        <rect x="3" y="3" width="7" height="7" rx="2" />
        <rect x="14" y="3" width="7" height="7" rx="2" />
        <rect x="14" y="14" width="7" height="7" rx="2" />
        <rect x="3" y="14" width="7" height="7" rx="2" />
      </svg>
    ),
  },
  {
    href: "/admin/pedidos",
    label: "Pedidos",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
      </svg>
    ),
  },
  {
    href: "/admin/produtos",
    label: "Produtos",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
        <line x1="7" y1="7" x2="7.01" y2="7" />
      </svg>
    ),
  },
  {
    href: "/admin/conta",
    label: "Conta",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
];

export default function AdminNav({ email }: { email: string }) {
  const path = usePathname();

  return (
    <>
      {/* 1. NAVEGAÇÃO MOBILE (Barra Fixa na Parte Inferior do Ecrã) */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-slate-200 bg-white/90 p-2 backdrop-blur-xl shadow-lg lg:hidden">
        {LINKS.map((l) => {
          const active = l.exact ? path === l.href : path.startsWith(l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`flex flex-col items-center gap-1 rounded-2xl px-3 py-1.5 text-[11px] font-black transition-all ${
                active
                  ? "text-rose-600 bg-rose-50"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              {l.icon}
              <span>{l.label}</span>
            </Link>
          );
        })}

        <form action={logoutAction} className="inline-block">
          <button
            type="submit"
            aria-label="Sair da conta"
            className="flex flex-col items-center gap-1 rounded-2xl px-3 py-1.5 text-[11px] font-black text-red-600 hover:bg-red-50"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span>Sair</span>
          </button>
        </form>
      </nav>

      {/* 2. NAVEGAÇÃO DESKTOP & TABLET (Sidebar Lateral Estilizada) */}
      <aside className="hidden lg:block space-y-4">
        {/* Card do Utilizador */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xl shadow-slate-100">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-gradient-to-r from-rose-600 to-amber-500 font-black text-white text-base shadow-md">
              {email.charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0">
              <span className="block text-[10px] font-black uppercase tracking-wider text-rose-600">
                Administrador
              </span>
              <p className="truncate text-xs font-black text-slate-900">{email}</p>
            </div>
          </div>
        </div>

        {/* Links Principais */}
        <nav className="rounded-3xl border border-slate-200/80 bg-white p-3 shadow-xl shadow-slate-100 space-y-1.5">
          {LINKS.map((l) => {
            const active = l.exact ? path === l.href : path.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-xs font-black transition-all ${
                  active
                    ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                {l.icon}
                <span>{l.label}</span>
              </Link>
            );
          })}

          <div className="border-t border-slate-100 pt-2 mt-2 space-y-1">
            <Link
              href="/"
              target="_blank"
              className="flex items-center justify-between rounded-2xl px-4 py-3 text-xs font-black text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            >
              <div className="flex items-center gap-3">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" />
                </svg>
                <span>Ver Loja ao Vivo</span>
              </div>
              <span className="text-[10px] font-bold text-slate-400">↗</span>
            </Link>

            <form action={logoutAction}>
              <button
                type="submit"
                className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-xs font-black text-red-600 transition hover:bg-red-50"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                <span>Encerrar Sessão</span>
              </button>
            </form>
          </div>
        </nav>
      </aside>
    </>
  );
}