import type { Product, Disponibilidade } from "@/data/products";
import { createClient } from "@/lib/supabase/server";

interface DbProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  description: string;
  short_description: string;
  dimensions: string;
  mdf_color: string;
  availability: Disponibilidade;
  weight: number;
  stock: number;
  stock_min: number;
  is_featured: boolean;
  is_active: boolean;
  manual_url: string;
  image_url: string;
}

interface DbRelation {
  related_id: string;
}

function mapDbToProduct(db: DbProduct, relatedIds?: string[]): Product {
  return {
    id: db.id,
    nome: db.name,
    preco: db.price,
    disponibilidade: db.availability,
    destaque: db.is_featured || undefined,
    medidas: db.dimensions || undefined,
    corMdf: db.mdf_color || undefined,
    descricao: db.description,
    resumoRapido: db.short_description || undefined,
    manualUrl: db.manual_url || undefined,
    relacionados: relatedIds,
    peso: db.weight || undefined,
    imagemUrl: db.image_url || undefined,
  };
}

export async function getProductById(id: string): Promise<Product | undefined> {
  const supabase = await createClient();
  if (!supabase) return undefined;

  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .eq("is_active", true)
    .single();

  if (!product) return undefined;

  const { data: relations } = await supabase
    .from("product_relations")
    .select("related_id")
    .eq("product_id", id);

  const typedRelations = (relations ?? []) as unknown as DbRelation[];
  const relatedIds = typedRelations.map((r: DbRelation) => r.related_id);

  return mapDbToProduct(product as unknown as DbProduct, relatedIds);
}

export async function getRelatedProducts(product: Product): Promise<Product[]> {
  const supabase = await createClient();
  if (!supabase || !product.relacionados?.length) return [];

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .in("id", product.relacionados)
    .eq("is_active", true);

  if (!products) return [];

  return (products as unknown as DbProduct[]).map((p: DbProduct) =>
    mapDbToProduct(p)
  );
}
