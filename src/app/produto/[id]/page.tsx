import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatKz } from "@/lib/format";
import AddToCart from "@/components/AddToCart";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = await prisma.product.findFirst({ where: { id, active: true } });
  if (!p) notFound();

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div className="aspect-square overflow-hidden rounded-xl bg-neutral-100">
        {p.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.imageUrl} alt={p.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-neutral-400">Sem foto</div>
        )}
      </div>

      <div className="space-y-4">
        <h1 className="text-2xl font-bold">{p.name}</h1>
        <p className="text-2xl font-semibold">{formatKz(p.price)}</p>
        {p.description && <p className="text-neutral-600">{p.description}</p>}
        <AddToCart
          product={{ id: p.id, name: p.name, price: p.price, imageUrl: p.imageUrl, stock: p.stock }}
        />
      </div>
    </div>
  );
}
