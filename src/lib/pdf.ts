import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export const PAYMENT_LABELS: Record<string, string> = {
  CASH_ON_DELIVERY: "Pagamento na entrega",
  BANK_TRANSFER: "Transferência bancária",
  MULTICAIXA_EXPRESS: "Multicaixa Express",
  REFERENCE: "Pagamento por referência",
};

type OrderForPdf = {
  orderNumber: number;
  customerName: string;
  phone: string;
  address: string;
  notes: string | null;
  paymentMethod: string;
  total: number;
  createdAt: Date;
  items: { name: string; unitPrice: number; quantity: number }[];
};

// As fontes padrão do PDF só aceitam Latin-1: troca o resto por "?"
const clean = (s: string) =>
  s.replace(/[\u00A0\u202F]/g, " ").replace(/[^\x20-\x7E\u00A1-\u00FF]/g, "?");

const kz = (n: number) => clean(new Intl.NumberFormat("pt-AO").format(n)) + " Kz";

export async function buildOrderPdf(order: OrderForPdf): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  const W = 595, H = 842, M = 50;
  let page = pdf.addPage([W, H]);
  let y = H - M;

  const text = (t: string, x: number, size = 10, b = false, align: "l" | "r" = "l") => {
    const s = clean(t);
    const f = b ? bold : font;
    const px = align === "r" ? x - f.widthOfTextAtSize(s, size) : x;
    page.drawText(s, { x: px, y, size, font: f, color: rgb(0.1, 0.1, 0.1) });
  };

  const truncate = (t: string, max: number, size = 10) => {
    let s = clean(t);
    while (s.length > 1 && font.widthOfTextAtSize(s, size) > max) s = s.slice(0, -1);
    return s === clean(t) ? s : s.trimEnd() + "...";
  };

  const line = () => {
    page.drawLine({ start: { x: M, y }, end: { x: W - M, y }, thickness: 0.7, color: rgb(0.8, 0.8, 0.8) });
  };

  text("Minha Loja", M, 20, true);
  text(`Pedido #${order.orderNumber}`, W - M, 14, true, "r");
  y -= 18;
  text(
    order.createdAt.toLocaleString("pt-PT", { timeZone: "Africa/Luanda" }),
    W - M, 10, false, "r"
  );
  y -= 22;
  line();
  y -= 22;

  text("Dados do cliente e entrega", M, 12, true);
  y -= 18;
  const info: [string, string][] = [
    ["Nome", order.customerName],
    ["Telefone", order.phone],
    ["Entrega", order.address],
    ["Pagamento", PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod],
  ];
  if (order.notes) info.push(["Observações", order.notes]);
  for (const [k, v] of info) {
    text(`${k}:`, M, 10, true);
    text(truncate(v, W - 2 * M - 90), M + 90, 10);
    y -= 15;
  }

  y -= 10;
  line();
  y -= 20;

  const colQty = 330, colUnit = 440, colSub = W - M;
  const header = () => {
    text("Produto", M, 10, true);
    text("Qtd", colQty, 10, true);
    text("Preço", colUnit, 10, true, "r");
    text("Subtotal", colSub, 10, true, "r");
    y -= 8;
    line();
    y -= 16;
  };
  header();

  for (const it of order.items) {
    if (y < 110) {
      page = pdf.addPage([W, H]);
      y = H - M;
      header();
    }
    text(truncate(it.name, colQty - M - 15), M, 10);
    text(String(it.quantity), colQty, 10);
    text(kz(it.unitPrice), colUnit, 10, false, "r");
    text(kz(it.unitPrice * it.quantity), colSub, 10, false, "r");
    y -= 18;
  }

  y -= 4;
  line();
  y -= 24;
  text("TOTAL", M, 13, true);
  text(kz(order.total), colSub, 13, true, "r");

  y -= 50;
  text("Obrigado pela sua compra!", M, 10);

  return pdf.save();
}
