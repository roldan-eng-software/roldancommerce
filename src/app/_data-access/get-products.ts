import { PRODUCTS, PAGE_SIZE, type Product } from "@/data/products";

export function getProductsPage(page: number): {
  products: Product[];
  totalPages: number;
  currentPage: number;
} {
  const totalPages = Math.max(1, Math.ceil(PRODUCTS.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const products = PRODUCTS.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  return { products, totalPages, currentPage };
}

export function getAllProducts(): Product[] {
  return PRODUCTS;
}
