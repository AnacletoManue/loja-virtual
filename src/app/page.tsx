import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";
import { SITE, whatsappLink } from "@/lib/site";

export const dynamic = "force-dynamic";

const BENEFITS = [
  { icon: "🚚", title: "Entrega ao seu local", text: "Receba as suas peças onde estiver." },
  { icon: "💳", title: "Vários métodos de pagamento", text: "Pague na entrega, por transferência ou Multicaixa." },
  { icon: "📄", title: "Pedido em PDF", text: "Ao finalizar, receba o comprovativo da encomenda." },
];

const STEPS = [
  { n: "1", title: "Escolha as peças", text: "Veja os produtos disponíveis e adicione ao carrinho." },
  { n: "2", title: "Preencha os seus dados", text: "Nome, telefone e local de entrega." },
  { n: "3", title: "Confirme o pedido", text: "Baixe o PDF e aguarde o nosso contacto." },
];

export default async function Home() {
  const products = await prisma.product.findMany({
    where: { active: true, stock: { gt: 0 } },
    orderBy: { createdAt: "desc" },
    take: 8,
  });

  return (
    <div className="space-y-16">
      {/* HERO */}
      <section className="relative overflow-hidden rounded-3xl bg-neutral-900 px-6 py-14 text-white md:px-14 md:py-24">
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-amber-500/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-72 w-72 rounded-full bg-pink-500/20 blur-3xl" />

        <div className="relative max-w-xl">
          <p className="text-xs font-medium uppercase tracking-[0.25em] text-amber-300">Nova coleção</p>
          <h1 className="mt-3 text-4xl font-extrabold leading-tight md:text-6xl">
            Vista o seu <span className="text-amber-300">estilo</span>
          </h1>
          <p className="mt-4 text-lg text-neutral-300">
            {SITE.tagline}. Escolha, peça em poucos cliques e receba em {SITE.city}.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#produtos"
              className="rounded-full bg-white px-7 py-3 font-semibold text-black transition hover:bg-amber-300"
            >
              Ver produtos
            </a>
            <a
              href={whatsappLink()}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-white/40 px-7 py-3 font-medium text-white transition hover:bg-white/10"
            >
              Falar no WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* BENEFÍCIOS */}
      <section className="grid gap-4 md:grid-cols-3">
        {BENEFITS.map((b) => (
          <div key={b.title} className="rounded-2xl border bg-white p-5">
            <p className="text-2xl">{b.icon}</p>
            <h3 className="mt-2 font-semibold">{b.title}</h3>
            <p className="mt-1 text-sm text-neutral-600">{b.text}</p>
          </div>
        ))}
      </section>

      {/* PRODUTOS DISPONÍVEIS */}
      <section id="produtos" className="scroll-mt-20">
        <div className="mb-5 flex items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold">Produtos disponíveis</h2>
            <p className="text-sm text-neutral-500">As peças mais recentes, prontas para entrega.</p>
          </div>
          <Link href="/produtos" className="shrink-0 text-sm font-medium underline">
            Ver todos →
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="rounded-2xl border bg-white py-16 text-center">
            <p className="text-3xl">🛍️</p>
            <p className="mt-2 text-neutral-500">Em breve teremos novidades. Volte já!</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
            <div className="mt-8 text-center">
              <Link
                href="/produtos"
                className="inline-block rounded-full bg-black px-8 py-3 font-medium text-white transition hover:bg-neutral-800"
              >
                Ver todos os produtos
              </Link>
            </div>
          </>
        )}
      </section>

      {/* COMO COMPRAR */}
      <section>
        <h2 className="mb-5 text-center text-2xl font-bold">Como comprar</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.n} className="rounded-2xl border bg-white p-5 text-center">
              <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-black font-bold text-white">
                {s.n}
              </span>
              <h3 className="mt-3 font-semibold">{s.title}</h3>
              <p className="mt-1 text-sm text-neutral-600">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CONTACTO */}
      <section className="rounded-3xl bg-gradient-to-r from-amber-400 to-pink-400 px-6 py-10 text-center text-neutral-900">
        <h2 className="text-2xl font-bold">Tem dúvidas?</h2>
        <p className="mt-1">Fale connosco e ajudamos a escolher a peça certa.</p>
        <a
          href={whatsappLink()}
          target="_blank"
          rel="noreferrer"
          className="mt-5 inline-block rounded-full bg-black px-8 py-3 font-medium text-white transition hover:bg-neutral-800"
        >
          Falar no WhatsApp
        </a>
      </section>
    </div>
  );
}
