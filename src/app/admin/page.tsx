import { createClient } from "@/lib/supabase/server";

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

      <div className="mt-8 rounded-xl border bg-white p-6">
        <h2 className="text-lg font-semibold">Próximos passos</h2>
        <ul className="mt-3 space-y-2 text-sm text-zinc-600">
          <li>• Criar pedidos de teste e verificar persistência</li>
          <li>• Implementar dashboard financeiro completo</li>
          <li>• Adicionar gráficos de vendas</li>
        </ul>
      </div>
    </div>
  );
}
