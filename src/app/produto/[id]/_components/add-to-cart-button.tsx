"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart-context";
import { type Product } from "@/data/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  product: Product;
}

export default function AddToCartButton({ product }: Props) {
  const [qty, setQty] = useState(1);
  const [hasAdded, setHasAdded] = useState(false);
  const { addItem } = useCart();

  function handleAdd() {
    addItem(product, qty);
    setHasAdded(true);
    setTimeout(() => setHasAdded(false), 2000);
  }

  function handleDecrement() {
    setQty((q) => Math.max(1, q - 1));
  }

  function handleIncrement() {
    setQty((q) => q + 1);
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border p-4">
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
          onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
          className="w-16 text-center"
          min={1}
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleIncrement}
        >
          +
        </Button>
      </div>
      <Button type="button" onClick={handleAdd} className="w-full">
        {hasAdded ? "✓ Adicionado!" : "Adicionar ao carrinho"}
      </Button>
      <p className="text-center text-xs text-zinc-500">
        Frete grátis em São Carlos/SP · CEP calculado no carrinho
      </p>
    </div>
  );
}
