"use client";
import Link from "next/link";
import { useCart, cartTotal } from "@/store/cart";
import { useMounted } from "@/lib/useMounted";
import { formatKz } from "@/lib/format";

export default function CartPage() {
  const mounted = useMounted();
  const { items, setQty, remove } = useCart();

  if (!mounted) return null;

  if (items.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="mb-4 text-neutral-500">O seu carrinho está vazio.</p>
        <Link href="/" className="rounded-lg bg-black px-5 py-3 text-white">Ver produtos</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-2xl font-bold">Carrinho</h1>

      <ul className="space-y-3">
        {items.map((i) => (
          <li key={i.productId} className="flex gap-3 rounded-xl border bg-white p-3">
            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
              {i.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={i.imageUrl} alt={i.name} className="h-full w-full object-cover" />
              )}
            </div>
            <div className="flex flex-1 flex-col justify-between">
              <div className="flex justify-between gap-2">
                <p className="font-medium">{i.name}</p>
                <button onClick={() => remove(i.productId)} className="text-sm text-red-600">Remover</button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center rounded-lg border">
                  <button className="px-3 py-1" onClick={() => setQty(i.productId, i.quantity - 1)}>−</button>
                  <span className="w-8 text-center text-sm">{i.quantity}</span>
                  <button className="px-3 py-1" onClick={() => setQty(i.productId, i.quantity + 1)}>+</button>
                </div>
                <p className="font-semibold">{formatKz(i.price * i.quantity)}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between rounded-xl border bg-white p-4 text-lg font-bold">
        <span>Total</span>
        <span>{formatKz(cartTotal(items))}</span>
      </div>

      <Link href="/checkout" className="block rounded-lg bg-black py-3 text-center font-medium text-white">
        Finalizar compra
      </Link>
    </div>
  );
}
