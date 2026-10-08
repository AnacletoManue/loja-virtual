import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatKz } from "@/lib/format";
import { PAYMENT_LABELS } from "@/lib/pdf";

export const dynamic = "force-dynamic";

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
  if (!order) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div className="rounded-xl border bg-white p-5 text-center">
        <p className="text-3xl">✓</p>
        <h1 className="mt-2 text-2xl font-bold">Pedido recebido!</h1>
        <p className="text-neutral-600">Número do pedido: <strong>#{order.orderNumber}</strong></p>
      </div>

      <div className="space-y-1 rounded-xl border bg-white p-5 text-sm">
        <p><strong>Nome:</strong> {order.customerName}</p>
        <p><strong>Telefone:</strong> {order.phone}</p>
        <p><strong>Entrega:</strong> {order.address}</p>
        <p><strong>Pagamento:</strong> {PAYMENT_LABELS[order.paymentMethod]}</p>
        {order.notes && <p><strong>Observações:</strong> {order.notes}</p>}
      </div>

      <ul className="divide-y rounded-xl border bg-white">
        {order.items.map((i) => (
          <li key={i.id} className="flex justify-between gap-3 p-4 text-sm">
            <span>{i.quantity} × {i.name}</span>
            <span className="font-medium">{formatKz(i.unitPrice * i.quantity)}</span>
          </li>
        ))}
        <li className="flex justify-between p-4 text-lg font-bold">
          <span>Total</span>
          <span>{formatKz(order.total)}</span>
        </li>
      </ul>

      <a
        href={`/api/pedidos/${order.id}/pdf`}
        className="block rounded-lg bg-black py-3 text-center font-medium text-white"
      >
        Baixar PDF do pedido
      </a>
      <p className="text-center text-xs text-neutral-500">
        Guarde este PDF. A loja entrará em contacto para confirmar o pedido.
      </p>
    </div>
  );
}
