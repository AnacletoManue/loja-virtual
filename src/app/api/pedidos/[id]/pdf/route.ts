import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildOrderPdf } from "@/lib/pdf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });
  if (!order) return NextResponse.json({ error: "Pedido não encontrado." }, { status: 404 });

  const bytes = await buildOrderPdf(order);

  return new NextResponse(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="pedido-${order.orderNumber}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
