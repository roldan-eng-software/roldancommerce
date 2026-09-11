"use client";

import { useState } from "react";
import { type Product } from "@/data/products";
import { getProductsPage } from "@/app/_data-access/get-products";
import ProductCard from "./product-card";
import QuickView from "./quick-view";
import { Button } from "@/components/ui/button";

interface Props {
  initialProducts: Product[];
  totalPages: number;
  currentPage: number;
}

export default function Storefront({
  initialProducts,
  totalPages,
  currentPage,
}: Props) {
  const [page, setPage] = useState(currentPage);
  const [selected, setSelected] = useState<Product | null>(null);

  const { products: visible } = getProductsPage(page);

  if (initialProducts.length === 0) {
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
          <ProductCard
            key={product.id}
            product={product}
            onSelect={setSelected}
          />
        ))}
      </div>
      {totalPages > 1 ? (
        <nav
          aria-label="Paginação"
          className="flex items-center justify-center gap-2"
        >
          <Button
            type="button"
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            Anterior
          </Button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <Button
              key={n}
              type="button"
              variant={n === page ? "default" : "outline"}
              size="icon"
              aria-current={n === page ? "page" : undefined}
              onClick={() => setPage(n)}
              className="size-9"
            >
              {n}
            </Button>
          ))}
          <Button
            type="button"
            variant="outline"
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
          >
            Próxima
          </Button>
        </nav>
      ) : null}
      <QuickView product={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
