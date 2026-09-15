import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

const adminLinks = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/produtos", label: "Produtos", icon: "📦" },
  { href: "/admin/categorias", label: "Categorias", icon: "🏷️" },
  { href: "/admin/pedidos", label: "Pedidos", icon: "🛒" },
  { href: "/admin/financeiro", label: "Financeiro", icon: "💰" },
  { href: "/admin/estatisticas", label: "Estatísticas", icon: "📈" },
  { href: "/admin/entregas", label: "Entregas", icon: "🚚" },
];

async function getAdminUser() {
  if (!isSupabaseConfigured) return null;

  const supabase = await createClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const isAdmin =
    user.app_metadata?.role === "admin" || user.user_metadata?.role === "admin";

  return isAdmin ? user : null;
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAdminUser();

  if (!user) {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="fixed left-0 top-0 z-40 flex h-full w-64 flex-col border-r border-border bg-card">
        <div className="flex h-14 items-center border-b border-border px-4">
          <Link href="/admin" className="text-lg font-bold">
            Roldan Admin
          </Link>
        </div>
        <nav className="flex-1 overflow-y-auto p-3">
          {adminLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            >
              <span>{link.icon}</span>
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-border p-3">
          <div className="text-xs text-muted-foreground">{user.email}</div>
          <Link
            href="/"
            className="mt-2 block text-xs text-muted-foreground hover:text-foreground"
          >
            ← Voltar à loja
          </Link>
        </div>
      </aside>
      <main className="ml-64 flex-1 p-6">{children}</main>
    </div>
  );
}
