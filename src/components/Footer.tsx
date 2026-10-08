"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SITE, whatsappLink } from "@/lib/site";

export default function Footer() {
  const path = usePathname();
  if (path.startsWith("/admin")) return null;

  return (
    <footer className="mt-16 bg-[var(--ink)] text-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-[2fr_1fr_1fr] md:px-6">
        <div>
          <p className="font-display text-3xl font-extrabold">{SITE.name}</p>
          <p className="mt-3 max-w-xs text-sm text-white/60">{SITE.tagline}</p>
        </div>
        <div className="text-sm">
          <p className="mb-3 font-semibold">Navegar</p>
          <ul className="space-y-2 text-white/60">
            <li><Link href="/" className="hover:text-white">Início</Link></li>
            <li><Link href="/produtos" className="hover:text-white">Produtos</Link></li>
            <li><Link href="/carrinho" className="hover:text-white">Carrinho</Link></li>
          </ul>
        </div>
        <div className="text-sm">
          <p className="mb-3 font-semibold">Contacto</p>
          <p className="text-white/60">{SITE.city}</p>
          <a
            href={whatsappLink()}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-block rounded-full bg-white px-5 py-2.5 font-semibold text-black transition hover:bg-[var(--brand)] hover:text-white"
          >
            Falar no WhatsApp
          </a>
        </div>
      </div>
      <p className="border-t border-white/10 py-5 text-center text-xs text-white/40">
        © {new Date().getFullYear()} {SITE.name}. Todos os direitos reservados.
      </p>
    </footer>
  );
}