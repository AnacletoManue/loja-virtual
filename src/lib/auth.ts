import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const SESSION_COOKIE = "admin_session";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 dias

function secret() {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 32) {
    throw new Error("AUTH_SECRET em falta ou curto demais (mínimo 32 caracteres). Veja o .env.");
  }
  return new TextEncoder().encode(s);
}

export async function createSession(adminId: string, email: string) {
  const token = await new SignJWT({ email })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(adminId)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret());

  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function getSession() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return { id: String(payload.sub), email: String(payload.email) };
  } catch {
    return null;
  }
}

// Use em TODA página e ação do admin (o proxy sozinho não basta)
export async function requireAdmin() {
  const s = await getSession();
  if (!s) redirect("/admin/login");
  return s;
}

export async function destroySession() {
  (await cookies()).delete(SESSION_COOKIE);
}
