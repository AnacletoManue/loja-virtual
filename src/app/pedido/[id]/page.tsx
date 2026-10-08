import { notFound } from "next/navigation";
import Link from "next/link";
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
      <div className="rounded-3xl bg-[var(--brand)] p-8 text-center text-white">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white text-2xl text-[var(--brand)]">✓</span>
        <h1 className="font-display mt-4 text-4xl font-extrabold">Pedido recebido</h1>
        <p className="mt-1 text-white/80">Número do pedido: <strong>#{order.orderNumber}</strong></p>
      </div>

      <div className="space-y-2 rounded-3xl bg-white p-6 text-sm">
        <p><strong>Nome:</strong> {order.customerName}</p>
        <p><strong>Telefone:</strong> {order.phone}</p>
        <p><strong>Entrega:</strong> {order.address}</p>
        <p><strong>Pagamento:</strong> {PAYMENT_LABELS[order.paymentMethod]}</p>
        {order.notes && <p><strong>Observações:</strong> {order.notes}</p>}
      </div>

      <ul className="divide-y divide-black/10 rounded-3xl bg-white">
        {order.items.map((i) => (
          <li key={i.id} className="flex justify-between gap-3 p-5 text-sm">
            <span>{i.quantity} × {i.name}</span>
            <span className="font-medium">{formatKz(i.unitPrice * i.quantity)}</span>
          </li>
        ))}
        <li className="flex justify-between p-5 text-lg font-bold">
          <span>Total</span>
          <span>{formatKz(order.total)}</span>
        </li>
      </ul>

      <a href={`/api/pedidos/${order.id}/pdf`} className="block rounded-full bg-black py-4 text-center font-semibold text-white transition hover:bg-[var(--brand)]">
        Baixar PDF do pedido
      </a>
      <p className="text-center text-sm text-neutral-500">
        Guarde este PDF. A loja entrará em contacto para confirmar o pedido.
      </p>
      <Link href="/produtos" className="block text-center text-sm underline">Voltar à loja</Link>
    </div>
  );
}