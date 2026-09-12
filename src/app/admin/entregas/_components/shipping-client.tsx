"use client";

import { useState } from "react";
import Link from "next/link";
import { formatPrice } from "@/data/products";
import {
  markAsShipped,
  markAsDelivered,
  simulateFreight,
} from "@/app/_actions/shipping";

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

interface Props {
  orders: ShippingOrder[];
}

const envioLabels: Record<string, { label: string; color: string }> = {
  pendente: { label: "Pendente", color: "bg-zinc-100 text-zinc-600" },
  enviado: { label: "Enviado", color: "bg-blue-100 text-blue-700" },
  entregue: { label: "Entregue", color: "bg-green-100 text-green-700" },
};

export default function ShippingClient({ orders }: Props) {
  const [search, setSearch] = useState("");
  const [envioFilter, setEnvioFilter] = useState("");
  const [showCalculator, setShowCalculator] = useState(false);

  const [calcCep, setCalcCep] = useState("");
  const [calcResult, setCalcResult] = useState<{
    valor: number;
    prazo: string;
  } | null>(null);
  const [calcError, setCalcError] = useState("");
  const [calcLoading, setCalcLoading] = useState(false);

  const [shipModal, setShipModal] = useState<string | null>(null);
  const [carrier, setCarrier] = useState("");
  const [trackingCode, setTrackingCode] = useState("");
  const [shipLoading, setShipLoading] = useState(false);
  const [shipError, setShipError] = useState("");

  const filtered = orders.filter((o) => {
    if (envioFilter && o.status_envio !== envioFilter) return false;
    if (search) {
      const s = search.toLowerCase();
      if (
        !o.id.toLowerCase().includes(s) &&
        !(o.user_name || "").includes(s) &&
        !o.cep.includes(s)
      ) {
        return false;
      }
    }
    return true;
  });

  async function handleSimulateFreight() {
    setCalcLoading(true);
    setCalcError("");
    setCalcResult(null);

    const result = await simulateFreight(calcCep, []);
    setCalcLoading(false);

    if ("error" in result) {
      setCalcError(result.error);
    } else {
      setCalcResult(result);
    }
  }

  async function handleShip(orderId: string) {
    setShipLoading(true);
    setShipError("");

    const result = await markAsShipped(orderId, carrier, trackingCode);
    setShipLoading(false);

    if (result.error) {
      setShipError(result.error);
    } else {
      setShipModal(null);
      setCarrier("");
      setTrackingCode("");
      window.location.reload();
    }
  }

  async function handleDeliver(orderId: string) {
    if (!confirm("Confirmar entrega deste pedido?")) return;

    const result = await markAsDelivered(orderId);
    if (result.error) {
      alert(result.error);
    } else {
      window.location.reload();
    }
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Entregas</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Gerencie envios e fretes.
          </p>
        </div>
        <button
          onClick={() => setShowCalculator(!showCalculator)}
          className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-zinc-50"
        >
          Calculadora de frete
        </button>
      </div>

      {showCalculator && (
        <div className="mt-4 rounded-xl border bg-white p-4">
          <h2 className="text-sm font-semibold">Calculadora de frete</h2>
          <div className="mt-3 flex gap-2">
            <input
              type="text"
              maxLength={9}
              value={calcCep}
              onChange={(e) => setCalcCep(e.target.value)}
              placeholder="CEP de destino"
              className="rounded-lg border px-3 py-2 text-sm"
            />
            <button
              onClick={handleSimulateFreight}
              disabled={calcLoading}
              className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
            >
              {calcLoading ? "Calculando..." : "Calcular"}
            </button>
          </div>
          {calcError && (
            <p className="mt-2 text-xs text-red-600">{calcError}</p>
          )}
          {calcResult && (
            <div className="mt-3 rounded-lg bg-emerald-50 p-3 text-sm">
              <p className="font-medium text-emerald-800">
                {calcResult.valor === 0
                  ? "Frete Grátis (São Carlos!)"
                  : `Frete: ${formatPrice(calcResult.valor)}`}
              </p>
              <p className="text-emerald-700">{calcResult.prazo}</p>
            </div>
          )}
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Buscar por ID, CPF ou CEP..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-lg border px-3 py-2 text-sm"
        />
        <select
          value={envioFilter}
          onChange={(e) => setEnvioFilter(e.target.value)}
          className="rounded-lg border px-3 py-2 text-sm"
        >
          <option value="">Todos</option>
          <option value="pendente">Pendentes de envio</option>
          <option value="enviado">Enviados</option>
          <option value="entregue">Entregues</option>
        </select>
      </div>

      <div className="mt-4 rounded-xl border bg-white">
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
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">CEP</th>
                  <th className="px-4 py-3">Frete</th>
                  <th className="px-4 py-3">Prazo</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Rastreio</th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((order) => {
                  const envioInfo = envioLabels[order.status_envio] || {
                    label: order.status_envio,
                    color: "bg-zinc-100 text-zinc-600",
                  };

                  return (
                    <tr key={order.id}>
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/pedidos/${order.id}`}
                          className="font-mono text-xs font-medium hover:underline"
                        >
                          #{order.id.slice(0, 8).toUpperCase()}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {order.user_name || "—"}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">
                        {order.frete_cep || order.cep || "—"}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {order.frete === 0
                          ? "Grátis"
                          : formatPrice(order.frete / 100)}
                      </td>
                      <td className="px-4 py-3 text-xs text-zinc-500">
                        {order.frete_prazo || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${envioInfo.color}`}
                        >
                          {envioInfo.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">
                        {order.tracking_code || "—"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {order.status_envio === "pendente" &&
                            ["confirmed", "pendente"].includes(
                              order.status
                            ) && (
                              <button
                                onClick={() => setShipModal(order.id)}
                                className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
                              >
                                Enviar
                              </button>
                            )}
                          {order.status_envio === "enviado" && (
                            <button
                              onClick={() => handleDeliver(order.id)}
                              className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700"
                            >
                              Entregue
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {shipModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl bg-white p-6">
            <h2 className="text-lg font-semibold">Registrar envio</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Pedido #{shipModal.slice(0, 8).toUpperCase()}
            </p>
            {shipError && (
              <div className="mt-3 rounded-lg bg-red-50 p-2 text-xs text-red-700">
                {shipError}
              </div>
            )}
            <div className="mt-4 flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">Transportadora *</label>
                <input
                  type="text"
                  value={carrier}
                  onChange={(e) => setCarrier(e.target.value)}
                  placeholder="Ex: Correios, Jadlog..."
                  className="rounded-lg border px-3 py-2 text-sm"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">
                  Código de rastreio
                </label>
                <input
                  type="text"
                  value={trackingCode}
                  onChange={(e) => setTrackingCode(e.target.value)}
                  placeholder="Opcional"
                  className="rounded-lg border px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => handleShip(shipModal)}
                disabled={shipLoading || !carrier}
                className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
              >
                {shipLoading ? "Salvando..." : "Confirmar envio"}
              </button>
              <button
                onClick={() => {
                  setShipModal(null);
                  setShipError("");
                }}
                className="rounded-lg border px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
