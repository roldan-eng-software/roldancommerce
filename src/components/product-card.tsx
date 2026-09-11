"use client";

import { formatPrice, prazoLabel, type Product } from "@/data/products";

interface Props {
  product: Product;
  onSelect: (product: Product) => void;
}

export default function ProductCard({ product, onSelect }: Props) {
  return (
    <button
      type="button"
      onClick={() => onSelect(product)}
      className="group flex flex-col gap-3 rounded-2xl border border-black/10 bg-white p-3 text-left transition hover:-translate-y-0.5 hover:shadow-lg dark:bg-zinc-900"
    >
      <div className="flex aspect-square items-center justify-center rounded-xl bg-gradient-to-br from-amber-100 to-orange-200 text-3xl font-bold text-amber-900 dark:from-zinc-800 dark:to-zinc-700 dark:text-zinc-200">
        {product.nome.charAt(0)}
      </div>
      <div className="flex flex-1 flex-col gap-1">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug">
          {product.nome}
        </h3>
        <p className="text-base font-bold">{formatPrice(product.preco)}</p>
        <p className="text-xs text-emerald-700">{prazoLabel(product.disponibilidade)}</p>
      </div>
    </button>
  );
}
