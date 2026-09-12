import { getCategories } from "@/app/_actions/categories";
import CategoriesClient from "./_components/categories-client";

export default async function AdminCategorias() {
  const categories = await getCategories();

  return <CategoriesClient categories={categories} />;
}
