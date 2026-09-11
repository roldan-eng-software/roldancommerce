"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface Props {
  userId: string;
}

export default function ProfileForm({ userId }: Props) {
  const [cep, setCep] = useState("");
  const [logradouro, setLogradouro] = useState("");
  const [numero, setNumero] = useState("");
  const [complemento, setComplemento] = useState("");
  const [cidade, setCidade] = useState("");
  const [uf, setUf] = useState("");
  const [cpf, setCpf] = useState("");
  const [lgpd, setLgpd] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const supabase = createClient();

  async function fetchCep(value: string) {
    const clean = value.replace(/\D/g, "");
    setCep(value);
    if (clean.length === 8) {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setLogradouro(data.logradouro ?? "");
          setCidade(data.localidade ?? "");
          setUf(data.uf ?? "");
        }
      } catch {
        // ViaCEP offline — manual
      }
    }
  }

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!lgpd) {
      setError("Você precisa aceitar a política de privacidade (LGPD).");
      return;
    }
    if (!validateCpf(cpf)) {
      setError("CPF inválido.");
      return;
    }
    setLoading(true);
    setError("");

    const { error: dbError } = await supabase.from("profiles").upsert({
      id: userId,
      cep: cep.replace(/\D/g, ""),
      logradouro,
      numero,
      complemento,
      cidade,
      uf,
      cpf: cpf.replace(/\D/g, ""),
      lgpd_consent: true,
    });

    if (dbError) {
      setError(dbError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  }

  if (success) {
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <fieldset className="flex flex-col gap-3 rounded-xl border p-4">
        <legend className="text-sm font-semibold">Endereço de entrega</legend>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="cep" className="text-sm font-medium">
            CEP
          </label>
          <input
            id="cep"
            type="text"
            required
            maxLength={9}
            value={cep}
            onChange={(e) => fetchCep(e.target.value)}
            className="rounded-lg border px-3 py-2 text-sm"
            placeholder="00000-000"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="logradouro" className="text-sm font-medium">
            Logradouro
          </label>
          <input
            id="logradouro"
            type="text"
            required
            value={logradouro}
            onChange={(e) => setLogradouro(e.target.value)}
            className="rounded-lg border px-3 py-2 text-sm"
          />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="numero" className="text-sm font-medium">
              Número
            </label>
            <input
              id="numero"
              type="text"
              required
              value={numero}
              onChange={(e) => setNumero(e.target.value)}
              className="rounded-lg border px-3 py-2 text-sm"
            />
          </div>
          <div className="col-span-2 flex flex-col gap-1.5">
            <label htmlFor="complemento" className="text-sm font-medium">
              Complemento
            </label>
            <input
              id="complemento"
              type="text"
              value={complemento}
              onChange={(e) => setComplemento(e.target.value)}
              className="rounded-lg border px-3 py-2 text-sm"
            />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2 flex flex-col gap-1.5">
            <label htmlFor="cidade" className="text-sm font-medium">
              Cidade
            </label>
            <input
              id="cidade"
              type="text"
              required
              value={cidade}
              onChange={(e) => setCidade(e.target.value)}
              className="rounded-lg border px-3 py-2 text-sm"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="uf" className="text-sm font-medium">
              UF
            </label>
            <input
              id="uf"
              type="text"
              required
              maxLength={2}
              value={uf}
              onChange={(e) => setUf(e.target.value.toUpperCase())}
              className="rounded-lg border px-3 py-2 text-sm"
            />
          </div>
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-3 rounded-xl border p-4">
        <legend className="text-sm font-semibold">Documento</legend>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="cpf" className="text-sm font-medium">
            CPF
          </label>
          <input
            id="cpf"
            type="text"
            required
            maxLength={14}
            value={cpf}
            onChange={(e) => setCpf(e.target.value)}
            className="rounded-lg border px-3 py-2 text-sm"
            placeholder="000.000.000-00"
          />
        </div>
      </fieldset>

      <label className="flex items-start gap-3 rounded-xl border p-4">
        <input
          type="checkbox"
          checked={lgpd}
          onChange={(e) => setLgpd(e.target.checked)}
          className="mt-0.5"
        />
        <span className="text-xs text-zinc-600">
          Autorizo o uso dos meus dados pessoais (CPF, endereço) exclusivamente
          para finalização de compra e entrega, conforme a LGPD.
        </span>
      </label>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-black px-6 py-3 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-50"
      >
        {loading ? "Salvando..." : "Salvar dados"}
      </button>
    </form>
  );
}
