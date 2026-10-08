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

/* ---------- Ícones (SVG inline) ---------- */
const ICONS = {
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  bag: (
    <>
      <path d="M5 8h14l-1 12H6z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </>
  ),
  cash: (
    <>
      <rect x="3" y="6" width="18" height="12" rx="2.5" />
      <circle cx="12" cy="12" r="2.5" />
      <path d="M6.5 9.5v.01M17.5 14.5v.01" />
    </>
  ),
  tag: (
    <>
      <path d="M3 12V4h8l10 10-8 8z" />
      <circle cx="7.5" cy="8.5" r="1.3" />
    </>
  ),
  alert: (
    <>
      <path d="M12 3l10 18H2z" />
      <path d="M12 10v4M12 17.5v.01" />
    </>
  ),
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  store: (
    <>
      <path d="M4 9l1.5-5h13L20 9" />
      <path d="M4 9a2.7 2.7 0 0 0 5.3 0 2.7 2.7 0 0 0 5.4 0A2.7 2.7 0 0 0 20 9" />
      <path d="M5 12v8h14v-8" />
    </>
  ),
  inbox: (
    <>
      <path d="M3 13l3-8h12l3 8" />
      <path d="M3 13v6h18v-6h-5l-1.5 2h-5L8 13z" />
    </>
  ),
  chevron: <path d="M9 6l6 6-6 6" />,
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

function greeting() {
  const h = parseInt(
    new Intl.DateTimeFormat("pt-PT", { hour: "numeric", hourCycle: "h23", timeZone: "Africa/Luanda" }).format(
      new Date()
    ),
    10
  );
  if (h < 12) return "Bom dia";
  if (h < 19) return "Boa tarde";
  return "Boa noite";
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

  const cards: {
    label: string;
    value: string;
    href: string;
    icon: IconName;
    highlight?: boolean;
    tone: string;
  }[] = [
    {
      label: "Pedidos pendentes",
      value: String(pending),
      href: "/admin/pedidos?status=PENDING",
      icon: "clock",
      highlight: pending > 0,
      tone: "bg-amber-100 text-amber-700",
    },
    {
      label: "Pedidos hoje",
      value: String(todayCount),
      href: "/admin/pedidos",
      icon: "bag",
      tone: "bg-sky-100 text-sky-700",
    },
    {
      label: "Vendas (sem cancelados)",
      value: formatKz(revenue._sum.total ?? 0),
      href: "/admin/pedidos",
      icon: "cash",
      tone: "bg-emerald-100 text-emerald-700",
    },
    {
      label: "Produtos ativos",
      value: String(activeProducts),
      href: "/admin/produtos",
      icon: "tag",
      tone: "bg-violet-100 text-violet-700",
    },
    {
      label: "Stock baixo (≤ 3)",
      value: String(lowStock),
      href: "/admin/produtos",
      icon: "alert",
      highlight: lowStock > 0,
      tone: "bg-rose-100 text-rose-700",
    },
  ];

  const dateLabel = new Date().toLocaleDateString("pt-PT", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "Africa/Luanda",
  });

  return (
    <div className="space-y-6">
      {/* CABEÇALHO */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm capitalize text-neutral-500">{dateLabel}</p>
          <h1 className="text-3xl font-extrabold tracking-tight">{greeting()} 👋</h1>
          <p className="mt-0.5 text-sm text-neutral-500">Aqui está o resumo da sua loja.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/produtos"
            className="inline-flex items-center gap-2 rounded-full border bg-white px-4 py-2 text-sm font-medium transition hover:-translate-y-0.5 hover:border-black"
          >
            <Icon name="tag" className="h-4 w-4" />
            Produtos
          </Link>
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-2 rounded-full bg-black px-4 py-2 text-sm font-medium text-white transition hover:-translate-y-0.5 hover:bg-neutral-800"
          >
            <Icon name="store" className="h-4 w-4" />
            Ver loja
          </Link>
        </div>
      </div>

      {/* AVISO DE PEDIDOS PENDENTES */}
      {pending > 0 && (
        <Link
          href="/admin/pedidos?status=PENDING"
          className="group flex items-center justify-between gap-3 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-300 p-4 text-black shadow-sm transition hover:shadow-md"
        >
          <span className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-black/10">
              <Icon name="clock" />
            </span>
            <span className="text-sm font-semibold">
              {pending === 1 ? "Tem 1 pedido à espera de confirmação" : `Tem ${pending} pedidos à espera de confirmação`}
            </span>
          </span>
          <span className="inline-flex items-center gap-1 text-sm font-semibold">
            Ver agora
            <Icon name="arrow" className="h-4 w-4 transition group-hover:translate-x-1" />
          </span>
        </Link>
      )}

      {/* CARTÕES */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className={`group relative overflow-hidden rounded-2xl border bg-white p-4 transition duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/5 ${
              c.highlight ? "border-amber-400 bg-amber-50/40" : ""
            }`}
          >
            <div className="flex items-start justify-between">
              <span
                className={`grid h-10 w-10 place-items-center rounded-xl transition duration-300 group-hover:scale-110 ${c.tone}`}
              >
                <Icon name={c.icon} />
              </span>
              <Icon
                name="arrow"
                className="h-4 w-4 -translate-x-1 text-neutral-300 opacity-0 transition duration-300 group-hover:translate-x-0 group-hover:opacity-100"
              />
            </div>
            <p className="mt-4 text-xs text-neutral-500">{c.label}</p>
            <p className="mt-0.5 text-2xl font-extrabold tracking-tight">{c.value}</p>
            {c.highlight && (
              <span className="absolute right-3 top-3 flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
                <span className="relative h-2.5 w-2.5 rounded-full bg-amber-500" />
              </span>
            )}
          </Link>
        ))}
      </div>

      {/* ÚLTIMOS PEDIDOS */}
      <div className="overflow-hidden rounded-2xl border bg-white">
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="font-semibold">Últimos pedidos</h2>
          <Link
            href="/admin/pedidos"
            className="group inline-flex items-center gap-1 text-sm font-medium hover:underline"
          >
            Ver todos
            <Icon name="arrow" className="h-4 w-4 transition group-hover:translate-x-1" />
          </Link>
        </div>
        {recent.length === 0 ? (
          <div className="flex flex-col items-center gap-2 p-10 text-center text-sm text-neutral-500">
            <span className="grid h-14 w-14 place-items-center rounded-full bg-neutral-100 text-neutral-400">
              <Icon name="inbox" className="h-7 w-7" />
            </span>
            Ainda não há pedidos.
          </div>
        ) : (
          <ul className="divide-y">
            {recent.map((o) => (
              <li key={o.id}>
                <Link
                  href={`/admin/pedidos/${o.id}`}
                  className="group flex items-center justify-between gap-3 p-4 transition hover:bg-neutral-50"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-black text-sm font-bold text-white">
                      {o.customerName.trim().charAt(0).toUpperCase() || "?"}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-medium">
                        #{o.orderNumber} · {o.customerName}
                      </p>
                      <p className="text-xs text-neutral-500">{fmtDate(o.createdAt)}</p>
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
    </div>
  );
}