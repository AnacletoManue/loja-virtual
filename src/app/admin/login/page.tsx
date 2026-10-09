"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction } from "@/app/admin/actions";
import { SITE } from "@/lib/site";

type State = { error?: string } | undefined;

const inputClass =
  "w-full rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3.5 text-sm font-bold text-slate-800 placeholder-slate-400 outline-none transition-all focus:border-rose-500 focus:bg-white focus:ring-4 focus:ring-rose-500/10";

export default function LoginPage() {
  const [state, action, pending] = useActionState<State, FormData>(
    loginAction,
    undefined
  );

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center px-4 py-12">
      {/* CARD PRINCIPAL DE LOGIN */}
      <div className="w-full max-w-md rounded-3xl border border-slate-200/80 bg-white p-8 shadow-2xl shadow-slate-200/60">
        
        {/* CABEÇALHO / LOGO */}
        <div className="text-center space-y-3">
          <Link href="/" className="inline-flex items-center gap-2 group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.jpg"
              alt={SITE.name}
              className="h-10 w-auto object-contain transition-transform group-hover:scale-105"
            />
            <span className="font-display text-2xl font-black tracking-tight text-slate-900">
              {SITE.name}
            </span>
          </Link>

          <div>
            <span className="inline-block rounded-md bg-rose-100 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-rose-600">
              Painel de Gestão
            </span>
            <h1 className="font-display mt-1 text-2xl font-black text-slate-900">
              Área do Proprietário
            </h1>
            <p className="mt-1 text-xs font-semibold text-slate-500">
              Aceda à sua conta para gerir produtos, preços e encomendas.
            </p>
          </div>
        </div>

        {/* FORMULÁRIO */}
        <form action={action} className="mt-6 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">
              E-mail de Acesso
            </label>
            <input
              name="email"
              type="email"
              required
              autoComplete="username"
              placeholder="exemplo@dominio.com"
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">
              Palavra-passe
            </label>
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              placeholder="••••••••"
              className={inputClass}
            />
          </div>

          {/* MENSAGEM DE ERRO */}
          {state?.error && (
            <div
              role="alert"
              className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-bold text-red-700 animate-in fade-in-50"
            >
              ⚠️ {state.error}
            </div>
          )}

          {/* BOTÃO DE SUBMISSÃO */}
          <button
            type="submit"
            disabled={pending}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-600 to-rose-500 py-4 text-sm font-black text-white shadow-xl shadow-rose-600/30 transition-all hover:brightness-110 active:scale-98 disabled:opacity-50"
          >
            {pending ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>A autenticar...</span>
              </>
            ) : (
              <>
                <span>Entrar no Painel</span>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  className="h-4 w-4"
                >
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </>
            )}
          </button>
        </form>

        {/* REGRESSO À LOJA */}
        <div className="mt-6 border-t border-slate-100 pt-4 text-center">
          <Link
            href="/"
            className="text-xs font-bold text-slate-500 hover:text-slate-900 transition hover:underline"
          >
            ← Voltar à loja principal
          </Link>
        </div>
      </div>
    </div>
  );
}