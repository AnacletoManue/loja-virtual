export const formatKz = (value: number) =>
  new Intl.NumberFormat("pt-AO").format(value) + " Kz";
