"use client";

import { useState } from "react";
import {
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/app/_actions/categories";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  order: number;
  product_count: number;
}

interface Props {
  categories: Category[];
}

export default function CategoriesClient({ categories }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleNew() {
    setEditing(null);
    setName("");
    setDescription("");
    setError("");
    setShowForm(true);
  }

  function handleEdit(cat: Category) {
    setEditing(cat);
    setName(cat.name);
    setDescription(cat.description);
    setError("");
    setShowForm(true);
  }

  function handleCancel() {
    setShowForm(false);
    setEditing(null);
    setName("");
    setDescription("");
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = editing
      ? await updateCategory(editing.id, { name, description })
      : await createCategory({ name, description });

    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      handleCancel();
    }
  }

  async function handleDelete(cat: Category) {
    if (
      !confirm(
        `Excluir a categoria "${cat.name}"?${cat.product_count > 0 ? ` (${cat.product_count} produtos vinculados)` : ""}`
      )
    ) {
      return;
    }

    const result = await deleteCategory(cat.id);
    if (result.error) {
      alert(result.error);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Categorias</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Organize o catálogo de produtos.
          </p>
        </div>
        <button
          onClick={handleNew}
          className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          + Nova categoria
        </button>
      </div>

      {showForm && (
        <div className="mt-6 rounded-xl border bg-card p-6">
          <h2 className="text-lg font-semibold">
            {editing ? "Editar categoria" : "Nova categoria"}
          </h2>
          <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="cat-name" className="text-sm font-medium">
                Nome *
              </label>
              <input
                id="cat-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                minLength={2}
                className="rounded-lg border px-3 py-2 text-sm"
                placeholder="Ex: Suportes"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="cat-desc" className="text-sm font-medium">
                Descrição (opcional)
              </label>
              <textarea
                id="cat-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={200}
                rows={2}
                className="rounded-lg border px-3 py-2 text-sm"
                placeholder="Descrição curta da categoria"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
              >
                {loading
                  ? "Salvando..."
                  : editing
                    ? "Salvar alterações"
                    : "Criar categoria"}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="rounded-lg border px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="mt-6 rounded-xl border bg-card">
        {categories.length === 0 ? (
          <div className="p-6 text-center text-sm text-zinc-500">
            Nenhuma categoria encontrada.
          </div>
        ) : (
          <div className="divide-y">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center justify-between px-4 py-3"
              >
                <div className="flex items-center gap-4">
                  <span className="text-xs text-zinc-400 w-6 text-center">
                    {cat.order}
                  </span>
                  <div>
                    <p className="text-sm font-medium">{cat.name}</p>
                    <p className="text-xs text-zinc-500">
                      {cat.product_count} produto
                      {cat.product_count !== 1 ? "s" : ""}
                      {cat.description && ` · ${cat.description}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(cat)}
                    className="rounded-lg border px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-50"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(cat)}
                    className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
