import Link from "next/link";
import { notFound } from "next/navigation";
import { PRODUCTS, formatPrice, prazoLabel, type Product } from "@/data/products";
import AddToCartButton from "./add-to-cart-button";
import CrossSell from "./cross-sell";

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ id: p.id }));
}

export function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  return params.then(({ id }) => {
    const p = PRODUCTS.find((x) => x.id === id);
    return { title: p ? `${p.nome} — Roldan Marcenaria` : "Produto não encontrado" };
  });
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = PRODUCTS.find((p) => p.id === id);

  if (!product) {
    notFound();
  }

  const related = (product.relacionados ?? [])
    .map((rid) => PRODUCTS.find((p) => p.id === rid))
    .filter(Boolean) as Product[];

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8">
      <nav className="mb-6 text-sm text-zinc-500">
        <Link href="/" className="hover:text-zinc-800">
          Roldan Marcenaria
        </Link>
        <span className="mx-2">/</span>
        <Link href="/" className="hover:text-zinc-800">
          Catálogo
        </Link>
        <span className="mx-2">/</span>
        <span className="text-zinc-800">{product.nome}</span>
      </nav>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="flex aspect-square items-center justify-center rounded-2xl bg-gradient-to-br from-amber-100 to-orange-200 text-7xl font-bold text-amber-900 dark:from-zinc-800 dark:to-zinc-700 dark:text-zinc-200">
          {product.nome.charAt(0)}
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-bold tracking-tight">{product.nome}</h1>
            <p className="text-sm text-emerald-700">
              {prazoLabel(product.disponibilidade)}
            </p>
          </div>

          <p className="text-3xl font-bold">{formatPrice(product.preco)}</p>

          {product.resumoRapido && (
            <p className="text-base text-zinc-600 dark:text-zinc-300">
              {product.resumoRapido}
            </p>
          )}

          <div className="flex flex-col gap-2 rounded-xl border p-4 text-sm">
            <h3 className="font-semibold">Especificações</h3>
            {product.medidas && (
              <div className="flex justify-between">
                <span className="text-zinc-500">Medidas</span>
                <span className="font-medium">{product.medidas}</span>
              </div>
            )}
            {product.corMdf && (
              <div className="flex justify-between">
                <span className="text-zinc-500">Cor MDF</span>
                <span className="font-medium">{product.corMdf}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-zinc-500">Material</span>
              <span className="font-medium">MDF revestido 100%</span>
            </div>
          </div>

          <p className="text-sm text-zinc-600 dark:text-zinc-300">
            {product.descricao}
          </p>

          <AddToCartButton product={product} />
        </div>
      </div>

      {related.length > 0 && <CrossSell items={related} />}
    </main>
  );
}
