import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatKz } from "@/lib/format";
import AddToCart from "@/components/AddToCart";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = await prisma.product.findFirst({ where: { id, active: true } });
  if (!p) notFound();

  return (
    <div className="space-y-6">
      <Link href="/produtos" className="text-sm text-neutral-500 underline">← Todos os produtos</Link>

      <div className="grid gap-10 md:grid-cols-2">
        <div className="aspect-[4/5] overflow-hidden rounded-[2rem] bg-neutral-200">
          {p.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={p.imageUrl} alt={p.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-neutral-400">Sem foto</div>
          )}
        </div>

        <div className="flex flex-col justify-center space-y-5">
          <h1 className="font-display text-4xl font-extrabold leading-tight md:text-5xl">{p.name}</h1>
          <p className="text-3xl font-semibold text-[var(--brand)]">{formatKz(p.price)}</p>
          {p.stock > 0 && p.stock <= 3 && (
            <p className="text-sm font-medium">Restam apenas {p.stock} unidades.</p>
          )}
          {p.description && <p className="max-w-md leading-relaxed text-neutral-600">{p.description}</p>}
          <AddToCart
            product={{ id: p.id, name: p.name, price: p.price, imageUrl: p.imageUrl, stock: p.stock }}
          />
        </div>
      </div>
    </div>
  );
}