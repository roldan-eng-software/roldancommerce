"use server";

import { createBuildClient } from "@/lib/supabase/build";

interface SalesByPeriod {
  date: string;
  total: number;
  count: number;
}

interface TopProduct {
  id: string;
  name: string;
  total_sold: number;
  total_revenue: number;
}

interface RecurringCustomer {
  user_id: string;
  cpf: string;
  order_count: number;
  total_spent: number;
  last_order: string;
}

interface StatsData {
  salesByPeriod: SalesByPeriod[];
  topProducts: TopProduct[];
  recurringCustomers: RecurringCustomer[];
}

export async function getSalesStats(
  dateFrom?: string,
  dateTo?: string
): Promise<StatsData> {
  const supabase = createBuildClient();
  if (!supabase) {
    return { salesByPeriod: [], topProducts: [], recurringCustomers: [] };
  }

  const now = new Date();
  const defaultFrom = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];
  const from = dateFrom || defaultFrom;
  const to = dateTo || now.toISOString().split("T")[0];

  const { data: paidOrders } = await supabase
    .from("orders")
    .select("id, user_id, total, created_at")
    .in("status", ["confirmed", "shipped", "delivered"])
    .gte("created_at", from)
    .lte("created_at", to + "T23:59:59");

  const typedOrders = (paidOrders ?? []) as unknown as {
    id: string;
    user_id: string;
    total: number;
    created_at: string;
  }[];

  const dailyMap = new Map<string, { total: number; count: number }>();
  typedOrders.forEach((o) => {
    const date = o.created_at.split("T")[0];
    const existing = dailyMap.get(date) || { total: 0, count: 0 };
    dailyMap.set(date, {
      total: existing.total + o.total,
      count: existing.count + 1,
    });
  });

  const salesByPeriod = Array.from(dailyMap.entries())
    .map(([date, data]) => ({ date, ...data }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const orderIds = typedOrders.map((o) => o.id);

  let topProducts: TopProduct[] = [];
  if (orderIds.length > 0) {
    const { data: orderItems } = await supabase
      .from("order_items")
      .select("product_id, quantity, unit_price")
      .in("order_id", orderIds);

    const productMap = new Map<
      string,
      { name: string; total_sold: number; total_revenue: number }
    >();

    const typedItems = (orderItems ?? []) as unknown as {
      product_id: string;
      quantity: number;
      unit_price: number;
    }[];

    for (const item of typedItems) {
      const existing = productMap.get(item.product_id) || {
        name: item.product_id,
        total_sold: 0,
        total_revenue: 0,
      };
      existing.total_sold += item.quantity;
      existing.total_revenue += item.unit_price * item.quantity;
      productMap.set(item.product_id, existing);
    }

    const productIds = [...productMap.keys()];
    if (productIds.length > 0) {
      const { data: products } = await supabase
        .from("products")
        .select("id, name")
        .in("id", productIds);

      const nameMap = new Map<string, string>();
      (products ?? []).forEach((p: { id: string; name: string }) => {
        nameMap.set(p.id, p.name);
      });

      topProducts = Array.from(productMap.entries())
        .map(([id, data]) => ({
          id,
          name: nameMap.get(id) || data.name,
          total_sold: data.total_sold,
          total_revenue: data.total_revenue,
        }))
        .sort((a, b) => b.total_sold - a.total_sold)
        .slice(0, 10);
    }
  }

  const userOrderMap = new Map<
    string,
    { count: number; total: number; last: string }
  >();
  typedOrders.forEach((o) => {
    const existing = userOrderMap.get(o.user_id) || {
      count: 0,
      total: 0,
      last: o.created_at,
    };
    existing.count += 1;
    existing.total += o.total;
    if (o.created_at > existing.last) existing.last = o.created_at;
    userOrderMap.set(o.user_id, existing);
  });

  const recurringUserIds = [...userOrderMap.entries()]
    .filter(([, data]) => data.count >= 2)
    .map(([userId]) => userId);

  let recurringCustomers: RecurringCustomer[] = [];
  if (recurringUserIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, cpf")
      .in("id", recurringUserIds);

    const cpfMap = new Map<string, string>();
    (profiles ?? []).forEach((p: { id: string; cpf: string }) => {
      cpfMap.set(p.id, p.cpf);
    });

    recurringCustomers = recurringUserIds
      .map((userId) => {
        const data = userOrderMap.get(userId)!;
        return {
          user_id: userId,
          cpf: cpfMap.get(userId) || "—",
          order_count: data.count,
          total_spent: data.total,
          last_order: data.last,
        };
      })
      .sort((a, b) => b.order_count - a.order_count);
  }

  return { salesByPeriod, topProducts, recurringCustomers };
}
