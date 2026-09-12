import { createClient } from "@/lib/supabase/server";
import { getLowStockProducts } from "@/app/_actions/stock";
import Link from "next/link";

export default async function AdminDashboard() {
  const supabase = await createClient();

  const [
    { count: totalProducts },
    { count: totalOrders },
    { count: totalCategories },
  ] = await Promise.all([
    supabase!
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true),
    supabase!.from("orders").select("*", { count: "exact", head: true }),
    supabase!.from("categories").select("*", { count: "exact", head: true }),
  ]);

  const lowStockProducts = await getLowStockProducts();

  return (
    <div>
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Visão geral do seu e-commerce.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-white p-4">
          <p className="text-sm text-zinc-500">Produtos</p>
          <p className="mt-1 text-3xl font-bold">{totalProducts ?? 0}</p>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <p className="text-sm text-zinc-500">Pedidos</p>
          <p className="mt-1 text-3xl font-bold">{totalOrders ?? 0}</p>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <p className="text-sm text-zinc-500">Categorias</p>
          <p className="mt-1 text-3xl font-bold">{totalCategories ?? 0}</p>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <p className="text-sm text-zinc-500">Faturamento</p>
          <p className="mt-1 text-3xl font-bold">R$ 0,00</p>
        </div>
      </div>

      {lowStockProducts.length > 0 && (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-amber-800">
            ⚠️ Estoque baixo
          </h2>
          <p className="mt-1 text-sm text-amber-700">
            {lowStockProducts.length} produto(s) com estoque abaixo do mínimo:
          </p>
          <ul className="mt-3 divide-y divide-amber-200">
            {lowStockProducts.map((p) => (
              <li key={p.id} className="flex items-center justify-between py-2">
                <span className="text-sm font-medium text-amber-900">
                  {p.name}
                </span>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-sm font-bold ${
                      p.stock === 0 ? "text-red-600" : "text-amber-600"
                    }`}
                  >
                    {p.stock === 0
                      ? "Esgotado"
                      : `${p.stock} un. (mín: ${p.stock_min})`}
                  </span>
                  <Link
                    href={`/admin/produtos/${p.id}`}
                    className="rounded-lg border border-amber-300 px-2 py-1 text-xs font-medium text-amber-700 hover:bg-amber-100"
                  >
                    Repor
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-8 rounded-xl border bg-white p-6">
        <h2 className="text-lg font-semibold">Acesso rápido</h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/admin/produtos/novo"
            className="rounded-lg border p-3 text-sm font-medium hover:bg-zinc-50"
          >
            + Novo produto
          </Link>
          <Link
            href="/admin/produtos"
            className="rounded-lg border p-3 text-sm font-medium hover:bg-zinc-50"
          >
            Gerenciar produtos
          </Link>
          <Link
            href="/admin/pedidos"
            className="rounded-lg border p-3 text-sm font-medium hover:bg-zinc-50"
          >
            Ver pedidos
          </Link>
          <Link
            href="/admin/categorias"
            className="rounded-lg border p-3 text-sm font-medium hover:bg-zinc-50"
          >
            Gerenciar categorias
          </Link>
        </div>
      </div>
    </div>
  );
}
