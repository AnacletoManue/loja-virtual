import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatKz } from "@/lib/format";
import { STATUS_LABELS, STATUS_STYLES, fmtDate } from "@/lib/labels";

export const dynamic = "force-dynamic";

function startOfTodayLuanda() {
  const luanda = new Date(Date.now() + 3600_000); // UTC+1
  luanda.setUTCHours(0, 0, 0, 0);
  return new Date(luanda.getTime() - 3600_000);
}

export default async function Dashboard() {
  const today = startOfTodayLuanda();

  const [activeProducts, lowStock, pending, todayCount, revenue, recent] = await Promise.all([
    prisma.product.count({ where: { active: true } }),
    prisma.product.count({ where: { active: true, stock: { lte: 3 } } }),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.order.count({ where: { createdAt: { gte: today } } }),
    prisma.order.aggregate({ _sum: { total: true }, where: { status: { not: "CANCELLED" } } }),
    prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
  ]);

  const cards = [
    { label: "Pedidos pendentes", value: String(pending), href: "/admin/pedidos?status=PENDING", highlight: pending > 0 },
    { label: "Pedidos hoje", value: String(todayCount), href: "/admin/pedidos" },
    { label: "Vendas (sem cancelados)", value: formatKz(revenue._sum.total ?? 0), href: "/admin/pedidos" },
    { label: "Produtos ativos", value: String(activeProducts), href: "/admin/produtos" },
    { label: "Stock baixo (≤ 3)", value: String(lowStock), href: "/admin/produtos", highlight: lowStock > 0 },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Resumo</h1>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className={`rounded-xl border bg-white p-4 transition hover:shadow-sm ${
              c.highlight ? "border-amber-400" : ""
            }`}
          >
            <p className="text-xs text-neutral-500">{c.label}</p>
            <p className="mt-1 text-xl font-bold">{c.value}</p>
          </Link>
        ))}
      </div>

      <div className="rounded-xl border bg-white">
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="font-semibold">Últimos pedidos</h2>
          <Link href="/admin/pedidos" className="text-sm underline">Ver todos</Link>
        </div>
        {recent.length === 0 ? (
          <p className="p-6 text-center text-sm text-neutral-500">Ainda não há pedidos.</p>
        ) : (
          <ul className="divide-y">
            {recent.map((o) => (
              <li key={o.id}>
                <Link href={`/admin/pedidos/${o.id}`} className="flex items-center justify-between gap-3 p-4 hover:bg-neutral-50">
                  <div className="min-w-0">
                    <p className="truncate font-medium">#{o.orderNumber} · {o.customerName}</p>
                    <p className="text-xs text-neutral-500">{fmtDate(o.createdAt)}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-semibold">{formatKz(o.total)}</p>
                    <span className={`rounded-full px-2 py-0.5 text-xs ${STATUS_STYLES[o.status]}`}>
                      {STATUS_LABELS[o.status]}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
