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
      <div className="mx-auto max-w-md py-24 text-center">
        <h1 className="font-display text-4xl font-extrabold">Carrinho vazio</h1>
        <p className="mt-2 text-neutral-500">Escolha uma peça para começar o seu pedido.</p>
        <Link href="/produtos" className="mt-6 inline-block rounded-full bg-[var(--brand)] px-8 py-3.5 font-semibold text-white">
          Ver produtos
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1fr_340px]">
      <div>
        <h1 className="font-display mb-6 text-5xl font-extrabold">Carrinho</h1>
        <ul className="space-y-3">
          {items.map((i) => (
            <li key={i.productId} className="flex gap-4 rounded-3xl bg-white p-3">
              <div className="h-28 w-24 shrink-0 overflow-hidden rounded-2xl bg-neutral-200">
                {i.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={i.imageUrl} alt={i.name} className="h-full w-full object-cover" />
                )}
              </div>
              <div className="flex flex-1 flex-col justify-between py-1">
                <div className="flex justify-between gap-3">
                  <p className="font-medium">{i.name}</p>
                  <button onClick={() => remove(i.productId)} className="text-sm text-neutral-500 underline hover:text-red-600">
                    Remover
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center rounded-full border border-black/10">
                    <button aria-label="Diminuir" className="h-9 w-9 text-lg" onClick={() => setQty(i.productId, i.quantity - 1)}>−</button>
                    <span className="w-6 text-center text-sm font-medium">{i.quantity}</span>
                    <button aria-label="Aumentar" className="h-9 w-9 text-lg" onClick={() => setQty(i.productId, i.quantity + 1)}>+</button>
                  </div>
                  <p className="font-semibold">{formatKz(i.price * i.quantity)}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <aside className="h-fit space-y-4 rounded-3xl bg-white p-6 lg:sticky lg:top-24">
        <h2 className="font-display text-xl font-bold">Resumo</h2>
        <div className="flex items-center justify-between border-t border-black/10 pt-4 text-lg font-bold">
          <span>Total</span>
          <span>{formatKz(cartTotal(items))}</span>
        </div>
        <Link href="/checkout" className="block rounded-full bg-[var(--brand)] py-3.5 text-center font-semibold text-white transition hover:brightness-110">
          Finalizar compra
        </Link>
        <Link href="/produtos" className="block text-center text-sm text-neutral-500 underline">
          Continuar a comprar
        </Link>
      </aside>
    </div>
  );
}