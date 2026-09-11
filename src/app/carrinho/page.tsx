"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { formatPrice, prazoLabel, calcFrete, isSaoCarlos } from "@/data/products";

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotal } = useCart();
  const [cep, setCep] = useState("");
  const [frete, setFrete] = useState<{ valor: number; prazo: string } | null>(null);
  const [freteError, setFreteError] = useState("");

  function handleCalcFrete() {
    const clean = cep.replace(/\D/g, "");
    if (clean.length !== 8) {
      setFreteError("CEP inválido. Digite 8 dígitos.");
      setFrete(null);
      return;
    }
    setFreteError("");
    const result = calcFrete(cep, items);
    setFrete(result);
  }

  const total = subtotal + (frete?.valor ?? 0);

  if (items.length === 0) {
    return (
      <main className="mx-auto flex min-h-[60vh] w-full max-w-4xl flex-col items-center justify-center px-4 py-12 text-center">
        <p className="text-2xl font-bold">Seu carrinho está vazio</p>
        <p className="mt-2 text-sm text-zinc-500">
          Adicione itens da loja para continuar.
        </p>
        <Link
          href="/"
          className="mt-6 rounded-full bg-black px-6 py-3 text-sm font-semibold text-white hover:bg-zinc-800"
        >
          Ver produtos
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-bold">Carrinho</h1>

      <div className="mt-6 flex flex-col gap-6 lg:flex-row">
        <div className="flex-1">
          <ul className="divide-y rounded-xl border">
            {items.map(({ product, quantity }) => (
              <li key={product.id} className="flex gap-4 p-4">
                <div className="flex size-16 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-lg font-bold text-amber-900">
                  {product.nome.charAt(0)}
                </div>
                <div className="flex flex-1 flex-col gap-1">
                  <Link
                    href={`/produto/${product.id}`}
                    className="text-sm font-semibold hover:underline"
                  >
                    {product.nome}
                  </Link>
                  <p className="text-xs text-zinc-500">
                    {prazoLabel(product.disponibilidade)}
                  </p>
                  <p className="text-sm font-bold">{formatPrice(product.preco)}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => updateQuantity(product.id, quantity - 1)}
                      disabled={quantity <= 1}
                      className="size-7 rounded-full border text-xs font-bold disabled:opacity-30"
                    >
                      −
                    </button>
                    <span className="w-6 text-center text-sm font-bold">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(product.id, quantity + 1)}
                      className="size-7 rounded-full border text-xs font-bold"
                    >
                      +
                    </button>
                    <button
                      type="button"
                      onClick={() => removeItem(product.id)}
                      className="ml-auto text-xs text-red-500 hover:underline"
                    >
                      Remover
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="w-full lg:w-80">
          <div className="sticky top-20 rounded-xl border p-4">
            <h2 className="text-sm font-semibold">Resumo</h2>
            <div className="mt-3 flex flex-col gap-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} itens)</span>
                <span className="font-bold">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Frete</span>
                <span className="font-bold">
                  {frete === null
                    ? "—"
                    : frete.valor === 0
                      ? "Grátis"
                      : formatPrice(frete.valor)}
                </span>
              </div>
              {frete && (
                <p className="text-xs text-emerald-700">{frete.prazo}</p>
              )}
              {frete && isSaoCarlos(cep) && (
                <p className="text-xs font-semibold text-emerald-700">
                  🎉 Frete Grátis para São Carlos!
                </p>
              )}
              <hr />
              <div className="flex justify-between text-base font-bold">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-2">
              <label className="text-xs font-medium">Calcular frete</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={9}
                  value={cep}
                  onChange={(e) => setCep(e.target.value)}
                  placeholder="00000-000"
                  className="flex-1 rounded-lg border px-3 py-2 text-sm"
                />
                <button
                  type="button"
                  onClick={handleCalcFrete}
                  className="rounded-lg border px-3 py-2 text-sm font-medium hover:bg-zinc-50"
                >
                  Calcular
                </button>
              </div>
              {freteError && (
                <p className="text-xs text-red-500">{freteError}</p>
              )}
            </div>

            <Link
              href="/checkout"
              className="mt-4 block w-full rounded-full bg-black py-3 text-center text-sm font-semibold text-white hover:bg-zinc-800"
            >
              Comprar
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
