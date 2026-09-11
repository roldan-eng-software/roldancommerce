"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { formatPrice, prazoLabel, type Product } from "@/data/products";
import { useCart } from "@/lib/cart-context";
import { Button } from "@/components/ui/button";
import ProductImage from "@/components/product-image";

interface Props {
  product: Product | null;
  onClose: () => void;
}

export default function QuickView({ product, onClose }: Props) {
  const [hasAdded, setHasAdded] = useState(false);
  const { addItem } = useCart();

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  function handleAdd() {
    if (!product) return;
    addItem(product);
    setHasAdded(true);
    setTimeout(() => setHasAdded(false), 2000);
  }

  function handleClose() {
    onClose();
  }

  return (
    <AnimatePresence>
      {product ? (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-40 bg-black/50"
          />
          <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="pointer-events-auto w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-zinc-900"
            >
              <ProductImage
                productId={product.id}
                nome={product.nome}
                size="lg"
              />
              <div className="flex flex-col gap-2 p-6">
                <h2 className="text-xl font-bold">{product.nome}</h2>
                <p className="text-sm text-zinc-600 dark:text-zinc-300">
                  {product.descricao}
                </p>
                <p className="text-2xl font-bold">
                  {formatPrice(product.preco)}
                </p>
                <p className="text-sm text-emerald-700">
                  {prazoLabel(product.disponibilidade)}
                </p>
                {product.medidas && (
                  <p className="text-xs text-zinc-500">
                    Medidas: {product.medidas}
                  </p>
                )}
                <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                  <Button onClick={handleAdd} className="flex-1">
                    {hasAdded ? "✓ Adicionado!" : "Adicionar ao carrinho"}
                  </Button>
                  <Button
                    render={<a href={`/produto/${product.id}`} />}
                    variant="outline"
                    className="flex-1"
                  >
                    Ver detalhes
                  </Button>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleClose}
                  className="mt-1 text-sm text-zinc-500 hover:text-zinc-800"
                >
                  Fechar
                </Button>
              </div>
            </motion.div>
          </div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
