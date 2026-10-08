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

const input = "w-full rounded-lg border bg-white px-3 py-2 outline-none focus:border-black";

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
      setError(data.error ?? "Não foi possível finalizar o pedido.");
      return;
    }

    router.push(`/pedido/${data.id}`);
    clear();
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Finalizar compra</h1>

      <form onSubmit={onSubmit} className="space-y-4">
        <input name="customerName" required placeholder="Nome completo" className={input} />
        <input name="phone" required type="tel" placeholder="Telefone (ex.: 923 000 000)" className={input} />
        <input name="address" required placeholder="Endereço ou local de entrega" className={input} />
        <textarea name="notes" placeholder="Observações (opcional)" rows={2} className={input} />

        <select name="paymentMethod" required defaultValue="" className={input}>
          <option value="" disabled>Método de pagamento</option>
          {PAYMENTS.map((p) => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>

        <div className="flex items-center justify-between rounded-xl border bg-white p-4 font-bold">
          <span>Total</span>
          <span>{formatKz(cartTotal(items))}</span>
        </div>

        {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

        <button
          disabled={loading}
          className="w-full rounded-lg bg-black py-3 font-medium text-white disabled:opacity-50"
        >
          {loading ? "A enviar..." : "Confirmar pedido"}
        </button>
      </form>
    </div>
  );
}
