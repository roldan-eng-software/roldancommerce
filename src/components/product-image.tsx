"use client";

import Image from "next/image";
import { getProductImageUrl } from "@/lib/supabase/storage";

interface Props {
  productId: string;
  nome: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "size-16 text-lg",
  md: "size-full aspect-square text-3xl",
  lg: "size-full aspect-square text-5xl",
};

export default function ProductImage({
  productId,
  nome,
  className = "",
  size = "md",
}: Props) {
  const imageUrl = getProductImageUrl(productId);
  const fallbackChar = nome.charAt(0);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Image
        src={imageUrl}
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
      <div
        className={`hidden items-center justify-center bg-gradient-to-br from-amber-100 to-orange-200 font-bold text-amber-900 ${sizeClasses[size]}`}
      >
        {fallbackChar}
      </div>
    </div>
  );
}
