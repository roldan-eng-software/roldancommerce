import Link from "next/link";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { signOut } from "@/lib/auth/actions";
import CartBadge from "./cart-badge";
import ThemeToggle from "./theme-toggle";

export default async function SiteHeader() {
  let user = null;
  let isAdmin = false;
  if (isSupabaseConfigured) {
    const supabase = await createClient();
    const { data } = await supabase!.auth.getUser();
    user = data.user;
    if (user) {
      isAdmin =
        user.app_metadata?.role === "admin" ||
        user.user_metadata?.role === "admin";
    }
  }

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4">
        <Link href="/" className="text-lg font-bold tracking-tight">
          Roldan Marcenaria
        </Link>
        <div className="flex items-center gap-3">
          <span className="hidden rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 sm:block">
            São Carlos · Frete Grátis
          </span>
          <ThemeToggle />
          <CartBadge />
          {user ? (
            <div className="flex items-center gap-2">
              {isAdmin && (
                <Link
                  href="/admin"
                  className="rounded-full border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-800 hover:bg-amber-100 dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-400 dark:hover:bg-amber-900/50"
                >
                  Admin
                </Link>
              )}
              <Link
                href="/perfil"
                className="rounded-full border border-border px-3 py-1.5 text-xs font-medium"
              >
                Minha conta
              </Link>
              <form action={signOut}>
                <button
                  type="submit"
                  className="rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground"
                >
                  Sair
                </button>
              </form>
            </div>
          ) : (
            <Link
              href="/auth/login"
              className="rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/80"
            >
              Entrar
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
