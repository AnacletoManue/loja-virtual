import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";
import { SITE, whatsappLink } from "@/lib/site";

export const dynamic = "force-dynamic";

/* ---------- Ícones (SVG inline, tudo neste ficheiro) ---------- */
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
  bag: (
    <>
      <path d="M5 8h14l-1 12H6z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
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

/* ---------- Conteúdo ---------- */
const BENEFITS: { icon: IconName; title: string; text: string }[] = [
  { icon: "truck", title: "Entrega ao seu local", text: "Receba as peças onde estiver." },
  { icon: "card", title: "Pague como preferir", text: "Na entrega, transferência ou Multicaixa." },
  { icon: "file", title: "Comprovativo em PDF", text: "Guarde o resumo do seu pedido." },
];

const STEPS: { icon: IconName; title: string; text: string }[] = [
  { icon: "bag", title: "Escolha as peças", text: "Adicione ao carrinho o que gostar." },
  { icon: "pin", title: "Diga onde entregar", text: "Nome, telefone e local de entrega." },
  { icon: "check", title: "Confirme o pedido", text: "Baixe o PDF e aguarde o nosso contacto." },
];

const TRUST: { icon: IconName; text: string }[] = [
  { icon: "sparkle", text: "Novidades toda a semana" },
  { icon: "truck", text: "Entrega rápida" },
  { icon: "shield", text: "Compra segura" },
  { icon: "heart", text: "Peças escolhidas com carinho" },
  { icon: "clock", text: "Atendimento rápido no WhatsApp" },
];

const FAQ = [
  {
    q: "Como faço o pagamento?",
    a: "Pode pagar na entrega, por transferência bancária ou por Multicaixa. Escolha a opção que for melhor para si ao finalizar o pedido.",
  },
  {
    q: "Quanto tempo demora a entrega?",
    a: "Depois de confirmarmos o pedido, entramos em contacto para combinar o melhor momento e local de entrega.",
  },
  {
    q: "Recebo algum comprovativo?",
    a: "Sim. No fim do pedido pode baixar um PDF com o resumo das peças e dos seus dados de entrega.",
  },
  {
    q: "Posso tirar dúvidas antes de comprar?",
    a: "Claro! Fale connosco no WhatsApp e ajudamos a escolher tamanho, cor e a peça certa.",
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
    <div id="topo" className="space-y-20">
      {/* BOTÕES FLUTUANTES (só CSS) */}
      <div className="fixed bottom-5 right-5 z-40 flex flex-col items-center gap-3">
        <a
          href="#topo"
          aria-label="Voltar ao topo"
          className="grid h-11 w-11 place-items-center rounded-full bg-white shadow-lg transition hover:-translate-y-1 hover:bg-black hover:text-white"
        >
          <Icon name="up" />
        </a>
        <a
          href={wa}
          target="_blank"
          rel="noreferrer"
          aria-label="Falar no WhatsApp"
          className="group relative grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-xl transition hover:scale-110"
        >
          <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-[#25D366]/40" />
          <Icon name="chat" className="h-6 w-6" />
          <span className="pointer-events-none absolute right-16 whitespace-nowrap rounded-full bg-black px-3 py-1.5 text-xs font-medium text-white opacity-0 transition group-hover:opacity-100">
            Fale connosco
          </span>
        </a>
      </div>

      {/* HERO */}
      <section className="grid items-center gap-10 pt-6 md:grid-cols-12 md:pt-12">
        <div className="hero-in md:col-span-6">
          <p className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-sm font-medium shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--brand)] opacity-60" />
              <span className="relative h-2 w-2 rounded-full bg-[var(--brand)]" />
            </span>
            Nova coleção disponível
          </p>
          <h1 className="font-display mt-5 text-5xl font-extrabold leading-[0.95] md:text-7xl">
            Roupa que fala por si.
          </h1>
          <p className="mt-5 max-w-md text-lg text-neutral-600">
            {SITE.tagline}. Escolha em poucos cliques e receba em {SITE.city}.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#produtos"
              className="group inline-flex items-center gap-2 rounded-full bg-[var(--brand)] px-7 py-3.5 font-semibold text-white shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0"
            >
              Ver produtos
              <Icon name="arrow" className="h-5 w-5 transition group-hover:translate-x-1" />
            </a>
            <a
              href={wa}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-black/15 bg-white px-7 py-3.5 font-semibold transition hover:-translate-y-0.5 hover:border-black active:translate-y-0"
            >
              <Icon name="chat" />
              Falar no WhatsApp
            </a>
          </div>

          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-neutral-600">
            {(
              [
                { icon: "truck", text: `Entrega em ${SITE.city}` },
                { icon: "card", text: "Pague na entrega" },
                { icon: "shield", text: "Compra segura" },
              ] as { icon: IconName; text: string }[]
            ).map((t) => (
              <li key={t.text} className="inline-flex items-center gap-1.5">
                <Icon name={t.icon} className="h-4 w-4 text-[var(--brand)]" />
                {t.text}
              </li>
            ))}
          </ul>
        </div>

        <div className="grid h-[420px] grid-cols-2 gap-3 md:col-span-6 md:h-[560px]">
          {[0, 1, 2].map((i) => {
            const p = hero[i];
            const layout = i === 0 ? "row-span-2" : i === 2 ? "mt-8" : "";
            return (
              <Link
                key={i}
                href={p ? `/produto/${p.id}` : "/produtos"}
                className={`group relative overflow-hidden rounded-[2rem] bg-neutral-200 ${layout}`}
              >
                {p?.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.imageUrl}
                    alt={p.name}
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  />
                )}
                <span className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/60 to-transparent p-4 text-sm font-medium text-white opacity-0 transition duration-300 group-hover:opacity-100">
                  <span className="truncate">{p ? p.name : "Ver coleção"}</span>
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white text-black">
                    <Icon name="arrow" className="h-4 w-4" />
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* FAIXA DE CONFIANÇA */}
      <div className="rounded-3xl bg-black py-4 text-white md:rounded-full">
        <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 px-4 text-sm">
          {TRUST.map((t) => (
            <li key={t.text} className="inline-flex items-center gap-2">
              <Icon name={t.icon} className="h-4 w-4 text-white/70" />
              {t.text}
            </li>
          ))}
        </ul>
      </div>

      {/* BENEFÍCIOS */}
      <section className="grid divide-y divide-black/10 overflow-hidden rounded-3xl bg-white md:grid-cols-3 md:divide-x md:divide-y-0">
        {BENEFITS.map((b) => (
          <div key={b.title} className="group flex items-start gap-4 p-6 transition hover:bg-neutral-50">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[var(--brand)]/10 text-[var(--brand)] transition duration-300 group-hover:scale-110 group-hover:bg-[var(--brand)] group-hover:text-white">
              <Icon name={b.icon} className="h-6 w-6" />
            </span>
            <div>
              <h3 className="font-display text-lg font-bold">{b.title}</h3>
              <p className="mt-1 text-sm text-neutral-600">{b.text}</p>
            </div>
          </div>
        ))}
      </section>

      {/* PRODUTOS */}
      <section id="produtos" className="scroll-mt-24">
        <div className="mb-8 flex items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-4xl font-extrabold">Acabou de chegar</h2>
            <p className="mt-1 text-neutral-500">As peças mais recentes, prontas para entrega.</p>
          </div>
          <Link
            href="/produtos"
            className="group inline-flex shrink-0 items-center gap-1.5 rounded-full border border-black/15 bg-white px-4 py-2 text-sm font-semibold transition hover:border-black"
          >
            Ver todos
            <Icon name="arrow" className="h-4 w-4 transition group-hover:translate-x-1" />
          </Link>
        </div>

        {products.length === 0 ? (
          <p className="rounded-3xl bg-white py-20 text-center text-neutral-500">
            Estamos a preparar novas peças. Volte em breve.
          </p>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>

            <div className="mt-10 text-center">
              <Link
                href="/produtos"
                className="group inline-flex items-center gap-2 rounded-full bg-black px-8 py-3.5 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[var(--brand)]"
              >
                <Icon name="bag" />
                Ver todas as peças
                <Icon name="arrow" className="h-5 w-5 transition group-hover:translate-x-1" />
              </Link>
            </div>
          </>
        )}
      </section>

      {/* COMO COMPRAR */}
      <section>
        <h2 className="font-display mb-8 text-4xl font-extrabold">Como comprar</h2>
        <ol className="grid gap-4 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <li
              key={s.title}
              className="group rounded-3xl bg-white p-6 transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/5"
            >
              <div className="flex items-center justify-between">
                <span className="font-display text-5xl font-extrabold text-[var(--brand)]">{i + 1}</span>
                <span className="grid h-11 w-11 place-items-center rounded-full bg-neutral-100 transition duration-300 group-hover:bg-[var(--brand)] group-hover:text-white">
                  <Icon name={s.icon} />
                </span>
              </div>
              <h3 className="mt-4 font-semibold">{s.title}</h3>
              <p className="mt-1 text-sm text-neutral-600">{s.text}</p>
            </li>
          ))}
        </ol>
        <div className="mt-6 text-center">
          <a
            href="#produtos"
            className="inline-flex items-center gap-2 rounded-full border border-black/15 bg-white px-6 py-3 text-sm font-semibold transition hover:border-black"
          >
            <Icon name="cursor" className="h-4 w-4" />
            Começar a escolher
          </a>
        </div>
      </section>

      {/* PERGUNTAS FREQUENTES (<details> nativo, sem JavaScript) */}
      <section>
        <h2 className="font-display mb-8 text-4xl font-extrabold">Perguntas frequentes</h2>
        <div className="divide-y divide-black/10 overflow-hidden rounded-3xl bg-white">
          {FAQ.map((item, i) => (
            <details key={item.q} open={i === 0} className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 font-semibold transition hover:text-[var(--brand)] [&::-webkit-details-marker]:hidden">
                {item.q}
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-neutral-100 transition duration-300 group-open:rotate-180 group-open:bg-[var(--brand)] group-open:text-white">
                  <Icon name="chevron" className="h-4 w-4" />
                </span>
              </summary>
              <p className="px-6 pb-5 text-sm text-neutral-600">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CONTACTO */}
      <section className="rounded-[2rem] bg-[var(--brand)] px-6 py-14 text-center text-white">
        <h2 className="font-display text-4xl font-extrabold">Não sabe qual escolher?</h2>
        <p className="mx-auto mt-2 max-w-md text-white/80">
          Envie-nos uma mensagem e ajudamos a encontrar a peça certa.
        </p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <a
            href={wa}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 font-semibold text-black transition hover:bg-black hover:text-white"
          >
            <Icon name="chat" />
            Falar no WhatsApp
          </a>
          <Link
            href="/produtos"
            className="inline-flex items-center gap-2 rounded-full border border-white/40 px-8 py-3.5 font-semibold text-white transition hover:bg-white/10"
          >
            Ver produtos
            <Icon name="arrow" />
          </Link>
        </div>
      </section>
    </div>
  );
}