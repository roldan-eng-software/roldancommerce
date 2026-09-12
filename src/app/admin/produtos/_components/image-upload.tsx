"use client";

import { useState, useRef } from "react";
import {
  uploadProductImage,
  deleteProductImage,
  setPrimaryImage,
  reorderProductImages,
} from "@/app/_actions/product-images";

interface Image {
  id: string;
  url: string;
  order: number;
  is_primary: boolean;
}

interface Props {
  productId: string;
  images: Image[];
  onImagesChange: (images: Image[]) => void;
}

export default function ImageUpload({
  productId,
  images,
  onImagesChange,
}: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_IMAGES = 6;

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setError("");

    if (images.length + files.length > MAX_IMAGES) {
      setError(`Máximo ${MAX_IMAGES} imagens por produto.`);
      return;
    }

    setUploading(true);

    for (const file of Array.from(files)) {
      const result = await uploadProductImage(productId, file, images.length);
      if (result.error) {
        setError(result.error);
        break;
      }
      if (result.url) {
        onImagesChange([
          ...images,
          {
            id: `temp-${Date.now()}`,
            url: result.url,
            order: images.length,
            is_primary: images.length === 0,
          },
        ]);
      }
    }

    setUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function handleDelete(image: Image) {
    if (!confirm("Remover esta imagem?")) return;

    const result = await deleteProductImage(image.id, productId);
    if (result.error) {
      setError(result.error);
    } else {
      onImagesChange(images.filter((img) => img.id !== image.id));
    }
  }

  async function handleSetPrimary(image: Image) {
    const result = await setPrimaryImage(image.id, productId);
    if (result.error) {
      setError(result.error);
    } else {
      onImagesChange(
        images.map((img) => ({
          ...img,
          is_primary: img.id === image.id,
        }))
      );
    }
  }

  async function handleMoveUp(index: number) {
    if (index === 0) return;
    const newImages = [...images];
    [newImages[index - 1], newImages[index]] = [
      newImages[index],
      newImages[index - 1],
    ];

    const ids = newImages.map((img) => img.id);
    const result = await reorderProductImages(productId, ids);
    if (result.error) {
      setError(result.error);
    } else {
      onImagesChange(
        newImages.map((img, i) => ({
          ...img,
          order: i,
          is_primary: i === 0,
        }))
      );
    }
  }

  async function handleMoveDown(index: number) {
    if (index === images.length - 1) return;
    const newImages = [...images];
    [newImages[index], newImages[index + 1]] = [
      newImages[index + 1],
      newImages[index],
    ];

    const ids = newImages.map((img) => img.id);
    const result = await reorderProductImages(productId, ids);
    if (result.error) {
      setError(result.error);
    } else {
      onImagesChange(
        newImages.map((img, i) => ({
          ...img,
          order: i,
          is_primary: i === 0,
        }))
      );
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {error && (
        <div className="rounded-lg bg-red-50 p-2 text-xs text-red-700">
          {error}
        </div>
      )}

      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {images.map((image, index) => (
            <div
              key={image.id}
              className="group relative rounded-lg border bg-zinc-50"
            >
              <img
                src={image.url}
                alt={`Imagem ${index + 1}`}
                className="h-24 w-full rounded-t-lg object-cover"
              />
              <div className="flex items-center justify-between p-2">
                <span className="text-xs text-zinc-500">
                  {image.is_primary ? (
                    <span className="font-medium text-amber-600">Capa</span>
                  ) : (
                    `#${index + 1}`
                  )}
                </span>
                <div className="flex gap-1">
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => handleMoveUp(index)}
                      className="rounded p-1 text-xs text-zinc-400 hover:bg-zinc-200"
                      title="Mover para cima"
                    >
                      ↑
                    </button>
                  )}
                  {index < images.length - 1 && (
                    <button
                      type="button"
                      onClick={() => handleMoveDown(index)}
                      className="rounded p-1 text-xs text-zinc-400 hover:bg-zinc-200"
                      title="Mover para baixo"
                    >
                      ↓
                    </button>
                  )}
                  {!image.is_primary && (
                    <button
                      type="button"
                      onClick={() => handleSetPrimary(image)}
                      className="rounded p-1 text-xs text-zinc-400 hover:bg-zinc-200"
                      title="Definir como capa"
                    >
                      ⭐
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDelete(image)}
                    className="rounded p-1 text-xs text-red-400 hover:bg-red-50"
                    title="Remover"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {images.length < MAX_IMAGES && (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={handleUpload}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="rounded-lg border-2 border-dashed px-4 py-3 text-sm text-zinc-500 hover:border-zinc-400 hover:text-zinc-700 disabled:opacity-50"
          >
            {uploading
              ? "Enviando..."
              : `Adicionar imagem (${images.length}/${MAX_IMAGES})`}
          </button>
          <p className="mt-1 text-xs text-zinc-400">
            JPG, PNG ou WebP. Máximo 5MB por arquivo.
          </p>
        </div>
      )}
    </div>
  );
}
