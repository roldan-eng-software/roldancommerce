import { Suspense } from "react";
import Link from "next/link";
import LoginForm from "./_components/login-form";

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-12">
      <h1 className="text-2xl font-bold">Entrar</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Acesse sua conta para acompanhar pedidos.
      </p>
      <div className="mt-6">
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
      <p className="mt-6 text-center text-sm text-zinc-500">
        Não tem conta?{" "}
        <Link href="/auth/register" className="font-semibold text-zinc-800">
          Criar conta
        </Link>
      </p>
    </main>
  );
}
