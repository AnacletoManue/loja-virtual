import "dotenv/config";
import dns from "node:dns";
import net from "node:net";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

dns.setDefaultResultOrder("ipv4first");
net.setDefaultAutoSelectFamily(false);

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis: 30000,
  }),
});

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim();
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) throw new Error("Faltam ADMIN_EMAIL e ADMIN_PASSWORD no .env");
  if (password.length < 8) throw new Error("ADMIN_PASSWORD precisa de pelo menos 8 caracteres");

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.admin.upsert({
    where: { email },
    update: { passwordHash },
    create: { email, passwordHash },
  });

  console.log("Admin criado/atualizado:", email);
  console.log("Total de admins na base:", await prisma.admin.count());
  console.log("Total de produtos na base:", await prisma.product.count());
}

main()
  .catch((e) => {
    console.error("ERRO NO SEED:", e.code ?? "", e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
