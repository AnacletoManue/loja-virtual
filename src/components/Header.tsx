"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/store/cart";
import { useMounted } from "@/lib/useMounted";
import { SITE } from "@/lib/site";

const NAV = [
  { href: "/", label: "Início" },
  { href: "/produtos", label: "Produtos" },
];

export default function Header() {
  const path = usePathname();
  const mounted = useMounted();
  const { items } = useCart();
  if (path.startsWith("/admin")) return null;

  const count = mounted ? items.reduce((s, i) => s + i.quantity, 0) : 0;

  return (
    <header className="sticky top-0 z-40 border-b border-black/5 bg-[var(--paper)]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-6">
        <Link href="/" className="font-display text-2xl font-extrabold">
          {SITE.name}
        </Link>

        <nav className="flex items-center gap-1 text-sm font-medium">
          {NAV.map((n) => {
            const active = n.href === "/" ? path === "/" : path.startsWith(n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                className={`rounded-full px-4 py-2 transition ${
                  active ? "bg-black text-white" : "text-neutral-600 hover:bg-black/5"
                }`}
              >
                {n.label}
              </Link>
            );
          })}
          <Link
            href="/carrinho"
            aria-label={`Carrinho, ${count} artigos`}
            className="ml-1 flex h-10 items-center gap-2 rounded-full border border-black/10 bg-white px-4 transition hover:border-black"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 7h12l-1 13H7L6 7Z" />
              <path d="M9 7a3 3 0 0 1 6 0" />
            </svg>
            <span className="hidden sm:inline">Carrinho</span>
            {count > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--brand)] px-1 text-[11px] font-bold text-white">
                {count}
              </span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
}