import Link from "next/link";
import RegisterForm from "./_components/register-form";

export default function RegisterPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-12">
      <h1 className="text-2xl font-bold">Criar conta</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Cadastre-se para comprar e acompanhar pedidos.
      </p>
      <div className="mt-6">
        <RegisterForm />
      </div>
      <p className="mt-6 text-center text-sm text-zinc-500">
        Já tem conta?{" "}
        <Link href="/auth/login" className="font-semibold text-zinc-800">
          Entrar
        </Link>
      </p>
    </main>
  );
}
