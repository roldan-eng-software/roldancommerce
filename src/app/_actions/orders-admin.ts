"use server";

import { createBuildClient } from "@/lib/supabase/build";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/admin";
import { restoreStock } from "@/app/_actions/stock";
import { revalidatePath } from "next/cache";

interface OrderListItem {
  id: string;
  user_id: string;
  created_at: string;
  subtotal: number;
  frete: number;
  total: number;
  payment_method: string;
  status: string;
  status_envio: string;
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  cidade: string;
  uf: string;
  frete_cep: string;
  frete_prazo: string;
  tracking_code: string;
  carrier: string;
  user_email?: string;
  user_name?: string;
  item_count: number;
}

interface OrderDetail extends OrderListItem {
  items: {
    id: string;
    product_id: string;
    quantity: number;
    unit_price: number;
    products: { name: string; image_url: string } | null;
  }[];
}

export async function getOrdersAdmin(filters?: {
  search?: string;
  status?: string;
  status_envio?: string;
  date_from?: string;
  date_to?: string;
}): Promise<OrderListItem[]> {
  const supabase = createBuildClient();
  if (!supabase) return [];

  let query = supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (filters?.status) {
    query = query.eq("status", filters.status);
  }
  if (filters?.status_envio) {
    query = query.eq("status_envio", filters.status_envio);
  }
  if (filters?.date_from) {
    query = query.gte("created_at", filters.date_from);
  }
  if (filters?.date_to) {
    query = query.lte("created_at", filters.date_to + "T23:59:59");
  }

  const { data: orders } = await query;
  if (!orders) return [];

  const typedOrders = orders as unknown as Array<{
    id: string;
    user_id: string;
    created_at: string;
    subtotal: number;
    frete: number;
    total: number;
    payment_method: string;
    status: string;
    status_envio: string;
    cep: string;
    logradouro: string;
    numero: string;
    complemento: string;
    cidade: string;
    uf: string;
    frete_cep: string;
    frete_prazo: string;
    tracking_code: string;
    carrier: string;
  }>;

  const userIds = [...new Set(typedOrders.map((o) => o.user_id))];

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, cpf")
    .in("id", userIds);

  const profileMap = new Map<string, { cpf: string }>();
  (profiles ?? []).forEach((p: { id: string; cpf: string }) => {
    profileMap.set(p.id, { cpf: p.cpf });
  });

  const orderIds = typedOrders.map((o) => o.id);
  const { data: itemCounts } = await supabase
    .from("order_items")
    .select("order_id")
    .in("order_id", orderIds);

  const countMap = new Map<string, number>();
  (itemCounts ?? []).forEach((i: { order_id: string }) => {
    countMap.set(i.order_id, (countMap.get(i.order_id) || 0) + 1);
  });

  let filteredOrders = typedOrders;
  if (filters?.search) {
    const searchLower = filters.search.toLowerCase();
    filteredOrders = typedOrders.filter((o) => {
      const cpf = profileMap.get(o.user_id)?.cpf || "";
      return (
        o.id.toLowerCase().includes(searchLower) ||
        cpf.includes(filters.search!.replace(/\D/g, ""))
      );
    });
  }

  return filteredOrders.map((o) => ({
    id: o.id,
    user_id: o.user_id,
    created_at: o.created_at,
    subtotal: o.subtotal,
    frete: o.frete,
    total: o.total,
    payment_method: o.payment_method,
    status: o.status,
    status_envio: o.status_envio,
    cep: o.cep,
    logradouro: o.logradouro,
    numero: o.numero,
    complemento: o.complemento,
    cidade: o.cidade,
    uf: o.uf,
    frete_cep: o.frete_cep,
    frete_prazo: o.frete_prazo,
    tracking_code: o.tracking_code,
    carrier: o.carrier,
    user_name: profileMap.get(o.user_id)?.cpf || "",
    item_count: countMap.get(o.id) || 0,
  }));
}

export async function getOrderDetailAdmin(
  orderId: string
): Promise<OrderDetail | null> {
  const supabase = createBuildClient();
  if (!supabase) return null;

  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .single();

  if (!order) return null;

  const typedOrder = order as unknown as OrderListItem;

  const { data: items } = await supabase
    .from("order_items")
    .select("*, products(name, image_url)")
    .eq("order_id", orderId);

  const { data: profile } = await supabase
    .from("profiles")
    .select("cpf, logradouro, numero, complemento, cidade, uf")
    .eq("id", typedOrder.user_id)
    .single();

  return {
    ...typedOrder,
    logradouro: typedOrder.logradouro || profile?.logradouro || "",
    numero: typedOrder.numero || profile?.numero || "",
    complemento: typedOrder.complemento || profile?.complemento || "",
    cidade: typedOrder.cidade || profile?.cidade || "",
    uf: typedOrder.uf || profile?.uf || "",
    user_name: profile?.cpf || "",
    items: (items ?? []) as unknown as OrderDetail["items"],
  };
}

export async function updateOrderStatus(
  orderId: string,
  status: string
): Promise<{ error?: string }> {
  let supabase;
  try {
    supabase = await requireAdmin();
  } catch (e) {
    return { error: (e as Error).message };
  }

  const { error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", orderId);

  if (error) return { error: error.message };

  revalidatePath("/admin/pedidos");
  revalidatePath(`/admin/pedidos/${orderId}`);
  return {};
}

export async function cancelOrder(
  orderId: string
): Promise<{ error?: string }> {
  let supabase;
  try {
    supabase = await requireAdmin();
  } catch (e) {
    return { error: (e as Error).message };
  }

  const { data: order } = await supabase
    .from("orders")
    .select("status")
    .eq("id", orderId)
    .single();

  if (!order) return { error: "Pedido não encontrado" };
  if (order.status !== "pendente") {
    return { error: "Apenas pedidos pendentes podem ser cancelados" };
  }

  const { data: items } = await supabase
    .from("order_items")
    .select("product_id, quantity")
    .eq("order_id", orderId);

  if (items && items.length > 0) {
    await restoreStock(
      items.map((i: { product_id: string; quantity: number }) => ({
        productId: i.product_id,
        quantity: i.quantity,
      }))
    );
  }

  const { error } = await supabase
    .from("orders")
    .update({ status: "cancelled" })
    .eq("id", orderId);

  if (error) return { error: error.message };

  revalidatePath("/admin/pedidos");
  revalidatePath(`/admin/pedidos/${orderId}`);
  return {};
}
