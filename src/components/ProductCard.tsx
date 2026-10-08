import Link from "next/link";
import { formatKz } from "@/lib/format";

type Props = {
  product: { id: string; name: string; price: number; stock: number; imageUrl: string | null };
};

export default function ProductCard({ product: p }: Props) {
  const soldOut = p.stock === 0;

  return (
    <Link
      href={`/produto/${p.id}`}
      className="group overflow-hidden rounded-2xl border bg-white transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-neutral-100">
        {p.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={p.imageUrl}
            alt={p.name}
            className={`h-full w-full object-cover transition duration-500 group-hover:scale-105 ${
              soldOut ? "opacity-50 grayscale" : ""
            }`}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-neutral-400">Sem foto</div>
        )}

        {soldOut && (
          <span className="absolute left-3 top-3 rounded-full bg-black px-3 py-1 text-xs font-medium text-white">
            Esgotado
          </span>
        )}
        {!soldOut && p.stock <= 3 && (
          <span className="absolute left-3 top-3 rounded-full bg-amber-500 px-3 py-1 text-xs font-medium text-white">
            Últimas unidades
          </span>
        )}
      </div>

      <div className="p-4">
        <h3 className="truncate font-medium">{p.name}</h3>
        <div className="mt-1 flex items-center justify-between">
          <p className="font-semibold">{formatKz(p.price)}</p>
          {!soldOut && (
            <span className="text-xs text-neutral-500 transition group-hover:text-black">Ver peça →</span>
          )}
        </div>
      </div>
    </Link>
  );
}
