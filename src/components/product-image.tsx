"use client";

import { getProductImageUrl } from "@/lib/supabase/storage";
import Image from "next/image";

interface Props {
  productId: string;
  nome: string;
  imageUrl?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "size-16 text-lg",
  md: "size-full aspect-square text-3xl",
  lg: "size-full aspect-square text-5xl",
};

function isValidProductImageUrl(url?: string): boolean {
  if (!url) return false;

  const trimmed = url.trim();
  if (!trimmed || !trimmed.startsWith("http")) return false;

  return /\/storage\/v1\/object\/public\/product-images\/.*\.[a-z0-9]+(?:\?.*)?$/i.test(
    trimmed
  );
}

export default function ProductImage({
  productId,
  nome,
  imageUrl: externalImageUrl,
  className = "",
  size = "md",
}: Props) {
  const safeImageUrl = isValidProductImageUrl(externalImageUrl)
    ? externalImageUrl
    : isValidProductImageUrl(getProductImageUrl(productId))
      ? getProductImageUrl(productId)
      : undefined;
  const fallbackChar = nome.charAt(0);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {safeImageUrl ? (
        <Image
          src={safeImageUrl}
          alt={nome}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = "none";
            const fallback = target.nextElementSibling as HTMLElement;
            if (fallback) fallback.style.display = "flex";
          }}
        />
      ) : null}
      <div
        className={`${safeImageUrl ? "hidden" : "flex"} items-center justify-center bg-gradient-to-br from-amber-100 to-orange-200 font-bold text-amber-900 ${sizeClasses[size]}`}
      >
        {fallbackChar}
      </div>
    </div>
  );
}
