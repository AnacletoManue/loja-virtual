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
    return <p className="rounded-lg bg-neutral-200 p-3 text-center font-medium">Esgotado</p>;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <span className="text-sm text-neutral-600">Quantidade</span>
        <div className="flex items-center rounded-lg border bg-white">
          <button className="px-3 py-2" onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
          <span className="w-10 text-center">{qty}</span>
          <button className="px-3 py-2" onClick={() => setQty((q) => Math.min(product.stock, q + 1))}>+</button>
        </div>
        <span className="text-xs text-neutral-500">{product.stock} em stock</span>
      </div>

      <button
        onClick={() => {
          add(
            { productId: product.id, name: product.name, price: product.price, imageUrl: product.imageUrl, stock: product.stock },
            qty
          );
          setAdded(true);
          setTimeout(() => setAdded(false), 2000);
        }}
        className="w-full rounded-lg bg-black py-3 font-medium text-white"
      >
        {added ? "Adicionado ✓" : "Adicionar ao carrinho"}
      </button>

      {added && (
        <Link href="/carrinho" className="block text-center text-sm underline">
          Ver carrinho
        </Link>
      )}
    </div>
  );
}
