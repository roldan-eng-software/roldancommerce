import Hero from "@/components/hero";
import SiteHeader from "@/components/site-header";
import Storefront from "@/components/storefront";

export default function Home() {
  return (
    <div className="flex min-h-full flex-col bg-zinc-50 dark:bg-black">
      <SiteHeader />
      <Hero />
      <main id="catalogo" className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Catálogo</h2>
            <p className="text-sm text-zinc-600">
              Clique num produto para ampliar no centro da tela.
            </p>
          </div>
        </div>
        <Storefront />
      </main>
      <footer className="border-t px-4 py-6 text-center text-xs text-zinc-500">
        Roldan Marcenaria · São Carlos/SP · Frete grátis local
      </footer>
    </div>
  );
}
