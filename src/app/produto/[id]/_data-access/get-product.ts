import type { Disponibilidade, Product } from "@/data/products";
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

interface DbProductImage {
  url: string;
  order: number;
  is_primary: boolean;
}

function getPrimaryImageUrl(
  productId: string,
  images: DbProductImage[]
): string {
  if (images.length === 0) return "";

  const primaryImage = images.find((image) => image.is_primary);
  if (primaryImage) return primaryImage.url;

  return [...images].sort((a, b) => a.order - b.order)[0]?.url ?? "";
}

function isValidStoredImageUrl(url?: string): boolean {
  if (!url) return false;

  const trimmed = url.trim();
  if (!trimmed.startsWith("http")) return false;

  return /\/storage\/v1\/object\/public\/product-images\/.*\.[a-z0-9]+(?:\?.*)?$/i.test(
    trimmed
  );
}

function normalizeStoredImageUrl(productId: string, imageUrl?: string): string {
  if (!imageUrl) return "";

  const normalized = imageUrl.trim();
  const legacyUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""}/storage/v1/object/public/product-images/${productId}`;

  if (normalized === legacyUrl) return "";
  if (!isValidStoredImageUrl(normalized)) return "";

  return normalized;
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

  const [{ data: product }, { data: productImages }, { data: relations }] =
    await Promise.all([
      supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .eq("is_active", true)
        .single(),
      supabase
        .from("product_images")
        .select("url, order, is_primary")
        .eq("product_id", id)
        .order("order"),
      supabase
        .from("product_relations")
        .select("related_id")
        .eq("product_id", id),
    ]);

  if (!product) return undefined;

  const typedProduct = product as unknown as DbProduct;
  const safeImages = (productImages ?? []) as DbProductImage[];
  const primaryImageUrl = getPrimaryImageUrl(id, safeImages);

  const typedRelations = (relations ?? []) as unknown as DbRelation[];
  const relatedIds = typedRelations.map((r: DbRelation) => r.related_id);

  return mapDbToProduct(
    {
      ...typedProduct,
      image_url:
        primaryImageUrl || normalizeStoredImageUrl(id, typedProduct.image_url),
    },
    relatedIds
  );
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
