"use client";

import { useState } from "react";
import Link from "next/link";
import { formatPrice } from "@/data/products";

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
  user_name?: string;
  item_count: number;
}

interface Props {
  orders: OrderListItem[];
}

const statusLabels: Record<string, { label: string; color: string }> = {
  pendente: { label: "Pendente", color: "bg-yellow-100 text-yellow-700" },
  confirmed: { label: "Confirmado", color: "bg-blue-100 text-blue-700" },
  shipped: { label: "Enviado", color: "bg-indigo-100 text-indigo-700" },
  delivered: { label: "Entregue", color: "bg-green-100 text-green-700" },
  cancelled: { label: "Cancelado", color: "bg-red-100 text-red-700" },
  "a-receber": { label: "A Receber", color: "bg-orange-100 text-orange-700" },
  pago: { label: "Pago", color: "bg-green-100 text-green-700" },
};

const envioLabels: Record<string, { label: string; color: string }> = {
  pendente: { label: "Pendente", color: "bg-zinc-100 text-zinc-600" },
  enviado: { label: "Enviado", color: "bg-blue-100 text-blue-700" },
  entregue: { label: "Entregue", color: "bg-green-100 text-green-700" },
};

const paymentLabels: Record<string, string> = {
  pix: "PIX",
  card: "Cartão",
  entrega: "Pagar na Entrega",
};

export default function OrdersListClient({ orders }: Props) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [envioFilter, setEnvioFilter] = useState("");

  const filtered = orders.filter((o) => {
    if (search) {
      const s = search.toLowerCase();
      if (
        !o.id.toLowerCase().includes(s) &&
        !(o.user_name || "").toLowerCase().includes(s) &&
        !o.cep.includes(s)
      ) {
        return false;
      }
    }
    if (statusFilter && o.status !== statusFilter) return false;
    if (envioFilter && o.status_envio !== envioFilter) return false;
    return true;
  });

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function isOverdue(order: OrderListItem) {
    if (order.status !== "pendente") return false;
    const created = new Date(order.created_at);
    const now = new Date();
    const hours = (now.getTime() - created.getTime()) / (1000 * 60 * 60);
    return hours > 24;
  }

  return (
    <div>
      <div>
        <h1 className="text-2xl font-bold">Pedidos</h1>
        <p className="mt-1 text-sm text-zinc-500">
          {orders.length} pedido(s) no sistema
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Buscar por ID, CPF ou CEP..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-lg border px-3 py-2 text-sm"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border px-3 py-2 text-sm"
        >
          <option value="">Todos status</option>
          <option value="pendente">Pendente</option>
          <option value="confirmed">Confirmado</option>
          <option value="shipped">Enviado</option>
          <option value="delivered">Entregue</option>
          <option value="cancelled">Cancelado</option>
          <option value="a-receber">A Receber</option>
        </select>
        <select
          value={envioFilter}
          onChange={(e) => setEnvioFilter(e.target.value)}
          className="rounded-lg border px-3 py-2 text-sm"
        >
          <option value="">Todos envios</option>
          <option value="pendente">Pendente</option>
          <option value="enviado">Enviado</option>
          <option value="entregue">Entregue</option>
        </select>
      </div>

      <div className="mt-4 rounded-xl border bg-card">
        {filtered.length === 0 ? (
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
                  <th className="px-4 py-3">CPF</th>
                  <th className="px-4 py-3">Itens</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Pagamento</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Envio</th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((order) => {
                  const statusInfo = statusLabels[order.status] || {
                    label: order.status,
                    color: "bg-zinc-100 text-zinc-600",
                  };
                  const envioInfo = envioLabels[order.status_envio] || {
                    label: order.status_envio,
                    color: "bg-zinc-100 text-zinc-600",
                  };
                  const overdue = isOverdue(order);

                  return (
                    <tr key={order.id} className={overdue ? "bg-red-50" : ""}>
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs font-medium">
                          #{order.id.slice(0, 8).toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-zinc-500">
                        {formatDate(order.created_at)}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {order.user_name || "—"}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {order.item_count}
                      </td>
                      <td className="px-4 py-3 font-medium">
                        {formatPrice(order.total / 100)}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs">
                          {paymentLabels[order.payment_method] ||
                            order.payment_method}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusInfo.color}`}
                        >
                          {overdue ? "⚠️ Atrasado" : statusInfo.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${envioInfo.color}`}
                        >
                          {envioInfo.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/admin/pedidos/${order.id}`}
                          className="rounded-lg border px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-50"
                        >
                          Detalhe
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
