"use server";

import { createClient } from "@/lib/supabase/server";
import { createBuildClient } from "@/lib/supabase/build";

interface StockInfo {
  id: string;
  name: string;
  stock: number;
  stock_min: number;
  availability: string;
}

export async function checkStock(
  items: { productId: string; quantity: number }[]
): Promise<{
  valid: boolean;
  errors: string[];
  stockInfo: StockInfo[];
}> {
  const supabase = createBuildClient();
  if (!supabase)
    return {
      valid: false,
      errors: ["Supabase não configurado"],
      stockInfo: [],
    };

  const productIds = items.map((i) => i.productId);

  const { data: products } = await supabase
    .from("products")
    .select("id, name, stock, stock_min, availability")
    .in("id", productIds);

  if (!products) {
    return {
      valid: false,
      errors: ["Produtos não encontrados"],
      stockInfo: [],
    };
  }

  const typedProducts = products as unknown as StockInfo[];
  const errors: string[] = [];

  for (const item of items) {
    const product = typedProducts.find((p) => p.id === item.productId);
    if (!product) {
      errors.push(`Produto "${item.productId}" não encontrado`);
      continue;
    }
    if (product.availability === "sob-medida") continue;
    if (product.stock < item.quantity) {
      errors.push(
        `Estoque insuficiente para "${product.name}": disponível ${product.stock}, solicitado ${item.quantity}`
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    stockInfo: typedProducts,
  };
}

export async function decrementStock(
  items: { productId: string; quantity: number }[]
): Promise<{ error?: string }> {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase não configurado" };

  for (const item of items) {
    const { data: product } = await supabase
      .from("products")
      .select("stock, availability")
      .eq("id", item.productId)
      .single();

    if (!product) continue;
    if (product.availability === "sob-medida") continue;

    const newStock = product.stock - item.quantity;
    if (newStock < 0) {
      return {
        error: `Estoque insuficiente para o produto "${item.productId}"`,
      };
    }

    const { error } = await supabase
      .from("products")
      .update({ stock: newStock })
      .eq("id", item.productId);

    if (error) return { error: error.message };
  }

  return {};
}

export async function restoreStock(
  items: { productId: string; quantity: number }[]
): Promise<{ error?: string }> {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase não configurado" };

  for (const item of items) {
    const { data: product } = await supabase
      .from("products")
      .select("stock, availability")
      .eq("id", item.productId)
      .single();

    if (!product) continue;
    if (product.availability === "sob-medida") continue;

    const { error } = await supabase
      .from("products")
      .update({ stock: product.stock + item.quantity })
      .eq("id", item.productId);

    if (error) return { error: error.message };
  }

  return {};
}

export async function getLowStockProducts(): Promise<StockInfo[]> {
  const supabase = createBuildClient();
  if (!supabase) return [];

  const { data: products } = await supabase
    .from("products")
    .select("id, name, stock, stock_min, availability")
    .eq("is_active", true)
    .in("availability", ["pronta-entrega", "fabricacao"])
    .lte("stock", 100)
    .order("stock");

  if (!products) return [];

  return (products as unknown as StockInfo[]).filter(
    (p) => p.stock <= p.stock_min
  );
}
