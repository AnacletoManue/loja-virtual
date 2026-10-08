"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/admin/actions";

const LINKS = [
  { href: "/admin", label: "Resumo", exact: true },
  { href: "/admin/pedidos", label: "Pedidos" },
  { href: "/admin/produtos", label: "Produtos" },
    { href: "/admin/conta", label: "Conta" },
];

export default function AdminNav({ email }: { email: string }) {
  const path = usePathname();

  return (
    <aside className="md:sticky md:top-6 md:self-start">
      <div className="mb-3 hidden md:block">
        <p className="text-xs text-neutral-500">Sessão iniciada</p>
        <p className="truncate text-sm font-medium">{email}</p>
      </div>

      <nav className="flex gap-2 overflow-x-auto pb-1 md:flex-col md:overflow-visible">
        {LINKS.map((l) => {
          const active = l.exact ? path === l.href : path.startsWith(l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition ${
                active ? "bg-black text-white" : "bg-white text-neutral-700 hover:bg-neutral-100"
              } border`}
            >
              {l.label}
            </Link>
          );
        })}
        <Link
          href="/"
          target="_blank"
          className="whitespace-nowrap rounded-lg border bg-white px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
        >
          Ver loja ↗
        </Link>
        <form action={logoutAction}>
          <button className="w-full whitespace-nowrap rounded-lg border bg-white px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50">
            Sair
          </button>
        </form>
      </nav>
    </aside>
  );
}
