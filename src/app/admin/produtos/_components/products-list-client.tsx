"use client";

import { useState } from "react";
import Link from "next/link";
import { deleteProduct } from "@/app/_actions/products-admin";
import { formatPrice } from "@/data/products";

interface ProductListItem {
  id: string;
  name: string;
  slug: string;
  price: number;
  availability: string;
  stock: number;
  stock_min: number;
  is_active: boolean;
  is_featured: boolean;
  image_url: string;
  category_id: string;
  category_name: string;
}

interface Category {
  id: string;
  name: string;
}

interface Props {
  products: ProductListItem[];
  categories: Category[];
}

const availabilityLabels: Record<string, string> = {
  "pronta-entrega": "Pronta-entrega",
  fabricacao: "Fabricação",
  "sob-medida": "Sob medida",
};

export default function ProductsListClient({ products, categories }: Props) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState("");
  const [activeFilter, setActiveFilter] = useState("");

  const filtered = products.filter((p) => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    if (categoryFilter && p.category_id !== categoryFilter) {
      return false;
    }
    if (availabilityFilter && p.availability !== availabilityFilter) {
      return false;
    }
    if (activeFilter === "true" && !p.is_active) return false;
    if (activeFilter === "false" && p.is_active) return false;
    return true;
  });

  async function handleDelete(product: ProductListItem) {
    const msg = product.is_active
      ? `Inativar o produto "${product.name}"? Ele não aparecerá mais no storefront.`
      : `Excluir permanentemente o produto "${product.name}"?`;

    if (!confirm(msg)) return;

    const result = await deleteProduct(product.id);
    if (result.error) {
      alert(result.error);
    } else if (result.message) {
      alert(result.message);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Produtos</h1>
          <p className="mt-1 text-sm text-zinc-500">
            {products.length} produto(s) cadastrado(s)
          </p>
        </div>
        <Link
          href="/admin/produtos/novo"
          className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          + Novo produto
        </Link>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Buscar por nome..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-lg border px-3 py-2 text-sm"
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-lg border px-3 py-2 text-sm"
        >
          <option value="">Todas categorias</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          value={availabilityFilter}
          onChange={(e) => setAvailabilityFilter(e.target.value)}
          className="rounded-lg border px-3 py-2 text-sm"
        >
          <option value="">Todas disponibilidades</option>
          <option value="pronta-entrega">Pronta-entrega</option>
          <option value="fabricacao">Fabricação</option>
          <option value="sob-medida">Sob medida</option>
        </select>
        <select
          value={activeFilter}
          onChange={(e) => setActiveFilter(e.target.value)}
          className="rounded-lg border px-3 py-2 text-sm"
        >
          <option value="">Todos status</option>
          <option value="true">Ativos</option>
          <option value="false">Inativos</option>
        </select>
      </div>

      <div className="mt-4 rounded-xl border bg-card">
        {filtered.length === 0 ? (
          <div className="p-6 text-center text-sm text-zinc-500">
            Nenhum produto encontrado.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs font-medium text-zinc-500">
                  <th className="px-4 py-3">Produto</th>
                  <th className="px-4 py-3">Preço</th>
                  <th className="px-4 py-3">Categoria</th>
                  <th className="px-4 py-3">Disponibilidade</th>
                  <th className="px-4 py-3">Estoque</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((product) => (
                  <tr
                    key={product.id}
                    className={!product.is_active ? "opacity-50" : ""}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100 text-xs font-bold text-zinc-500">
                          {product.image_url ? (
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="h-10 w-10 rounded-lg object-cover"
                            />
                          ) : (
                            product.name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          {product.is_featured && (
                            <span className="text-xs text-amber-600">
                              Destaque
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {formatPrice(product.price)}
                    </td>
                    <td className="px-4 py-3 text-zinc-600">
                      {product.category_name}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium">
                        {availabilityLabels[product.availability] ||
                          product.availability}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {product.availability === "sob-medida" ? (
                        <span className="text-xs text-zinc-400">N/A</span>
                      ) : (
                        <span
                          className={
                            product.stock <= product.stock_min
                              ? "font-medium text-red-600"
                              : ""
                          }
                        >
                          {product.stock}
                          {product.stock <= product.stock_min &&
                            product.stock > 0 && (
                              <span className="ml-1 text-xs">⚠️</span>
                            )}
                          {product.stock === 0 && (
                            <span className="ml-1 text-xs text-red-500">
                              Esgotado
                            </span>
                          )}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          product.is_active
                            ? "bg-green-100 text-green-700"
                            : "bg-zinc-100 text-zinc-500"
                        }`}
                      >
                        {product.is_active ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/produtos/${product.id}`}
                          className="rounded-lg border px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-50"
                        >
                          Editar
                        </Link>
                        <button
                          onClick={() => handleDelete(product)}
                          className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                        >
                          {product.is_active ? "Inativar" : "Excluir"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
