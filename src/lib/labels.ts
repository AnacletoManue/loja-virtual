export const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendente",
  CONFIRMED: "Confirmado",
  DELIVERED: "Entregue",
  CANCELLED: "Cancelado",
};

export const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-neutral-200 text-neutral-600",
};

export const PAYMENT_LABELS: Record<string, string> = {
  CASH_ON_DELIVERY: "Pagamento na entrega",
  BANK_TRANSFER: "Transferência bancária",
  MULTICAIXA_EXPRESS: "Multicaixa Express",
  REFERENCE: "Pagamento por referência",
};

export const fmtDate = (d: Date) =>
  d.toLocaleString("pt-PT", { timeZone: "Africa/Luanda", dateStyle: "short", timeStyle: "short" });
