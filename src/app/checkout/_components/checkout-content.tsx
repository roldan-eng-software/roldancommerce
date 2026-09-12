"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { formatPrice, isSaoCarlos } from "@/data/products";
import { createOrder } from "@/app/_actions/orders";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

type PaymentMethod = "pix" | "card" | "entrega";

interface OrderResult {
  orderId: string;
  method: PaymentMethod;
}

export default function CheckoutContent() {
  const { items, subtotal, clearCart } = useCart();
  const [cep, setCep] = useState("");
  const [logradouro, setLogradouro] = useState("");
  const [numero, setNumero] = useState("");
  const [complemento, setComplemento] = useState("");
  const [cidade, setCidade] = useState("");
  const [uf, setUf] = useState("");
  const [freteValor, setFreteValor] = useState<number | null>(null);
  const [fretePrazo, setFretePrazo] = useState("");
  const [metodo, setMetodo] = useState<PaymentMethod>("pix");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [orderResult, setOrderResult] = useState<OrderResult | null>(null);

  const isLocal = cep ? isSaoCarlos(cep) : false;
  const total = subtotal + (freteValor ?? 0);

  async function handleFinish() {
    setError("");
    setLoading(true);

    if (freteValor === null) {
      setError("Calcule o frete antes de finalizar.");
      setLoading(false);
      return;
    }

    if (!cep || cep.replace(/\D/g, "").length !== 8) {
      setError("Informe um CEP válido.");
      setLoading(false);
      return;
    }

    const result = await createOrder({
      items: items.map((i) => ({
        productId: i.product.id,
        quantity: i.quantity,
        unitPrice: i.product.preco,
      })),
      subtotal,
      freteValor,
      freteCep: cep,
      fretePrazo,
      paymentMethod: metodo,
      cep: cep.replace(/\D/g, ""),
      logradouro,
      numero,
      complemento,
      cidade,
      uf,
    });

    setLoading(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setOrderResult({ orderId: result.orderId!, method: metodo });
    clearCart();
  }

  if (items.length === 0 && !orderResult) {
    return (
      <main className="mx-auto flex min-h-[60vh] w-full max-w-4xl flex-col items-center justify-center px-4 py-12 text-center">
        <p className="text-2xl font-bold">Carrinho vazio</p>
        <Button render={<a href="/" />} className="mt-4">
          Ver produtos
        </Button>
      </main>
    );
  }

  if (orderResult) {
    return (
      <main className="mx-auto flex min-h-[60vh] w-full max-w-2xl flex-col items-center justify-center px-4 py-12 text-center">
        <div className="rounded-2xl border bg-emerald-50 p-8">
          <p className="text-3xl">🎉</p>
          <p className="mt-4 text-xl font-bold text-emerald-800">
            Pedido confirmado!
          </p>
          <p className="mt-2 text-sm text-emerald-700">
            Pedido #{orderResult.orderId.slice(0, 8).toUpperCase()}
          </p>
          <p className="mt-1 text-sm text-emerald-700">
            {orderResult.method === "pix"
              ? "PIX gerado. Use o QR code para pagamento."
              : orderResult.method === "card"
                ? "Cartão processado com sucesso."
                : "Pagamento será cobrado na entrega."}
          </p>
          <Button render={<a href="/" />} className="mt-6">
            Voltar à loja
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-bold">Checkout</h1>

      <div className="mt-6 flex flex-col gap-6 lg:flex-row">
        <div className="flex flex-1 flex-col gap-6">
          <section className="rounded-xl border p-4">
            <h2 className="text-sm font-semibold">Resumo do pedido</h2>
            <ul className="mt-3 divide-y text-sm">
              {items.map(({ product, quantity }) => (
                <li key={product.id} className="flex justify-between py-2">
                  <span>
                    {product.nome} × {quantity}
                  </span>
                  <span className="font-bold">
                    {formatPrice(product.preco * quantity)}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-xl border p-4">
            <h2 className="text-sm font-semibold">Entrega</h2>
            <div className="mt-3 flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="cep">CEP *</Label>
                <Input
                  id="cep"
                  maxLength={9}
                  value={cep}
                  onChange={(e) => setCep(e.target.value)}
                  placeholder="00000-000"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="logradouro">Logradouro</Label>
                  <Input
                    id="logradouro"
                    value={logradouro}
                    onChange={(e) => setLogradouro(e.target.value)}
                    placeholder="Rua, Av..."
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="numero">Número</Label>
                  <Input
                    id="numero"
                    value={numero}
                    onChange={(e) => setNumero(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="complemento">Compl.</Label>
                  <Input
                    id="complemento"
                    value={complemento}
                    onChange={(e) => setComplemento(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="cidade">Cidade</Label>
                  <Input
                    id="cidade"
                    value={cidade}
                    onChange={(e) => setCidade(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="uf">UF</Label>
                  <Input
                    id="uf"
                    maxLength={2}
                    value={uf}
                    onChange={(e) => setUf(e.target.value)}
                  />
                </div>
              </div>
              {freteValor !== null && (
                <div className="text-sm">
                  <span className="text-emerald-700">
                    Frete:{" "}
                    {freteValor === 0
                      ? "Grátis (São Carlos!)"
                      : formatPrice(freteValor)}
                  </span>
                  <span className="ml-2 text-zinc-500">· {fretePrazo}</span>
                </div>
              )}
            </div>
          </section>

          <section className="rounded-xl border p-4">
            <h2 className="text-sm font-semibold">Pagamento</h2>
            <p className="mt-1 text-xs text-zinc-500">
              Os dados de pagamento aparecem apenas nesta última etapa.
            </p>
            <div className="mt-3 flex flex-col gap-2">
              <label className="flex items-center gap-3 rounded-lg border p-3 cursor-pointer has-[:checked]:border-black has-[:checked]:bg-zinc-50">
                <input
                  type="radio"
                  name="pagamento"
                  value="pix"
                  checked={metodo === "pix"}
                  onChange={() => setMetodo("pix")}
                />
                <div>
                  <p className="text-sm font-medium">PIX</p>
                  <p className="text-xs text-zinc-500">QR Code instantâneo</p>
                </div>
              </label>
              <label className="flex items-center gap-3 rounded-lg border p-3 cursor-pointer has-[:checked]:border-black has-[:checked]:bg-zinc-50">
                <input
                  type="radio"
                  name="pagamento"
                  value="card"
                  checked={metodo === "card"}
                  onChange={() => setMetodo("card")}
                />
                <div>
                  <p className="text-sm font-medium">Cartão de crédito</p>
                  <p className="text-xs text-zinc-500">Visa, Mastercard, Elo</p>
                </div>
              </label>
              {isLocal && (
                <label className="flex items-center gap-3 rounded-lg border p-3 cursor-pointer has-[:checked]:border-black has-[:checked]:bg-zinc-50">
                  <input
                    type="radio"
                    name="pagamento"
                    value="entrega"
                    checked={metodo === "entrega"}
                    onChange={() => setMetodo("entrega")}
                  />
                  <div>
                    <p className="text-sm font-medium">Pagar na Entrega</p>
                    <p className="text-xs text-zinc-500">
                      Cartão ou PIX no recebimento · São Carlos
                    </p>
                  </div>
                </label>
              )}
            </div>
          </section>
        </div>

        <div className="w-full lg:w-80">
          <div className="sticky top-20 rounded-xl border p-4">
            <h2 className="text-sm font-semibold">Total</h2>
            <div className="mt-3 flex flex-col gap-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Frete</span>
                <span>
                  {freteValor === null
                    ? "—"
                    : freteValor === 0
                      ? "Grátis"
                      : formatPrice(freteValor)}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between text-base font-bold">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
            {error && (
              <div className="mt-3 rounded-lg bg-red-50 p-2 text-xs text-red-700">
                {error}
              </div>
            )}
            <Button
              onClick={handleFinish}
              disabled={loading}
              className="mt-4 w-full"
            >
              {loading ? "Processando..." : "Confirmar pedido"}
            </Button>
            <p className="mt-2 text-center text-xs text-zinc-500">
              Pagamento processado via Asaas
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
