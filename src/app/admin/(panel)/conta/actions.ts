"use server";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { createSession, requireAdmin } from "@/lib/auth";

type State = { error?: string; ok?: string } | undefined;

export async function updateAccountAction(_prev: State, f: FormData): Promise<State> {
  const session = await requireAdmin();

  const current = String(f.get("currentPassword") ?? "");
  const newEmail = String(f.get("email") ?? "").trim().toLowerCase();
  const newPassword = String(f.get("newPassword") ?? "");
  const confirm = String(f.get("confirmPassword") ?? "");

  const admin = await prisma.admin.findFirst({
    where: { email: { equals: session.email, mode: "insensitive" } },
  });
  if (!admin) return { error: "Conta não encontrada." };

  if (!(await bcrypt.compare(current, admin.passwordHash))) {
    return { error: "A senha atual está incorreta." };
  }

  const data: { email?: string; passwordHash?: string } = {};

  if (newEmail && newEmail !== admin.email.toLowerCase()) {
    if (!/^\S+@\S+\.\S+$/.test(newEmail)) return { error: "Email inválido." };
    const taken = await prisma.admin.findFirst({
      where: { email: { equals: newEmail, mode: "insensitive" }, NOT: { id: admin.id } },
    });
    if (taken) return { error: "Esse email já está em uso." };
    data.email = newEmail;
  }

  if (newPassword) {
    if (newPassword.length < 8) return { error: "A nova senha deve ter pelo menos 8 caracteres." };
    if (newPassword !== confirm) return { error: "A confirmação não coincide com a nova senha." };
    data.passwordHash = await bcrypt.hash(newPassword, 12);
  }

  if (!data.email && !data.passwordHash) return { error: "Não há nada para alterar." };

  const updated = await prisma.admin.update({ where: { id: admin.id }, data });

  // renova a sessão com o email novo, para não ter de sair e entrar
  await createSession(updated.id, updated.email);
  revalidatePath("/admin", "layout");

  const what = [data.email && "email", data.passwordHash && "senha"].filter(Boolean).join(" e ");
  return { ok: `Atualizado: ${what}.` };
}