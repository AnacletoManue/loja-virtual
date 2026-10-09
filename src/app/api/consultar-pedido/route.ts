import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hit, getClientIp, HOUR } from "@/lib/ratelimit";
import { normalizePhone } from "@/lib/phone";

const NOT_FOUND = "Pedido não encontrado ou o telefone não corresponde aos dados da compra.";

const LOOKUPS_PER_IP_HOUR = 10;
const LOOKUPS_PER_ORDER_HOUR = 5;

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as { query?: unknown; phone?: unknown };

    const query = String(body.query ?? "").trim().replace(/^#/, "");
    const phone = normalizePhone(String(body.phone ?? ""));

    if (!query || phone.length < 9) {
      return NextResponse.json(
        { error: "Insira o número/ID do pedido e o seu telefone." },
        { status: 400 }
      );
    }
    if (query.length > 40) return NextResponse.json({ error: NOT_FOUND }, { status: 404 });

    const isNumber = /^\d{1,9}$/.test(query);
    const orderKey = isNumber ? `n:${Number(query)}` : `i:${query.toLowerCase()}`;

    // Limites: impedem adivinhar telefones ou varrer números de pedido
    const ip = await getClientIp();
    const byIp = await hit(`lookup:ip:${ip}`, LOOKUPS_PER_IP_HOUR, HOUR);
    const byOrder = await hit(`lookup:order:${orderKey}`, LOOKUPS_PER_ORDER_HOUR, HOUR);
    if (!byIp.allowed || !byOrder.allowed) {
      const wait = Math.max(byIp.retryAfterSec, byOrder.retryAfterSec);
      return NextResponse.json(
        { error: `Demasiadas consultas. Tente novamente dentro de ${Math.ceil(wait / 60)} minuto(s).` },
        { status: 429, headers: { "Retry-After": String(wait) } }
      );
    }

    const order = await prisma.order.findFirst({
      where: isNumber ? { orderNumber: Number(query) } : { id: query },
      select: { publicToken: true, phone: true },
    });

    // Telefone tem de ser IGUAL (sem "contains"), e a resposta é a mesma nos dois casos
    if (!order || normalizePhone(order.phone) !== phone) {
      return NextResponse.json({ error: NOT_FOUND }, { status: 404 });
    }

    return NextResponse.json({ token: order.publicToken });
  } catch {
    return NextResponse.json({ error: "Erro ao consultar o pedido." }, { status: 500 });
  }
}
