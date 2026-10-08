// Edite aqui os dados da sua loja
export const SITE = {
  name: "HG - Vestuario",
  tagline: "Roupas com estilo, entregues até si",
  city: "Luanda",
  // número com indicativo, só dígitos (ex.: 244923000000)
  whatsapp: "244932966225",
};

export const whatsappLink = (text = "Olá! Gostaria de saber mais sobre os vossos produtos.") =>
  `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(text)}`;
