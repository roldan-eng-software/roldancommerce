import Hero from "./_components/hero";
import Storefront from "./_components/storefront";
import { getProductsPage } from "./_data-access/get-products";

export default async function Home() {
  const { products, totalPages, currentPage } = await getProductsPage(1);

  return (
    <div className="flex min-h-full flex-col bg-muted/50">
      <Hero />
      <main
        id="catalogo"
        className="mx-auto w-full max-w-6xl flex-1 px-4 py-10"
      >
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Catálogo</h2>
            <p className="text-sm text-muted-foreground">
              Clique num produto para ampliar no centro da tela.
            </p>
          </div>
        </div>
        <Storefront
          initialProducts={products}
          totalPages={totalPages}
          currentPage={currentPage}
        />
      </main>
      <footer className="border-t border-border px-4 py-6 text-center text-xs text-muted-foreground">
        Roldan Marcenaria · São Carlos/SP · Frete grátis local
      </footer>
    </div>
  );
}
