export type Disponibilidade = "pronta-entrega" | "fabricacao" | "sob-medida";

export interface Product {
  id: string;
  nome: string;
  preco: number;
  disponibilidade: Disponibilidade;
  destaque?: boolean;
  medidas?: string;
  corMdf?: string;
  descricao: string;
  resumoRapido?: string;
  manualUrl?: string;
  relacionados?: string[];
  peso?: number;
}

export const SAO_CARLOS_CEPS = ["13560", "13561", "13562", "13563", "13564", "13565", "13566", "13567", "13568", "13569"];

export function isSaoCarlos(cep: string): boolean {
  const clean = cep.replace(/\D/g, "");
  return SAO_CARLOS_CEPS.some((prefix) => clean.startsWith(prefix));
}

export function calcFrete(cep: string, items: { product: Product; quantity: number }[]): { valor: number; prazo: string } | null {
  const clean = cep.replace(/\D/g, "");
  if (clean.length !== 8) return null;

  if (isSaoCarlos(clean)) {
    return { valor: 0, prazo: "Entrega no dia seguinte" };
  }

  const totalPeso = items.reduce((sum, i) => sum + (i.product.peso ?? 0.5) * i.quantity, 0);
  const valor = Math.max(15, Math.round(totalPeso * 4.5 * 100) / 100);
  const maxDias = items.reduce((max, i) => {
    if (i.product.disponibilidade === "sob-medida") return Math.max(max, 10);
    if (i.product.disponibilidade === "fabricacao") return Math.max(max, 5);
    return Math.max(max, 3);
  }, 0);
  return { valor, prazo: `Entrega em até ${maxDias} dias úteis` };
}

export const PAGE_SIZE = 12;

export function prazoLabel(d: Disponibilidade): string {
  if (d === "pronta-entrega") return "Envio no dia seguinte";
  if (d === "fabricacao") return "Envio em até 5 dias";
  return "Envio em até 10 dias";
}

