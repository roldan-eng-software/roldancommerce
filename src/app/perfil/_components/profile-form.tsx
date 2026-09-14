"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

function validateCpf(value: string): boolean {
  const clean = value.replace(/\D/g, "");
  if (clean.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(clean)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(clean[i]) * (10 - i);
  let d1 = 11 - (sum % 11);
  if (d1 >= 10) d1 = 0;
  if (d1 !== parseInt(clean[9])) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(clean[i]) * (11 - i);
  let d2 = 11 - (sum % 11);
  if (d2 >= 10) d2 = 0;
  return d2 === parseInt(clean[10]);
}

const profileSchema = z.object({
  cep: z.string().min(8, "CEP inválido"),
  logradouro: z.string().min(1, "Logradouro obrigatório"),
  numero: z.string().min(1, "Número obrigatório"),
  complemento: z.string().optional(),
  cidade: z.string().min(1, "Cidade obrigatória"),
  uf: z.string().length(2, "UF deve ter 2 letras"),
  cpf: z.string().refine((val) => validateCpf(val), "CPF inválido"),
  lgpd: z.literal(true, {
    errorMap: () => ({
      message: "Você precisa aceitar a política de privacidade (LGPD)",
    }),
  }),
});

type ProfileValues = z.infer<typeof profileSchema>;

interface Props {
  userId: string;
  redirectTo?: string;
}

export default function ProfileForm({ userId, redirectTo = "/" }: Props) {
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      cep: "",
      logradouro: "",
      numero: "",
      complemento: "",
      cidade: "",
      uf: "",
      cpf: "",
      lgpd: undefined as unknown as true,
    },
  });

  const lgpdValue = watch("lgpd");

  async function fetchCep(value: string) {
    const clean = value.replace(/\D/g, "");
    setValue("cep", value);
    if (clean.length === 8) {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setValue("logradouro", data.logradouro ?? "");
          setValue("cidade", data.localidade ?? "");
          setValue("uf", data.uf ?? "");
        }
      } catch {
        // ViaCEP offline — manual
      }
    }
  }

  async function handleSave(data: ProfileValues) {
    setIsSubmitting(true);
    setError("");

    const { error: dbError } = await supabase.from("profiles").upsert({
      id: userId,
      cep: data.cep.replace(/\D/g, ""),
      logradouro: data.logradouro,
      numero: data.numero,
      complemento: data.complemento ?? "",
      cidade: data.cidade,
      uf: data.uf,
      cpf: data.cpf.replace(/\D/g, ""),
      lgpd_consent: true,
    });

    if (dbError) {
      setError(dbError.message);
      setIsSubmitting(false);
      return;
    }

    setIsSuccess(true);
    setIsSubmitting(false);
    window.location.href = redirectTo;
  }

  if (isSuccess) {
    return (
      <div className="rounded-2xl border bg-emerald-50 p-6 text-center">
        <p className="text-lg font-bold text-emerald-800">Dados salvos!</p>
        <p className="mt-2 text-sm text-emerald-700">
          Seu cadastro está completo. Agora você pode finalizar compras.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(handleSave)} className="flex flex-col gap-4">
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <fieldset className="flex flex-col gap-3 rounded-xl border p-4">
        <legend className="text-sm font-semibold">Endereço de entrega</legend>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="cep">CEP</Label>
          <Input
            id="cep"
            maxLength={9}
            placeholder="00000-000"
            aria-invalid={!!errors.cep}
            {...register("cep", { onChange: (e) => fetchCep(e.target.value) })}
          />
          {errors.cep && (
            <p className="text-xs text-red-600">{errors.cep.message}</p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="logradouro">Logradouro</Label>
          <Input
            id="logradouro"
            aria-invalid={!!errors.logradouro}
            {...register("logradouro")}
          />
          {errors.logradouro && (
            <p className="text-xs text-red-600">{errors.logradouro.message}</p>
          )}
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="numero">Número</Label>
            <Input
              id="numero"
              aria-invalid={!!errors.numero}
              {...register("numero")}
            />
            {errors.numero && (
              <p className="text-xs text-red-600">{errors.numero.message}</p>
            )}
          </div>
          <div className="col-span-2 flex flex-col gap-1.5">
            <Label htmlFor="complemento">Complemento</Label>
            <Input id="complemento" {...register("complemento")} />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2 flex flex-col gap-1.5">
            <Label htmlFor="cidade">Cidade</Label>
            <Input
              id="cidade"
              aria-invalid={!!errors.cidade}
              {...register("cidade")}
            />
            {errors.cidade && (
              <p className="text-xs text-red-600">{errors.cidade.message}</p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="uf">UF</Label>
            <Input
              id="uf"
              maxLength={2}
              aria-invalid={!!errors.uf}
              {...register("uf")}
            />
            {errors.uf && (
              <p className="text-xs text-red-600">{errors.uf.message}</p>
            )}
          </div>
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-3 rounded-xl border p-4">
        <legend className="text-sm font-semibold">Documento</legend>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="cpf">CPF</Label>
          <Input
            id="cpf"
            maxLength={14}
            placeholder="000.000.000-00"
            aria-invalid={!!errors.cpf}
            {...register("cpf")}
          />
          {errors.cpf && (
            <p className="text-xs text-red-600">{errors.cpf.message}</p>
          )}
        </div>
      </fieldset>

      <label className="flex items-start gap-3 rounded-xl border p-4">
        <Checkbox
          checked={lgpdValue === true}
          onCheckedChange={(checked) =>
            setValue(
              "lgpd",
              checked === true ? true : (undefined as unknown as true)
            )
          }
        />
        <span className="text-xs text-zinc-600">
          Autorizo o uso dos meus dados pessoais (CPF, endereço) exclusivamente
          para finalização de compra e entrega, conforme a LGPD.
        </span>
      </label>
      {errors.lgpd && (
        <p className="text-xs text-red-600">{errors.lgpd.message}</p>
      )}

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Salvando..." : "Salvar dados"}
      </Button>
    </form>
  );
}
