import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatKz } from "@/lib/format";
import { STATUS_LABELS, STATUS_STYLES, PAYMENT_LABELS, fmtDate } from "@/lib/labels";
import type { OrderStatus } from "@/lib/db-types";

export const dynamic = "force-dynamic";

/* ---------- Ícones (SVG inline) ---------- */
const ICONS = {
  list: <path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  check: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12.5l3 3 5-6" />
    </>
  ),
  truck: (
    <>
      <path d="M3 7h11v9H3z" />
      <path d="M14 10h4l3 3v3h-7z" />
      <circle cx="7" cy="18" r="1.8" />
      <circle cx="17" cy="18" r="1.8" />
    </>
  ),
  x: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9 9l6 6M15 9l-6 6" />
    </>
  ),
  card: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="M3 10h18" />
    </>
  ),
  chevron: <path d="M9 6l6 6-6 6" />,
  inbox: (
    <>
      <path d="M3 13l3-8h12l3 8" />
      <path d="M3 13v6h18v-6h-5l-1.5 2h-5L8 13z" />
    </>
  ),
};
type IconName = keyof typeof ICONS;

function Icon({ name, className = "h-5 w-5" }: { name: IconName; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {ICONS[name]}
    </svg>
  );
}

const FILTERS: { value: string; label: string; icon: IconName }[] = [
  { value: "", label: "Todos", icon: "list" },
  { value: "PENDING", label: "Pendentes", icon: "clock" },
  { value: "CONFIRMED", label: "Confirmados", icon: "check" },
  { value: "DELIVERED", label: "Entregues", icon: "truck" },
  { value: "CANCELLED", label: "Cancelados", icon: "x" },
];

// Barra de cor à esquerda de cada pedido, para ler o estado de relance
const ACCENT: Record<string, string> = {
  PENDING: "bg-amber-400",
  CONFIRMED: "bg-sky-500",
  DELIVERED: "bg-emerald-500",
  CANCELLED: "bg-red-400",
};

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
    <div className="space-y-5">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Pedidos</h1>
          <p className="mt-0.5 text-sm text-neutral-500">
            {orders.length === 1 ? "1 pedido" : `${orders.length} pedidos`}
            {filter ? ` · ${STATUS_LABELS[filter]}` : ""}
          </p>
        </div>
      </div>

      {/* FILTROS */}
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {FILTERS.map((f) => {
          const active = (filter ?? "") === f.value;
          return (
            <Link
              key={f.value}
              href={f.value ? `/admin/pedidos?status=${f.value}` : "/admin/pedidos"}
              className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition hover:-translate-y-0.5 ${
                active
                  ? "border-black bg-black text-white shadow-md"
                  : "bg-white hover:border-black"
              }`}
            >
              <Icon name={f.icon} className="h-4 w-4" />
              {f.label}
            </Link>
          );
        })}
      </div>

      {/* LISTA */}
      {orders.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border bg-white p-14 text-center text-neutral-500">
          <span className="grid h-16 w-16 place-items-center rounded-full bg-neutral-100 text-neutral-400">
            <Icon name="inbox" className="h-8 w-8" />
          </span>
          <p>Nenhum pedido encontrado.</p>
          {filter && (
            <Link
              href="/admin/pedidos"
              className="rounded-full border px-4 py-2 text-sm font-medium text-black transition hover:border-black"
            >
              Ver todos os pedidos
            </Link>
          )}
        </div>
      ) : (
        <ul className="space-y-2.5">
          {orders.map((o) => (
            <li key={o.id}>
              <Link
                href={`/admin/pedidos/${o.id}`}
                className="group relative flex items-center justify-between gap-3 overflow-hidden rounded-2xl border bg-white p-4 pl-5 transition duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/5"
              >
                <span className={`absolute inset-y-0 left-0 w-1.5 ${ACCENT[o.status] ?? "bg-neutral-300"}`} />

                <div className="flex min-w-0 items-center gap-3">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-black text-sm font-bold text-white transition duration-300 group-hover:scale-110">
                    {o.customerName.trim().charAt(0).toUpperCase() || "?"}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-medium">
                      #{o.orderNumber} · {o.customerName}
                    </p>
                    <p className="flex items-center gap-1.5 truncate text-xs text-neutral-500">
                      {fmtDate(o.createdAt)}
                      <span className="text-neutral-300">•</span>
                      <Icon name="card" className="h-3.5 w-3.5" />
                      {PAYMENT_LABELS[o.paymentMethod]}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-3">
                  <div className="text-right">
                    <p className="font-semibold">{formatKz(o.total)}</p>
                    <span className={`rounded-full px-2 py-0.5 text-xs ${STATUS_STYLES[o.status]}`}>
                      {STATUS_LABELS[o.status]}
                    </span>
                  </div>
                  <Icon
                    name="chevron"
                    className="h-4 w-4 text-neutral-300 transition group-hover:translate-x-1 group-hover:text-black"
                  />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}