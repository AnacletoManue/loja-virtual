import Link from "next/link";
import ProductForm from "@/components/admin/ProductForm";

export const dynamic = "force-dynamic";

export default function NewProduct() {
  return (
    <div className="space-y-5">
      <Link
        href="/admin/produtos"
        className="group inline-flex items-center gap-1.5 text-sm text-neutral-600 transition hover:text-black"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4 transition group-hover:-translate-x-1"
          aria-hidden="true"
        >
          <path d="M19 12H5M11 6l-6 6 6 6" />
        </svg>
        Voltar aos produtos
      </Link>

      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Novo produto</h1>
        <p className="mt-0.5 text-sm text-neutral-500">Adicione uma nova peça à sua loja.</p>
      </div>

      <div className="rounded-2xl border bg-white p-5 md:p-6">
        <ProductForm />
      </div>
    </div>
  );
}