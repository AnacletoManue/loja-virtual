import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatKz } from "@/lib/format";
import { STATUS_LABELS, STATUS_STYLES, fmtDate } from "@/lib/labels";
import { SITE } from "@/lib/site";

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
  cart: (
    <>
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
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
      className={`shrink-0 inline-block ${className}`}
      aria-hidden="true"
    >
      {ICONS[name]}
    </svg>
  );
}

function greeting() {
  const h = parseInt(
    new Intl.DateTimeFormat("pt-PT", {
      hour: "numeric",
      hourCycle: "h23",
      timeZone: "Africa/Luanda",
    }).format(new Date()),
    10
  );
  if (h < 12) return "Bom dia";
  if (h < 19) return "Boa tarde";
  return "Boa noite";
}

export default async function Dashboard() {
  const today = startOfTodayLuanda();

  const [activeProducts, lowStock, pending, todayCount, revenue, recent] =
    await Promise.all([
      prisma.product.count({ where: { active: true } }),
      prisma.product.count({ where: { active: true, stock: { lte: 3 } } }),
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.order.count({ where: { createdAt: { gte: today } } }),
      prisma.order.aggregate({
        _sum: { total: true },
        where: { status: { not: "CANCELLED" } },
      }),
      prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
    ]);

  const cards: {
    label: string;
    value: string;
    href: string;
    icon: IconName;
    highlight?: boolean;
    tone: string;
    cardBorder: string;
  }[] = [
    {
      label: "Pedidos Pendentes",
      value: String(pending),
      href: "/admin/pedidos?status=PENDING",
      icon: "clock",
      highlight: pending > 0,
      tone: "bg-amber-500 text-white shadow-amber-500/30",
      cardBorder: pending > 0 ? "border-amber-400 bg-amber-50/50" : "border-slate-200/80 bg-white",
    },
    {
      label: "Pedidos de Hoje",
      value: String(todayCount),
      href: "/admin/pedidos",
      icon: "cart",
      tone: "bg-sky-500 text-white shadow-sky-500/30",
      cardBorder: "border-slate-200/80 bg-white",
    },
    {
      label: "Vendas Totais",
      value: formatKz(revenue._sum.total ?? 0),
      href: "/admin/pedidos",
      icon: "cash",
      tone: "bg-emerald-500 text-white shadow-emerald-500/30",
      cardBorder: "border-slate-200/80 bg-white",
    },
    {
      label: "Produtos Ativos",
      value: String(activeProducts),
      href: "/admin/produtos",
      icon: "tag",
      tone: "bg-indigo-500 text-white shadow-indigo-500/30",
      cardBorder: "border-slate-200/80 bg-white",
    },
    {
      label: "Stock Baixo (≤ 3)",
      value: String(lowStock),
      href: "/admin/produtos",
      icon: "alert",
      highlight: lowStock > 0,
      tone: "bg-rose-500 text-white shadow-rose-500/30",
      cardBorder: lowStock > 0 ? "border-rose-300 bg-rose-50/40" : "border-slate-200/80 bg-white",
    },
  ];

  const dateLabel = new Date().toLocaleDateString("pt-PT", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "Africa/Luanda",
  });

  return (
    <div className="mx-auto max-w-7xl space-y-8 pb-16">
      {/* CABEÇALHO DA PÁGINA */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-6">
        <div className="space-y-1">
          <p className="text-xs font-black uppercase tracking-wider text-rose-600 capitalize">
            {dateLabel}
          </p>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-3xl font-black text-slate-900 sm:text-4xl">
              {greeting()}, Proprietário 👋
            </h1>
          </div>
          <p className="text-sm font-medium text-slate-500">
            Resumo geral de vendas, encomendas e catálogo da loja <strong className="text-slate-800">{SITE.name}</strong>.
          </p>
        </div>

        {/* ATALHOS RÁPIDOS */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/admin/produtos"
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200/80 bg-white px-5 py-3 text-xs font-black text-slate-800 shadow-sm transition hover:border-slate-900 hover:bg-slate-900 hover:text-white"
          >
            <Icon name="tag" className="h-4 w-4" />
            <span>Gerir Produtos</span>
          </Link>

          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-rose-600 to-rose-500 px-5 py-3 text-xs font-black text-white shadow-lg shadow-rose-600/30 transition hover:brightness-110 active:scale-95"
          >
            <Icon name="store" className="h-4 w-4" />
            <span>Ver Loja ao Vivo</span>
          </Link>
        </div>
      </div>

      {/* BANNER ALERTA DE PEDIDOS PENDENTES */}
      {pending > 0 && (
        <Link
          href="/admin/pedidos?status=PENDING"
          className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 p-5 text-slate-950 shadow-xl shadow-amber-500/20 transition hover:-translate-y-0.5"
        >
          <div className="flex items-center gap-3.5">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/40 shadow-inner">
              <Icon name="clock" className="h-6 w-6 text-slate-950" />
            </span>
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-amber-950/70">
                Ação Necessária
              </p>
              <p className="text-base font-black text-slate-950">
                {pending === 1
                  ? "Tem 1 novo pedido pendente para confirmar"
                  : `Tem ${pending} novos pedidos pendentes para confirmar`}
              </p>
            </div>
          </div>

          <span className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-xs font-black text-white shadow-md transition group-hover:bg-slate-800">
            <span>Aceder aos Pedidos</span>
            <Icon name="arrow" className="h-4 w-4 transition group-hover:translate-x-1" />
          </span>
        </Link>
      )}

      {/* GRELHA DE MÉTRICAS */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className={`group relative overflow-hidden rounded-3xl border p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/50 ${c.cardBorder}`}
          >
            <div className="flex items-start justify-between">
              <span
                className={`grid h-11 w-11 place-items-center rounded-2xl font-bold shadow-lg transition-transform duration-300 group-hover:scale-110 ${c.tone}`}
              >
                <Icon name={c.icon} className="h-5 w-5" />
              </span>

              <Icon
                name="arrow"
                className="h-4 w-4 text-slate-300 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100"
              />
            </div>

            <p className="mt-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
              {c.label}
            </p>
            <p className="mt-1 text-2xl font-black text-slate-900 tracking-tight">
              {c.value}
            </p>

            {c.highlight && (
              <span className="absolute right-3.5 top-3.5 flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
                <span className="relative h-3 w-3 rounded-full bg-amber-500" />
              </span>
            )}
          </Link>
        ))}
      </div>

      {/* SECÇÃO DOS ÚLTIMOS PEDIDOS */}
      <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-xl shadow-slate-100">
        <div className="flex items-center justify-between border-b border-slate-100 p-6">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-rose-600">
              Atividade Recente
            </span>
            <h2 className="font-display text-xl font-black text-slate-900">
              Últimas Encomendas
            </h2>
          </div>

          <Link
            href="/admin/pedidos"
            className="group inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-900 hover:text-white"
          >
            <span>Ver Lista Completa</span>
            <Icon name="arrow" className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
          </Link>
        </div>

        {recent.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <span className="grid h-16 w-16 place-items-center rounded-3xl bg-slate-100 text-slate-400 mb-3">
              <Icon name="inbox" className="h-8 w-8" />
            </span>
            <p className="font-black text-slate-800 text-base">Nenhum pedido registado ainda</p>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Assim que os clientes realizarem encomendas no site, elas aparecerão aqui em tempo real.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {recent.map((o) => (
              <li key={o.id}>
                <Link
                  href={`/admin/pedidos/${o.id}`}
                  className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 transition hover:bg-slate-50/80"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-r from-rose-600 to-amber-500 font-black text-base text-white shadow-md">
                      {o.customerName.trim().charAt(0).toUpperCase() || "?"}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-black text-sm text-slate-900 group-hover:text-rose-600 transition-colors">
                        #{o.orderNumber} · {o.customerName}
                      </p>
                      <p className="text-xs font-bold text-slate-400 mt-0.5">
                        {fmtDate(o.createdAt)}
                      </p>
                    </div>
                  </div>

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
    </div>
  );
}