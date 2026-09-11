import { PRODUCTS, type Product } from "@/data/products";

export function getProductById(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}

export function getRelatedProducts(product: Product): Product[] {
  return (product.relacionados ?? [])
    .map((rid) => PRODUCTS.find((p) => p.id === rid))
    .filter(Boolean) as Product[];
}
