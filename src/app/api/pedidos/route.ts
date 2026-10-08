import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { PaymentMethod } from "../../../../generated/prisma/client";

const PAYMENTS: PaymentMethod[] = [
  "CASH_ON_DELIVERY",
  "BANK_TRANSFER",
  "MULTICAIXA_EXPRESS",
  "REFERENCE",
];

class OrderError extends Error {}

const fail = (error: string, status = 400) =>
  NextResponse.json({ error }, { status });

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return fail("Pedido inválido.");
  }

  const customerName = String(body.customerName ?? "").trim();
  const phone = String(body.phone ?? "").trim();
  const address = String(body.address ?? "").trim();
  const notes = String(body.notes ?? "").trim();
  const paymentMethod = body.paymentMethod as PaymentMethod;

  if (customerName.length < 2 || customerName.length > 100) return fail("Nome inválido.");
  if (phone.replace(/\D/g, "").length < 9 || phone.length > 20) return fail("Telefone inválido.");
  if (address.length < 3 || address.length > 300) return fail("Endereço inválido.");
  if (notes.length > 500) return fail("Observações demasiado longas.");
  if (!PAYMENTS.includes(paymentMethod)) return fail("Método de pagamento inválido.");

  // Junta produtos repetidos e valida quantidades
  const rawItems = Array.isArray(body.items) ? body.items : [];
  if (rawItems.length === 0 || rawItems.length > 50) return fail("Carrinho inválido.");

  const wanted = new Map<string, number>();
  for (const it of rawItems) {
    const productId = String((it as { productId?: unknown }).productId ?? "");
    const quantity = Number((it as { quantity?: unknown }).quantity);
    if (!productId || !Number.isInteger(quantity) || quantity < 1 || quantity > 100) {
      return fail("Carrinho inválido.");
    }
    wanted.set(productId, (wanted.get(productId) ?? 0) + quantity);
  }

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

        // Decremento atómico: só funciona se ainda houver stock
        const r = await tx.product.updateMany({
          where: { id: p.id, stock: { gte: quantity } },
          data: { stock: { decrement: quantity } },
        });
        if (r.count === 0) throw new OrderError(`Stock insuficiente: ${p.name}`);

        // Preço e nome vêm SEMPRE da base de dados, nunca do cliente
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

    return NextResponse.json({ id: order.id, orderNumber: order.orderNumber }, { status: 201 });
  } catch (e) {
    if (e instanceof OrderError) return fail(e.message, 409);
    console.error("Erro ao criar pedido:", e);
    return fail("Erro interno. Tente novamente.", 500);
  }
}
