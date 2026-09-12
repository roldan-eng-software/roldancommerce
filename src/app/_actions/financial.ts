"use server";

import { createBuildClient } from "@/lib/supabase/build";

interface FinancialMetrics {
  totalRevenue: number;
  totalOrders: number;
  avgTicket: number;
  pendingPayments: number;
  pendingShipments: number;
  dailySales: { date: string; total: number }[];
  recentOrders: {
    id: string;
    created_at: string;
    total: number;
    status: string;
    payment_method: string;
  }[];
}

export async function getFinancialMetrics(
  dateFrom?: string,
  dateTo?: string
): Promise<FinancialMetrics> {
  const supabase = createBuildClient();
  if (!supabase) {
    return {
      totalRevenue: 0,
      totalOrders: 0,
      avgTicket: 0,
      pendingPayments: 0,
      pendingShipments: 0,
      dailySales: [],
      recentOrders: [],
    };
  }

  const now = new Date();
  const defaultFrom = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .split("T")[0];
  const from = dateFrom || defaultFrom;
  const to = dateTo || now.toISOString().split("T")[0];

  const { data: paidOrders } = await supabase
    .from("orders")
    .select("total, created_at, status")
    .in("status", ["confirmed", "shipped", "delivered"])
    .gte("created_at", from)
    .lte("created_at", to + "T23:59:59");

  const { count: pendingPayments } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("status", "pendente");

  const { count: pendingShipments } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .in("status", ["confirmed"])
    .eq("status_envio", "pendente");

  const typedPaidOrders = (paidOrders ?? []) as unknown as {
    total: number;
    created_at: string;
  }[];

  const totalRevenue = typedPaidOrders.reduce((sum, o) => sum + o.total, 0);
  const totalOrders = typedPaidOrders.length;
  const avgTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const dailyMap = new Map<string, number>();
  typedPaidOrders.forEach((o) => {
    const date = o.created_at.split("T")[0];
    dailyMap.set(date, (dailyMap.get(date) || 0) + o.total);
  });

  const dailySales = Array.from(dailyMap.entries())
    .map(([date, total]) => ({ date, total }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const { data: recentOrders } = await supabase
    .from("orders")
    .select("id, created_at, total, status, payment_method")
    .order("created_at", { ascending: false })
    .limit(10);

  return {
    totalRevenue,
    totalOrders,
    avgTicket,
    pendingPayments: pendingPayments || 0,
    pendingShipments: pendingShipments || 0,
    dailySales,
    recentOrders: (recentOrders ??
      []) as unknown as FinancialMetrics["recentOrders"],
  };
}

interface OrderExport {
  id: string;
  created_at: string;
  subtotal: number;
  frete: number;
  total: number;
  payment_method: string;
  status: string;
  status_envio: string;
  cep: string;
  cidade: string;
  uf: string;
  item_count: number;
}

export async function getOrdersForExport(
  dateFrom?: string,
  dateTo?: string
): Promise<OrderExport[]> {
  const supabase = createBuildClient();
  if (!supabase) return [];

  const now = new Date();
  const defaultFrom = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .split("T")[0];
  const from = dateFrom || defaultFrom;
  const to = dateTo || now.toISOString().split("T")[0];

  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .gte("created_at", from)
    .lte("created_at", to + "T23:59:59")
    .order("created_at", { ascending: false });

  if (!orders) return [];

  const typedOrders = orders as unknown as Array<{
    id: string;
    created_at: string;
    subtotal: number;
    frete: number;
    total: number;
    payment_method: string;
    status: string;
    status_envio: string;
    cep: string;
    cidade: string;
    uf: string;
  }>;

  const orderIds = typedOrders.map((o) => o.id);
  const { data: items } = await supabase
    .from("order_items")
    .select("order_id")
    .in("order_id", orderIds);

  const countMap = new Map<string, number>();
  (items ?? []).forEach((i: { order_id: string }) => {
    countMap.set(i.order_id, (countMap.get(i.order_id) || 0) + 1);
  });

  return typedOrders.map((o) => ({
    ...o,
    item_count: countMap.get(o.id) || 0,
  }));
}
