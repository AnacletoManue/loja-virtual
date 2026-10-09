import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hit, getClientIp, HOUR } from "@/lib/ratelimit";
import type { PaymentMethod } from "@/lib/db-types";
import { normalizePhone } from "@/lib/phone";

const PAYMENTS: PaymentMethod[] = [
  "CASH_ON_DELIVERY",
  "BANK_TRANSFER",
  "MULTICAIXA_EXPRESS",
  "REFERENCE",
];

const ORDERS_PER_IP_HOUR = 6;
const ORDERS_PER_PHONE_HOUR = 4;
const MAX_PENDING_PER_PHONE = 3;
const MAX_UNITS_PER_ORDER = 30;
const MIN_FORM_TIME_MS = 2500;

class OrderError extends Error {}

const fail = (error: string, status = 400, headers?: Record<string, string>) =>
  NextResponse.json({ error }, { status, headers });

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return fail("Pedido inválido.");
  }

  // 1) Anti-robô: campo isca (honeypot) e tempo mínimo de preenchimento
  if (String(body.website ?? "").trim() !== "") return fail("Pedido inválido.");
  const elapsed = Number(body.elapsedMs);
  if (!Number.isFinite(elapsed) || elapsed < MIN_FORM_TIME_MS) {
    return fail("Aguarde um instante e tente novamente.");
  }

  // 2) Validação dos dados
  const customerName = String(body.customerName ?? "").trim();
  const phone = normalizePhone(String(body.phone ?? ""));
  const address = String(body.address ?? "").trim();
  const notes = String(body.notes ?? "").trim();
  const paymentMethod = body.paymentMethod as PaymentMethod;

  if (customerName.length < 2 || customerName.length > 100) return fail("Nome inválido.");
  if (phone.length < 9 || phone.length > 15) return fail("Telefone inválido.");
  if (address.length < 3 || address.length > 300) return fail("Endereço inválido.");
  if (notes.length > 500) return fail("Observações demasiado longas.");
  if (!PAYMENTS.includes(paymentMethod)) return fail("Método de pagamento inválido.");

  const rawItems = Array.isArray(body.items) ? body.items : [];
  if (rawItems.length === 0 || rawItems.length > 50) return fail("Carrinho inválido.");

  const wanted = new Map<string, number>();
  let units = 0;
  for (const it of rawItems) {
    const productId = String((it as { productId?: unknown }).productId ?? "");
    const quantity = Number((it as { quantity?: unknown }).quantity);
    if (!productId || !Number.isInteger(quantity) || quantity < 1 || quantity > 100) {
      return fail("Carrinho inválido.");
    }
    units += quantity;
    wanted.set(productId, (wanted.get(productId) ?? 0) + quantity);
  }
  if (units > MAX_UNITS_PER_ORDER) {
    return fail(`Máximo de ${MAX_UNITS_PER_ORDER} peças por pedido. Fale connosco para encomendas maiores.`);
  }

  // 3) Limites de pedidos (por IP e por telefone)
  const ip = await getClientIp();
  const byIp = await hit(`order:ip:${ip}`, ORDERS_PER_IP_HOUR, HOUR);
  if (!byIp.allowed) {
    return fail("Demasiados pedidos. Tente novamente mais tarde.", 429, {
      "Retry-After": String(byIp.retryAfterSec),
    });
  }
  const byPhone = await hit(`order:phone:${phone}`, ORDERS_PER_PHONE_HOUR, HOUR);
  if (!byPhone.allowed) {
    return fail("Demasiados pedidos com este telefone. Tente novamente mais tarde.", 429, {
      "Retry-After": String(byPhone.retryAfterSec),
    });
  }

  // 4) Limite de pedidos pendentes por telefone (evita "reservar" todo o stock)
  const pending = await prisma.order.count({ where: { phone, status: "PENDING" } });
  if (pending >= MAX_PENDING_PER_PHONE) {
    return fail("Já tem pedidos pendentes. Aguarde o nosso contacto para confirmar.", 429);
  }

  // 5) Criação do pedido (transação + stock atómico)
  try {
    const order = await prisma.$transaction(async (tx) => {
      const products = await tx.product.findMany({
        where: { id: { in: [...wanted.keys()] }, active: true },
      });

      let total = 0;
      const items: { productId: string; name: string; unitPrice: number; quantity: number }[] = [];

      for (const [productId, quantity] of wanted) {
        const p = products.find((x) => x.id === productId);
        if (!p) throw new OrderError("Um dos produtos já não está disponível.");

        const r = await tx.product.updateMany({
          where: { id: p.id, stock: { gte: quantity } },
          data: { stock: { decrement: quantity } },
        });
        if (r.count === 0) throw new OrderError(`Stock insuficiente: ${p.name}`);

        total += p.price * quantity;
        items.push({ productId: p.id, name: p.name, unitPrice: p.price, quantity });
      }

      return tx.order.create({
        data: {
          customerName,
          phone,
          address,
          notes: notes || null,
          paymentMethod,
          total,
          items: { create: items },
        },
      });
    });

    return NextResponse.json({ token: order.publicToken, orderNumber: order.orderNumber }, { status: 201 });
  } catch (e) {
    if (e instanceof OrderError) return fail(e.message, 409);
    console.error("Erro ao criar pedido:", e);
    return fail("Erro interno. Tente novamente.", 500);
  }
}