export function formatPrice(valor: number): string {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export const PRODUCTS: Product[] = [
  {
    id: "porta-celulares",
    nome: "Porta Celulares",
    preco: 34.9,
    disponibilidade: "pronta-entrega",
    destaque: true,
    medidas: "10 x 12 x 8 cm",
    corMdf: "Branco / Madeirado",
    descricao: "Apoio de mesa em MDF para celular na vertical ou horizontal.",
    resumoRapido: "Prático e compacto. Coloque o celular na vertical ou horizontal.",
    relacionados: ["porta-tablets", "suporte-monitor", "nicho-organizador-mesa"],
  },
  {
    id: "nicho-decorativo-parede",
    nome: "Nicho Decorativo de Parede",
    preco: 59.9,
    disponibilidade: "pronta-entrega",
    destaque: true,
    medidas: "30 x 30 x 12 cm",
    corMdf: "Branco / Madeirado / Colorido",
    descricao: "Nicho quadrado para decorar sala, quarto ou corredor.",
    resumoRapido: "Decore com quadros, plantas ou livros. Fixação na parede.",
    relacionados: ["prateleiras-parede", "nicho-organizador-mesa", "suporte-leitura"],
  },
  {
    id: "mesa-cabeceira",
    nome: "Mesa de Cabeceira",
    preco: 189.9,
    disponibilidade: "pronta-entrega",
    destaque: true,
    medidas: "40 x 45 x 35 cm",
    corMdf: "Branco / Madeirado",
    descricao: "Criado-mudo compacto com nicho aberto para quarto.",
    resumoRapido: "Criado-mudo com nicho aberto. Guarda livros e objetos de cabeceira.",
    relacionados: ["nicho-decorativo-parede", "prateleiras-parede", "suporte-leitura"],
  },
  {
    id: "prateleiras-parede",
    nome: "Prateleiras de Parede",
    preco: 79.9,
    disponibilidade: "pronta-entrega",
    destaque: true,
    medidas: "60 x 20 x 15 cm",
    corMdf: "Branco / Madeirado",
    descricao: "Par de prateleiras retas para livros e decoração.",
    resumoRapido: "Pack de 2 prateleiras. 60 cm de largura para livros e decoração.",
    relacionados: ["nicho-decorativo-parede", "suporte-air-fryer", "suporte-monitor"],
  },
  {
    id: "armario-banheiro-rodizios",
    nome: "Armário de Banheiro com Rodízios",
    preco: 329.9,
    disponibilidade: "fabricacao",
    medidas: "50 x 70 x 30 cm",
    corMdf: "Branco",
    descricao: "Armário baixo com rodízios, ideal para banheiro e lavabo.",
    resumoRapido: "Armário baixo com rodízios. Facilita limpeza do chão.",
    relacionados: ["nicho-organizador-chao", "prateleiras-parede", "tampo-mdf"],
  },
  {
    id: "mesa-centro-tv",
    nome: "Mesa de Centro para TV",
    preco: 399.9,
    disponibilidade: "fabricacao",
    medidas: "90 x 40 x 35 cm",
    corMdf: "Madeirado / Branco",
    descricao: "Mesa de centro baixa com nichos para sala de TV.",
    resumoRapido: "Mesa de centro com nichos para home theater e decoração.",
    relacionados: ["armario-banheiro-rodizios", "nicho-organizador-chao", "suporte-monitor"],
  },
  {
    id: "porta-tablets",
    nome: "Porta Tablets",
    preco: 39.9,
    disponibilidade: "pronta-entrega",
    medidas: "20 x 14 x 10 cm",
    corMdf: "Branco / Madeirado",
    descricao: "Suporte de mesa para tablet em modo leitura ou vídeo.",
    resumoRapido: "Segure o tablet em qualquer ângulo para leitura ou vídeo.",
    relacionados: ["porta-celulares", "suporte-monitor", "suporte-leitura"],
  },
  {
    id: "porta-biblias",
    nome: "Porta Bíblias",
    preco: 44.9,
    disponibilidade: "pronta-entrega",
    medidas: "25 x 18 x 8 cm",
    corMdf: "Madeirado / Branco",
    descricao: "Apoio para bíblia aberta ou fechada sobre mesa e estante.",
    resumoRapido: "Mantenha sua bíblia organizada e protegida sobre a mesa.",
    relacionados: ["caixa-biblias", "prateleiras-parede", "suporte-leitura"],
  },
  {
    id: "caixa-biblias",
    nome: "Caixa para Guardar Bíblias",
    preco: 69.9,
 disponibilidade: "pronta-entrega",
    medidas: "30 x 22 x 12 cm",
    corMdf: "Madeirado / Colorido",
    descricao: "Caixa com tampa para guardar e proteger bíblias.",
    resumoRapido: "Proteja suas bíblias com esta caixa com tampa em MDF.",
    relacionados: ["porta-biblias", "prateleiras-parede", "caixa-cha"],
  },
  {
    id: "caixa-cha",
    nome: "Caixa para Envelopes de Chá",
    preco: 49.9,
    disponibilidade: "pronta-entrega",
    medidas: "18 x 12 x 8 cm",
    corMdf: "Branco / Colorido",
    descricao: "Caixa organizadora com divisórias para sachês de chá.",
    resumoRapido: "Organize seus sachês de chá com divisórias internas.",
    relacionados: ["caixa-biblias", "nicho-organizador-mesa", "porta-guardanapos"],
  },
  {
    id: "nicho-organizador-chao",
    nome: "Nicho Organizador de Chão",
    preco: 129.9,
    disponibilidade: "fabricacao",
    medidas: "60 x 40 x 30 cm",
    corMdf: "Branco / Madeirado",
    descricao: "Nicho baixo empilhável para brinquedos, calçados e mantas.",
    resumoRapido: "Empilhe vários para organizar brinquedos e calçados.",
    relacionados: ["nicho-organizador-mesa", "armario-banheiro-rodizios", "mesa-centro-tv"],
  },
  {
    id: "portas-avulsas",
    nome: "Portas Avulsas sob Medida",
    preco: 119.9,
    disponibilidade: "sob-medida",
    medidas: "Sob medida",
    corMdf: "Branco / Madeirado / Colorido",
    descricao: "Portas em MDF sob medida para móveis planejados existentes.",
    resumoRapido: "Substitua portas de armários sob medida. Envio em até 10 dias.",
    relacionados: ["tampo-mdf", "armario-banheiro-rodizios", "mesa-centro-tv"],
  },
  {
    id: "porta-guardanapos",
    nome: "Porta Guardanapos de Mesa",
    preco: 24.9,
    disponibilidade: "pronta-entrega",
    medidas: "12 x 8 x 5 cm",
    corMdf: "Branco / Colorido",
    descricao: "Porta-guardanapos compacto para mesa posta e lanchonete.",
    resumoRapido: "Mantenha guardanapos organizados na mesa de jantar.",
    relacionados: ["caixa-cha", "nicho-organizador-mesa", "porta-celulares"],
  },
  {
    id: "suporte-leitura",
    nome: "Suporte de Leitura Inclinado",
    preco: 54.9,
    disponibilidade: "pronta-entrega",
    medidas: "30 x 22 cm, plano inclinado",
    corMdf: "Madeirado / Branco",
    descricao: "Plano inclinado ergonômico para leitura de livros e tablets.",
    resumoRapido: "Plano inclinado ergonômico. Mantenha livros abertos sem segurar.",
    relacionados: ["porta-celulares", "porta-biblias", "prateleiras-parede"],
  },
  {
    id: "nicho-organizador-mesa",
    nome: "Nicho Organizador de Mesa",
    preco: 64.9,
    disponibilidade: "pronta-entrega",
    medidas: "35 x 15 x 12 cm",
    corMdf: "Branco / Colorido",
    descricao: "Organizador com nichos para escritório e home office.",
    resumoRapido: "Mantenha canetas, clipes e papéis organizados no escritório.",
    relacionados: ["suporte-monitor", "nicho-decorativo-parede", "porta-celulares"],
  },
  {
    id: "expositor-roupas",
    nome: "Expositor de Roupas de Parede",
    preco: 149.9,
    disponibilidade: "fabricacao",
    medidas: "80 x 20 x 25 cm, com tubo cabideiro",
    corMdf: "Madeirado / Branco",
    descricao: "Arara de parede com tubo cabideiro para loja e quarto.",
    resumoRapido: "Arara de parede com tubo cabideiro para loja ou quarto.",
    relacionados: ["expositor-calcados", "prateleiras-parede", "nicho-decorativo-parede"],
  },
  {
    id: "expositor-calcados",
    nome: "Expositor de Sapatos de Parede",
    preco: 139.9,
    disponibilidade: "fabricacao",
    medidas: "80 x 30 x 20 cm",
    corMdf: "Branco / Madeirado",
    descricao: "Prateleira inclinada para expor tênis e sapatos na parede.",
    resumoRapido: "Exponha tênis e sapatos como decoração na parede.",
    relacionados: ["expositor-roupas", "prateleiras-parede", "nicho-organizador-chao"],
  },
  {
    id: "suporte-air-fryer",
    nome: "Suporte Air Fryer de Parede",
    preco: 119.9,
    disponibilidade: "pronta-entrega",
    medidas: "45 x 35 x 30 cm",
    corMdf: "Branco",
    descricao: "Prateleira reforçada de parede para Air Fryer.",
    resumoRapido: "Fixe na parede e libere espaço na bancada. Suporta Air Fryer.",
    relacionados: ["suporte-micro-ondas", "prateleiras-parede", "nicho-organizador-mesa"],
  },
  {
    id: "suporte-micro-ondas",
    nome: "Suporte Micro-ondas (até 21L / 20kg)",
    preco: 129.9,
    disponibilidade: "pronta-entrega",
    destaque: true,
    medidas: "60 x 40 x 35 cm, suporta até 20kg e 21L",
    corMdf: "Branco",
    descricao: "Prateleira reforçada de parede para micro-ondas até 21L e 20kg.",
    resumoRapido: "Suporta até 20kg e 21L. Fixe na parede e libere a bancada.",
    relacionados: ["suporte-air-fryer", "prateleiras-parede", "nicho-organizador-mesa"],
  },
  {
    id: "tampo-mdf",
    nome: "Tampo MDF Multiuso sob Medida",
    preco: 99.9,
    disponibilidade: "sob-medida",
    medidas: "Até 60 x 90 cm, branco",
    corMdf: "Branco",
    descricao: "Tampo em MDF branco cortado sob medida até 60 x 90 cm.",
    resumoRapido: "Corte sob medida até 60x90 cm. Ideal para bancadas e estantes.",
    relacionados: ["portas-avulsas", "mesa-centro-tv", "armario-banheiro-rodizios"],
  },
  {
    id: "suporte-monitor",
    nome: "Suporte para Monitor",
    preco: 89.9,
    disponibilidade: "pronta-entrega",
    destaque: true,
    medidas: "50 x 22 x 10 cm",
    corMdf: "Branco / Madeirado",
    descricao: "Base elevada para monitor com espaço para teclado e Nicho.",
    resumoRapido: "Erga o monitor e ganhe nicho embaixo para teclado.",
    relacionados: ["porta-celulares", "nicho-organizador-mesa", "suporte-leitura"],
  },
];
