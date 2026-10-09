// Deixa só os dígitos e remove o indicativo de Angola (+244)
export function normalizePhone(raw: string) {
  let d = raw.replace(/\D/g, "");
  if (d.length === 12 && d.startsWith("244")) d = d.slice(3);
  return d;
}
