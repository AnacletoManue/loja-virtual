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

const input =
  "w-full rounded-xl border bg-white px-3 py-2.5 outline-none transition focus:border-black focus:ring-4 focus:ring-black/5";
const label = "mb-1 block text-sm font-medium";

/* ---------- Ícones (SVG inline) ---------- */
const ICONS = {
  image: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2.5" />
      <circle cx="9" cy="10" r="1.8" />
      <path d="M21 16l-5-5-8 9" />
    </>
  ),
  upload: (
    <>
      <path d="M12 16V4M6 9l6-6 6 6" />
      <path d="M4 20h16" />
    </>
  ),
  trash: (
    <>
      <path d="M4 7h16M10 11v6M14 11v6" />
      <path d="M6 7l1 13h10l1-13M9 7V4h6v3" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  alert: (
    <>
      <path d="M12 3l10 18H2z" />
      <path d="M12 10v4M12 17.5v.01" />
    </>
  ),
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  link: (
    <>
      <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" />
      <path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />
    </>
  ),
};
type IconName = keyof typeof ICONS;

function Icon({ name, className = "h-5 w-5" }: { name: IconName; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {ICONS[name]}
    </svg>
  );
}

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
  const [stock, setStock] = useState<string>(String(product?.stock ?? 0));
  const [descLen, setDescLen] = useState(product?.description?.length ?? 0);
  const [dragging, setDragging] = useState(false);

  async function processFile(file: File) {
    setError("");
    try {
      const b = await resizeImage(file);
      setBlob(b);
      setPreview(URL.createObjectURL(b));
    } catch {
      setError("Não foi possível ler essa imagem.");
    }
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    await processFile(file);
  }

  async function onDrop(e: React.DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) await processFile(file);
  }

  function removePhoto() {
    setBlob(null);
    setPreview("");
    setImageUrl("");
  }

  function stepStock(delta: number) {
    setStock(String(Math.max(0, (parseInt(stock, 10) || 0) + delta)));
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

      {/* FOTO */}
      <div className="space-y-3">
        <label
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={`group relative block aspect-square cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed transition ${
            dragging ? "border-black bg-neutral-100" : "border-neutral-300 bg-neutral-50 hover:border-black"
          }`}
        >
          {preview ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="Pré-visualização" className="h-full w-full object-cover" />
              <span className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/50 text-sm font-medium text-white opacity-0 transition group-hover:opacity-100">
                <Icon name="upload" className="h-6 w-6" />
                Trocar foto
              </span>
            </>
          ) : (
            <span className="flex h-full flex-col items-center justify-center gap-2 px-4 text-center text-sm text-neutral-400 transition group-hover:text-black">
              <span className="grid h-14 w-14 place-items-center rounded-full bg-white shadow-sm transition group-hover:scale-110">
                <Icon name="image" className="h-7 w-7" />
              </span>
              <span className="font-medium">Toque para escolher</span>
              <span className="text-xs">ou arraste uma foto para aqui</span>
            </span>
          )}
          <input type="file" accept="image/*" onChange={onFile} className="hidden" />
        </label>

        {preview && (
          <button
            type="button"
            onClick={removePhoto}
            className="flex w-full items-center justify-center gap-2 rounded-xl border bg-white py-2 text-sm font-medium text-red-600 transition hover:border-red-300 hover:bg-red-50"
          >
            <Icon name="trash" className="h-4 w-4" />
            Remover foto
          </button>
        )}

        <div>
          <label className="mb-1 flex items-center gap-1.5 text-xs text-neutral-500">
            <Icon name="link" className="h-3.5 w-3.5" />
            Ou cole o link de uma imagem
          </label>
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

      {/* DADOS */}
      <div className="space-y-4">
        <div>
          <label className={label}>Nome da peça</label>
          <input name="name" required defaultValue={product?.name} placeholder="Ex.: Camisa Polo - M" className={input} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={label}>Preço</label>
            <div className="relative">
              <input
                name="price"
                type="number"
                min={0}
                step={1}
                required
                defaultValue={product?.price}
                className={`${input} pr-11`}
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-neutral-400">
                Kz
              </span>
            </div>
          </div>
          <div>
            <label className={label}>Stock</label>
            <div className="flex items-stretch gap-1.5">
              <button
                type="button"
                aria-label="Diminuir stock"
                onClick={() => stepStock(-1)}
                className="grid w-10 shrink-0 place-items-center rounded-xl border bg-white transition hover:border-black hover:bg-neutral-50 active:scale-95"
              >
                <Icon name="minus" className="h-4 w-4" />
              </button>
              <input
                name="stock"
                type="number"
                min={0}
                step={1}
                required
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className={`${input} min-w-0 text-center`}
              />
              <button
                type="button"
                aria-label="Aumentar stock"
                onClick={() => stepStock(1)}
                className="grid w-10 shrink-0 place-items-center rounded-xl border bg-white transition hover:border-black hover:bg-neutral-50 active:scale-95"
              >
                <Icon name="plus" className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-end justify-between">
            <label className={label}>Descrição (opcional)</label>
            <span className="mb-1 text-xs text-neutral-400">{descLen} caracteres</span>
          </div>
          <textarea
            name="description"
            rows={4}
            defaultValue={product?.description}
            onChange={(e) => setDescLen(e.target.value.length)}
            className={input}
          />
        </div>

        {/* INTERRUPTOR: VISÍVEL NA LOJA */}
        <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border bg-white p-4 transition hover:border-black">
          <span>
            <span className="block text-sm font-medium">Visível na loja</span>
            <span className="block text-xs text-neutral-500">Os clientes podem ver e comprar esta peça.</span>
          </span>
          <input name="active" type="checkbox" defaultChecked={product?.active ?? true} className="peer sr-only" />
          <span className="relative h-6 w-11 shrink-0 rounded-full bg-neutral-300 transition peer-checked:bg-black peer-focus-visible:ring-4 peer-focus-visible:ring-black/20 after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition peer-checked:after:translate-x-5" />
        </label>

        {error && (
          <p className="flex items-start gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-700">
            <Icon name="alert" className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </p>
        )}

        <div className="flex flex-wrap gap-3">
          <button
            disabled={pending}
            className="inline-flex items-center gap-2 rounded-full bg-black px-7 py-3 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-neutral-800 active:translate-y-0 disabled:pointer-events-none disabled:opacity-60"
          >
            {pending ? (
              <>
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" opacity="0.25" />
                  <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
                A guardar...
              </>
            ) : (
              <>
                <Icon name="check" className="h-4 w-4" />
                Guardar produto
              </>
            )}
          </button>
          <Link
            href="/admin/produtos"
            className="rounded-full border bg-white px-7 py-3 font-semibold transition hover:-translate-y-0.5 hover:border-black"
          >
            Cancelar
          </Link>
        </div>
      </div>
    </form>
  );
}