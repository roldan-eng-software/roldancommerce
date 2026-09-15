"use client";

import { uploadProductImage } from "@/app/_actions/product-images";
import { createProduct, updateProduct } from "@/app/_actions/products-admin";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import ImageUpload from "./image-upload";

interface Category {
  id: string;
  name: string;
}

interface ProductOption {
  id: string;
  name: string;
}

interface ProductData {
  id: string;
  name: string;
  slug: string;
  price: number;
  description: string;
  short_description: string;
  dimensions: string;
  mdf_color: string;
  availability: string;
  weight: number;
  stock: number;
  stock_min: number;
  is_active: boolean;
  is_featured: boolean;
  manual_url: string;
  category_id: string;
  image_url: string;
  related_ids: string[];
}

interface Props {
  categories: Category[];
  allProducts: ProductOption[];
  product?: ProductData;
  initialImages?: Array<{
    id: string;
    url: string;
    order: number;
    is_primary: boolean;
  }>;
}

function isValidSupabaseProductImageUrl(url?: string): boolean {
  if (!url) return false;

  const trimmed = url.trim();
  if (!trimmed.startsWith("http")) return false;

  return /\/storage\/v1\/object\/public\/product-images\/.*\.[a-z0-9]+(?:\?.*)?$/i.test(
    trimmed
  );
}

