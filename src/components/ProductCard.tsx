"use client";
import Link from "next/link";
import { formatKz } from "@/lib/format";

type Props = {
  product: { id: string; name: string; price: number; stock: number; imageUrl: string | null };
};

export default function ProductCard({ product: p }: Props) {
  const soldOut = p.stock === 0;

  return (
    <Link href={`/produto/${p.id}`} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-slate-100 border border-slate-200/80 shadow-sm transition-all duration-300 group-hover:-translate-y-1.5 group-hover:shadow-xl group-hover:shadow-rose-500/10 group-hover:border-rose-300">
        
        {/* Imagem do Produto */}
        {p.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={p.imageUrl}
            alt={p.name}
            className={`h-full w-full object-cover transition-transform duration-700 group-hover:scale-108 ${
              soldOut ? "opacity-50 grayscale" : ""
            }`}
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400 p-4 text-center">
            {/* Ícone de Carrinho de Compras */}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-8 w-8 mb-1 opacity-50">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            <span className="text-xs font-bold uppercase tracking-wider">Sem Foto</span>
          </div>
        )}

        {/* Badges de Estoque */}
        <div className="absolute left-3 top-3 flex flex-col gap-1 z-10">
          {soldOut ? (
            <span className="rounded-full bg-slate-900/90 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-white backdrop-blur-md shadow-md">
              Esgotado
            </span>
          ) : p.stock <= 3 ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-white shadow-md shadow-amber-500/30">
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />
              Restam {p.stock}
            </span>
          ) : null}
        </div>

        {/* Botão no Hover com Ícone de Carrinho de Compras */}
        {!soldOut && (
          <div className="absolute inset-x-3 bottom-3 z-10 translate-y-3 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <span className="flex items-center justify-center gap-2 rounded-2xl bg-white/95 py-3 text-center text-xs font-black uppercase tracking-wider text-slate-900 shadow-lg backdrop-blur-md transition-colors group-hover:bg-rose-600 group-hover:text-white">
              {/* Ícone do Carrinho com Rodas */}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              <span>Ver no Carrinho</span>
            </span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </div>

      {/* Nome e Preço */}
      <div className="mt-3.5 space-y-1 px-1">
        <h3 className="truncate font-extrabold text-sm text-slate-800 transition-colors group-hover:text-rose-600">
          {p.name}
        </h3>
        <div className="flex items-center justify-between">
          <p className="font-black text-base text-rose-600">
            {formatKz(p.price)}
          </p>
          {!soldOut && (
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
              Em Stock
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}