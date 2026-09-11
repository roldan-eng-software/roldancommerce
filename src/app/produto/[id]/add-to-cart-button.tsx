"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart-context";
import { type Product } from "@/data/products";

interface Props {
  product: Product;
}

export default function AddToCartButton({ product }: Props) {
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();

  function handleAdd() {
    addItem(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border p-4">
      <label className="text-sm font-medium">Quantidade</label>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setQty((q) => Math.max(1, q - 1))}
          className="size-9 rounded-full border text-lg font-bold"
        >
          −
        </button>
        <span className="w-10 text-center text-lg font-bold">{qty}</span>
        <button
          type="button"
          onClick={() => setQty((q) => q + 1)}
          className="size-9 rounded-full border text-lg font-bold"
        >
          +
        </button>
      </div>
      <button
        type="button"
        onClick={handleAdd}
        className="mt-2 w-full rounded-full bg-black px-6 py-3 text-sm font-semibold text-white hover:bg-zinc-800"
      >
        {added ? "✓ Adicionado!" : "Adicionar ao carrinho"}
      </button>
      <p className="text-center text-xs text-zinc-500">
        Frete grátis em São Carlos/SP · CEP calculado no carrinho
      </p>
    </div>
  );
}
