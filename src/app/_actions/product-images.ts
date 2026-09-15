"use server";

import { requireAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

const BUCKET = "product-images";

interface ProductImage {
  id: string;
  url: string;
  order: number;
  is_primary: boolean;
}

export async function getProductImages(
  productId: string
): Promise<ProductImage[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  const { data } = await supabase
    .from("product_images")
    .select("*")
    .eq("product_id", productId)
    .order("order");

  const images = (data ?? []) as unknown as ProductImage[];
  if (images.length > 0) return images;

  const { data: product } = await supabase
    .from("products")
    .select("image_url")
    .eq("id", productId)
    .single();

  if (!product?.image_url) return [];

  return [
    {
      id: `legacy-${productId}`,
      url: product.image_url,
      order: 0,
      is_primary: true,
    },
  ];
}

async function syncPrimaryProductImage(
  supabase: Awaited<ReturnType<typeof createClient>>,
  productId: string,
  fallbackUrl?: string
) {
  if (!supabase) return;

  const { data: primaryImage } = await supabase
    .from("product_images")
    .select("url")
    .eq("product_id", productId)
    .order("order")
    .limit(1)
    .maybeSingle();

  const nextImageUrl = primaryImage?.url ?? fallbackUrl ?? "";

  await supabase
    .from("products")
    .update({ image_url: nextImageUrl })
    .eq("id", productId);
}

export async function uploadProductImage(
  productId: string,
  file: File,
  order: number = 0
): Promise<{ error?: string; url?: string }> {
  let supabase;
  try {
    supabase = await requireAdmin();
  } catch (e) {
    return { error: (e as Error).message };
  }

  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    return { error: "Formato não aceito. Use JPG, PNG ou WebP." };
  }

  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    return { error: "Arquivo muito grande. Máximo 5MB." };
  }

  const ext = file.name.split(".").pop() || "jpg";
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const filePath = `products/${productId}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    return { error: `Falha no upload: ${uploadError.message}` };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET).getPublicUrl(filePath);

  const { count } = await supabase
    .from("product_images")
    .select("*", { count: "exact", head: true })
    .eq("product_id", productId);

  const { error: dbError } = await supabase.from("product_images").insert({
    product_id: productId,
    url: publicUrl,
    order: order || count || 0,
    is_primary: (count || 0) === 0,
  });

  if (dbError) {
    return { error: `Falha ao registrar imagem: ${dbError.message}` };
  }

  if (
    (count || 0) === 0 ||
    !(
      await supabase
        .from("products")
        .select("image_url")
        .eq("id", productId)
        .single()
    ).data?.image_url
  ) {
    await supabase
      .from("products")
      .update({ image_url: publicUrl })
      .eq("id", productId);
  }

  revalidatePath(`/admin/produtos/${productId}`);
  revalidatePath(`/produto/${productId}`);
  revalidatePath("/");
  return { url: publicUrl };
}

export async function deleteProductImage(
  imageId: string,
  productId: string
): Promise<{ error?: string }> {
  let supabase;
  try {
    supabase = await requireAdmin();
  } catch (e) {
    return { error: (e as Error).message };
  }

  const { data: image } = await supabase
    .from("product_images")
    .select("url")
    .eq("id", imageId)
    .single();

  if (image) {
    const url = image.url as string;
    const pathMatch = url.match(/product-images\/(.+)$/);
    if (pathMatch) {
      await supabase.storage.from(BUCKET).remove([pathMatch[1]]);
    }
  }

  const { error } = await supabase
    .from("product_images")
    .delete()
    .eq("id", imageId);

  if (error) return { error: error.message };

  const { data: remaining } = await supabase
    .from("product_images")
    .select("id")
    .eq("product_id", productId)
    .order("order");

  if (remaining && remaining.length > 0) {
    const firstId = remaining[0].id;
    await supabase
      .from("product_images")
      .update({ is_primary: true })
      .eq("id", firstId);

    const { data: firstImage } = await supabase
      .from("product_images")
      .select("url")
      .eq("id", firstId)
      .single();

    if (firstImage?.url) {
      await supabase
        .from("products")
        .update({ image_url: firstImage.url })
        .eq("id", productId);
    }
  } else {
    await supabase
      .from("products")
      .update({ image_url: "" })
      .eq("id", productId);
  }

  revalidatePath(`/admin/produtos/${productId}`);
  revalidatePath(`/produto/${productId}`);
  return {};
}

export async function setPrimaryImage(
  imageId: string,
  productId: string
): Promise<{ error?: string }> {
  let supabase;
  try {
    supabase = await requireAdmin();
  } catch (e) {
    return { error: (e as Error).message };
  }

  await supabase
    .from("product_images")
    .update({ is_primary: false })
    .eq("product_id", productId);

  const { error } = await supabase
    .from("product_images")
    .update({ is_primary: true })
    .eq("id", imageId);

  if (error) return { error: error.message };

  const { data: selectedImage } = await supabase
    .from("product_images")
    .select("url")
    .eq("id", imageId)
    .single();

  if (selectedImage?.url) {
    await supabase
      .from("products")
      .update({ image_url: selectedImage.url })
      .eq("id", productId);
  }

  revalidatePath(`/admin/produtos/${productId}`);
  revalidatePath(`/produto/${productId}`);
  return {};
}

export async function reorderProductImages(
  productId: string,
  imageIds: string[]
): Promise<{ error?: string }> {
  let supabase;
  try {
    supabase = await requireAdmin();
  } catch (e) {
    return { error: (e as Error).message };
  }

  const updates = imageIds.map((id, index) =>
    supabase
      .from("product_images")
      .update({ order: index, is_primary: index === 0 })
      .eq("id", id)
  );

  await Promise.all(updates);

  const { data: reorderedImages } = await supabase
    .from("product_images")
    .select("url")
    .eq("product_id", productId)
    .order("order")
    .limit(1);

  if (reorderedImages && reorderedImages.length > 0) {
    await supabase
      .from("products")
      .update({ image_url: reorderedImages[0].url })
      .eq("id", productId);
  }

  revalidatePath(`/admin/produtos/${productId}`);
  revalidatePath(`/produto/${productId}`);
  return {};
}
