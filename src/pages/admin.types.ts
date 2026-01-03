export type Product = {
  id: string;
  name: string;
  brand: string;
  description: string;
  price: number;
  imageUrl: string;
  sizesCsv: string; // "7,8,9"
  stockQty: number;
  createdAt?: string;
};
