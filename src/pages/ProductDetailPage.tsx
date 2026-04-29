import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api } from "../api/http";
import { useCart } from "../context/CartContext";
import { Money, Spinner, Toast } from "../components/Ui";
import type { Product } from "../components/ProductCard";
import "./product-detail-page.css";

export default function ProductDetailPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const { add } = useCart();

  const [p, setP] = useState<Product | null>(null);
  const [size, setSize] = useState<string>("");
  const [qty, setQty] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string>("");

  const sizes = useMemo(() => (p ? p.sizesCsv.split(",").map((x) => x.trim()) : []), [p]);

  useEffect(() => {
    if (!id) return;
    let alive = true;

    setLoading(true);
    api<Product>(`/api/products/${id}`)
      .then((data) => {
        if (!alive) return;
        setP(data);
        const s = data.sizesCsv.split(",").map((x) => x.trim())[0] || "";
        setSize(s);
      })
      .catch((e) => alive && setMsg(e?.err?.message || e.message || "Failed to load product"))
      .finally(() => alive && setLoading(false));

    return () => {
      alive = false;
    };
  }, [id]);

  if (loading) return <Spinner />;
  if (!p) return <Toast kind="error" message={msg || "Product not found"} />;

  return (
    <div className="card productDetail">
      <div className="row">
        <div>
          <img className="product-img productDetail__img" src={p.imageUrl} alt={p.name} />
        </div>

        <div className="productDetail__content">
          <h2 className="productDetail__title">{p.name}</h2>
          <div className="muted">{p.brand}</div>

          <div className="productDetail__price">
            <Money value={p.price} />
          </div>

          <div className="muted">{p.description}</div>

          <div className="toast">
            <div className="muted">Stock: {p.stockQty}</div>
          </div>

          <div className="row">
            <div>
              <label className="muted">Size</label>
              <select value={size} onChange={(e) => setSize(e.target.value)}>
                {sizes.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="muted">Qty</label>
              <input
                className="input"
                type="number"
                min={1}
                max={Math.max(1, p.stockQty)}
                value={qty}
                onChange={(e) => setQty(Number(e.target.value))}
              />
            </div>
          </div>

          {msg && <Toast message={msg} />}

          <div className="productDetail__actions">
            <button
              className="btn primary"
              disabled={!size || qty <= 0 || p.stockQty <= 0}
              onClick={() => {
                add(
                  {
                    productId: p.id,
                    name: p.name,
                    brand: p.brand,
                    imageUrl: p.imageUrl,
                    size,
                    unitPrice: p.price,
                  },
                  qty
                );
                setMsg("Added to cart Sucessfully!");
              }}
            >
              Add to Cart
            </button>

            <Link className="btn" to="/cart">
              Go to Cart
            </Link>

            <button className="btn ghost" onClick={() => nav(-1)}>
              Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
