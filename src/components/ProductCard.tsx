
import { Link } from "react-router-dom";
import { Money } from "./Ui";

export type Product = {
  id: string;
  name: string;
  brand: string;
  description: string;
  price: number;
  imageUrl: string;
  sizesCsv: string;
  stockQty: number;
};

export default function ProductCard({ p }: { p: Product }) {
  return (
    <div className="card">
      <img className="product-img" src={p.imageUrl} alt={p.name} />
      <div className="p-body">
        <div className="p-title">{p.name}</div>
        <div className="p-meta">
          <span className="muted">{p.brand}</span>
          <span className="p-price"><Money value={p.price} /></span>
        </div>
        <Link className="btn primary" to={`/products/${p.id}`}>View</Link>
      </div>
    </div>
  );
}
