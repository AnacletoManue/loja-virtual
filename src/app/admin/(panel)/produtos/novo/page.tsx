import ProductForm from "@/components/admin/ProductForm";

export const dynamic = "force-dynamic";

export default function NewProduct() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Novo produto</h1>
      <ProductForm />
    </div>
  );
}
