import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";

export const dynamic = "force-dynamic";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const term = (q ?? "").trim().slice(0, 60);

  const all = await prisma.product.findMany({
    where: {
      active: true,
      ...(term ? { name: { contains: term, mode: "insensitive" } } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  // disponíveis primeiro, esgotados no fim
  const products = [...all.filter((p) => p.stock > 0), ...all.filter((p) => p.stock === 0)];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Produtos</h1>
          <p className="text-sm text-neutral-500">
            {products.length} {products.length === 1 ? "peça encontrada" : "peças encontradas"}
          </p>
        </div>

        <form action="/produtos" className="flex gap-2">
          <input
            name="q"
            defaultValue={term}
            placeholder="Pesquisar peça..."
            className="w-full rounded-full border bg-white px-4 py-2 text-sm outline-none focus:border-black sm:w-64"
          />
          <button className="rounded-full bg-black px-5 py-2 text-sm font-medium text-white">Buscar</button>
        </form>
      </div>

      {products.length === 0 ? (
        <p className="rounded-2xl border bg-white py-16 text-center text-neutral-500">
          {term ? `Nenhuma peça encontrada para “${term}”.` : "Ainda não há produtos disponíveis."}
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
