"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart-context";

export default function CartBadge() {
  const { totalItems } = useCart();

  return (
    <Link
      href="/carrinho"
      className="relative rounded-full border border-border px-3 py-1.5 text-xs font-medium"
    >
      Carrinho
      {totalItems > 0 && (
        <span className="absolute -right-1.5 -top-1.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
          {totalItems}
        </span>
      )}
    </Link>
  );
}
