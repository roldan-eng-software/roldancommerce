"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createBuildClient } from "@/lib/supabase/build";

interface ProductListItem {
  id: string;
  name: string;
  slug: string;
  price: number;
  availability: string;
  stock: number;
  stock_min: number;
  is_active: boolean;
  is_featured: boolean;
  image_url: string;
  category_id: string;
  category_name: string;
}

interface ProductDetail {
  id: string;
  name: string;
  slug: string;
  price: number;
  description: string;
  short_description: string;
  dimensions: string;
  mdf_color: string;
  availability: string;
  weight: number;
  stock: number;
  stock_min: number;
  is_active: boolean;
  is_featured: boolean;
  manual_url: string;
  category_id: string;
  image_url: string;
  related_ids: string[];
}

export async function getProductsAdmin(filters?: {
  search?: string;
  category_id?: string;
  availability?: string;
  is_active?: string;
}): Promise<ProductListItem[]> {
  const supabase = createBuildClient();
  if (!supabase) return [];

  let query = supabase
    .from("products")
    .select("*, categories!inner(name)")
    .order("name");

  if (filters?.search) {
    query = query.ilike("name", `%${filters.search}%`);
  }
  if (filters?.category_id) {
    query = query.eq("category_id", filters.category_id);
  }
  if (filters?.availability) {
    query = query.eq("availability", filters.availability);
  }
  if (filters?.is_active !== undefined && filters.is_active !== "") {
    query = query.eq("is_active", filters.is_active === "true");
  }

  const { data: products } = await query;

  if (!products) return [];

  return (
    products as unknown as Array<{
      id: string;
      name: string;
      slug: string;
      price: number;
      availability: string;
      stock: number;
      stock_min: number;
      is_active: boolean;
      is_featured: boolean;
      image_url: string;
      category_id: string;
      categories: { name: string };
    }>
  ).map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: p.price,
    availability: p.availability,
    stock: p.stock,
    stock_min: p.stock_min,
    is_active: p.is_active,
    is_featured: p.is_featured,
    image_url: p.image_url,
    category_id: p.category_id,
    category_name: p.categories?.name || "",
  }));
}

export async function getProductAdmin(
  id: string
): Promise<ProductDetail | null> {
  const supabase = createBuildClient();
  if (!supabase) return null;

  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (!product) return null;

  const { data: relations } = await supabase
    .from("product_relations")
    .select("related_id")
    .eq("product_id", id);

  const typedProduct = product as unknown as {
    id: string;
    name: string;
    slug: string;
    price: number;
    description: string;
    short_description: string;
    dimensions: string;
    mdf_color: string;
    availability: string;
    weight: number;
    stock: number;
    stock_min: number;
    is_active: boolean;
    is_featured: boolean;
    manual_url: string;
    category_id: string;
    image_url: string;
  };

  const typedRelations = (relations ?? []) as unknown as Array<{
    related_id: string;
  }>;

  return {
    ...typedProduct,
    related_ids: typedRelations.map((r) => r.related_id),
  };
}

export async function createProduct(data: {
  name: string;
  price: number;
  description: string;
  short_description?: string;
  dimensions?: string;
  mdf_color?: string;
  availability: string;
  weight?: number;
  stock?: number;
  stock_min?: number;
  is_featured?: boolean;
  manual_url?: string;
  category_id: string;
  image_url?: string;
  related_ids?: string[];
}) {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase não configurado" };

  const slug = data.name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const productId = slug;

  const { error } = await supabase.from("products").insert({
    id: productId,
    name: data.name,
    slug,
    price: data.price,
    description: data.description,
    short_description: data.short_description || "",
    dimensions: data.dimensions || "",
    mdf_color: data.mdf_color || "",
    availability: data.availability,
    weight: data.weight || 0.5,
    stock: data.availability === "sob-medida" ? 0 : data.stock || 0,
    stock_min: data.stock_min || 3,
    is_featured: data.is_featured || false,
    is_active: true,
    manual_url: data.manual_url || "",
    category_id: data.category_id,
    image_url: data.image_url || "",
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "Já existe um produto com esse nome" };
    }
    return { error: error.message };
  }

  if (data.related_ids && data.related_ids.length > 0) {
    const relations = data.related_ids.map((relatedId) => ({
      product_id: productId,
      related_id: relatedId,
    }));

    await supabase.from("product_relations").insert(relations);

    const reverseRelations = data.related_ids.map((relatedId) => ({
      product_id: relatedId,
      related_id: productId,
    }));

    await supabase.from("product_relations").insert(reverseRelations);
  }

  revalidatePath("/admin/produtos");
  revalidatePath("/");
  revalidatePath(`/produto/${slug}`);
  return { success: true, id: productId };
}

