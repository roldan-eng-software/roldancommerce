"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createBuildClient } from "@/lib/supabase/build";

interface ShippingOrder {
  id: string;
  created_at: string;
  total: number;
  status: string;
  status_envio: string;
  cep: string;
  logradouro: string;
  numero: string;
  cidade: string;
  uf: string;
  frete_cep: string;
  frete_prazo: string;
  frete: number;
  tracking_code: string;
  carrier: string;
  shipped_at: string | null;
  delivered_at: string | null;
  user_name?: string;
  item_count: number;
}

export async function getShippingOrders(filters?: {
  status_envio?: string;
  search?: string;
}): Promise<ShippingOrder[]> {
  const supabase = createBuildClient();
  if (!supabase) return [];

  let query = supabase
    .from("orders")
    .select("*")
    .not("status", "eq", "cancelled")
    .order("created_at", { ascending: false });

  if (filters?.status_envio) {
    query = query.eq("status_envio", filters.status_envio);
  }

  const { data: orders } = await query;
  if (!orders) return [];

  const typedOrders = orders as unknown as Array<{
    id: string;
    created_at: string;
    total: number;
    status: string;
    status_envio: string;
    cep: string;
    logradouro: string;
    numero: string;
    cidade: string;
    uf: string;
    frete_cep: string;
    frete_prazo: string;
    frete: number;
    tracking_code: string;
    carrier: string;
    shipped_at: string | null;
    delivered_at: string | null;
    user_id: string;
  }>;

  const userIds = [...new Set(typedOrders.map((o) => o.user_id))];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, cpf")
    .in("id", userIds);

  const cpfMap = new Map<string, string>();
  (profiles ?? []).forEach((p: { id: string; cpf: string }) => {
    cpfMap.set(p.id, p.cpf);
  });

  const orderIds = typedOrders.map((o) => o.id);
  const { data: items } = await supabase
    .from("order_items")
    .select("order_id")
    .in("order_id", orderIds);

  const countMap = new Map<string, number>();
  (items ?? []).forEach((i: { order_id: string }) => {
    countMap.set(i.order_id, (countMap.get(i.order_id) || 0) + 1);
  });

  let filtered = typedOrders;
  if (filters?.search) {
    const s = filters.search.toLowerCase();
    filtered = typedOrders.filter(
      (o) =>
        o.id.toLowerCase().includes(s) ||
        (cpfMap.get(o.user_id) || "").includes(s) ||
        o.cep.includes(s)
    );
  }

  return filtered.map((o) => ({
    id: o.id,
    created_at: o.created_at,
    total: o.total,
    status: o.status,
    status_envio: o.status_envio,
    cep: o.cep,
    logradouro: o.logradouro,
    numero: o.numero,
    cidade: o.cidade,
    uf: o.uf,
    frete_cep: o.frete_cep,
    frete_prazo: o.frete_prazo,
    frete: o.frete,
    tracking_code: o.tracking_code,
    carrier: o.carrier,
    shipped_at: o.shipped_at,
    delivered_at: o.delivered_at,
    user_name: cpfMap.get(o.user_id) || "",
    item_count: countMap.get(o.id) || 0,
  }));
}

export async function markAsShipped(
  orderId: string,
  carrier: string,
  trackingCode: string
): Promise<{ error?: string }> {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase não configurado" };

  const { data: order } = await supabase
    .from("orders")
    .select("status")
    .eq("id", orderId)
    .single();

  if (!order) return { error: "Pedido não encontrado" };

  if (!["confirmed", "pendente"].includes(order.status)) {
    return { error: "Apenas pedidos confirmados podem ser enviados" };
  }

  const { error } = await supabase
    .from("orders")
    .update({
      status_envio: "enviado",
      status: "shipped",
      carrier,
      tracking_code: trackingCode,
      shipped_at: new Date().toISOString(),
    })
    .eq("id", orderId);

  if (error) return { error: error.message };

  revalidatePath("/admin/entregas");
  revalidatePath(`/admin/pedidos/${orderId}`);
  return {};
}

export async function markAsDelivered(
  orderId: string
): Promise<{ error?: string }> {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase não configurado" };

  const { data: order } = await supabase
    .from("orders")
    .select("status_envio")
    .eq("id", orderId)
    .single();

  if (!order) return { error: "Pedido não encontrado" };

  if (order.status_envio !== "enviado") {
    return {
      error: "Apenas pedidos enviados podem ser marcados como entregues",
    };
  }

  const { error } = await supabase
    .from("orders")
    .update({
      status_envio: "entregue",
      status: "delivered",
      delivered_at: new Date().toISOString(),
    })
    .eq("id", orderId);

  if (error) return { error: error.message };

  revalidatePath("/admin/entregas");
  revalidatePath(`/admin/pedidos/${orderId}`);
  return {};
}

export async function simulateFreight(
  cep: string,
  items: { productId: string; quantity: number; weight: number }[]
): Promise<{ valor: number; prazo: string } | { error: string }> {
  const clean = cep.replace(/\D/g, "");
  if (clean.length !== 8) {
    return { error: "CEP inválido. Digite 8 dígitos." };
  }

  const saoCarlosPrefixes = [
    "13560",
    "13561",
    "13562",
    "13563",
    "13564",
    "13565",
    "13566",
    "13567",
    "13568",
    "13569",
  ];

  if (saoCarlosPrefixes.some((prefix) => clean.startsWith(prefix))) {
    return { valor: 0, prazo: "Entrega no dia seguinte" };
  }

  const totalPeso = items.reduce(
    (sum, i) => sum + (i.weight || 0.5) * i.quantity,
    0
  );
  const valor = Math.max(15, Math.round(totalPeso * 4.5 * 100) / 100);

  const supabase = createBuildClient();
  if (!supabase) {
    return { valor, prazo: "Entrega em até 5 dias úteis" };
  }

  const productIds = items.map((i) => i.productId);
  const { data: products } = await supabase
    .from("products")
    .select("id, availability")
    .in("id", productIds);

  const typedProducts = (products ?? []) as unknown as {
    id: string;
    availability: string;
  }[];

  let maxDias = 3;
  for (const item of items) {
    const product = typedProducts.find((p) => p.id === item.productId);
    if (product?.availability === "sob-medida") maxDias = Math.max(maxDias, 10);
    else if (product?.availability === "fabricacao")
      maxDias = Math.max(maxDias, 5);
  }

  return { valor, prazo: `Entrega em até ${maxDias} dias úteis` };
}
