import { PAGE_SIZE, type Disponibilidade, type Product } from "@/data/products";
import { createBuildClient } from "@/lib/supabase/build";
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

interface DbProductImage {
  product_id: string;
  url: string;
  order: number;
  is_primary: boolean;
}

function getPrimaryImageUrl(
  productId: string,
  images: DbProductImage[]
): string {
  const productImages = images.filter(
    (image) => image.product_id === productId
  );
  if (productImages.length === 0) return "";

  const primaryImage = productImages.find((image) => image.is_primary);
  if (primaryImage) return primaryImage.url;

  return [...productImages].sort((a, b) => a.order - b.order)[0]?.url ?? "";
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

export async function getProductsPage(page: number): Promise<{
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

  const [{ data: relations }, { data: productImages }] = await Promise.all([
    supabase
      .from("product_relations")
      .select("product_id, related_id")
      .in("product_id", productIds),
    supabase
      .from("product_images")
      .select("product_id, url, order, is_primary")
      .in("product_id", productIds)
      .order("order"),
  ]);

  const typedRelations = (relations ?? []) as unknown as DbRelation[];
  const relatedMap = new Map<string, string[]>();
  typedRelations.forEach((r: DbRelation) => {
    const existing = relatedMap.get(r.product_id) || [];
    existing.push(r.related_id);
    relatedMap.set(r.product_id, existing);
  });

  const safeImages = (productImages ?? []) as DbProductImage[];
  const primaryImageMap = new Map<string, string>();
  typedProducts.forEach((product) => {
    primaryImageMap.set(product.id, getPrimaryImageUrl(product.id, safeImages));
  });

  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));

  return {
    products: typedProducts.map((p: DbProduct) =>
      mapDbToProduct(
        {
          ...p,
          image_url:
            primaryImageMap.get(p.id) ||
            normalizeStoredImageUrl(p.id, p.image_url) ||
            "",
        },
        relatedMap.get(p.id)
      )
    ),
    totalPages,
    currentPage: Math.min(page, totalPages),
  };
}

export async function getAllProducts(): Promise<Product[]> {
  const supabase = createBuildClient();
  if (!supabase) return [];

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("name");

  if (!products) return [];

  const typedProducts = products as unknown as DbProduct[];
  const productIds = typedProducts.map((p: DbProduct) => p.id);

  const [{ data: relations }, { data: productImages }] = await Promise.all([
    supabase
      .from("product_relations")
      .select("product_id, related_id")
      .in("product_id", productIds),
    supabase
      .from("product_images")
      .select("product_id, url, order, is_primary")
      .in("product_id", productIds)
      .order("order"),
  ]);

  const typedRelations = (relations ?? []) as unknown as DbRelation[];
  const relatedMap = new Map<string, string[]>();
  typedRelations.forEach((r: DbRelation) => {
    const existing = relatedMap.get(r.product_id) || [];
    existing.push(r.related_id);
    relatedMap.set(r.product_id, existing);
  });

  const safeImages = (productImages ?? []) as DbProductImage[];
  const primaryImageMap = new Map<string, string>();
  typedProducts.forEach((product) => {
    primaryImageMap.set(product.id, getPrimaryImageUrl(product.id, safeImages));
  });

  return typedProducts.map((p: DbProduct) =>
    mapDbToProduct(
      {
        ...p,
        image_url:
          primaryImageMap.get(p.id) ||
          normalizeStoredImageUrl(p.id, p.image_url) ||
          "",
      },
      relatedMap.get(p.id)
    )
  );
}
