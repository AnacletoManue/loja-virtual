import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatKz } from "@/lib/format";
import { deleteProduct, toggleActive } from "@/app/admin/actions";
import DeleteButton from "@/components/admin/DeleteButton";

export const dynamic = "force-dynamic";

export default async function ProductsAdmin() {
  const products = await prisma.product.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Produtos</h1>
        <Link href="/admin/produtos/novo" className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white">
          + Novo produto
        </Link>
      </div>

      {products.length === 0 ? (
        <p className="rounded-xl border bg-white p-10 text-center text-neutral-500">
          Ainda não há produtos. Clique em “Novo produto” para começar.
        </p>
      ) : (
        <ul className="space-y-3">
          {products.map((p) => (
            <li key={p.id} className="flex flex-col gap-3 rounded-xl border bg-white p-3 sm:flex-row sm:items-center">
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                  {p.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.imageUrl} alt={p.name} className="h-full w-full object-cover" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-medium">{p.name}</p>
                  <p className="text-sm text-neutral-600">{formatKz(p.price)}</p>
                  <div className="mt-1 flex flex-wrap gap-1.5 text-xs">
                    <span
                      className={`rounded-full px-2 py-0.5 ${
                        p.stock === 0
                          ? "bg-red-100 text-red-700"
                          : p.stock <= 3
                          ? "bg-amber-100 text-amber-800"
                          : "bg-neutral-100 text-neutral-700"
                      }`}
                    >
                      Stock: {p.stock}
                    </span>
                    {!p.active && <span className="rounded-full bg-neutral-200 px-2 py-0.5">Oculto</span>}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Link href={`/admin/produtos/${p.id}`} className="rounded-lg border px-3 py-1.5 text-sm hover:bg-neutral-50">
                  Editar
                </Link>
                <form action={toggleActive.bind(null, p.id, !p.active)}>
                  <button className="rounded-lg border px-3 py-1.5 text-sm hover:bg-neutral-50">
                    {p.active ? "Ocultar" : "Mostrar"}
                  </button>
                </form>
                <DeleteButton action={deleteProduct.bind(null, p.id)} message={`Remover “${p.name}”?`} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
