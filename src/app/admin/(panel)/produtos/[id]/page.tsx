import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProductForm from "@/components/admin/ProductForm";

export const dynamic = "force-dynamic";

export default async function EditProduct({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = await prisma.product.findUnique({ where: { id } });
  if (!p) notFound();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Editar produto</h1>
      <ProductForm
        product={{
          id: p.id,
          name: p.name,
          description: p.description ?? "",
          price: p.price,
          stock: p.stock,
          imageUrl: p.imageUrl ?? "",
          active: p.active,
        }}
      />
    </div>
  );
}
