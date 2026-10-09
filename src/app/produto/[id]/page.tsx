import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatKz } from "@/lib/format";
import AddToCart from "@/components/AddToCart";
import { whatsappLink, SITE } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = await prisma.product.findFirst({ where: { id, active: true } });
  if (!p) notFound();

  const wa = whatsappLink();

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-16">
      {/* NAVEGAÇÃO DE REGRESSO */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <Link
          href="/produtos"
          className="group inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-600 transition hover:text-rose-600"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4 transition-transform group-hover:-translate-x-1">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          <span>Voltar ao Catálogo</span>
        </Link>

        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-extrabold text-slate-600">
          Código: #{p.id.slice(-6).toUpperCase()}
        </span>
      </div>

      <div className="grid gap-10 md:grid-cols-12 items-start">
        {/* GALERIA DA IMAGEM DO PRODUTO */}
        <div className="md:col-span-6">
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-slate-100 border border-slate-200/80 shadow-2xl shadow-slate-200">
            {p.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={p.imageUrl}
                alt={p.name}
                className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400 p-6 text-center">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-12 w-12 mb-2 opacity-40">
                  <path d="M5 8h14l-1 12H6z" />
                  <path d="M9 8V6a3 3 0 0 1 6 0v2" />
                </svg>
                <span className="text-xs font-bold uppercase tracking-wider">Sem foto disponível</span>
              </div>
            )}

            {/* BADGES DE ESTOQUE FLUTUANTES */}
            <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
              {p.stock === 0 ? (
                <span className="rounded-full bg-slate-900 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-white shadow-md">
                  Esgotado
                </span>
              ) : p.stock <= 3 ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-amber-500/30">
                  <span className="h-2 w-2 rounded-full bg-white animate-ping" />
                  Rápido! Restam apenas {p.stock}
                </span>
              ) : (
                <span className="rounded-full bg-emerald-500 px-3.5 py-1 text-xs font-black uppercase tracking-wider text-white shadow-md">
                  Em Stock
                </span>
              )}
            </div>
          </div>
        </div>

        {/* DETALHES E COMPRA */}
        <div className="md:col-span-6 space-y-6">
          <div className="space-y-3">
            <span className="inline-block rounded-md bg-rose-100 px-3 py-1 text-xs font-black uppercase tracking-wider text-rose-600">
              Garantia de Qualidade
            </span>
            <h1 className="font-display text-3xl font-black text-slate-900 sm:text-4xl md:text-5xl leading-tight">
              {p.name}
            </h1>
            <p className="font-display text-3xl font-black text-rose-600">
              {formatKz(p.price)}
            </p>
          </div>

          {/* DESCRIÇÃO DO PRODUTO */}
          {p.description && (
            <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4 text-sm font-medium leading-relaxed text-slate-700">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-1">
                Detalhes da Peça
              </h2>
              <p>{p.description}</p>
            </div>
          )}

          {/* COMPONENTE ADICIONAR AO CARRINHO */}
          <AddToCart
            product={{
              id: p.id,
              name: p.name,
              price: p.price,
              imageUrl: p.imageUrl,
              stock: p.stock,
            }}
          />

          {/* GARANTIAS E CONFIANÇA */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 text-xs">
              <span className="block font-black text-slate-900">🚀 Entrega Rápida</span>
              <span className="text-slate-500 font-medium">Entregamos em {SITE.city}</span>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 text-xs">
              <span className="block font-black text-slate-900">💳 Pagamento Flexível</span>
              <span className="text-slate-500 font-medium">TPA, Cash ou Express</span>
            </div>
          </div>

          {/* DÚVIDAS VIA WHATSAPP */}
          <div className="rounded-3xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/5 p-5 border border-emerald-500/20 flex items-center justify-between gap-4">
            <div>
              <p className="font-bold text-sm text-slate-900">Dúvidas sobre o tamanho ou tecido?</p>
              <p className="text-xs text-slate-600 font-medium">Fale connosco no WhatsApp para ajudar a escolher.</p>
            </div>
            <a
              href={`${wa}?text=${encodeURIComponent(`Olá! Tenho uma dúvida sobre a peça "${p.name}".`)}`}
              target="_blank"
              rel="noreferrer"
              className="shrink-0 rounded-2xl bg-[#25D366] px-4 py-2.5 text-xs font-black text-white shadow-md transition hover:scale-105"
            >
              Perguntar
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}