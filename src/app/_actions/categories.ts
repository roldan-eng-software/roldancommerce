"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/admin";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  order: number;
  product_count: number;
}

interface DbCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  order: number;
}

interface DbProductCategory {
  category_id: string;
}

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("order");

  if (!categories) return [];

  const typedCategories = categories as unknown as DbCategory[];
  const catIds = typedCategories.map((c: DbCategory) => c.id);

  const { data: counts } = await supabase
    .from("products")
    .select("category_id")
    .in("category_id", catIds)
    .eq("is_active", true);

  const typedCounts = (counts ?? []) as unknown as DbProductCategory[];
  const countMap = new Map<string, number>();
  typedCounts.forEach((p: DbProductCategory) => {
    countMap.set(p.category_id, (countMap.get(p.category_id) || 0) + 1);
  });

  return typedCategories.map((c: DbCategory) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description || "",
    order: c.order || 0,
    product_count: countMap.get(c.id) || 0,
  }));
}

export async function createCategory(data: {
  name: string;
  description?: string;
}) {
  let supabase;
  try {
    supabase = await requireAdmin();
  } catch (e) {
    return { error: (e as Error).message };
  }

  const slug = data.name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const { count } = await supabase
    .from("categories")
    .select("*", { count: "exact", head: true });

  const { error } = await supabase.from("categories").insert({
    name: data.name,
    slug,
    description: data.description || "",
    order: (count || 0) + 1,
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "Já existe uma categoria com esse nome" };
    }
    return { error: error.message };
  }

  revalidatePath("/admin/categorias");
  return { success: true };
}

export async function updateCategory(
  id: string,
  data: { name: string; description?: string }
) {
  let supabase;
  try {
    supabase = await requireAdmin();
  } catch (e) {
    return { error: (e as Error).message };
  }

  const slug = data.name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const { error } = await supabase
    .from("categories")
    .update({ name: data.name, slug, description: data.description || "" })
    .eq("id", id);

  if (error) {
    if (error.code === "23505") {
      return { error: "Já existe uma categoria com esse nome" };
    }
    return { error: error.message };
  }

  revalidatePath("/admin/categorias");
  return { success: true };
}

export async function deleteCategory(id: string) {
  let supabase;
  try {
    supabase = await requireAdmin();
  } catch (e) {
    return { error: (e as Error).message };
  }

  const { count } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })
    .eq("category_id", id)
    .eq("is_active", true);

  if (count && count > 0) {
    return {
      error: `Não é possível excluir: ${count} produto(s) vinculado(s). Remova ou mova os produtos antes.`,
    };
  }

  const { error } = await supabase.from("categories").delete().eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/categorias");
  return { success: true };
}

export async function updateCategoryOrder(
  items: { id: string; order: number }[]
) {
  let supabase;
  try {
    supabase = await requireAdmin();
  } catch (e) {
    return { error: (e as Error).message };
  }

  const updates = items.map((item) =>
    supabase.from("categories").update({ order: item.order }).eq("id", item.id)
  );

  await Promise.all(updates);

  revalidatePath("/admin/categorias");
  return { success: true };
}
