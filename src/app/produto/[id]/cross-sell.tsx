"use client";

import { useState } from "react";
import { formatPrice, prazoLabel, type Product } from "@/data/products";
import { motion } from "framer-motion";
import { useCart } from "@/lib/cart-context";

interface Props {
  items: Product[];
}

export default function CrossSell({ items }: Props) {
  const [addedId, setAddedId] = useState<string | null>(null);
  const { addItem } = useCart();

  if (items.length === 0) return null;

  function handleAdd(product: Product) {
    addItem(product);
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 2000);
  }

  return (
    <section className="mt-12 border-t pt-8">
      <h2 className="text-xl font-bold tracking-tight">
        Compre junto com... e economize no frete
      </h2>
      <p className="mt-1 text-sm text-zinc-500">
        Adicione mais de um item ao carrinho para reduzir o custo do frete.
      </p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex flex-col gap-2 rounded-xl border bg-white p-4 dark:bg-zinc-900"
          >
            <div className="flex items-start gap-3">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-lg font-bold text-amber-900">
                {item.nome.charAt(0)}
              </div>
              <div className="flex flex-1 flex-col gap-1">
                <h3 className="text-sm font-semibold leading-snug">{item.nome}</h3>
                <p className="text-sm font-bold">{formatPrice(item.preco)}</p>
                <p className="text-xs text-emerald-700">{prazoLabel(item.disponibilidade)}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleAdd(item)}
              className="mt-1 w-full rounded-full border px-4 py-2 text-xs font-semibold"
            >
              {addedId === item.id ? "✓ Adicionado!" : "+ Adicionar ao carrinho"}
            </button>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
