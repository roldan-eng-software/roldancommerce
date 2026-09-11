"use client";

import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import {
  formatPrice,
  prazoLabel,
  calcFrete,
  isSaoCarlos,
} from "@/data/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import ProductImage from "@/components/product-image";

export default function CartContent() {
  const { items, removeItem, updateQuantity, subtotal } = useCart();
  const [cep, setCep] = useState("");
  const [frete, setFrete] = useState<{ valor: number; prazo: string } | null>(
    null
  );
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

  function handleDecrementQuantity(id: string, currentQty: number) {
    updateQuantity(id, currentQty - 1);
  }

  function handleIncrementQuantity(id: string, currentQty: number) {
    updateQuantity(id, currentQty + 1);
  }

  function handleRemove(id: string) {
    removeItem(id);
  }

  const total = subtotal + (frete?.valor ?? 0);

  if (items.length === 0) {
    return (
      <main className="mx-auto flex min-h-[60vh] w-full max-w-4xl flex-col items-center justify-center px-4 py-12 text-center">
        <p className="text-2xl font-bold">Seu carrinho está vazio</p>
        <p className="mt-2 text-sm text-zinc-500">
          Adicione itens da loja para continuar.
        </p>
        <Button render={<a href="/" />} className="mt-6">
          Ver produtos
        </Button>
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
                <ProductImage
                  productId={product.id}
                  nome={product.nome}
                  size="sm"
                  className="rounded-lg"
                />
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
                  <p className="text-sm font-bold">
                    {formatPrice(product.preco)}
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        handleDecrementQuantity(product.id, quantity)
                      }
                      disabled={quantity <= 1}
                      className="size-7"
                    >
                      −
                    </Button>
                    <span className="w-6 text-center text-sm font-bold">
                      {quantity}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        handleIncrementQuantity(product.id, quantity)
                      }
                      className="size-7"
                    >
                      +
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemove(product.id)}
                      className="ml-auto text-xs text-red-500 hover:text-red-700"
                    >
                      Remover
                    </Button>
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
                <span>
                  Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} itens)
                </span>
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
              <Separator />
              <div className="flex justify-between text-base font-bold">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-2">
              <Label>Calcular frete</Label>
              <div className="flex gap-2">
                <Input
                  maxLength={9}
                  value={cep}
                  onChange={(e) => setCep(e.target.value)}
                  placeholder="00000-000"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCalcFrete}
                >
                  Calcular
                </Button>
              </div>
              {freteError && (
                <p className="text-xs text-red-500">{freteError}</p>
              )}
            </div>

            <Button render={<a href="/checkout" />} className="mt-4 w-full">
              Comprar
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
