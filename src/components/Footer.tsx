"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SITE, whatsappLink } from "@/lib/site";

export default function Footer() {
  const path = usePathname();
  if (path.startsWith("/admin")) return null;

  return (
    <footer className="mt-12 border-t bg-white">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 md:grid-cols-3">
        <div>
          <p className="text-lg font-bold">{SITE.name}</p>
          <p className="mt-2 text-sm text-neutral-600">{SITE.tagline}</p>
        </div>

        <div className="text-sm">
          <p className="mb-2 font-semibold">Navegar</p>
          <ul className="space-y-1 text-neutral-600">
            <li><Link href="/" className="hover:text-black">Início</Link></li>
            <li><Link href="/produtos" className="hover:text-black">Produtos</Link></li>
            <li><Link href="/carrinho" className="hover:text-black">Carrinho</Link></li>
          </ul>
        </div>

        <div className="text-sm">
          <p className="mb-2 font-semibold">Contacto</p>
          <p className="text-neutral-600">{SITE.city}</p>
          <a
            href={whatsappLink()}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-block rounded-full bg-green-600 px-4 py-2 font-medium text-white hover:bg-green-700"
          >
            Falar no WhatsApp
          </a>
        </div>
      </div>
      <p className="border-t py-4 text-center text-xs text-neutral-500">
        © {new Date().getFullYear()} {SITE.name}. Todos os direitos reservados.
      </p>
    </footer>
  );
}
