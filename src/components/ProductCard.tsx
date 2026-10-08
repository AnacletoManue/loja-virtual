import Link from "next/link";
import { formatKz } from "@/lib/format";

type Props = {
  product: { id: string; name: string; price: number; stock: number; imageUrl: string | null };
};

export default function ProductCard({ product: p }: Props) {
  const soldOut = p.stock === 0;

  return (
    <Link href={`/produto/${p.id}`} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-neutral-200">
        {p.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={p.imageUrl}
            alt={p.name}
            className={`h-full w-full object-cover transition duration-700 group-hover:scale-105 ${
              soldOut ? "opacity-50 grayscale" : ""
            }`}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-neutral-400">Sem foto</div>
        )}

        {soldOut ? (
          <span className="absolute left-3 top-3 rounded-full bg-black px-3 py-1 text-xs font-medium text-white">Esgotado</span>
        ) : p.stock <= 3 ? (
          <span className="absolute left-3 top-3 rounded-full bg-[var(--brand)] px-3 py-1 text-xs font-medium text-white">
            Restam {p.stock}
          </span>
        ) : null}

        {!soldOut && (
          <span className="absolute inset-x-3 bottom-3 translate-y-2 rounded-full bg-white/90 py-2.5 text-center text-sm font-semibold opacity-0 backdrop-blur transition group-hover:translate-y-0 group-hover:opacity-100">
            Ver peça
          </span>
        )}
      </div>

      <div className="mt-3 flex items-baseline justify-between gap-3 px-1">
        <h3 className="truncate font-medium">{p.name}</h3>
        <p className="shrink-0 font-semibold">{formatKz(p.price)}</p>
      </div>
    </Link>
  );
}