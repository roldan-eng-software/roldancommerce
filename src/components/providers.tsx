"use client";

import { CartProvider } from "@/lib/cart-context";
import SiteHeader from "./site-header-client";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <SiteHeader />
      {children}
    </CartProvider>
  );
}
