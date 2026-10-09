import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildOrderPdf } from "@/lib/pdf";
import { isToken } from "@/lib/token";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// O "id" desta rota é o código secreto (publicToken) do pedido
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const notFound = () => NextResponse.json({ error: "Pedido não encontrado." }, { status: 404 });

  if (!isToken(id)) return notFound();

  const order = await prisma.order.findUnique({
    where: { publicToken: id },
    include: { items: true },
  });
  if (!order) return notFound();

  const bytes = await buildOrderPdf(order);

  return new NextResponse(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="pedido-${order.orderNumber}.pdf"`,
      "Cache-Control": "private, no-store",
      "X-Robots-Tag": "noindex",
    },
  });
}
