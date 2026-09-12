import Link from "next/link";
import { notFound } from "next/navigation";
import { formatPrice, prazoLabel } from "@/data/products";
import { getProductById, getRelatedProducts } from "./_data-access/get-product";
import AddToCartButton from "./_components/add-to-cart-button";
import CrossSell from "./_components/cross-sell";
import ProductImage from "@/components/product-image";
import { getAllProducts } from "@/app/_data-access/get-products";
import { createBuildClient } from "@/lib/supabase/build";

export async function generateStaticParams() {
  const products = await getAllProducts();
  return products.map((p) => ({ id: p.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const p = await getProductById(id);
  return {
    title: p ? `${p.nome} — Roldan Marcenaria` : "Produto não encontrado",
  };
}

async function getProductStock(id: string): Promise<number | undefined> {
  const supabase = createBuildClient();
  if (!supabase) return undefined;

  const { data } = await supabase
    .from("products")
    .select("stock, availability")
    .eq("id", id)
    .single();

  if (!data) return undefined;
  if (data.availability === "sob-medida") return undefined;
  return data.stock;
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, stock] = await Promise.all([
    getProductById(id),
    getProductStock(id),
  ]);

  if (!product) {
    notFound();
  }

  const related = await getRelatedProducts(product);

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
        <ProductImage
          productId={product.id}
          nome={product.nome}
          size="lg"
          className="rounded-2xl"
        />

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-bold tracking-tight">
              {product.nome}
            </h1>
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

          <AddToCartButton product={product} stock={stock} />
        </div>
      </div>

      {related.length > 0 && <CrossSell items={related} />}
    </main>
  );
}
