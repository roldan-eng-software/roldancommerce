"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { formatPrice, prazoLabel, type Product } from "@/data/products";
import { useCart } from "@/lib/cart-context";

interface Props {
  product: Product | null;
  onClose: () => void;
}

export default function QuickView({ product, onClose }: Props) {
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function handleAdd() {
    if (!product) return;
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <AnimatePresence>
      {product ? (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
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
              <div className="flex aspect-video items-center justify-center bg-gradient-to-br from-amber-100 to-orange-200 text-5xl font-bold text-amber-900">
                {product.nome.charAt(0)}
              </div>
              <div className="flex flex-col gap-2 p-6">
                <h2 className="text-xl font-bold">{product.nome}</h2>
                <p className="text-sm text-zinc-600 dark:text-zinc-300">
                  {product.descricao}
                </p>
                <p className="text-2xl font-bold">{formatPrice(product.preco)}</p>
                <p className="text-sm text-emerald-700">
                  {prazoLabel(product.disponibilidade)}
                </p>
                {product.medidas && (
                  <p className="text-xs text-zinc-500">Medidas: {product.medidas}</p>
                )}
                <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                  <button
                    type="button"
                    onClick={handleAdd}
                    className="flex-1 rounded-full bg-black px-5 py-3 text-sm font-semibold text-white hover:bg-zinc-800"
                  >
                    {added ? "✓ Adicionado!" : "Adicionar ao carrinho"}
                  </button>
                  <Link
                    href={`/produto/${product.id}`}
                    className="flex-1 rounded-full border border-black/15 px-5 py-3 text-center text-sm font-medium"
                  >
                    Ver detalhes
                  </Link>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="mt-1 text-sm text-zinc-500 hover:text-zinc-800"
                >
                  Fechar
                </button>
              </div>
            </motion.div>
          </div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
