import { notFound } from "next/navigation";
import {
  getProductAdmin,
  getCategoriesForSelect,
  getAllProductsForSelect,
} from "@/app/_actions/products-admin";
import { getProductImages } from "@/app/_actions/product-images";
import ProductForm from "../_components/product-form";

export default async function EditarProduto({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [product, categories, allProducts, images] = await Promise.all([
    getProductAdmin(id),
    getCategoriesForSelect(),
    getAllProductsForSelect(),
    getProductImages(id),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Editar produto</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Altere os dados do produto <strong>{product.name}</strong>.
      </p>
      <div className="mt-6">
        <ProductForm
          categories={categories}
          allProducts={allProducts}
          product={product}
          initialImages={images}
        />
      </div>
    </div>
  );
}
