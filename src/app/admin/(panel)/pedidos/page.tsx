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
      className={`shrink-0 inline-block ${className}`}
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

// Barra de cor lateral para relance de status
const ACCENT: Record<string, string> = {
  PENDING: "bg-amber-400",
  CONFIRMED: "bg-sky-500",
  DELIVERED: "bg-emerald-500",
  CANCELLED: "bg-rose-500",
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
    <div className="mx-auto max-w-7xl space-y-6 pb-16">
      {/* CABEÇALHO */}
      <div className="flex flex-col gap-1 border-b border-slate-200 pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="text-xs font-black uppercase tracking-wider text-rose-600">
            Painel do Proprietário
          </span>
          <h1 className="font-display text-3xl font-black text-slate-900 sm:text-4xl">
            Gestão de Pedidos
          </h1>
          <p className="text-sm font-medium text-slate-500">
            A apresentar <strong className="text-slate-900">{orders.length}</strong> {orders.length === 1 ? "pedido" : "pedidos"}
            {filter ? ` · ${STATUS_LABELS[filter]}` : ""}
          </p>
        </div>
      </div>

      {/* BARRA DE FILTROS RESPONSIVA */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {FILTERS.map((f) => {
          const active = (filter ?? "") === f.value;
          return (
            <Link
              key={f.value}
              href={f.value ? `/admin/pedidos?status=${f.value}` : "/admin/pedidos"}
              className={`inline-flex items-center gap-2 whitespace-nowrap rounded-2xl px-4 py-2.5 text-xs font-black transition-all ${
                active
                  ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20"
                  : "border border-slate-200/80 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <Icon name={f.icon} className="h-4 w-4" />
              <span>{f.label}</span>
            </Link>
          );
        })}
      </div>

      {/* LISTA DE PEDIDOS */}
      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-200/80 bg-white p-12 text-center shadow-sm">
          <span className="grid h-16 w-16 place-items-center rounded-3xl bg-slate-100 text-slate-400 mb-4">
            <Icon name="inbox" className="h-8 w-8" />
          </span>
          <h2 className="font-display text-lg font-black text-slate-900">Nenhum pedido encontrado</h2>
          <p className="mt-1 text-xs font-medium text-slate-500 max-w-sm">
            {filter
              ? `Não existem encomendas com o estado "${STATUS_LABELS[filter]}".`
              : "Ainda não existem encomendas registadas na plataforma."}
          </p>
          {filter && (
            <Link
              href="/admin/pedidos"
              className="mt-6 inline-block rounded-2xl bg-slate-900 px-6 py-3 text-xs font-black text-white transition hover:bg-rose-600"
            >
              Ver Todos os Pedidos
            </Link>
          )}
        </div>
      ) : (
        <ul className="space-y-3">
          {orders.map((o) => (
            <li key={o.id}>
              <Link
                href={`/admin/pedidos/${o.id}`}
                className="group relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-4 pl-6 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-slate-100/80 hover:border-slate-300"
              >
                {/* Faixa de cor indicativa do status */}
                <span className={`absolute inset-y-0 left-0 w-2 ${ACCENT[o.status] ?? "bg-slate-300"}`} />

                {/* Dados do Cliente e Pedido */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-r from-rose-600 to-amber-500 font-black text-sm text-white shadow-md">
                    {o.customerName.trim().charAt(0).toUpperCase() || "?"}
                  </span>

                  <div className="min-w-0 space-y-0.5">
                    <p className="truncate font-black text-sm text-slate-900 group-hover:text-rose-600 transition-colors">
                      #{o.orderNumber} · {o.customerName}
                    </p>
                    <div className="flex items-center gap-2 truncate text-xs font-bold text-slate-500">
                      <span>{fmtDate(o.createdAt)}</span>
                      <span className="text-slate-300">•</span>
                      <span className="inline-flex items-center gap-1">
                        <Icon name="card" className="h-3.5 w-3.5 text-slate-400" />
                        {PAYMENT_LABELS[o.paymentMethod] ?? o.paymentMethod}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Total e Estado do Pedido */}
                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 border-t border-slate-100 pt-2 sm:border-t-0 sm:pt-0">
                  <div className="text-left sm:text-right">
                    <p className="font-black text-base text-slate-900">
                      {formatKz(o.total)}
                    </p>
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                        STATUS_STYLES[o.status] ?? "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {STATUS_LABELS[o.status] ?? o.status}
                    </span>
                  </div>

                  <span className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-slate-400 group-hover:bg-rose-600 group-hover:text-white transition-colors">
                    <Icon name="chevron" className="h-4 w-4" />
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