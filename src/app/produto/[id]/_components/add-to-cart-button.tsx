"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart-context";
import { type Product } from "@/data/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  product: Product;
  stock?: number;
}

export default function AddToCartButton({ product, stock }: Props) {
  const [qty, setQty] = useState(1);
  const [hasAdded, setHasAdded] = useState(false);
  const { addItem } = useCart();

  const isOutOfStock =
    stock !== undefined &&
    product.disponibilidade !== "sob-medida" &&
    stock <= 0;

  const maxQty =
    stock !== undefined && product.disponibilidade !== "sob-medida"
      ? stock
      : 99;

  function handleAdd() {
    if (isOutOfStock) return;
    addItem(product, qty);
    setHasAdded(true);
    setTimeout(() => setHasAdded(false), 2000);
  }

  function handleDecrement() {
    setQty((q) => Math.max(1, q - 1));
  }

  function handleIncrement() {
    setQty((q) => Math.min(maxQty, q + 1));
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border p-4">
      {isOutOfStock ? (
        <div className="rounded-lg bg-red-50 p-3 text-sm font-medium text-red-700">
          Produto esgotado no momento
        </div>
      ) : (
        <>
          <Label>Quantidade</Label>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleDecrement}
            >
              −
            </Button>
            <Input
              type="number"
              value={qty}
              onChange={(e) =>
                setQty(
                  Math.max(1, Math.min(maxQty, parseInt(e.target.value) || 1))
                )
              }
              className="w-16 text-center"
              min={1}
              max={maxQty}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleIncrement}
              disabled={qty >= maxQty}
            >
              +
            </Button>
            {stock !== undefined &&
              product.disponibilidade !== "sob-medida" &&
              stock > 0 && (
                <span className="text-xs text-zinc-500">
                  {stock} disponível{stock !== 1 ? "eis" : ""}
                </span>
              )}
          </div>
          <Button
            type="button"
            onClick={handleAdd}
            className="w-full"
            disabled={isOutOfStock}
          >
            {hasAdded ? "✓ Adicionado!" : "Adicionar ao carrinho"}
          </Button>
        </>
      )}
      <p className="text-center text-xs text-zinc-500">
        Frete grátis em São Carlos/SP · CEP calculado no carrinho
      </p>
    </div>
  );
}
