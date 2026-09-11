import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Hero() {
  return (
    <section className="bg-gradient-to-br from-amber-50 to-orange-100 dark:from-zinc-900 dark:to-zinc-800">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-14 sm:py-20">
        <p className="w-fit rounded-full bg-black px-3 py-1 text-xs font-semibold text-white">
          São Carlos/SP · MDF revestido
        </p>
        <h1 className="max-w-2xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
          Móveis pequenos em MDF, prontos para sua casa
        </h1>
        <p className="max-w-xl text-lg text-zinc-600 dark:text-zinc-300">
          Nichos, prateleiras, suportes e organizadores. Frete grátis em São
          Carlos e envio para todo o Brasil.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button render={<a href="#catalogo" />}>Ver catálogo</Button>
          <Button variant="outline" disabled>
            Pronta-entrega · envio dia seguinte
          </Button>
        </div>
      </div>
    </section>
  );
}
