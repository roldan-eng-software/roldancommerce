import {
  getProductsAdmin,
  getCategoriesForSelect,
} from "@/app/_actions/products-admin";
import ProductsListClient from "./_components/products-list-client";

export default async function AdminProdutos() {
  const [products, categories] = await Promise.all([
    getProductsAdmin(),
    getCategoriesForSelect(),
  ]);

  return <ProductsListClient products={products} categories={categories} />;
}
