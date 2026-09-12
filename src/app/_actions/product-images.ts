"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

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

  return (data ?? []) as unknown as ProductImage[];
}

export async function uploadProductImage(
  productId: string,
  file: File,
  order: number = 0
): Promise<{ error?: string; url?: string }> {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase não configurado" };

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

  if ((count || 0) === 0) {
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
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase não configurado" };

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
  }

  revalidatePath(`/admin/produtos/${productId}`);
  revalidatePath(`/produto/${productId}`);
  return {};
}

export async function setPrimaryImage(
  imageId: string,
  productId: string
): Promise<{ error?: string }> {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase não configurado" };

  await supabase
    .from("product_images")
    .update({ is_primary: false })
    .eq("product_id", productId);

  const { error } = await supabase
    .from("product_images")
    .update({ is_primary: true })
    .eq("id", imageId);

  if (error) return { error: error.message };

  revalidatePath(`/admin/produtos/${productId}`);
  revalidatePath(`/produto/${productId}`);
  return {};
}

export async function reorderProductImages(
  productId: string,
  imageIds: string[]
): Promise<{ error?: string }> {
  const supabase = await createClient();
  if (!supabase) return { error: "Supabase não configurado" };

  const updates = imageIds.map((id, index) =>
    supabase
      .from("product_images")
      .update({ order: index, is_primary: index === 0 })
      .eq("id", id)
  );

  await Promise.all(updates);

  revalidatePath(`/admin/produtos/${productId}`);
  revalidatePath(`/produto/${productId}`);
  return {};
}
