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

const inputClass =
  "w-full rounded-2xl border border-slate-200/80 bg-slate-50/80 px-4 py-3.5 text-sm font-bold text-slate-800 placeholder-slate-400 outline-none transition-all focus:border-rose-500 focus:bg-white focus:ring-4 focus:ring-rose-500/10";
const labelClass = "mb-1.5 block text-xs font-black uppercase tracking-wider text-slate-700";

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
      className={`shrink-0 inline-block ${className}`}
      aria-hidden="true"
    >
      {ICONS[name]}
    </svg>
  );
}

// Reduz a foto no telemóvel/computador para ~1200px antes do upload
async function resizeImage(file: File, max = 1200): Promise<Blob> {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bmp.width * scale);
  canvas.height = Math.round(bmp.height * scale);
  canvas.getContext("2d")!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  return new Promise((res, rej) =>
    canvas.toBlob(
      (b) => (b ? res(b) : rej(new Error("Falha ao processar a imagem"))),
      "image/jpeg",
      0.85
    )
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
      setError("Não foi possível processar essa imagem.");
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
    <form onSubmit={onSubmit} className="grid gap-8 lg:grid-cols-[280px_1fr]">
      {product?.id && <input type="hidden" name="id" value={product.id} />}

      {/* PAINEL DA FOTO */}
      <div className="space-y-4">
        <label className={labelClass}>Foto da Peça</label>
        <label
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={`group relative flex aspect-square w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-3xl border-2 border-dashed transition-all ${
            dragging
              ? "border-rose-500 bg-rose-50/50"
              : "border-slate-200/80 bg-slate-50/80 hover:border-rose-500 hover:bg-white"
          }`}
        >
          {preview ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview}
                alt="Pré-visualização da peça"
                className="h-full w-full object-cover"
              />
              <span className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-slate-900/60 text-xs font-black uppercase tracking-wider text-white opacity-0 backdrop-blur-xs transition-opacity group-hover:opacity-100">
                <Icon name="upload" className="h-6 w-6" />
                <span>Trocar foto</span>
              </span>
            </>
          ) : (
            <span className="flex flex-col items-center justify-center gap-2.5 p-6 text-center">
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white shadow-md text-slate-400 transition-transform group-hover:scale-110 group-hover:text-rose-600">
                <Icon name="image" className="h-7 w-7" />
              </span>
              <span className="text-xs font-black uppercase tracking-wider text-slate-700">
                Toque para carregar foto
              </span>
              <span className="text-[11px] font-medium text-slate-400">
                ou arraste uma imagem aqui (JPG/PNG)
              </span>
            </span>
          )}
          <input type="file" accept="image/*" onChange={onFile} className="hidden" />
        </label>

        {preview && (
          <button
            type="button"
            onClick={removePhoto}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50/80 py-3 text-xs font-black text-rose-600 transition-colors hover:bg-rose-100 active:scale-98"
          >
            <Icon name="trash" className="h-4 w-4" />
            <span>Remover Imagem</span>
          </button>
        )}

        <div className="space-y-1.5 pt-2">
          <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            <Icon name="link" className="h-3.5 w-3.5 text-slate-400" />
            Ou cole um Link de Imagem
          </label>
          <input
            name="imageUrl"
            value={imageUrl}
            onChange={(e) => {
              setImageUrl(e.target.value);
              if (!blob) setPreview(e.target.value);
            }}
            placeholder="https://exemplo.com/foto.jpg"
            className={inputClass}
          />
        </div>
      </div>

      {/* PAINEL DOS DADOS */}
      <div className="space-y-5">
        <div>
          <label className={labelClass}>Nome do Produto *</label>
          <input
            name="name"
            required
            defaultValue={product?.name}
            placeholder="Ex.: Camisa Polo Slim Fit Azul"
            className={inputClass}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Preço de Venda *</label>
            <div className="relative">
              <input
                name="price"
                type="number"
                min={0}
                step={1}
                required
                defaultValue={product?.price}
                placeholder="15000"
                className={`${inputClass} pr-12`}
              />
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black uppercase text-slate-400">
                Kz
              </span>
            </div>
          </div>

          <div>
            <label className={labelClass}>Unidades em Stock *</label>
            <div className="flex items-stretch gap-2">
              <button
                type="button"
                aria-label="Diminuir stock"
                onClick={() => stepStock(-1)}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-slate-200/80 bg-slate-50 text-slate-700 shadow-sm transition hover:bg-slate-200 active:scale-95"
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
                className={`${inputClass} min-w-0 text-center font-black text-base`}
              />

              <button
                type="button"
                aria-label="Aumentar stock"
                onClick={() => stepStock(1)}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-slate-200/80 bg-slate-50 text-slate-700 shadow-sm transition hover:bg-slate-200 active:scale-95"
              >
                <Icon name="plus" className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className={labelClass}>Descrição da Peça (Opcional)</label>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {descLen} caracteres
            </span>
          </div>
          <textarea
            name="description"
            rows={4}
            defaultValue={product?.description}
            onChange={(e) => setDescLen(e.target.value.length)}
            placeholder="Detalhes sobre o tecido, corte, tamanho e cuidados..."
            className={inputClass}
          />
        </div>

        {/* INTERRUPTOR: VISÍVEL NA LOJA */}
        <label className="flex cursor-pointer items-center justify-between gap-4 rounded-3xl border border-slate-200/80 bg-slate-50/60 p-4 transition hover:border-slate-300">
          <div>
            <span className="block text-xs font-black uppercase tracking-wider text-slate-900">
              Visível na Loja Virtual
            </span>
            <span className="block text-xs font-medium text-slate-500">
              Ative para permitir que os clientes vejam e comprem este produto.
            </span>
          </div>
          <input
            name="active"
            type="checkbox"
            defaultChecked={product?.active ?? true}
            className="peer sr-only"
          />
          <span className="relative h-7 w-12 shrink-0 rounded-full bg-slate-300 transition-colors peer-checked:bg-rose-600 after:absolute after:left-1 after:top-1 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow-md after:transition-transform peer-checked:after:translate-x-5" />
        </label>

        {/* MENSAGEM DE ERRO */}
        {error && (
          <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-bold text-red-700">
            <Icon name="alert" className="h-4 w-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {/* BOTÕES DE AÇÃO */}
        <div className="flex flex-col-reverse sm:flex-row items-center gap-3 pt-2">
          <Link
            href="/admin/produtos"
            className="flex w-full sm:w-auto items-center justify-center rounded-2xl border border-slate-200/80 bg-white px-7 py-3.5 text-xs font-black text-slate-700 shadow-sm transition hover:bg-slate-100"
          >
            Cancelar
          </Link>

          <button
            type="submit"
            disabled={pending}
            className="flex w-full sm:w-auto flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-600 to-rose-500 px-8 py-3.5 text-xs font-black text-white shadow-xl shadow-rose-600/30 transition-all hover:brightness-110 active:scale-98 disabled:opacity-50"
          >
            {pending ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>A guardar alterações...</span>
              </>
            ) : (
              <>
                <Icon name="check" className="h-4 w-4" />
                <span>Guardar Produto</span>
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}