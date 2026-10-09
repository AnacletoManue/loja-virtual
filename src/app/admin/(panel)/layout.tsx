import { requireAdmin } from "@/lib/auth";
import AdminNav from "@/components/admin/AdminNav";
import Link from "next/link";
import { SITE } from "@/lib/site";

export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdmin();

  return (
    <div className="min-h-screen bg-slate-50/60 pb-16 pt-4">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* CABEÇALHO DO PAINEL ADMIN */}
        <header className="mb-6 flex items-center justify-between border-b border-slate-200/80 bg-white p-4 sm:p-5 rounded-3xl shadow-sm">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="flex items-center gap-2 group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.jpg"
                alt={SITE.name}
                className="h-9 w-auto object-contain transition-transform group-hover:scale-105"
              />
              <span className="font-display text-xl font-black text-slate-900 hidden sm:inline">
                {SITE.name}
              </span>
            </Link>
            <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-rose-600">
              Painel Admin
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="hidden md:inline font-bold text-slate-500">
              Sessão ativa: <strong className="text-slate-800">{session.email}</strong>
            </span>
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 font-bold text-slate-700 transition hover:border-slate-900 hover:bg-slate-900 hover:text-white"
            >
              <span>Ver Loja</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" />
              </svg>
            </Link>
          </div>
        </header>

        {/* ESTRUTURA PRINCIPAL: NAVEGAÇÃO + CONTEÚDO */}
        <div className="grid gap-6 lg:grid-cols-[240px_1fr] lg:items-start">
          {/* NAVEGAÇÃO FIXA NO DESKTOP */}
          <aside className="lg:sticky lg:top-24 z-20">
            <AdminNav email={session.email} />
          </aside>

          {/* ÁREA DE CONTEÚDO DINÂMICO */}
          <main className="min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}