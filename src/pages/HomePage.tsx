import { useEffect, useMemo, useState } from "react";
import { api } from "../api/http";
import { Spinner, Toast } from "../components/Ui";
import type { Product } from "../components/ProductCard";
import ProductCard from "../components/ProductCard";
import "./home-page.css";

const BRANDS = ["All", "Nike", "Adidas", "Converse", "Reebok", "Puma", "Vans", "ASICS", "New Balance"];
const SIZES = ["All", "6", "7", "8", "9", "10", "11"];

export default function HomePage() {
  const [brand, setBrand] = useState("All");
  const [size, setSize] = useState("All");
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [err, setErr] = useState<string>("");

  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (brand !== "All") params.set("brand", brand);
    if (size !== "All") params.set("size", size);
    const q = params.toString();
    return q ? `/api/products?${q}` : "/api/products";
  }, [brand, size]);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setErr("");
    api<Product[]>(query)
      .then((data) => alive && setProducts(data))
      .catch((e) => alive && setErr(e?.err?.message || e.message || "Failed to load products"))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [query]);

  return (
    <>
      <h2>Browse Sneakers</h2>

      <div className="filters">
        <div className="homeFilters__selectWrap">
          <select value={brand} onChange={(e) => setBrand(e.target.value)}>
            {BRANDS.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>

        <div className="homeFilters__selectWrap">
          <select value={size} onChange={(e) => setSize(e.target.value)}>
            {SIZES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <button
          className="btn"
          onClick={() => {
            setBrand("All");
            setSize("All");
          }}
        >
          Reset
        </button>
      </div>

      {err && <Toast kind="error" message={err} />}

      {loading ? (
        <Spinner />
      ) : products.length === 0 ? (
        <div className="toast">No products found for selected filters.</div>
      ) : (
        <div className="grid">
          {products.map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
      )}
    </>
  );
}
