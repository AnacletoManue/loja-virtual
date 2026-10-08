import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const url = process.env.DATABASE_URL ?? "";
  try {
    const n = await prisma.product.count();
    return NextResponse.json({ ok: true, produtos: n });
  } catch (e) {
    const err = e as { code?: string; message?: string; meta?: unknown; cause?: unknown };
    return NextResponse.json({
      ok: false,
      code: err.code,
      mensagem: String(err.message).split("\n").slice(-3).join(" "),
      meta: err.meta,
      cause: String(err.cause),
      url: {
        temAsteriscos: url.includes("***"),
        sslmode: new URL(url || "http://x").searchParams.get("sslmode"),
        host: new URL(url || "http://x").hostname,
        user: new URL(url || "http://x").username,
      },
    });
  }
}
