"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { formatPrice } from "@/data/products";

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

interface Props {
  data: {
    salesByPeriod: SalesByPeriod[];
    topProducts: TopProduct[];
    recurringCustomers: RecurringCustomer[];
  };
}

export default function StatsClient({ data }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const period = searchParams.get("period") || "30";

  function setPeriod(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("period", value);
    router.push(`/admin/estatisticas?${params.toString()}`, { scroll: false });
  }

  const totalRevenue = data.salesByPeriod.reduce((s, d) => s + d.total, 0);
  const totalOrders = data.salesByPeriod.reduce((s, d) => s + d.count, 0);
  const maxSale = Math.max(...data.salesByPeriod.map((d) => d.total), 1);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Estatísticas</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Métricas de vendas e desempenho.
          </p>
        </div>
        <div className="flex gap-2">
          {[
            { value: "7", label: "7 dias" },
            { value: "30", label: "30 dias" },
            { value: "90", label: "90 dias" },
          ].map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                period === p.value
                  ? "bg-black text-white"
                  : "border text-zinc-600 hover:bg-zinc-50"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border bg-card p-4">
          <p className="text-sm text-zinc-500">Faturamento total</p>
          <p className="mt-1 text-2xl font-bold text-green-600">
            {formatPrice(totalRevenue / 100)}
          </p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-sm text-zinc-500">Pedidos pagos</p>
          <p className="mt-1 text-2xl font-bold">{totalOrders}</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-sm text-zinc-500">Ticket médio</p>
          <p className="mt-1 text-2xl font-bold">
            {totalOrders > 0
              ? formatPrice(totalRevenue / totalOrders / 100)
              : "R$ 0,00"}
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-xl border bg-card p-4">
        <h2 className="text-sm font-semibold">Vendas por período</h2>
        {data.salesByPeriod.length === 0 ? (
          <p className="mt-4 text-center text-sm text-zinc-500">
            Sem dados para o período selecionado.
          </p>
        ) : (
          <div className="mt-4 flex items-end gap-1" style={{ height: 200 }}>
            {data.salesByPeriod.map((day) => (
              <div
                key={day.date}
                className="group relative flex flex-1 flex-col items-center gap-1"
              >
                <div className="absolute -top-8 hidden group-hover:block">
                  <span className="rounded bg-black px-2 py-1 text-[10px] text-white">
                    {formatPrice(day.total / 100)} ({day.count} pedidos)
                  </span>
                </div>
                <span className="text-[9px] text-zinc-400">
                  {formatPrice(day.total / 100)}
                </span>
                <div
                  className="w-full rounded-t bg-emerald-500 transition-all hover:bg-emerald-600"
                  style={{
                    height: `${Math.max(4, (day.total / maxSale) * 160)}px`,
                  }}
                />
                <span className="text-[8px] text-zinc-400">
                  {new Date(day.date + "T12:00:00").toLocaleDateString(
                    "pt-BR",
                    {
                      day: "2-digit",
                      month: "2-digit",
                    }
                  )}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-4">
          <h2 className="text-sm font-semibold">
            Top 10 produtos mais vendidos
          </h2>
          {data.topProducts.length === 0 ? (
            <p className="mt-4 text-center text-sm text-zinc-500">
              Sem dados de vendas.
            </p>
          ) : (
            <div className="mt-3">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs font-medium text-zinc-500">
                    <th className="pb-2">#</th>
                    <th className="pb-2">Produto</th>
                    <th className="pb-2 text-right">Vendidos</th>
                    <th className="pb-2 text-right">Faturamento</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {data.topProducts.map((p, i) => (
                    <tr key={p.id}>
                      <td className="py-2 text-xs font-bold text-zinc-400">
                        {i + 1}
                      </td>
                      <td className="py-2 font-medium">{p.name}</td>
                      <td className="py-2 text-right">{p.total_sold}</td>
                      <td className="py-2 text-right font-medium">
                        {formatPrice(p.total_revenue / 100)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="rounded-xl border bg-card p-4">
          <h2 className="text-sm font-semibold">Clientes recorrentes</h2>
          <p className="mt-1 text-xs text-zinc-500">
            Clientes com 2 ou mais pedidos
          </p>
          {data.recurringCustomers.length === 0 ? (
            <p className="mt-4 text-center text-sm text-zinc-500">
              Nenhum cliente recorrente ainda.
            </p>
          ) : (
            <div className="mt-3">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs font-medium text-zinc-500">
                    <th className="pb-2">CPF</th>
                    <th className="pb-2 text-right">Pedidos</th>
                    <th className="pb-2 text-right">Total gasto</th>
                    <th className="pb-2 text-right">Última compra</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {data.recurringCustomers.map((c) => (
                    <tr key={c.user_id}>
                      <td className="py-2 font-mono text-xs">{c.cpf || "—"}</td>
                      <td className="py-2 text-right font-bold">
                        {c.order_count}
                      </td>
                      <td className="py-2 text-right font-medium">
                        {formatPrice(c.total_spent / 100)}
                      </td>
                      <td className="py-2 text-right text-xs text-zinc-500">
                        {new Date(c.last_order).toLocaleDateString("pt-BR")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
