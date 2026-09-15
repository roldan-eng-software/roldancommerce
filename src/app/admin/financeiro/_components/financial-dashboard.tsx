"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { formatPrice } from "@/data/products";

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

interface Props {
  metrics: FinancialMetrics;
  orders: OrderExport[];
}

const paymentLabels: Record<string, string> = {
  pix: "PIX",
  card: "Cartão",
  entrega: "Entrega",
};

const statusLabels: Record<string, string> = {
  pendente: "Pendente",
  confirmed: "Confirmado",
  shipped: "Enviado",
  delivered: "Entregue",
  cancelled: "Cancelado",
  "a-receber": "A Receber",
};

export default function FinancialDashboard({ metrics, orders }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dateFrom = searchParams.get("from") || "";
  const dateTo = searchParams.get("to") || "";

  function updateDate(key: "from" | "to", value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/admin/financeiro?${params.toString()}`, { scroll: false });
  }

  function exportCSV() {
    const headers = [
      "Pedido",
      "Data",
      "Subtotal",
      "Frete",
      "Total",
      "Pagamento",
      "Status",
      "Envio",
      "CEP",
      "Cidade",
      "UF",
      "Itens",
    ];

    const rows = orders.map((o) => [
      o.id.slice(0, 8).toUpperCase(),
      new Date(o.created_at).toLocaleDateString("pt-BR"),
      (o.subtotal / 100).toFixed(2),
      (o.frete / 100).toFixed(2),
      (o.total / 100).toFixed(2),
      paymentLabels[o.payment_method] || o.payment_method,
      statusLabels[o.status] || o.status,
      o.status_envio,
      o.cep,
      o.cidade,
      o.uf,
      o.item_count.toString(),
    ]);

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `relatorio-financeiro-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function exportPDF() {
    const { default: jsPDF } = await import("jspdf");
    const { default: autoTable } = await import("jspdf-autotable");

    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Roldan Marcenaria - Relatório Financeiro", 14, 22);

    doc.setFontSize(10);
    doc.text(`Período: ${dateFrom || "Início"} a ${dateTo || "Hoje"}`, 14, 30);
    doc.text(`Gerado em: ${new Date().toLocaleDateString("pt-BR")}`, 14, 36);

    doc.setFontSize(12);
    doc.text("Resumo", 14, 46);
    doc.setFontSize(10);
    doc.text(`Faturamento: ${formatPrice(metrics.totalRevenue / 100)}`, 14, 54);
    doc.text(`Pedidos: ${metrics.totalOrders}`, 14, 60);
    doc.text(`Ticket médio: ${formatPrice(metrics.avgTicket / 100)}`, 14, 66);

    const tableData = orders.map((o) => [
      o.id.slice(0, 8).toUpperCase(),
      new Date(o.created_at).toLocaleDateString("pt-BR"),
      formatPrice(o.total / 100),
      paymentLabels[o.payment_method] || o.payment_method,
      statusLabels[o.status] || o.status,
    ]);

    autoTable(doc, {
      startY: 76,
      head: [["Pedido", "Data", "Total", "Pagamento", "Status"]],
      body: tableData,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [0, 0, 0] },
    });

    doc.save(
      `relatorio-financeiro-${new Date().toISOString().split("T")[0]}.pdf`
    );
  }

  const maxSale = Math.max(...metrics.dailySales.map((d) => d.total), 1);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Financeiro</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Visão geral das vendas e faturamento.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportCSV}
            className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-zinc-50"
          >
            Exportar CSV
          </button>
          <button
            onClick={exportPDF}
            className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-zinc-50"
          >
            Exportar PDF
          </button>
        </div>
      </div>

      <div className="mt-4 flex gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-zinc-500">De</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => updateDate("from", e.target.value)}
            className="rounded-lg border px-3 py-2 text-sm"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-zinc-500">Até</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => updateDate("to", e.target.value)}
            className="rounded-lg border px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-card p-4">
          <p className="text-sm text-zinc-500">Faturamento</p>
          <p className="mt-1 text-2xl font-bold text-green-600">
            {formatPrice(metrics.totalRevenue / 100)}
          </p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-sm text-zinc-500">Pedidos pagos</p>
          <p className="mt-1 text-2xl font-bold">{metrics.totalOrders}</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-sm text-zinc-500">Ticket médio</p>
          <p className="mt-1 text-2xl font-bold">
            {formatPrice(metrics.avgTicket / 100)}
          </p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-sm text-zinc-500">Pendentes</p>
          <p className="mt-1 text-2xl font-bold text-amber-600">
            {metrics.pendingPayments}
          </p>
          <p className="text-xs text-zinc-400">
            {metrics.pendingShipments} aguardando envio
          </p>
        </div>
      </div>

      {metrics.dailySales.length > 0 && (
        <div className="mt-6 rounded-xl border bg-card p-4">
          <h2 className="text-sm font-semibold">Vendas diárias</h2>
          <div className="mt-4 flex items-end gap-1" style={{ height: 160 }}>
            {metrics.dailySales.map((day) => (
              <div
                key={day.date}
                className="flex flex-1 flex-col items-center gap-1"
              >
                <span className="text-[10px] text-zinc-500">
                  {formatPrice(day.total / 100)}
                </span>
                <div
                  className="w-full rounded-t bg-emerald-500"
                  style={{
                    height: `${Math.max(4, (day.total / maxSale) * 120)}px`,
                  }}
                />
                <span className="text-[9px] text-zinc-400">
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
        </div>
      )}

      <div className="mt-6 rounded-xl border bg-card">
        <div className="border-b px-4 py-3">
          <h2 className="text-sm font-semibold">Últimos pedidos</h2>
        </div>
        {metrics.recentOrders.length === 0 ? (
          <div className="p-6 text-center text-sm text-zinc-500">
            Nenhum pedido encontrado.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs font-medium text-zinc-500">
                  <th className="px-4 py-3">Pedido</th>
                  <th className="px-4 py-3">Data</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Pagamento</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {metrics.recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-4 py-3 font-mono text-xs">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="px-4 py-3 text-xs text-zinc-500">
                      {new Date(order.created_at).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {formatPrice(order.total / 100)}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {paymentLabels[order.payment_method] ||
                        order.payment_method}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium">
                        {statusLabels[order.status] || order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
