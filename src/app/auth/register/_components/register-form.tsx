"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

const registerSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
});

type RegisterValues = z.infer<typeof registerSchema>;

export default function RegisterForm() {
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
  });

  async function handleRegister(data: RegisterValues) {
    setIsSubmitting(true);
    setError("");

    const { error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });

    if (authError) {
      setError(authError.message);
      setIsSubmitting(false);
      return;
    }

    setIsSuccess(true);
    setIsSubmitting(false);
  }

  async function handleGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  if (isSuccess) {
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
    <form
      onSubmit={handleSubmit(handleRegister)}
      className="flex flex-col gap-4"
    >
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="reg-email">E-mail</Label>
        <Input
          id="reg-email"
          type="email"
          placeholder="seu@email.com"
          aria-invalid={!!errors.email}
          {...register("email")}
        />
        {errors.email && (
          <p className="text-xs text-red-600">{errors.email.message}</p>
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="reg-password">Senha</Label>
        <Input
          id="reg-password"
          type="password"
          placeholder="Mínimo 6 caracteres"
          aria-invalid={!!errors.password}
          {...register("password")}
        />
        {errors.password && (
          <p className="text-xs text-red-600">{errors.password.message}</p>
        )}
      </div>
      <p className="text-xs text-zinc-500">
        Ao criar conta, você concorda com nossos termos e política de
        privacidade conforme LGPD.
      </p>
      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Criando conta..." : "Criar conta"}
      </Button>
      <div className="relative my-2">
        <Separator />
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-zinc-500">ou</span>
        </div>
      </div>
      <Button
        type="button"
        variant="outline"
        onClick={handleGoogle}
        className="w-full"
      >
        Cadastrar com Google
      </Button>
    </form>
  );
}
