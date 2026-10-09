"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart, cartTotal } from "@/store/cart";
import { useMounted } from "@/lib/useMounted";
import { formatKz } from "@/lib/format";

const PAYMENTS = [
  { value: "CASH_ON_DELIVERY", label: "Pagamento na entrega", badge: "TPA ou Dinheiro", icon: "truck" },
  { value: "MULTICAIXA_EXPRESS", label: "Multicaixa Express", badge: "Inmediato", icon: "phone" },
  { value: "BANK_TRANSFER", label: "Transferência Bancária", badge: "IBAN", icon: "bank" },
  { value: "REFERENCE", label: "Pagamento por Referência", badge: "Multicaixa", icon: "card" },
];

const inputClass =
  "w-full rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3.5 text-sm font-bold text-slate-800 placeholder-slate-400 outline-none transition-all focus:border-rose-500 focus:bg-white focus:ring-4 focus:ring-rose-500/10";

export default function CheckoutPage() {
  const mounted = useMounted();
  const router = useRouter();
  const { items, clear } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("CASH_ON_DELIVERY");

  const empty = mounted && items.length === 0;

  useEffect(() => {
    if (empty && !loading) router.replace("/carrinho");
  }, [empty, loading, router]);

  if (!mounted || empty) return null;

  const total = cartTotal(items);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const f = new FormData(e.currentTarget);
    const res = await fetch("/api/pedidos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerName: f.get("customerName"),
        phone: f.get("phone"),
        address: f.get("address"),
        notes: f.get("notes"),
        paymentMethod,
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      setLoading(false);
      setError(data.error ?? "Não foi possível finalizar o pedido. Tente novamente.");
      return;
    }

    router.push(`/pedido/${data.id}`);
    clear();
  }

  return (
    <div className="mx-auto max-w-6xl pb-16">
      {/* Cobre-cabeçalho */}
      <div className="mb-8 border-b border-slate-200 pb-4">
        <span className="text-xs font-black uppercase tracking-wider text-rose-600">
          Último Passo
        </span>
        <h1 className="font-display text-4xl font-black text-slate-900">Finalizar Encomenda</h1>
      </div>

      <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
        {/* FORMULÁRIO */}
        <form onSubmit={onSubmit} className="space-y-6">
          {/* SECÇÃO 1: DADOS DE CONTACTO E ENTREGA */}
          <div className="space-y-4 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xl shadow-slate-100">
            <h2 className="font-display text-xl font-black text-slate-900 flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-rose-100 text-rose-600 text-sm font-black">
                1
              </span>
              Dados de Entrega
            </h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-bold uppercase text-slate-600">
                  Nome Completo *
                </label>
                <input
                  name="customerName"
                  required
                  placeholder="Ex.: Maria dos Santos"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase text-slate-600">
                  Telefone / WhatsApp *
                </label>
                <input
                  name="phone"
                  required
                  type="tel"
                  placeholder="Ex.: 923 000 000"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase text-slate-600">
                  Local / Bairro *
                </label>
                <input
                  name="address"
                  required
                  placeholder="Ex.: Talatona, Luanda"
                  className={inputClass}
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-bold uppercase text-slate-600">
                  Ponto de Referência ou Observações
                </label>
                <textarea
                  name="notes"
                  placeholder="Ex.: Próximo ao supermercado, entregar no período da manhã..."
                  rows={2}
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {/* SECÇÃO 2: MÉTODO DE PAGAMENTO */}
          <div className="space-y-4 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xl shadow-slate-100">
            <h2 className="font-display text-xl font-black text-slate-900 flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-amber-100 text-amber-600 text-sm font-black">
                2
              </span>
              Forma de Pagamento
            </h2>

            <div className="grid gap-3 sm:grid-cols-2">
              {PAYMENTS.map((p) => {
                const selected = paymentMethod === p.value;
                return (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setPaymentMethod(p.value)}
                    className={`flex items-center justify-between rounded-2xl border-2 p-4 text-left transition-all ${
                      selected
                        ? "border-rose-600 bg-rose-50/50 shadow-md shadow-rose-500/10"
                        : "border-slate-200 bg-slate-50/50 hover:border-slate-300 hover:bg-slate-100/50"
                    }`}
                  >
                    <div>
                      <p className="font-black text-sm text-slate-900">{p.label}</p>
                      <span className="mt-0.5 inline-block text-[10px] font-bold uppercase text-slate-500">
                        {p.badge}
                      </span>
                    </div>

                    <span
                      className={`grid h-6 w-6 place-items-center rounded-full border-2 transition-all ${
                        selected
                          ? "border-rose-600 bg-rose-600 text-white"
                          : "border-slate-300 bg-white"
                      }`}
                    >
                      {selected && <span className="h-2 w-2 rounded-full bg-white" />}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ALERTA DE ERRO */}
          {error && (
            <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
              ⚠️ {error}
            </div>
          )}

          {/* BOTÃO SUBMIT */}
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-rose-600 to-rose-500 py-4 font-black text-white shadow-xl shadow-rose-600/30 transition-all hover:brightness-110 active:scale-98 disabled:opacity-50"
          >
            {loading ? (
              <>
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>A processar o pedido...</span>
              </>
            ) : (
              <>
                <span>Confirmar e Gerar PDF</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-5 w-5">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </>
            )}
          </button>
        </form>

        {/* RESUMO DO PEDIDO */}
        <aside className="h-fit space-y-5 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xl shadow-slate-100 lg:sticky lg:top-24">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="font-display text-xl font-black text-slate-900">Resumo da Compra</h2>
            <Link href="/carrinho" className="text-xs font-bold text-rose-600 hover:underline">
              Editar
            </Link>
          </div>

          <ul className="max-h-72 space-y-3 overflow-y-auto text-xs font-medium pr-1">
            {items.map((i) => (
              <li key={i.productId} className="flex items-center justify-between gap-3 border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2 truncate">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-slate-100 font-bold text-slate-700">
                    {i.quantity}×
                  </span>
                  <span className="truncate font-bold text-slate-800">{i.name}</span>
                </div>
                <span className="shrink-0 font-black text-slate-900">
                  {formatKz(i.price * i.quantity)}
                </span>
              </li>
            ))}
          </ul>

          <div className="space-y-2 border-t border-slate-200 pt-3 text-xs font-medium text-slate-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-bold text-slate-900">{formatKz(total)}</span>
            </div>
            <div className="flex justify-between">
              <span>Entrega em Luanda</span>
              <span className="font-bold text-emerald-600">A combinar no WhatsApp</span>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-slate-200 pt-4">
            <span className="text-sm font-black text-slate-900">Total Final</span>
            <span className="font-display text-2xl font-black text-rose-600">{formatKz(total)}</span>
          </div>

          <div className="rounded-2xl bg-amber-50 border border-amber-200 p-3.5 text-center text-[11px] font-bold text-amber-800">
            🔒 Compra Segura. Baixe o PDF do resumo e envie pelo WhatsApp para combinar a entrega.
          </div>
        </aside>
      </div>
    </div>
  );
}