export default function ProductForm({
  categories,
  allProducts,
  product,
  initialImages = [],
}: Props) {
  const router = useRouter();
  const isEditing = !!product;

  const [name, setName] = useState(product?.name || "");
  const [price, setPrice] = useState(product?.price?.toString() || "");
  const [description, setDescription] = useState(product?.description || "");
  const [shortDescription, setShortDescription] = useState(
    product?.short_description || ""
  );
  const [dimensions, setDimensions] = useState(product?.dimensions || "");
  const [mdfColor, setMdfColor] = useState(product?.mdf_color || "");
  const [availability, setAvailability] = useState(
    product?.availability || "pronta-entrega"
  );
  const [weight, setWeight] = useState(product?.weight?.toString() || "0.5");
  const [stock, setStock] = useState(product?.stock?.toString() || "0");
  const [stockMin, setStockMin] = useState(
    product?.stock_min?.toString() || "3"
  );
  const [isFeatured, setIsFeatured] = useState(product?.is_featured || false);
  const [isActive, setIsActive] = useState(product?.is_active ?? true);
  const [manualUrl, setManualUrl] = useState(product?.manual_url || "");
  const [categoryId, setCategoryId] = useState(product?.category_id || "");
  const [imageUrl, setImageUrl] = useState(product?.image_url || "");
  const [relatedIds, setRelatedIds] = useState<string[]>(
    product?.related_ids || []
  );
  const [productImages, setProductImages] = useState<
    Array<{ id: string; url: string; order: number; is_primary: boolean }>
  >(
    initialImages.length > 0
      ? initialImages.filter((image) =>
          isValidSupabaseProductImageUrl(image.url)
        )
      : product?.image_url && isValidSupabaseProductImageUrl(product.image_url)
        ? [
            {
              id: `legacy-${product.id}`,
              url: product.image_url,
              order: 0,
              is_primary: true,
            },
          ]
        : []
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    if (initialImages.length > 0) {
      setProductImages(
        initialImages.filter((image) =>
          isValidSupabaseProductImageUrl(image.url)
        )
      );
      return;
    }

    if (
      product?.image_url &&
      isValidSupabaseProductImageUrl(product.image_url)
    ) {
      setProductImages([
        {
          id: `legacy-${product.id}`,
          url: product.image_url,
          order: 0,
          is_primary: true,
        },
      ]);
      return;
    }

    setProductImages([]);
  }, [initialImages, product]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const showStock = availability !== "sob-medida";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const data = {
      name,
      price: parseFloat(price),
      description,
      short_description: shortDescription,
      dimensions,
      mdf_color: mdfColor,
      availability,
      weight: parseFloat(weight) || 0.5,
      stock: showStock ? parseInt(stock) || 0 : 0,
      stock_min: showStock ? parseInt(stockMin) || 3 : 3,
      is_featured: isFeatured,
      is_active: isActive,
      manual_url: manualUrl,
      category_id: categoryId,
      image_url: imageUrl,
      related_ids: relatedIds,
    };

    const result = isEditing
      ? await updateProduct(product.id, data)
      : await createProduct(data);

    if (result.error) {
      setLoading(false);
      setError(result.error);
      return;
    }

    if (
      !isEditing &&
      selectedFile &&
      "id" in result &&
      typeof result.id === "string"
    ) {
      const uploadResult = await uploadProductImage(result.id, selectedFile, 0);
      if (uploadResult.error) {
        setLoading(false);
        setError(
          `Produto criado, mas falha no upload da imagem: ${uploadResult.error}`
        );
        return;
      }
    }

    setLoading(false);
    router.push("/admin/produtos");
    router.refresh();
  }

  function toggleRelated(id: string) {
    setRelatedIds((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  }

  const otherProducts = allProducts.filter((p) => p.id !== product?.id);

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <fieldset className="rounded-xl border p-4">
            <legend className="text-sm font-semibold">
              Informações básicas
            </legend>
            <div className="mt-3 flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="name" className="text-sm font-medium">
                  Nome *
                </label>
                <input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  minLength={3}
                  maxLength={100}
                  className="rounded-lg border px-3 py-2 text-sm"
                  placeholder="Ex: Porta Celulares"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="price" className="text-sm font-medium">
                  Preço (R$) *
                </label>
                <input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                  className="rounded-lg border px-3 py-2 text-sm"
                  placeholder="34.90"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="category" className="text-sm font-medium">
                  Categoria *
                </label>
                <select
                  id="category"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  required
                  className="rounded-lg border px-3 py-2 text-sm"
                >
                  <option value="">Selecione...</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="availability" className="text-sm font-medium">
                  Disponibilidade *
                </label>
                <select
                  id="availability"
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value)}
                  required
                  className="rounded-lg border px-3 py-2 text-sm"
                >
                  <option value="pronta-entrega">Pronta-entrega</option>
                  <option value="fabricacao">Fabricação</option>
                  <option value="sob-medida">Sob medida</option>
                </select>
              </div>
            </div>
          </fieldset>

          <fieldset className="rounded-xl border p-4">
            <legend className="text-sm font-semibold">Descrição</legend>
            <div className="mt-3 flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="description" className="text-sm font-medium">
                  Descrição completa *
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  minLength={10}
                  maxLength={500}
                  rows={3}
                  className="rounded-lg border px-3 py-2 text-sm"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="shortDesc" className="text-sm font-medium">
                  Resumo rápido
                </label>
                <input
                  id="shortDesc"
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  maxLength={200}
                  className="rounded-lg border px-3 py-2 text-sm"
                  placeholder="Frase curta de vendas"
                />
              </div>
            </div>
          </fieldset>

          <fieldset className="rounded-xl border p-4">
            <legend className="text-sm font-semibold">Especificações</legend>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="dimensions" className="text-sm font-medium">
                  Medidas
                </label>
                <input
                  id="dimensions"
                  value={dimensions}
                  onChange={(e) => setDimensions(e.target.value)}
                  className="rounded-lg border px-3 py-2 text-sm"
                  placeholder="30 x 20 x 15 cm"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="mdfColor" className="text-sm font-medium">
                  Cor MDF
                </label>
                <input
                  id="mdfColor"
                  value={mdfColor}
                  onChange={(e) => setMdfColor(e.target.value)}
                  className="rounded-lg border px-3 py-2 text-sm"
                  placeholder="Branco / Madeirado"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="weight" className="text-sm font-medium">
                  Peso (kg)
                </label>
                <input
                  id="weight"
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="rounded-lg border px-3 py-2 text-sm"
                />
              </div>
              {showStock && (
                <>
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="stock" className="text-sm font-medium">
                      Estoque
                    </label>
                    <input
                      id="stock"
                      type="number"
                      min="0"
                      value={stock}
                      onChange={(e) => setStock(e.target.value)}
                      className="rounded-lg border px-3 py-2 text-sm"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="stockMin" className="text-sm font-medium">
                      Estoque mínimo
                    </label>
                    <input
                      id="stockMin"
                      type="number"
                      min="0"
                      value={stockMin}
                      onChange={(e) => setStockMin(e.target.value)}
                      className="rounded-lg border px-3 py-2 text-sm"
                    />
                  </div>
                </>
              )}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="manualUrl" className="text-sm font-medium">
                  URL do manual
                </label>
                <input
                  id="manualUrl"
                  value={manualUrl}
                  onChange={(e) => setManualUrl(e.target.value)}
                  className="rounded-lg border px-3 py-2 text-sm"
                  placeholder="https://..."
                />
              </div>
            </div>
          </fieldset>
        </div>

        <div className="flex flex-col gap-4">
          <fieldset className="rounded-xl border p-4">
            <legend className="text-sm font-semibold">Imagens</legend>
            <div className="mt-3">
              {isEditing ? (
                <ImageUpload
                  productId={product.id}
                  images={productImages}
                  onImagesChange={setProductImages}
                />
              ) : (
                <div className="flex flex-col gap-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setSelectedFile(file);
                      }
                    }}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-lg border-2 border-dashed px-4 py-3 text-sm text-zinc-500 hover:border-zinc-400 hover:text-zinc-700"
                  >
                    {selectedFile
                      ? selectedFile.name
                      : "Selecionar imagem do computador"}
                  </button>
                  {selectedFile && (
                    <div className="relative">
                      <img
                        src={URL.createObjectURL(selectedFile)}
                        alt="Preview"
                        className="h-32 w-32 rounded-lg object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedFile(null);
                          if (fileInputRef.current) {
                            fileInputRef.current.value = "";
                          }
                        }}
                        className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-xs text-white hover:bg-red-600"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                  <p className="text-xs text-zinc-400">
                    JPG, PNG ou WebP. Máximo 5MB. Após criar o produto, você
                    poderá adicionar mais imagens.
                  </p>
                </div>
              )}
            </div>
          </fieldset>

          <fieldset className="rounded-xl border p-4">
            <legend className="text-sm font-semibold">Opções</legend>
            <div className="mt-3 flex flex-col gap-3">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">Produto em destaque</span>
              </label>
              {isEditing && (
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm">Produto ativo</span>
                </label>
              )}
            </div>
          </fieldset>

          <fieldset className="rounded-xl border p-4">
            <legend className="text-sm font-semibold">
              Produtos relacionados
            </legend>
            <div className="mt-3 flex flex-col gap-2 max-h-48 overflow-y-auto">
              {otherProducts.length === 0 ? (
                <p className="text-xs text-zinc-500">
                  Nenhum outro produto disponível.
                </p>
              ) : (
                otherProducts.map((p) => (
                  <label key={p.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={relatedIds.includes(p.id)}
                      onChange={() => toggleRelated(p.id)}
                      className="rounded"
                    />
                    <span className="text-sm">{p.name}</span>
                  </label>
                ))
              )}
            </div>
          </fieldset>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-black px-6 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
        >
          {loading
            ? "Salvando..."
            : isEditing
              ? "Salvar alterações"
              : "Criar produto"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg border px-6 py-2.5 text-sm font-medium text-zinc-600 hover:bg-zinc-50"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
