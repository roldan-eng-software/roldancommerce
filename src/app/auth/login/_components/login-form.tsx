"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { signInWithGoogle } from "@/lib/auth/google";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
});

type LoginValues = z.infer<typeof loginSchema>;

const ERROR_MESSAGES: Record<string, string> = {
  auth_failed: "Falha na autenticação. Tente novamente.",
  oauth_denied: "Acesso ao Google foi negado. Tente novamente.",
};

export default function LoginForm() {
  const searchParams = useSearchParams();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam) {
      setError(
        ERROR_MESSAGES[errorParam] ?? "Erro ao autenticar. Tente novamente."
      );
    }
  }, [searchParams]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
  });

  async function handleLogin(data: LoginValues) {
    setIsSubmitting(true);
    setError("");

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (authError) {
      setError(authError.message);
      setIsSubmitting(false);
      return;
    }

    window.location.href = "/";
  }

  async function handleGoogle() {
    setIsGoogleLoading(true);
    setError("");
    const result = await signInWithGoogle();
    if (result.error) {
      setError(result.error);
      setIsGoogleLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(handleLogin)} className="flex flex-col gap-4">
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
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
        <Label htmlFor="password">Senha</Label>
        <Input
          id="password"
          type="password"
          placeholder="Mínimo 6 caracteres"
          aria-invalid={!!errors.password}
          {...register("password")}
        />
        {errors.password && (
          <p className="text-xs text-red-600">{errors.password.message}</p>
        )}
      </div>
      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Entrando..." : "Entrar"}
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
        disabled={isGoogleLoading}
        className="w-full"
      >
        {isGoogleLoading ? "Redirecionando..." : "Entrar com Google"}
      </Button>
    </form>
  );
}
