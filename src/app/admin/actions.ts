"use server";

import bcrypt from "bcryptjs";
import { put, del } from "@vercel/blob";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { createSession, destroySession, requireAdmin } from "@/lib/auth";
import type { OrderStatus } from "@/lib/db-types";

/* ---------- Login / Logout ---------- */

let dummyHash: string | undefined;

export async function loginAction(
  _prev: { error?: string } | undefined,
  fd: FormData
): Promise<{ error: string }> {
  const email = String(fd.get("email") ?? "").trim();
  const password = String(fd.get("password") ?? "");

  const admin = email
    ? await prisma.admin.findFirst({ where: { email: { equals: email, mode: "insensitive" } } })
    : null;

  // compara sempre, para não revelar se o email existe
  dummyHash ??= bcrypt.hashSync("dummy-password", 12);
  const ok = await bcrypt.compare(password, admin?.passwordHash ?? dummyHash);

  if (!admin || !ok) return { error: "Email ou senha incorretos." };

  await createSession(admin.id, admin.email);
  redirect("/admin");
}

export async function logoutAction() {
  await destroySession();
  redirect("/admin/login");
}

/* ---------- Produtos ---------- */

export async function saveProduct(fd: FormData): Promise<{ error?: string }> {
  await requireAdmin();

  const id = String(fd.get("id") ?? "");
  const name = String(fd.get("name") ?? "").trim();
  const description = String(fd.get("description") ?? "").trim();
  const price = Number(fd.get("price"));
  const stock = Number(fd.get("stock"));
  const active = fd.get("active") === "on";
  let imageUrl: string | null = String(fd.get("imageUrl") ?? "").trim() || null;

  if (name.length < 2 || name.length > 120) return { error: "Nome inválido (2 a 120 caracteres)." };
  if (description.length > 1000) return { error: "Descrição demasiado longa." };
  if (!Number.isInteger(price) || price < 0) return { error: "Preço inválido (número inteiro, em Kz)." };
  if (!Number.isInteger(stock) || stock < 0) return { error: "Stock inválido (número inteiro)." };
  if (imageUrl && !/^(https?:\/\/|\/)/.test(imageUrl)) return { error: "Link da imagem inválido." };

  const image = fd.get("image");
  if (image instanceof File && image.size > 0) {
    if (!image.type.startsWith("image/")) return { error: "O ficheiro tem de ser uma imagem." };
    if (image.size > 4 * 1024 * 1024) return { error: "Imagem demasiado grande (máx. 4 MB)." };
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return { error: "Upload não configurado (falta BLOB_READ_WRITE_TOKEN). Cole o link da imagem em vez disso." };
    }
    try {
      const blob = await put(`produtos/${Date.now()}.jpg`, image, {
        access: "public",
        addRandomSuffix: true,
        contentType: image.type,
      });
      imageUrl = blob.url;
    } catch (e) {
      console.error("Erro no upload:", e);
      return { error: "Falha ao enviar a imagem. Tente novamente." };
    }
  }

  const data = { name, description: description || null, price, stock, imageUrl, active };

  try {
    if (id) await prisma.product.update({ where: { id }, data });
    else await prisma.product.create({ data });
  } catch (e) {
    console.error("Erro ao guardar produto:", e);
    return { error: "Não foi possível guardar o produto." };
  }

  revalidatePath("/");
  revalidatePath("/admin/produtos");
  redirect("/admin/produtos");
}

export async function deleteProduct(id: string) {
  await requireAdmin();
  const p = await prisma.product.findUnique({ where: { id } });
  if (!p) return;
  // os pedidos antigos mantêm nome e preço (productId fica null)
  await prisma.product.delete({ where: { id } });
  if (p.imageUrl?.includes("blob.vercel-storage.com")) {
    try {
      await del(p.imageUrl);
    } catch {}
  }
  revalidatePath("/");
  revalidatePath("/admin/produtos");
}

export async function toggleActive(id: string, active: boolean) {
  await requireAdmin();
  await prisma.product.update({ where: { id }, data: { active } });
  revalidatePath("/");
  revalidatePath("/admin/produtos");
}

/* ---------- Pedidos ---------- */

const STATUSES: OrderStatus[] = ["PENDING", "CONFIRMED", "DELIVERED", "CANCELLED"];

export async function updateOrderStatus(id: string, fd: FormData) {
  await requireAdmin();
  const status = String(fd.get("status")) as OrderStatus;
  if (!STATUSES.includes(status)) return;

  await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id }, include: { items: true } });
    if (!order || order.status === status) return;
    if (order.status === "CANCELLED") return; // cancelado não volta atrás

    if (status === "CANCELLED") {
      // devolve as peças ao stock
      for (const it of order.items) {
        if (!it.productId) continue;
        await tx.product.updateMany({
          where: { id: it.productId },
          data: { stock: { increment: it.quantity } },
        });
      }
    }
    await tx.order.update({ where: { id }, data: { status } });
  });

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/pedidos");
  revalidatePath(`/admin/pedidos/${id}`);
}
