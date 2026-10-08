import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatKz } from "@/lib/format";
import { STATUS_LABELS, STATUS_STYLES, PAYMENT_LABELS, fmtDate } from "@/lib/labels";
import type { OrderStatus } from "@/lib/db-types";

export const dynamic = "force-dynamic";

const FILTERS = [
  { value: "", label: "Todos" },
  { value: "PENDING", label: "Pendentes" },
  { value: "CONFIRMED", label: "Confirmados" },
  { value: "DELIVERED", label: "Entregues" },
  { value: "CANCELLED", label: "Cancelados" },
];

export default async function OrdersAdmin({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const filter = FILTERS.some((f) => f.value === status) && status ? (status as OrderStatus) : undefined;

  const orders = await prisma.order.findMany({
    where: filter ? { status: filter } : undefined,
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Pedidos</h1>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((f) => {
          const active = (filter ?? "") === f.value;
          return (
            <Link
              key={f.value}
              href={f.value ? `/admin/pedidos?status=${f.value}` : "/admin/pedidos"}
              className={`whitespace-nowrap rounded-full border px-4 py-1.5 text-sm ${
                active ? "bg-black text-white" : "bg-white hover:bg-neutral-50"
              }`}
            >
              {f.label}
            </Link>
          );
        })}
      </div>

      {orders.length === 0 ? (
        <p className="rounded-xl border bg-white p-10 text-center text-neutral-500">Nenhum pedido encontrado.</p>
      ) : (
        <ul className="divide-y rounded-xl border bg-white">
          {orders.map((o) => (
            <li key={o.id}>
              <Link href={`/admin/pedidos/${o.id}`} className="flex items-center justify-between gap-3 p-4 hover:bg-neutral-50">
                <div className="min-w-0">
                  <p className="truncate font-medium">#{o.orderNumber} · {o.customerName}</p>
                  <p className="truncate text-xs text-neutral-500">
                    {fmtDate(o.createdAt)} · {PAYMENT_LABELS[o.paymentMethod]}
                  </p>
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
  );
}
