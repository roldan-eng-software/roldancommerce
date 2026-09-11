"use client";

import Link from "next/link";
import CartBadge from "./cart-badge";

export default function SiteHeaderClient() {
  return (
    <header className="sticky top-0 z-30 border-b border-black/10 bg-white/90 backdrop-blur dark:bg-black/80">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4">
        <Link href="/" className="text-lg font-bold tracking-tight">
          Roldan Marcenaria
        </Link>
        <div className="flex items-center gap-3">
          <span className="hidden rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800 sm:block">
            São Carlos · Frete Grátis
          </span>
          <CartBadge />
          <Link
            href="/auth/login"
            className="rounded-full bg-black px-4 py-1.5 text-xs font-semibold text-white hover:bg-zinc-800"
          >
            Entrar
          </Link>
        </div>
      </div>
    </header>
  );
}
