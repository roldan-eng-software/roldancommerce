"use client";

import { useState } from "react";
import Link from "next/link";
import { formatPrice } from "@/data/products";
import { updateOrderStatus, cancelOrder } from "@/app/_actions/orders-admin";

interface OrderDetail {
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
  items: {
    id: string;
    product_id: string;
    quantity: number;
    unit_price: number;
    products: { name: string; image_url: string } | null;
  }[];
}

interface Props {
  order: OrderDetail;
}

const statusLabels: Record<string, { label: string; color: string }> = {
  pendente: { label: "Pendente", color: "bg-yellow-100 text-yellow-700" },
  confirmed: { label: "Confirmado", color: "bg-blue-100 text-blue-700" },
  shipped: { label: "Enviado", color: "bg-indigo-100 text-indigo-700" },
  delivered: { label: "Entregue", color: "bg-green-100 text-green-700" },
  cancelled: { label: "Cancelado", color: "bg-red-100 text-red-700" },
  "a-receber": { label: "A Receber", color: "bg-orange-100 text-orange-700" },
};

const paymentLabels: Record<string, string> = {
  pix: "PIX",
  card: "Cartão de Crédito",
  entrega: "Pagar na Entrega",
};

export default function OrderDetailClient({ order }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const statusInfo = statusLabels[order.status] || {
    label: order.status,
    color: "bg-zinc-100 text-zinc-600",
  };

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  async function handleStatusChange(newStatus: string) {
    setLoading(true);
    setError("");
    const result = await updateOrderStatus(order.id, newStatus);
    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      window.location.reload();
    }
  }

  async function handleCancel() {
    if (!confirm("Cancelar este pedido? O estoque será devolvido.")) return;
    setLoading(true);
    setError("");
    const result = await cancelOrder(order.id);
    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      window.location.reload();
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/admin/pedidos"
            className="text-sm text-zinc-500 hover:text-zinc-800"
          >
            ← Voltar para pedidos
          </Link>
          <h1 className="mt-2 text-2xl font-bold">
            Pedido #{order.id.slice(0, 8).toUpperCase()}
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Feito em {formatDate(order.created_at)}
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-sm font-medium ${statusInfo.color}`}
        >
          {statusInfo.label}
        </span>
      </div>

      {error && (
        <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 flex flex-col gap-4">
          <section className="rounded-xl border bg-card p-4">
            <h2 className="text-sm font-semibold">Itens do pedido</h2>
            <ul className="mt-3 divide-y">
              {order.items.map((item) => (
                <li key={item.id} className="flex items-center gap-3 py-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-zinc-100">
                    {item.products?.image_url ? (
                      <img
                        src={item.products.image_url}
                        alt={item.products.name}
                        className="h-12 w-12 rounded-lg object-cover"
                      />
                    ) : (
                      <span className="text-xs text-zinc-400">IMG</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {item.products?.name || item.product_id}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {item.quantity}× {formatPrice(item.unit_price / 100)}
                    </p>
                  </div>
                  <span className="text-sm font-bold">
                    {formatPrice((item.unit_price * item.quantity) / 100)}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-xl border bg-card p-4">
            <h2 className="text-sm font-semibold">Endereço de entrega</h2>
            <div className="mt-2 text-sm text-zinc-600">
              <p>
                {order.logradouro || "Não informado"}{" "}
                {order.numero && `, ${order.numero}`}
                {order.complemento && ` - ${order.complemento}`}
              </p>
              <p>
                {order.cidade || "—"} / {order.uf || "—"}
              </p>
              <p>CEP: {order.cep || "—"}</p>
            </div>
          </section>
        </div>

        <div className="flex flex-col gap-4">
          <section className="rounded-xl border bg-card p-4">
            <h2 className="text-sm font-semibold">Valores</h2>
            <div className="mt-3 flex flex-col gap-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatPrice(order.subtotal / 100)}</span>
              </div>
              <div className="flex justify-between">
                <span>Frete</span>
                <span>{formatPrice(order.frete / 100)}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-bold">
                <span>Total</span>
                <span>{formatPrice(order.total / 100)}</span>
              </div>
            </div>
          </section>

          <section className="rounded-xl border bg-card p-4">
            <h2 className="text-sm font-semibold">Pagamento</h2>
            <p className="mt-2 text-sm">
              {paymentLabels[order.payment_method] || order.payment_method}
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              Status: {statusInfo.label}
            </p>
          </section>

          <section className="rounded-xl border bg-card p-4">
            <h2 className="text-sm font-semibold">Entrega</h2>
            <div className="mt-2 text-sm">
              <p>CEP destino: {order.frete_cep || order.cep}</p>
              <p className="text-zinc-500">{order.frete_prazo}</p>
              {order.tracking_code && (
                <p className="mt-1">
                  Rastreio:{" "}
                  <span className="font-mono">{order.tracking_code}</span>
                </p>
              )}
              {order.carrier && <p>Transportadora: {order.carrier}</p>}
            </div>
          </section>

          <section className="rounded-xl border bg-card p-4">
            <h2 className="text-sm font-semibold">Ações</h2>
            <div className="mt-3 flex flex-col gap-2">
              {order.status === "pendente" && (
                <>
                  <button
                    onClick={() => handleStatusChange("confirmed")}
                    disabled={loading}
                    className="rounded-lg bg-green-600 px-3 py-2 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50"
                  >
                    Confirmar pagamento
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={loading}
                    className="rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                  >
                    Cancelar pedido
                  </button>
                </>
              )}
              {order.status === "confirmed" && (
                <button
                  onClick={() => handleStatusChange("shipped")}
                  disabled={loading}
                  className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  Marcar como enviado
                </button>
              )}
              {order.status === "shipped" && (
                <button
                  onClick={() => handleStatusChange("delivered")}
                  disabled={loading}
                  className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  Confirmar entrega
                </button>
              )}
              {order.status === "cancelled" && (
                <p className="text-xs text-red-500">Pedido cancelado</p>
              )}
              {order.status === "delivered" && (
                <p className="text-xs text-green-600">Pedido entregue</p>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
