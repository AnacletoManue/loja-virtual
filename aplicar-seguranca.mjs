// Aplica as alterações de segurança nos ficheiros COM design, sem mexer no visual.
// Uso (na raiz do projeto):  node aplicar-seguranca.mjs
import fs from "node:fs";
import path from "node:path";

const SRC = path.join(process.cwd(), "src");
if (!fs.existsSync(SRC)) {
  console.error("Pasta src não encontrada. Rode este script na raiz do projeto (~/loja-roupa).");
  process.exit(1);
}

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name !== "node_modules" && e.name !== ".next") walk(p, out);
    } else if (/\.(ts|tsx)$/.test(e.name)) out.push(p);
  }
  return out;
}

const PUSH_OLD = "router.push(`/pedido/${data.id}`);";
const PUSH_NEW = "router.push(`/pedido/${data.token}`);";
const PDF_OLD = "href={`/api/pedidos/${order.id}/pdf`}";
const PDF_NEW = "href={`/api/pedidos/${order.publicToken}/pdf`}";

const HONEYPOT = `{/* Campo isca (anti-robô): invisível para pessoas */}
          <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
            <label>
              Não preencha este campo
              <input name="website" tabIndex={-1} autoComplete="off" />
            </label>
          </div>
        </form>`;

const TARGETS = [
  {
    nome: "Página do pedido (cliente)",
    marker: "export default async function OrderPage",
    edits: [
      { old: 'import { whatsappLink } from "@/lib/site";',
        neu: 'import { SITE } from "@/lib/site";\nimport { isToken } from "@/lib/token";',
        done: 'from "@/lib/token"' },
      { old: 'export const dynamic = "force-dynamic";',
        neu: 'export const dynamic = "force-dynamic";\nexport const metadata = { title: "Pedido", robots: { index: false, follow: false } };',
        done: "robots: {" },
      { old: "const { id } = await params;",
        neu: "const { id } = await params;\n  if (!isToken(id)) notFound();",
        done: "if (!isToken(id))" },
      { old: "where: { id },", neu: "where: { publicToken: id },", done: "publicToken: id" },
      // corrige também o link do WhatsApp (tinha dois "?text=")
      { old: "const wa = whatsappLink();",
        neu: "const wa = `https://wa.me/${SITE.whatsapp}`;",
        done: "SITE.whatsapp" },
      { old: PDF_OLD, neu: PDF_NEW, done: "order.publicToken" },
    ],
  },
  {
    nome: "Checkout",
    marker: "export default function CheckoutPage",
    edits: [
      { old: 'const [paymentMethod, setPaymentMethod] = useState("CASH_ON_DELIVERY");',
        neu: 'const [paymentMethod, setPaymentMethod] = useState("CASH_ON_DELIVERY");\n  const [openedAt] = useState(() => Date.now());',
        done: "openedAt" },
      { old: 'notes: f.get("notes"),',
        neu: 'notes: f.get("notes"),\n        website: f.get("website"),\n        elapsedMs: Date.now() - openedAt,',
        done: "elapsedMs" },
      { old: PUSH_OLD, neu: PUSH_NEW, done: "data.token" },
      { old: "</form>", neu: HONEYPOT, done: 'name="website"' },
    ],
  },
  {
    nome: "Detalhe do pedido (admin)",
    marker: "export default async function OrderDetail",
    edits: [{ old: PDF_OLD, neu: PDF_NEW, done: "order.publicToken" }],
  },
  {
    nome: "Consultar pedido (cliente)",
    marker: 'fetch("/api/consultar-pedido"',
    edits: [{ old: PUSH_OLD, neu: PUSH_NEW, done: "data.token" }],
  },
];

const files = walk(SRC).map((f) => ({ f, text: fs.readFileSync(f, "utf8") }));
const count = (s, sub) => s.split(sub).length - 1;

const plan = [];
let problems = 0;

for (const t of TARGETS) {
  const hits = files.filter((x) => x.text.includes(t.marker));
  if (hits.length !== 1) {
    console.log(`✗ ${t.nome}: encontrei ${hits.length} ficheiro(s) (esperado 1).`);
    problems++;
    continue;
  }
  const file = hits[0];
  let text = file.text;
  const notes = [];
  for (const e of t.edits) {
    if (text.includes(e.neu)) {
      notes.push("já aplicado: " + e.old.slice(0, 40));
      continue;
    }
    const n = count(text, e.old);
    if (n !== 1) {
      console.log(`✗ ${t.nome} (${path.relative(process.cwd(), file.f)}): trecho ${n === 0 ? "não encontrado" : "repetido"}:\n    ${e.old.slice(0, 80)}`);
      problems++;
      continue;
    }
    text = text.replace(e.old, () => e.neu);
  }
  plan.push({ t, file, text, notes });
}

if (problems > 0) {
  console.log("\nNada foi alterado. Me envie esta mensagem e eu ajusto o script.");
  process.exit(1);
}

for (const p of plan) {
  if (p.text !== p.file.text) {
    fs.writeFileSync(p.file.f + ".bak", p.file.text);
    fs.writeFileSync(p.file.f, p.text);
    console.log(`✓ ${p.t.nome}: ${path.relative(process.cwd(), p.file.f)} (cópia em .bak)`);
  } else {
    console.log(`= ${p.t.nome}: já estava atualizado.`);
  }
}
console.log("\nConcluído. Depois de testar, apague as cópias:  find src -name '*.bak' -delete");
