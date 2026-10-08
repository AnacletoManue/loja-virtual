"use client";
import { useState, useTransition } from "react";
import Link from "next/link";
import { saveProduct } from "@/app/admin/actions";

type Product = {
  id?: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
  active: boolean;
};

const input = "w-full rounded-lg border bg-white px-3 py-2.5 outline-none focus:border-black";
const label = "mb-1 block text-sm font-medium";

// Reduz a foto (telemóvel) para ~1200px antes de enviar
async function resizeImage(file: File, max = 1200): Promise<Blob> {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bmp.width * scale);
  canvas.height = Math.round(bmp.height * scale);
  canvas.getContext("2d")!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  return new Promise((res, rej) =>
    canvas.toBlob((b) => (b ? res(b) : rej(new Error("Falha ao processar a imagem"))), "image/jpeg", 0.85)
  );
}

export default function ProductForm({ product }: { product?: Product }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState("");
  const [blob, setBlob] = useState<Blob | null>(null);
  const [preview, setPreview] = useState(product?.imageUrl ?? "");
  const [imageUrl, setImageUrl] = useState(product?.imageUrl ?? "");

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    try {
      const b = await resizeImage(file);
      setBlob(b);
      setPreview(URL.createObjectURL(b));
    } catch {
      setError("Não foi possível ler essa imagem.");
    }
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const fd = new FormData(e.currentTarget);
    if (blob) fd.set("image", new File([blob], "foto.jpg", { type: "image/jpeg" }));
    start(async () => {
      const r = await saveProduct(fd);
      if (r?.error) setError(r.error);
    });
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-6 md:grid-cols-[240px_1fr]">
      {product?.id && <input type="hidden" name="id" value={product.id} />}

      <div className="space-y-3">
        <div className="aspect-square overflow-hidden rounded-xl border bg-neutral-100">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="Pré-visualização" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-neutral-400">Sem foto</div>
          )}
        </div>
        <label className="block cursor-pointer rounded-lg border bg-white py-2 text-center text-sm font-medium hover:bg-neutral-50">
          {preview ? "Trocar foto" : "Escolher foto"}
          <input type="file" accept="image/*" onChange={onFile} className="hidden" />
        </label>
        <div>
          <label className="mb-1 block text-xs text-neutral-500">Ou cole o link de uma imagem</label>
          <input
            name="imageUrl"
            value={imageUrl}
            onChange={(e) => {
              setImageUrl(e.target.value);
              if (!blob) setPreview(e.target.value);
            }}
            placeholder="https://..."
            className={input}
          />
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className={label}>Nome da peça</label>
          <input name="name" required defaultValue={product?.name} placeholder="Ex.: Camisa Polo - M" className={input} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={label}>Preço (Kz)</label>
            <input name="price" type="number" min={0} step={1} required defaultValue={product?.price} className={input} />
          </div>
          <div>
            <label className={label}>Stock</label>
            <input name="stock" type="number" min={0} step={1} required defaultValue={product?.stock ?? 0} className={input} />
          </div>
        </div>

        <div>
          <label className={label}>Descrição (opcional)</label>
          <textarea name="description" rows={4} defaultValue={product?.description} className={input} />
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input name="active" type="checkbox" defaultChecked={product?.active ?? true} className="h-4 w-4" />
          Visível na loja
        </label>

        {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

        <div className="flex gap-3">
          <button disabled={pending} className="rounded-lg bg-black px-6 py-2.5 font-medium text-white disabled:opacity-50">
            {pending ? "A guardar..." : "Guardar produto"}
          </button>
          <Link href="/admin/produtos" className="rounded-lg border bg-white px-6 py-2.5 font-medium">
            Cancelar
          </Link>
        </div>
      </div>
    </form>
  );
}
