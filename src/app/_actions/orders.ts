"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { decrementStock } from "./stock";

interface OrderItem {
  productId: string;
  quantity: number;
  unitPrice: number;
}

interface CreateOrderData {
  items: OrderItem[];
  subtotal: number;
  freteValor: number;
  freteCep: string;
  fretePrazo: string;
  paymentMethod: "pix" | "card" | "entrega";
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  cidade: string;
  uf: string;
}

interface OrderResult {
  success: boolean;
  orderId?: string;
  error?: string;
}

export async function createOrder(data: CreateOrderData): Promise<OrderResult> {
  const supabase = await createClient();
  if (!supabase) return { success: false, error: "Supabase não configurado" };

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Usuário não autenticado" };
  }

  const stockCheck = await decrementStock(
    data.items.map((i) => ({ productId: i.productId, quantity: i.quantity }))
  );

  if (stockCheck.error) {
    return { success: false, error: stockCheck.error };
  }

  let statusPagamento: string;
  switch (data.paymentMethod) {
    case "pix":
    case "card":
      statusPagamento = "pendente";
      break;
    case "entrega":
      statusPagamento = "a-receber";
      break;
    default:
      statusPagamento = "pendente";
  }

  const total = data.subtotal + data.freteValor;

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id: user.id,
      subtotal: Math.round(data.subtotal * 100),
      frete: Math.round(data.freteValor * 100),
      total: Math.round(total * 100),
      payment_method: data.paymentMethod,
      status: statusPagamento,
      cep: data.cep,
      logradouro: data.logradouro,
      numero: data.numero,
      complemento: data.complemento,
      cidade: data.cidade,
      uf: data.uf,
      frete_cep: data.freteCep,
      frete_prazo: data.fretePrazo,
      status_envio: "pendente",
    })
    .select("id")
    .single();

  if (orderError) {
    return {
      success: false,
      error: `Erro ao criar pedido: ${orderError.message}`,
    };
  }

  const orderItems = data.items.map((item) => ({
    order_id: order.id,
    product_id: item.productId,
    quantity: item.quantity,
    unit_price: Math.round(item.unitPrice * 100),
  }));

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(orderItems);

  if (itemsError) {
    return {
      success: false,
      error: `Erro ao criar itens: ${itemsError.message}`,
    };
  }

  revalidatePath("/admin/pedidos");
  revalidatePath("/admin");
  revalidatePath("/admin/financeiro");

  return { success: true, orderId: order.id };
}

export async function getOrderById(orderId: string) {
  const supabase = await createClient();
  if (!supabase) return null;

  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .single();

  if (!order) return null;

  const { data: items } = await supabase
    .from("order_items")
    .select("*, products(name, image_url)")
    .eq("order_id", orderId);

  return {
    ...order,
    items: items || [],
  };
}

export async function getUserOrders() {
  const supabase = await createClient();
  if (!supabase) return [];

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return orders || [];
}
