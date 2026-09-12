"use client";

import { useState } from "react";
import { type Product } from "@/data/products";
import { fetchProductsPage } from "@/app/_actions/products";
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
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [loading, setLoading] = useState(false);

  async function handlePageChange(newPage: number) {
    setLoading(true);
    setPage(newPage);
    const data = await fetchProductsPage(newPage);
    setProducts(data.products);
    setLoading(false);
  }

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
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onSelect={setSelected}
          />
        ))}
      </div>
      {loading && (
        <p className="text-center text-sm text-zinc-500">Carregando...</p>
      )}
      {totalPages > 1 ? (
        <nav
          aria-label="Paginação"
          className="flex items-center justify-center gap-2"
        >
          <Button
            type="button"
            variant="outline"
            disabled={page === 1 || loading}
            onClick={() => handlePageChange(page - 1)}
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
              onClick={() => handlePageChange(n)}
              className="size-9"
              disabled={loading}
            >
              {n}
            </Button>
          ))}
          <Button
            type="button"
            variant="outline"
            disabled={page === totalPages || loading}
            onClick={() => handlePageChange(page + 1)}
          >
            Próxima
          </Button>
        </nav>
      ) : null}
      <QuickView product={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
