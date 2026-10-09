import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";
import { SITE, whatsappLink } from "@/lib/site";

export const dynamic = "force-dynamic";

/* ---------- Ícones (SVG inline com dimensões restritas) ---------- */
const ICONS = {
  truck: (
    <>
      <path d="M3 7h11v9H3z" />
      <path d="M14 10h4l3 3v3h-7z" />
      <circle cx="7" cy="18" r="1.8" />
      <circle cx="17" cy="18" r="1.8" />
    </>
  ),
  card: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="M3 10h18M7 15h3" />
    </>
  ),
  file: (
    <>
      <path d="M7 3h7l5 5v13H7z" />
      <path d="M14 3v5h5M10 13h6M10 17h6" />
    </>
  ),
  cart: (
    <>
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </>
  ),
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  chat: <path d="M4 5h16v11H9l-5 4z" />,
  sparkle: (
    <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z" />
  ),
  shield: (
    <>
      <path d="M12 3l8 3v6c0 4.5-3.2 7.8-8 9-4.8-1.2-8-4.5-8-9V6z" />
      <path d="M8.5 12l2.5 2.5 4.5-5" />
    </>
  ),
  up: <path d="M12 19V5M6 11l6-6 6 6" />,
  chevron: <path d="M6 9l6 6 6-6" />,
  heart: <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  cursor: <path d="M5 4l14 6-6 2-2 6z" />,
  star: (
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  ),
  fire: (
    <path d="M12 2c0 3.5-3 5.5-3 8.5 0 3 2.5 5.5 5.5 5.5s5.5-2.5 5.5-5.5c0-3.5-3-5.5-3-8.5C14 4 12 2 12 2z" />
  ),
  gift: (
    <>
      <rect x="3" y="8" width="18" height="4" rx="1" />
      <path d="M12 8v13M5 12v7a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-7" />
      <path d="M7.5 8C6 8 5 7 5 5.5A2.5 2.5 0 0 1 7.5 3c2 0 4.5 5 4.5 5s2.5-5 4.5-5A2.5 2.5 0 0 1 19 5.5C19 7 18 8 16.5 8" />
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

const BENEFITS = [
  {
    icon: "truck" as IconName,
    title: "Entrega em Luanda",
    text: "Receba as suas peças rapidamente na sua residência ou trabalho.",
    badge: "Rápido & Seguro",
    cardBg: "bg-amber-500/10 border-amber-200 text-amber-900",
    iconBg: "bg-amber-500 text-white",
  },
  {
    icon: "card" as IconName,
    title: "Pagamento Flexível",
    text: "Pague na entrega (TPA/Cash), transferência ou Multicaixa Express.",
    badge: "100% Prático",
    cardBg: "bg-emerald-500/10 border-emerald-200 text-emerald-900",
    iconBg: "bg-emerald-500 text-white",
  },
  {
    icon: "file" as IconName,
    title: "Comprovativo em PDF",
    text: "Gere o resumo completo da sua encomenda instantaneamente em PDF.",
    badge: "Organizado",
    cardBg: "bg-indigo-500/10 border-indigo-200 text-indigo-900",
    iconBg: "bg-indigo-500 text-white",
  },
];

const CATEGORIES = [
  { name: "Lançamentos", tag: "Novos", bg: "from-rose-500 to-red-600", icon: "fire" },
  { name: "Feminino", tag: "Coleção", bg: "from-purple-600 to-pink-500", icon: "sparkle" },
  { name: "Masculino", tag: "Tendência", bg: "from-blue-600 to-indigo-600", icon: "cart" },
  { name: "Acessórios", tag: "Especial", bg: "from-amber-500 to-orange-500", icon: "gift" },
];

const STEPS = [
  {
    icon: "cart" as IconName,
    title: "1. Adicione ao Carrinho",
    text: "Escolha as suas peças preferidas e adicione-as ao carrinho de compras.",
    color: "from-orange-500 to-amber-500",
  },
  {
    icon: "pin" as IconName,
    title: "2. Indique o Local",
    text: "Insira o seu contacto telefónico e ponto de referência para entrega.",
    color: "from-rose-500 to-pink-500",
  },
  {
    icon: "check" as IconName,
    title: "3. Confirme & Receba",
    text: "Baixe o PDF e entraremos em contacto por WhatsApp imediatamente.",
    color: "from-emerald-500 to-teal-500",
  },
];

const FAQ = [
  {
    q: "Como é feito o pagamento?",
    a: "Pode pagar diretamente na entrega (em dinheiro ou TPA), via transferência bancária ou Multicaixa Express.",
  },
  {
    q: "Quanto tempo demora a entrega?",
    a: "Geralmente entregamos entre 24h e 48h após a confirmação do pedido no WhatsApp.",
  },
  {
    q: "Recebo algum comprovativo?",
    a: "Sim! Ao finalizar a encomenda, tem a opção de descarregar um PDF detalhado com o resumo da compra.",
  },
  {
    q: "Posso tirar dúvidas antes de comprar?",
    a: "Claro! Pode clicar no botão do WhatsApp a qualquer momento para falar com a nossa equipa.",
  },
];

export default async function Home() {
  const products = await prisma.product.findMany({
    where: { active: true, stock: { gt: 0 } },
    orderBy: { createdAt: "desc" },
    take: 8,
  });

  const hero = products.filter((p) => p.imageUrl).slice(0, 3);
  const wa = whatsappLink();

  return (
    <div id="topo" className="space-y-16">
      {/* BOTÕES FLUTUANTES (WHATSAPP + TOPO) */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-center gap-3">
        <a
          href="#topo"
          aria-label="Voltar ao topo"
          className="grid h-12 w-12 place-items-center rounded-full bg-white text-slate-800 shadow-xl border border-slate-200 transition-all hover:bg-slate-900 hover:text-white"
        >
          <Icon name="up" className="h-5 w-5" />
        </a>
        <a
          href={wa}
          target="_blank"
          rel="noreferrer"
          aria-label="Falar no WhatsApp"
          className="group relative flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-white shadow-xl transition-all hover:scale-105"
        >
          <Icon name="chat" className="h-6 w-6" />
          <span className="font-bold text-sm">WhatsApp</span>
        </a>
      </div>

      {/* HERO SECTION */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-900 p-8 sm:p-12 text-white shadow-xl">
        <div className="relative z-10 grid items-center gap-8 lg:grid-cols-12">
          {/* Lado Esquerdo */}
          <div className="lg:col-span-6 space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full bg-rose-600 px-3.5 py-1 text-xs font-bold text-white">
              <Icon name="fire" className="h-4 w-4" />
              <span>Nova Coleção</span>
            </div>

            <h1 className="font-display text-4xl sm:text-5xl font-black leading-tight">
              A moda perfeita para <span className="text-rose-400">o seu estilo.</span>
            </h1>

            <p className="text-base text-slate-300 leading-relaxed">
              {SITE.tagline}. Roupas modernas com garantia de qualidade. Receba em {SITE.city}.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href="#produtos"
                className="inline-flex items-center gap-2 rounded-full bg-rose-600 px-7 py-3.5 font-bold text-white shadow-lg transition hover:bg-rose-700"
              >
                <Icon name="cart" className="h-5 w-5" />
                Ver Produtos
              </a>
              <a
                href={wa}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-6 py-3.5 font-bold text-white transition hover:bg-white/20"
              >
                <Icon name="chat" className="h-5 w-5 text-[#25D366]" />
                Atendimento
              </a>
            </div>
          </div>

          {/* Lado Direito - Mosaico de Produtos */}
          <div className="lg:col-span-6 grid grid-cols-2 gap-3 h-[380px]">
            {[0, 1, 2].map((i) => {
              const p = hero[i];
              const layout = i === 0 ? "row-span-2" : "";
              return (
                <Link
                  key={i}
                  href={p ? `/produto/${p.id}` : "/produtos"}
                  className={`group relative overflow-hidden rounded-2xl bg-slate-800 border border-white/10 ${layout}`}
                >
                  {p?.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-slate-800 p-4 text-center">
                      <span className="text-xs font-bold text-slate-400">HG Vestuário</span>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-3 text-white">
                    <p className="font-bold text-xs truncate">{p ? p.name : "Ver Loja"}</p>
                    <p className="text-[11px] font-bold text-rose-400">{p?.price ? `${p.price} Kz` : "Explorar"}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* CATEGORIAS EM CARDS */}
      <section className="space-y-4">
        <h2 className="font-display text-2xl font-bold text-slate-900">Categorias em Destaque</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.name}
              href="/produtos"
              className={`group relative overflow-hidden rounded-2xl bg-gradient-to-r ${cat.bg} p-5 text-white shadow-lg transition hover:-translate-y-1`}
            >
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold">
                  {cat.tag}
                </span>
                <Icon name={cat.icon as IconName} className="h-5 w-5 text-white/80" />
              </div>
              <p className="mt-4 text-lg font-bold">{cat.name}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* BENEFÍCIOS */}
      <section className="grid gap-4 md:grid-cols-3">
        {BENEFITS.map((b) => (
          <div key={b.title} className={`rounded-2xl border p-6 ${b.cardBg}`}>
            <div className="flex items-center justify-between">
              <span className={`grid h-10 w-10 place-items-center rounded-xl ${b.iconBg}`}>
                <Icon name={b.icon} className="h-5 w-5" />
              </span>
              <span className="rounded-full bg-white px-2.5 py-0.5 text-xs font-bold shadow-sm text-slate-800">
                {b.badge}
              </span>
            </div>
            <h3 className="font-display mt-4 text-lg font-bold">{b.title}</h3>
            <p className="mt-1 text-xs opacity-90">{b.text}</p>
          </div>
        ))}
      </section>

      {/* PRODUTOS */}
      <section id="produtos" className="scroll-mt-28 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <h2 className="font-display text-2xl font-bold text-slate-900">Últimos Produtos</h2>
          <Link
            href="/produtos"
            className="inline-flex items-center gap-1 text-sm font-bold text-rose-600 hover:underline"
          >
            Ver todos
            <Icon name="arrow" className="h-4 w-4" />
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="rounded-2xl bg-slate-100 p-8 text-center text-slate-500">
            A preparar novidades exclusivas.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* COMO COMPRAR */}
      <section className="rounded-2xl bg-slate-900 p-8 text-white">
        <h2 className="font-display text-2xl font-bold">Como comprar</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.title} className="rounded-xl bg-slate-800 p-5 border border-slate-700">
              <span className={`inline-grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-r ${s.color} text-white`}>
                <Icon name={s.icon} className="h-5 w-5" />
              </span>
              <h3 className="mt-3 text-base font-bold">{s.title}</h3>
              <p className="mt-1 text-xs text-slate-300">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-2xl mx-auto space-y-4">
        <h2 className="font-display text-2xl font-bold text-center text-slate-900">Perguntas Frequentes</h2>
        <div className="space-y-3">
          {FAQ.map((item, i) => (
            <details key={item.q} open={i === 0} className="rounded-xl border border-slate-200 bg-white p-4">
              <summary className="flex cursor-pointer items-center justify-between font-bold text-sm text-slate-900">
                {item.q}
                <Icon name="chevron" className="h-4 w-4 text-slate-500" />
              </summary>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed border-t pt-2">{item.a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}