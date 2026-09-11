const BUCKET = "product-images";

export function getProductImageUrl(productId: string, ext?: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const suffix = ext ? `.${ext}` : "";
  return `${base}/storage/v1/object/public/${BUCKET}/${productId}${suffix}`;
}

export function getProductImagePaths(): string[] {
  return [
    "porta-celulares",
    "nicho-decorativo-parede",
    "mesa-cabeceira",
    "prateleiras-parede",
    "armario-banheiro-rodizios",
    "mesa-centro-tv",
    "porta-tablets",
    "porta-biblias",
    "caixa-biblias",
    "caixa-cha",
    "nicho-organizador-chao",
    "portas-avulsas",
    "porta-guardanapos",
    "suporte-leitura",
    "nicho-organizador-mesa",
    "expositor-roupas",
    "expositor-calcados",
    "suporte-air-fryer",
    "suporte-micro-ondas",
    "tampo-mdf",
    "suporte-monitor",
  ];
}