export async function updateProduct(
  id: string,
  data: {
    name: string;
    price: number;
    description: string;
    short_description?: string;
    dimensions?: string;
    mdf_color?: string;
    availability: string;
    weight?: number;
    stock?: number;
    stock_min?: number;
    is_featured?: boolean;
    is_active?: boolean;
    manual_url?: string;
    category_id: string;
    image_url?: string;
    related_ids?: string[];
  }
) {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase não configurado" };

  const slug = data.name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const { error } = await supabase
    .from("products")
    .update({
      name: data.name,
      slug,
      price: data.price,
      description: data.description,
      short_description: data.short_description || "",
      dimensions: data.dimensions || "",
      mdf_color: data.mdf_color || "",
      availability: data.availability,
      weight: data.weight || 0.5,
      stock: data.availability === "sob-medida" ? 0 : data.stock || 0,
      stock_min: data.stock_min || 3,
      is_featured: data.is_featured || false,
      is_active: data.is_active ?? true,
      manual_url: data.manual_url || "",
      category_id: data.category_id,
      image_url: data.image_url || "",
    })
    .eq("id", id);

  if (error) {
    if (error.code === "23505") {
      return { error: "Já existe um produto com esse nome" };
    }
    return { error: error.message };
  }

  if (data.related_ids !== undefined) {
    await supabase.from("product_relations").delete().eq("product_id", id);
    await supabase.from("product_relations").delete().eq("related_id", id);

    if (data.related_ids.length > 0) {
      const relations = data.related_ids.map((relatedId) => ({
        product_id: id,
        related_id: relatedId,
      }));
      await supabase.from("product_relations").insert(relations);

      const reverseRelations = data.related_ids.map((relatedId) => ({
        product_id: relatedId,
        related_id: id,
      }));
      await supabase.from("product_relations").insert(reverseRelations);
    }
  }

  revalidatePath("/admin/produtos");
  revalidatePath("/");
  revalidatePath(`/produto/${slug}`);
  return { success: true };
}

export async function deleteProduct(id: string) {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase não configurado" };

  const { count } = await supabase
    .from("order_items")
    .select("*", { count: "exact", head: true })
    .eq("product_id", id);

  if (count && count > 0) {
    const { error } = await supabase
      .from("products")
      .update({ is_active: false })
      .eq("id", id);

    if (error) return { error: error.message };

    revalidatePath("/admin/produtos");
    revalidatePath("/");
    return {
      success: true,
      message: `Produto inativado (possui ${count} pedido(s) vinculado(s)).`,
    };
  }

  await supabase.from("product_relations").delete().eq("product_id", id);
  await supabase.from("product_relations").delete().eq("related_id", id);

  const { error } = await supabase.from("products").delete().eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/produtos");
  revalidatePath("/");
  return { success: true, message: "Produto excluído permanentemente." };
}

export async function getCategoriesForSelect(): Promise<
  { id: string; name: string }[]
> {
  const supabase = createBuildClient();
  if (!supabase) return [];

  const { data } = await supabase
    .from("categories")
    .select("id, name")
    .order("name");

  return (data ?? []) as unknown as { id: string; name: string }[];
}

export async function getAllProductsForSelect(): Promise<
  { id: string; name: string }[]
> {
  const supabase = createBuildClient();
  if (!supabase) return [];

  const { data } = await supabase
    .from("products")
    .select("id, name")
    .eq("is_active", true)
    .order("name");

  return (data ?? []) as unknown as { id: string; name: string }[];
}
