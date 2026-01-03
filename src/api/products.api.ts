import type { Product } from "../components/ProductCard";
import { api } from "./http";


export async function listProductsApi(params?: { brand?: string; size?: string }) {
  const qs = new URLSearchParams();
  if (params?.brand) qs.set("brand", params.brand);
  if (params?.size) qs.set("size", params.size);
  const suffix = qs.toString() ? `?${qs.toString()}` : "";
  return api<Product[]>(`/api/products${suffix}`);
}

export async function getProductApi(id: string) {
  return api<Product>(`/api/products/${id}`);
}

export async function createProductApi(token: string, payload: Omit<Product, "id" | "createdAt">) {
  return api<Product>(`/api/products`, {
    method: "POST",
    token,
    body: JSON.stringify(payload),
  });
}

export async function updateProductApi(token: string, id: string, payload: Partial<Product>) {
  return api<Product>(`/api/products/${id}`, {
    method: "PUT",
    token,
    body: JSON.stringify(payload),
  });
}

export async function deleteProductApi(token: string, id: string) {
  return api<void>(`/api/products/${id}`, {
    method: "DELETE",
    token,
  });
}
