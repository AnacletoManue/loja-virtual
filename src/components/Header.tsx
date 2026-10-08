"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/store/cart";
import { useMounted } from "@/lib/useMounted";
import { SITE } from "@/lib/site";

export default function Header() {
  const path = usePathname();
  const mounted = useMounted();
  const count = useCart((s) => s.items.reduce((n, i) => n + i.quantity, 0));

  if (path.startsWith("/admin")) return null;

  const link = (href: string, label: string) => (
    <Link
      href={href}
      className={`rounded-full px-3 py-1.5 text-sm transition hover:bg-neutral-100 ${
        path === href ? "font-semibold text-black" : "text-neutral-600"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <header className="sticky top-0 z-20 border-b bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="text-xl font-bold tracking-tight">
          {SITE.name}
        </Link>

        <nav className="flex items-center gap-1">
          {link("/", "Início")}
          {link("/produtos", "Produtos")}
          <Link
            href="/carrinho"
            className="ml-1 flex items-center gap-2 rounded-full border bg-white px-4 py-2 text-sm font-medium transition hover:bg-neutral-50"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6" />
            </svg>
            <span className="hidden sm:inline">Carrinho</span>
            {mounted && count > 0 && (
              <span className="rounded-full bg-black px-2 py-0.5 text-xs text-white">{count}</span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
}
