"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart, cartTotal } from "@/store/cart";
import { useMounted } from "@/lib/useMounted";
import { formatKz } from "@/lib/format";

const PAYMENTS = [
  { value: "CASH_ON_DELIVERY", label: "Pagamento na entrega" },
  { value: "BANK_TRANSFER", label: "Transferência bancária" },
  { value: "MULTICAIXA_EXPRESS", label: "Multicaixa Express" },
  { value: "REFERENCE", label: "Pagamento por referência" },
];

const input =
  "w-full rounded-2xl border border-black/10 bg-white px-4 py-3.5 outline-none transition focus:border-black";

export default function CheckoutPage() {
  const mounted = useMounted();
  const router = useRouter();
  const { items, clear } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const empty = mounted && items.length === 0;

  useEffect(() => {
    if (empty && !loading) router.replace("/carrinho");
  }, [empty, loading, router]);

  if (!mounted || empty) return null;

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
        paymentMethod: f.get("paymentMethod"),
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
    <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1fr_340px]">
      <form onSubmit={onSubmit} className="space-y-4">
        <h1 className="font-display mb-2 text-5xl font-extrabold">Finalizar compra</h1>
        <input name="customerName" required placeholder="Nome completo" className={input} />
        <input name="phone" required type="tel" placeholder="Telefone (ex.: 923 000 000)" className={input} />
        <input name="address" required placeholder="Endereço ou local de entrega" className={input} />
        <textarea name="notes" placeholder="Observações (opcional)" rows={3} className={input} />
        <select name="paymentMethod" required defaultValue="" className={input}>
          <option value="" disabled>Método de pagamento</option>
          {PAYMENTS.map((p) => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>

        {error && <p role="alert" className="rounded-2xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}

        <button
          disabled={loading}
          className="w-full rounded-full bg-[var(--brand)] py-4 font-semibold text-white transition hover:brightness-110 disabled:opacity-50"
        >
          {loading ? "A enviar..." : "Confirmar pedido"}
        </button>
      </form>

      <aside className="h-fit space-y-4 rounded-3xl bg-white p-6 lg:sticky lg:top-24">
        <h2 className="font-display text-xl font-bold">O seu pedido</h2>
        <ul className="space-y-2 text-sm">
          {items.map((i) => (
            <li key={i.productId} className="flex justify-between gap-3">
              <span className="text-neutral-600">{i.quantity} × {i.name}</span>
              <span className="font-medium">{formatKz(i.price * i.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="flex justify-between border-t border-black/10 pt-4 text-lg font-bold">
          <span>Total</span>
          <span>{formatKz(cartTotal(items))}</span>
        </div>
      </aside>
    </div>
  );
}