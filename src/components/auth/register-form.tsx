"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function RegisterForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  }

  async function handleGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  if (success) {
    return (
      <div className="rounded-2xl border bg-emerald-50 p-6 text-center">
        <p className="text-lg font-bold text-emerald-800">Conta criada!</p>
        <p className="mt-2 text-sm text-emerald-700">
          Verifique seu e-mail para confirmar o cadastro.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="reg-email" className="text-sm font-medium">
          E-mail
        </label>
        <input
          id="reg-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-lg border px-3 py-2 text-sm"
          placeholder="seu@email.com"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="reg-password" className="text-sm font-medium">
          Senha
        </label>
        <input
          id="reg-password"
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-lg border px-3 py-2 text-sm"
          placeholder="Mínimo 6 caracteres"
        />
      </div>
      <p className="text-xs text-zinc-500">
        Ao criar conta, você concorda com nossos termos e política de
        privacidade conforme LGPD.
      </p>
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-black px-6 py-3 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-50"
      >
        {loading ? "Criando conta..." : "Criar conta"}
      </button>
      <div className="relative my-2">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-zinc-500">ou</span>
        </div>
      </div>
      <button
        type="button"
        onClick={handleGoogle}
        className="w-full rounded-full border border-black/15 px-6 py-3 text-sm font-semibold hover:bg-zinc-50"
      >
        Cadastrar com Google
      </button>
    </form>
  );
}
