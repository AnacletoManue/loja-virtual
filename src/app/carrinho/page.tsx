"use client";

import Link from "next/link";
import { useCart, cartTotal } from "@/store/cart";
import { useMounted } from "@/lib/useMounted";
import { formatKz } from "@/lib/format";

export default function CartPage() {
  const mounted = useMounted();
  const { items, setQty, remove } = useCart();

  if (!mounted) return null;

  /* ESTADO VAZIO COM ÍCONE DE CARRINHO COM RODAS */
  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-lg py-20 text-center">
        <div className="mx-auto mb-6 grid h-24 w-24 place-items-center rounded-3xl border border-rose-100 bg-rose-50 text-rose-500 shadow-xl shadow-rose-500/10">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-12 w-12"
          >
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
        </div>
        <h1 className="font-display text-4xl font-black text-slate-900">
          Seu carrinho está vazio
        </h1>
        <p className="mt-3 text-base font-medium text-slate-600">
          Ainda não adicionou nenhuma peça. Explore a nossa coleção para começar o seu pedido.
        </p>
        <Link
          href="/produtos"
          className="mt-8 inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-rose-600 to-rose-500 px-8 py-4 font-black text-white shadow-xl shadow-rose-600/30 transition hover:-translate-y-1 hover:brightness-110"
        >
          <span>Ver Coleção de Produtos</span>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            className="h-5 w-5"
          >
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </Link>
      </div>
    );
  }

  const total = cartTotal(items);

  /* LISTA DE PRODUTOS & RESUMO DO CARRINHO */
  return (
    <div className="mx-auto grid max-w-6xl gap-10 pb-12 lg:grid-cols-[1fr_360px]">
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-rose-600">
              Sua Reserva
            </span>
            <h1 className="font-display text-4xl font-black text-slate-900">
              Carrinho de Compras
            </h1>
          </div>
          <span className="rounded-full bg-rose-100 px-3.5 py-1 text-xs font-extrabold text-rose-700">
            {items.reduce((acc, i) => acc + i.quantity, 0)}{" "}
            {items.reduce((acc, i) => acc + i.quantity, 0) === 1 ? "item" : "itens"}
          </span>
        </div>

        <ul className="space-y-4">
          {items.map((i) => (
            <li
              key={i.productId}
              className="group flex gap-4 rounded-3xl border border-slate-200/80 bg-white p-4 shadow-sm transition-all hover:border-slate-300 hover:shadow-lg"
            >
              {/* Imagem do Produto */}
              <div className="relative h-28 w-24 shrink-0 overflow-hidden rounded-2xl border border-slate-200/60 bg-slate-100">
                {i.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={i.imageUrl}
                    alt={i.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[10px] font-bold uppercase text-slate-400">
                    Sem Imagem
                  </div>
                )}
              </div>

              {/* Informações e Controlo de Quantidade */}
              <div className="flex flex-1 flex-col justify-between py-1">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-extrabold text-base leading-snug text-slate-900">
                      {i.name}
                    </h3>
                    <p className="mt-0.5 text-xs font-bold text-slate-500">
                      {formatKz(i.price)} cada
                    </p>
                  </div>
                  <button
                    onClick={() => remove(i.productId)}
                    className="group/btn flex items-center gap-1 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:bg-rose-50 hover:text-rose-600"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="h-4 w-4"
                    >
                      <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                    <span className="hidden sm:inline">Remover</span>
                  </button>
                </div>

                <div className="flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
                  {/* Seletor de Quantidade */}
                  <div className="flex items-center rounded-2xl border-2 border-slate-200 bg-slate-50 p-1">
                    <button
                      type="button"
                      aria-label="Diminuir"
                      className="flex h-8 w-8 items-center justify-center rounded-xl bg-white font-black text-slate-800 shadow-sm transition hover:bg-slate-200 disabled:opacity-40"
                      onClick={() => setQty(i.productId, i.quantity - 1)}
                      disabled={i.quantity <= 1}
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-sm font-black text-slate-900">
                      {i.quantity}
                    </span>
                    <button
                      type="button"
                      aria-label="Aumentar"
                      className="flex h-8 w-8 items-center justify-center rounded-xl bg-white font-black text-slate-800 shadow-sm transition hover:bg-slate-200 disabled:opacity-40"
                      onClick={() => setQty(i.productId, i.quantity + 1)}
                      disabled={i.quantity >= i.stock}
                    >
                      +
                    </button>
                  </div>

                  {/* Subtotal do Item */}
                  <div className="text-right">
                    <span className="block text-[10px] font-bold uppercase text-slate-400">
                      Subtotal
                    </span>
                    <p className="font-black text-lg text-rose-600">
                      {formatKz(i.price * i.quantity)}
                    </p>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Caixa do Resumo / Checkout */}
      <aside className="h-fit space-y-5 rounded-3xl border border-slate-200/80 bg-white p-7 shadow-xl shadow-slate-100 lg:sticky lg:top-24">
        <h2 className="font-display border-b border-slate-100 pb-3 text-2xl font-black text-slate-900">
          Resumo do Pedido
        </h2>

        <div className="space-y-3 text-sm font-medium">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal das peças</span>
            <span className="font-bold text-slate-900">{formatKz(total)}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>Entrega</span>
            <span className="font-bold text-emerald-600">A combinar no WhatsApp</span>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-slate-200 pt-4">
          <span className="text-base font-black text-slate-900">Total a Pagar</span>
          <span className="font-display text-2xl font-black text-rose-600">
            {formatKz(total)}
          </span>
        </div>

        <Link
          href="/checkout"
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-600 to-rose-500 py-4 font-black text-white shadow-xl shadow-rose-600/30 transition-all hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0"
        >
          <span>Finalizar Compra</span>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            className="h-5 w-5"
          >
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </Link>

        <Link
          href="/produtos"
          className="block text-center text-xs font-bold uppercase tracking-wider text-slate-500 transition hover:text-slate-900"
        >
          ← Continuar a escolher produtos
        </Link>
      </aside>
    </div>
  );
}