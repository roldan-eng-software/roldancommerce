"use server";

import { PAGE_SIZE, type Product, type Disponibilidade } from "@/data/products";
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
  product_id: string;
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

export async function fetchProductsPage(page: number): Promise<{
  products: Product[];
  totalPages: number;
  currentPage: number;
}> {
  const supabase = await createClient();
  if (!supabase) {
    return { products: [], totalPages: 1, currentPage: 1 };
  }

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { count } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })
    .eq("is_active", true);

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("is_featured", { ascending: false })
    .order("name")
    .range(from, to);

  if (!products) {
    return { products: [], totalPages: 1, currentPage: 1 };
  }

  const typedProducts = products as unknown as DbProduct[];
  const productIds = typedProducts.map((p: DbProduct) => p.id);

  const { data: relations } = await supabase
    .from("product_relations")
    .select("product_id, related_id")
    .in("product_id", productIds);

  const typedRelations = (relations ?? []) as unknown as DbRelation[];
  const relatedMap = new Map<string, string[]>();
  typedRelations.forEach((r: DbRelation) => {
    const existing = relatedMap.get(r.product_id) || [];
    existing.push(r.related_id);
    relatedMap.set(r.product_id, existing);
  });

  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));

  return {
    products: typedProducts.map((p: DbProduct) =>
      mapDbToProduct(p, relatedMap.get(p.id))
    ),
    totalPages,
    currentPage: Math.min(page, totalPages),
  };
}
