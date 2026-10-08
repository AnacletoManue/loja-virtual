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

  const products = [...all.filter((p) => p.stock > 0), ...all.filter((p) => p.stock === 0)];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-5xl font-extrabold">Produtos</h1>
          <p className="mt-1 text-neutral-500">
            {products.length} {products.length === 1 ? "peça" : "peças"}
            {term && <> para “{term}”</>}
          </p>
        </div>

        <form action="/produtos" className="flex w-full gap-2 sm:w-auto">
          <input
            name="q"
            defaultValue={term}
            placeholder="Pesquisar peça"
            className="w-full rounded-full border border-black/10 bg-white px-5 py-3 text-sm outline-none transition focus:border-black sm:w-72"
          />
          <button className="rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--brand)]">
            Buscar
          </button>
        </form>
      </div>

      {products.length === 0 ? (
        <p className="rounded-3xl bg-white py-20 text-center text-neutral-500">
          {term ? `Nenhuma peça encontrada para “${term}”. Tente outro nome.` : "Ainda não há produtos disponíveis."}
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}