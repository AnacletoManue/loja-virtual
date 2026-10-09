import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatKz } from "@/lib/format";
import { PAYMENT_LABELS } from "@/lib/pdf";
import { whatsappLink } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
  if (!order) notFound();

  const wa = whatsappLink();

  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-16">
      {/* BANNER DE SUCESSO VIBRANTE */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 p-8 text-center text-white shadow-2xl shadow-emerald-600/20">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-3xl font-black text-emerald-600 shadow-lg animate-in zoom-in-50">
          ✓
        </span>
        
        <h1 className="font-display mt-4 text-3xl font-black sm:text-4xl">
          Pedido Confirmado com Sucesso!
        </h1>
        <p className="mt-2 text-sm font-medium text-emerald-100">
          Número da Encomenda: <strong className="rounded-md bg-white/20 px-2 py-0.5 font-black text-white">#{order.orderNumber}</strong>
        </p>
      </div>

      {/* DETALHES DE ENTREGA & CONTACTO */}
      <div className="space-y-3 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xl shadow-slate-100 text-sm">
        <h2 className="font-display text-lg font-black text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
          <span>Dados do Cliente & Entrega</span>
          <span className="rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-bold text-emerald-700">
            Aguardando Confirmação
          </span>
        </h2>

        <div className="grid gap-2.5 pt-1 text-slate-700 font-medium">
          <div className="flex justify-between">
            <span className="text-slate-500">Nome:</span>
            <strong className="text-slate-900">{order.customerName}</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Telefone:</span>
            <strong className="text-slate-900">{order.phone}</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Local de Entrega:</span>
            <strong className="text-slate-900 text-right">{order.address}</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Forma de Pagamento:</span>
            <strong className="text-rose-600">{PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod}</strong>
          </div>
          {order.notes && (
            <div className="mt-2 rounded-2xl bg-slate-50 p-3 text-xs text-slate-600 border border-slate-100">
              <strong className="text-slate-900 block mb-0.5">Observações:</strong>
              {order.notes}
            </div>
          )}
        </div>
      </div>

      {/* RESUMO DOS ITENS */}
      <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-xl shadow-slate-100">
        <div className="bg-slate-50 border-b border-slate-100 px-6 py-4">
          <h2 className="font-display text-base font-black text-slate-900">
            Resumo dos Artigos
          </h2>
        </div>

        <ul className="divide-y divide-slate-100 text-sm font-medium">
          {order.items.map((i) => (
            <li key={i.id} className="flex justify-between items-center gap-3 p-5">
              <div className="flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-100 font-black text-xs text-rose-600">
                  {i.quantity}×
                </span>
                <span className="font-bold text-slate-800">{i.name}</span>
              </div>
              <span className="font-black text-slate-900">{formatKz(i.unitPrice * i.quantity)}</span>
            </li>
          ))}
        </ul>

        <div className="flex items-center justify-between border-t-2 border-slate-100 bg-slate-50/50 p-6 text-base font-black text-slate-900">
          <span>Total do Pedido</span>
          <span className="font-display text-2xl text-rose-600">{formatKz(order.total)}</span>
        </div>
      </div>

      {/* BOTÕES DE AÇÃO DESTACADOS */}
      <div className="space-y-3">
        {/* BOTÃO ENVIAR NO WHATSAPP */}
        <a
          href={`${wa}?text=${encodeURIComponent(
            `Olá! Acabei de fazer a encomenda #${order.orderNumber} no valor de${formatKz(
              order.total
            )}. Gostaria de confirmar a entrega!`
          )}`}
          target="_blank"
          rel="noreferrer"
          className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-[#25D366] py-4 font-black text-white shadow-xl shadow-[#25D366]/20 transition-all hover:bg-[#22bf5b] active:scale-98"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
            <path d="M4 5h16v11H9l-5 4z" />
          </svg>
          <span>Confirmar Pedido via WhatsApp</span>
        </a>

        {/* BOTÃO BAIXAR PDF */}
        <a
          href={`/api/pedidos/${order.id}/pdf`}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-slate-200 bg-white py-3.5 font-bold text-slate-800 shadow-sm transition-all hover:border-slate-900 hover:bg-slate-900 hover:text-white"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
            <path d="M7 3h7l5 5v13H7z" />
            <path d="M14 3v5h5M10 13h6M10 17h6" />
          </svg>
          <span>Descarregar Comprovativo em PDF</span>
        </a>
      </div>

      <div className="text-center space-y-2 pt-2">
        <p className="text-xs font-semibold text-slate-500">
          Guarde o comprovativo PDF. A nossa equipa entrará em contacto no WhatsApp para agendar a entrega.
        </p>
        <Link
          href="/produtos"
          className="inline-block text-xs font-black uppercase tracking-wider text-rose-600 transition hover:underline"
        >
          ← Voltar à loja para ver mais peças
        </Link>
      </div>
    </div>
  );
}