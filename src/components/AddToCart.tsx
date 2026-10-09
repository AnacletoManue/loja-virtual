"use client";
import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/store/cart";

type Props = {
  product: { id: string; name: string; price: number; imageUrl: string | null; stock: number };
};

export default function AddToCart({ product }: Props) {
  const add = useCart((s) => s.add);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  if (product.stock === 0) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50/80 p-4 text-center font-bold text-rose-600 shadow-sm">
        ⚠️ Peça Temporariamente Esgotada
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-xl shadow-slate-100">
      {/* Seletor de Quantidade */}
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-black uppercase tracking-wider text-slate-700">
          Quantidade
        </span>
        <div className="flex items-center rounded-2xl border-2 border-slate-200 bg-slate-50/80 p-1">
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-lg font-bold text-slate-800 shadow-sm transition hover:bg-slate-200 active:scale-95 disabled:opacity-40"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            disabled={qty <= 1}
          >
            −
          </button>
          <span className="w-12 text-center text-base font-extrabold text-slate-900">{qty}</span>
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-lg font-bold text-slate-800 shadow-sm transition hover:bg-slate-200 active:scale-95 disabled:opacity-40"
            onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
            disabled={qty >= product.stock}
          >
            +
          </button>
        </div>
      </div>

      {/* Indicador de Stock com Badge */}
      <div className="flex items-center justify-between text-xs">
        <span className="inline-flex items-center gap-1.5 font-bold text-emerald-600">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          Disponível para entrega imediata
        </span>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 font-bold text-slate-600">
          {product.stock} em stock
        </span>
      </div>

      {/* Botão de Ação Principal */}
      <button
        type="button"
        onClick={() => {
          add(
            {
              productId: product.id,
              name: product.name,
              price: product.price,
              imageUrl: product.imageUrl,
              stock: product.stock,
            },
            qty
          );
          setAdded(true);
          setTimeout(() => setAdded(false), 2500);
        }}
        className={`flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-base font-black text-white shadow-xl transition-all duration-300 active:scale-98 ${
          added
            ? "bg-emerald-600 shadow-emerald-600/30"
            : "bg-gradient-to-r from-rose-600 to-rose-500 shadow-rose-600/30 hover:brightness-110"
        }`}
      >
        {added ? (
          <>
            <span>✓</span>
            <span>Adicionado ao Carrinho!</span>
          </>
        ) : (
          <>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-5 w-5 shrink-0"
            >
              <path d="M5 8h14l-1 12H6z" />
              <path d="M9 8V6a3 3 0 0 1 6 0v2" />
            </svg>
            <span>Adicionar ao Carrinho</span>
          </>
        )}
      </button>

      {/* Alerta / Atalho para Ir ao Carrinho */}
      {added && (
        <Link
          href="/carrinho"
          className="flex items-center justify-center gap-2 rounded-2xl border-2 border-emerald-500/30 bg-emerald-50 py-3 text-center text-sm font-black text-emerald-700 transition hover:bg-emerald-100"
        >
          <span>🛒 Ver Carrinho & Finalizar Pedido</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </Link>
      )}
    </div>
  );
}