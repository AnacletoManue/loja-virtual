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

  // Coloca os produtos com estoque primeiro e os esgotados no final
  const products = [...all.filter((p) => p.stock > 0), ...all.filter((p) => p.stock === 0)];

  return (
    <div className="mx-auto max-w-7xl space-y-8 pb-16">
      {/* CABEÇALHO DA PÁGINA + PESQUISA */}
      <div className="flex flex-col gap-6 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <span className="rounded-md bg-rose-100 px-3 py-1 text-xs font-black uppercase tracking-wider text-rose-600">
            Catálogo Completo
          </span>
          <h1 className="font-display text-4xl font-black text-slate-900 sm:text-5xl">
            Todas as Peças
          </h1>
          <p className="text-sm font-semibold text-slate-500">
            Encontradas <strong className="text-slate-900">{products.length}</strong> {products.length === 1 ? "peça disponível" : "peças disponíveis"}
            {term && (
              <span> para a pesquisa <span className="text-rose-600 font-bold">“{term}”</span></span>
            )}
          </p>
        </div>

        {/* FORMULÁRIO DE PESQUISA ESTILIZADO */}
        <form action="/produtos" className="flex w-full items-center gap-2 sm:w-auto">
          <div className="relative w-full sm:w-80">
            <input
              name="q"
              defaultValue={term}
              placeholder="Pesquisar por nome ou estilo..."
              className="w-full rounded-2xl border border-slate-200/80 bg-white py-3.5 pl-11 pr-4 text-sm font-bold text-slate-800 placeholder-slate-400 outline-none shadow-sm transition-all focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10"
            />
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.3-4.3" />
            </svg>
          </div>

          <button
            type="submit"
            className="shrink-0 rounded-2xl bg-gradient-to-r from-rose-600 to-rose-500 px-6 py-3.5 font-black text-white shadow-lg shadow-rose-600/30 transition-all hover:brightness-110 active:scale-95"
          >
            Buscar
          </button>
        </form>
      </div>

      {/* RESULTADO DA PESQUISA / GRELHA DE PRODUTOS */}
      {products.length === 0 ? (
        <div className="mx-auto max-w-md rounded-3xl border border-rose-100 bg-rose-50/50 p-12 text-center shadow-sm">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-rose-100 text-rose-500 mb-4">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-8 w-8">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.3-4.3" />
            </svg>
          </div>
          <h2 className="font-display text-xl font-black text-slate-900">Nenhum produto encontrado</h2>
          <p className="mt-2 text-xs font-medium text-slate-600">
            {term
              ? `Não encontramos nenhuma peça correspondente a “${term}”. Tente pesquisar por outros termos.`
              : "De momento não há produtos ativos disponíveis no catálogo."}
          </p>
          {term && (
            <a
              href="/produtos"
              className="mt-6 inline-block rounded-full bg-slate-900 px-6 py-2.5 text-xs font-bold text-white transition hover:bg-rose-600"
            >
              Limpar Pesquisa
            </a>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}