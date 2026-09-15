"use client";

import { formatPrice, prazoLabel, type Product } from "@/data/products";
import ProductImage from "@/components/product-image";

interface Props {
  product: Product;
  onSelect: (product: Product) => void;
}

export default function ProductCard({ product, onSelect }: Props) {
  function handleSelect() {
    onSelect(product);
  }

  return (
    <button
      type="button"
      onClick={handleSelect}
      data-testid="product-card"
      className="group flex flex-col gap-3 rounded-2xl border border-border bg-card p-3 text-left transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <ProductImage
        productId={product.id}
        nome={product.nome}
        imageUrl={product.imagemUrl}
        size="md"
        className="rounded-xl"
      />
      <div className="flex flex-1 flex-col gap-1">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug">
          {product.nome}
        </h3>
        <p className="text-base font-bold">{formatPrice(product.preco)}</p>
        <p className="text-xs text-emerald-700">
          {prazoLabel(product.disponibilidade)}
        </p>
      </div>
    </button>
  );
}
