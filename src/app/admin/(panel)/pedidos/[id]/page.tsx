import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatKz } from "@/lib/format";
import { STATUS_LABELS, STATUS_STYLES, PAYMENT_LABELS, fmtDate } from "@/lib/labels";
import { updateOrderStatus } from "@/app/admin/actions";
import type { OrderStatus } from "@/lib/db-types";

export const dynamic = "force-dynamic";

/* ---------- Ícones (SVG inline) ---------- */
const ICONS = {
  back: <path d="M19 12H5M11 6l-6 6 6 6" />,
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </>
  ),
  phone: (
    <path d="M6 3h4l1.5 4.5-2 1.5a11 11 0 0 0 5.5 5.5l1.5-2L21 14v4a2 2 0 0 1-2 2A16 16 0 0 1 4 5a2 2 0 0 1 2-2z" />
  ),
  chat: <path d="M4 5h16v11H9l-5 4z" />,
  pin: (
    <>
      <path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </>
  ),
  card: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="M3 10h18M7 15h3" />
    </>
  ),
  note: (
    <>
      <path d="M5 4h14v16H5z" />
      <path d="M9 9h6M9 13h6M9 17h3" />
    </>
  ),
  download: (
    <>
      <path d="M12 4v12M6 11l6 6 6-6" />
      <path d="M4 20h16" />
    </>
  ),
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  refresh: (
    <>
      <path d="M20 11a8 8 0 0 0-14-4L4 9" />
      <path d="M4 4v5h5M4 13a8 8 0 0 0 14 4l2-2" />
      <path d="M20 20v-5h-5" />
    </>
  ),
  alert: (
    <>
      <path d="M12 3l10 18H2z" />
      <path d="M12 10v4M12 17.5v.01" />
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

const FLOW: OrderStatus[] = ["PENDING", "CONFIRMED", "DELIVERED"];

export default async function OrderDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
  if (!order) notFound();

  const digits = order.phone.replace(/\D/g, "");
  const wa = digits.length === 9 ? `244${digits}` : digits;
  const cancelled = order.status === "CANCELLED";
  const step = FLOW.indexOf(order.status);

  const info: { icon: IconName; label: string; value: string }[] = [
    { icon: "user", label: "Cliente", value: order.customerName },
    { icon: "pin", label: "Entrega", value: order.address },
    { icon: "card", label: "Pagamento", value: PAYMENT_LABELS[order.paymentMethod] },
  ];

  return (
    <div className="space-y-5">
      <Link
        href="/admin/pedidos"
        className="group inline-flex items-center gap-1.5 text-sm text-neutral-600 transition hover:text-black"
      >
        <Icon name="back" className="h-4 w-4 transition group-hover:-translate-x-1" />
        Voltar aos pedidos
      </Link>

      {/* CABEÇALHO */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-black text-xl font-bold text-white">
            {order.customerName.trim().charAt(0).toUpperCase() || "?"}
          </span>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">Pedido #{order.orderNumber}</h1>
            <p className="text-sm text-neutral-500">{fmtDate(order.createdAt)}</p>
          </div>
        </div>
        <span className={`rounded-full px-4 py-1.5 text-sm font-medium ${STATUS_STYLES[order.status]}`}>
          {STATUS_LABELS[order.status]}
        </span>
      </div>

      {/* PROGRESSO DO PEDIDO */}
      {cancelled ? (
        <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <Icon name="alert" className="h-5 w-5 shrink-0" />
          Este pedido foi cancelado. As peças já voltaram ao stock.
        </div>
      ) : (
        <div className="rounded-2xl border bg-white p-5">
          <ol className="flex items-center">
            {FLOW.map((s, i) => {
              const done = i < step;
              const current = i === step;
              return (
                <li key={s} className={`flex items-center ${i < FLOW.length - 1 ? "flex-1" : ""}`}>
                  <div className="flex flex-col items-center gap-1.5">
                    <span
                      className={`grid h-9 w-9 place-items-center rounded-full border-2 text-sm font-bold transition ${
                        done
                          ? "border-black bg-black text-white"
                          : current
                          ? "border-black bg-white text-black ring-4 ring-black/10"
                          : "border-neutral-200 bg-white text-neutral-300"
                      }`}
                    >
                      {done ? <Icon name="check" className="h-4 w-4" /> : i + 1}
                    </span>
                    <span
                      className={`text-xs font-medium ${done || current ? "text-black" : "text-neutral-400"}`}
                    >
                      {STATUS_LABELS[s]}
                    </span>
                  </div>
                  {i < FLOW.length - 1 && (
                    <span
                      className={`mx-2 mb-5 h-0.5 flex-1 rounded-full ${done ? "bg-black" : "bg-neutral-200"}`}
                    />
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      )}

      {/* CLIENTE */}
      <div className="rounded-2xl border bg-white p-5">
        <ul className="grid gap-4 sm:grid-cols-2">
          {info.map((i) => (
            <li key={i.label} className="flex items-start gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-neutral-100 text-neutral-600">
                <Icon name={i.icon} />
              </span>
              <div className="min-w-0">
                <p className="text-xs text-neutral-500">{i.label}</p>
                <p className="break-words text-sm font-medium">{i.value}</p>
              </div>
            </li>
          ))}
          <li className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-neutral-100 text-neutral-600">
              <Icon name="phone" />
            </span>
            <div>
              <p className="text-xs text-neutral-500">Telefone</p>
              <p className="text-sm font-medium">{order.phone}</p>
            </div>
          </li>
          {order.notes && (
            <li className="flex items-start gap-3 sm:col-span-2">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-100 text-amber-700">
                <Icon name="note" />
              </span>
              <div>
                <p className="text-xs text-neutral-500">Observações</p>
                <p className="text-sm font-medium">{order.notes}</p>
              </div>
            </li>
          )}
        </ul>

        <div className="mt-5 flex flex-wrap gap-2 border-t pt-4">
          <a
            href={`https://wa.me/${wa}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:brightness-110"
          >
            <Icon name="chat" className="h-4 w-4" />
            WhatsApp
          </a>
          <a
            href={`tel:${digits}`}
            className="inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold transition hover:-translate-y-0.5 hover:border-black"
          >
            <Icon name="phone" className="h-4 w-4" />
            Ligar
          </a>
        </div>
      </div>

      {/* PEÇAS */}
      <ul className="divide-y overflow-hidden rounded-2xl border bg-white">
        {order.items.map((i) => (
          <li key={i.id} className="flex items-center justify-between gap-3 p-4 text-sm transition hover:bg-neutral-50">
            <span className="flex items-center gap-3">
              <span className="grid h-8 min-w-8 place-items-center rounded-lg bg-neutral-100 px-2 text-xs font-bold">
                {i.quantity}×
              </span>
              <span>
                {i.name} <span className="text-neutral-400">({formatKz(i.unitPrice)})</span>
              </span>
            </span>
            <span className="font-medium">{formatKz(i.unitPrice * i.quantity)}</span>
          </li>
        ))}
        <li className="flex items-center justify-between bg-black p-4 text-lg font-bold text-white">
          <span>Total</span>
          <span>{formatKz(order.total)}</span>
        </li>
      </ul>

      {/* ESTADO DO PEDIDO */}
      <div className="space-y-4 rounded-2xl border bg-white p-5">
        <h2 className="font-semibold">Estado do pedido</h2>
        <form action={updateOrderStatus.bind(null, order.id)} className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {Object.entries(STATUS_LABELS).map(([v, l]) => (
              <label key={v} className="cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value={v}
                  defaultChecked={order.status === v}
                  disabled={cancelled}
                  className="peer sr-only"
                />
                <span className="block rounded-full border px-4 py-2 text-sm font-medium transition hover:border-black peer-checked:border-black peer-checked:bg-black peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-black/40 peer-disabled:cursor-not-allowed peer-disabled:opacity-50">
                  {l}
                </span>
              </label>
            ))}
          </div>
          <button
            disabled={cancelled}
            className="inline-flex items-center gap-2 rounded-full bg-black px-6 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-neutral-800 active:translate-y-0 disabled:pointer-events-none disabled:opacity-40"
          >
            <Icon name="refresh" className="h-4 w-4" />
            Atualizar estado
          </button>
        </form>
        <p className="text-xs text-neutral-500">
          {cancelled
            ? "Pedido cancelado: as peças já voltaram ao stock e o pedido não pode ser reativado."
            : "Ao cancelar, as peças voltam automaticamente ao stock. Um pedido cancelado não pode ser reativado."}
        </p>
      </div>

      <a
        href={`/api/pedidos/${order.id}/pdf`}
        className="group inline-flex items-center gap-2 rounded-full border bg-white px-5 py-2.5 text-sm font-semibold transition hover:-translate-y-0.5 hover:border-black"
      >
        <Icon name="download" className="h-4 w-4 transition group-hover:translate-y-0.5" />
        Baixar PDF do pedido
      </a>
    </div>
  );
}