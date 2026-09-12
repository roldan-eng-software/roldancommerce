import {
  getCategoriesForSelect,
  getAllProductsForSelect,
} from "@/app/_actions/products-admin";
import ProductForm from "../_components/product-form";

export default async function NovoProduto() {
  const [categories, allProducts] = await Promise.all([
    getCategoriesForSelect(),
    getAllProductsForSelect(),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold">Novo produto</h1>
      <p className="mt-1 text-sm text-zinc-500">
        Preencha os dados para criar um novo produto.
      </p>
      <div className="mt-6">
        <ProductForm categories={categories} allProducts={allProducts} />
      </div>
    </div>
  );
}
