"use client";

import { useState } from "react";
import { PAGE_SIZE, PRODUCTS, type Product } from "@/data/products";
import ProductCard from "./product-card";
import QuickView from "./quick-view";

export default function Storefront() {
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Product | null>(null);

  const totalPages = Math.max(1, Math.ceil(PRODUCTS.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const visible = PRODUCTS.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  if (PRODUCTS.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed p-10 text-center text-zinc-500">
        Catálogo indisponível no momento. Volte em breve.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {visible.map((product) => (
          <ProductCard key={product.id} product={product} onSelect={setSelected} />
        ))}
      </div>
      {totalPages > 1 ? (
        <nav aria-label="Paginação" className="flex items-center justify-center gap-2">
          <button
            type="button"
            disabled={current === 1}
            onClick={() => setPage(current - 1)}
            className="rounded-full border px-4 py-2 text-sm disabled:opacity-40"
          >
            Anterior
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
              aria-current={n === current ? "page" : undefined}
              onClick={() => setPage(n)}
              className={
                n === current
                  ? "size-9 rounded-full bg-black text-sm font-bold text-white"
                  : "size-9 rounded-full border text-sm"
              }
            >
              {n}
            </button>
          ))}
          <button
            type="button"
            disabled={current === totalPages}
            onClick={() => setPage(current + 1)}
            className="rounded-full border px-4 py-2 text-sm disabled:opacity-40"
          >
            Próxima
          </button>
        </nav>
      ) : null}
      <QuickView product={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
