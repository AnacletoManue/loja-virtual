import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatKz } from "@/lib/format";
import { STATUS_LABELS, STATUS_STYLES, PAYMENT_LABELS, fmtDate } from "@/lib/labels";
import { updateOrderStatus } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

export default async function OrderDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
  if (!order) notFound();

  const digits = order.phone.replace(/\D/g, "");
  const wa = digits.length === 9 ? `244${digits}` : digits;
  const cancelled = order.status === "CANCELLED";

  return (
    <div className="space-y-4">
      <Link href="/admin/pedidos" className="text-sm text-neutral-600 underline">← Voltar aos pedidos</Link>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold">Pedido #{order.orderNumber}</h1>
          <p className="text-sm text-neutral-500">{fmtDate(order.createdAt)}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-sm ${STATUS_STYLES[order.status]}`}>
          {STATUS_LABELS[order.status]}
        </span>
      </div>

      <div className="space-y-1.5 rounded-xl border bg-white p-4 text-sm">
        <p><strong>Cliente:</strong> {order.customerName}</p>
        <p>
          <strong>Telefone:</strong> {order.phone}{" "}
          <a href={`https://wa.me/${wa}`} target="_blank" rel="noreferrer" className="ml-2 text-green-700 underline">
            WhatsApp
          </a>{" "}
          <a href={`tel:${digits}`} className="ml-2 underline">Ligar</a>
        </p>
        <p><strong>Entrega:</strong> {order.address}</p>
        <p><strong>Pagamento:</strong> {PAYMENT_LABELS[order.paymentMethod]}</p>
        {order.notes && <p><strong>Observações:</strong> {order.notes}</p>}
      </div>

      <ul className="divide-y rounded-xl border bg-white">
        {order.items.map((i) => (
          <li key={i.id} className="flex justify-between gap-3 p-4 text-sm">
            <span>{i.quantity} × {i.name} <span className="text-neutral-400">({formatKz(i.unitPrice)})</span></span>
            <span className="font-medium">{formatKz(i.unitPrice * i.quantity)}</span>
          </li>
        ))}
        <li className="flex justify-between p-4 text-lg font-bold">
          <span>Total</span>
          <span>{formatKz(order.total)}</span>
        </li>
      </ul>

      <div className="space-y-3 rounded-xl border bg-white p-4">
        <h2 className="font-semibold">Estado do pedido</h2>
        <form action={updateOrderStatus.bind(null, order.id)} className="flex flex-wrap gap-2">
          <select
            name="status"
            defaultValue={order.status}
            disabled={cancelled}
            className="rounded-lg border bg-white px-3 py-2 text-sm disabled:opacity-60"
          >
            {Object.entries(STATUS_LABELS).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
          <button disabled={cancelled} className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-40">
            Atualizar
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
        className="inline-block rounded-lg border bg-white px-4 py-2 text-sm font-medium hover:bg-neutral-50"
      >
        Baixar PDF do pedido
      </a>
    </div>
  );
}
