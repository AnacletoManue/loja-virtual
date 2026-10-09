import "server-only";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

export const HOUR = 60 * 60 * 1000;

export async function getClientIp(): Promise<string> {
  const h = await headers();
  const fwd = h.get("x-forwarded-for");
  return (fwd?.split(",")[0] ?? h.get("x-real-ip") ?? "unknown").trim();
}

/**
 * Conta uma tentativa para `key` (janela fixa). Operação atómica no Postgres,
 * por isso pedidos em paralelo não furam o limite.
 */
export async function hit(key: string, limit: number, windowMs: number) {
  const now = new Date();
  const resetAt = new Date(now.getTime() + windowMs);

  const rows = await prisma.$queryRaw<{ count: number; resetAt: Date }[]>`
    INSERT INTO "RateLimit" ("key", "count", "resetAt")
    VALUES (${key}, 1, ${resetAt})
    ON CONFLICT ("key") DO UPDATE SET
      "count" = CASE WHEN "RateLimit"."resetAt" <= ${now} THEN 1 ELSE "RateLimit"."count" + 1 END,
      "resetAt" = CASE WHEN "RateLimit"."resetAt" <= ${now} THEN ${resetAt} ELSE "RateLimit"."resetAt" END
    RETURNING "count", "resetAt"
  `;

  // limpeza ocasional de registos antigos
  if (Math.random() < 0.02) {
    prisma.rateLimit
      .deleteMany({ where: { resetAt: { lt: new Date(Date.now() - 24 * HOUR) } } })
      .catch(() => {});
  }

  const { count, resetAt: until } = rows[0];
  return {
    allowed: count <= limit,
    remaining: Math.max(0, limit - count),
    retryAfterSec: Math.max(1, Math.ceil((until.getTime() - now.getTime()) / 1000)),
  };
}

export async function reset(keys: string[]) {
  await prisma.rateLimit.deleteMany({ where: { key: { in: keys } } });
}
