import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Product } from "./admin.types";
import { listProductsApi, deleteProductApi } from "../api/products.api";
import { useAuth } from "../context/AuthContext";
import "./admin-products.css";

export default function AdminProductsPage() {
  const { token, user } = useAuth();
  const nav = useNavigate();

  const [items, setItems] = useState<Product[]>([]);
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function load() {
    setErr("");
    setBusy(true);
    try {
      const data = await listProductsApi();
      setItems(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setErr(e?.err?.message || e?.message || "Failed to load products");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;

    return items.filter((p) => {
      return (
        (p.name || "").toLowerCase().includes(s) ||
        (p.brand || "").toLowerCase().includes(s) ||
        (p.description || "").toLowerCase().includes(s) ||
        String(p.price ?? "").includes(s)
      );
    });
  }, [items, q]);

  function openAdd() {
    nav("/admin/products/new");
  }

  function openEdit(p: Product) {
    nav(`/admin/products/${p.id}/edit`);
  }

  async function onDelete(p: Product) {
    if (!token) {
      alert("Login required");
      return;
    }
    const ok = confirm(`Delete "${p.name}"?`);
    if (!ok) return;

    try {
      await deleteProductApi(token, p.id);
      setItems((prev) => prev.filter((x) => x.id !== p.id));
    } catch (e: any) {
      alert(e?.err?.message || e?.message || "Delete failed");
    }
  }

  return (
    <div className="adminProducts">
      <div className="adminProducts__header">
        <div>
          <h2 className="adminProducts__title">Admin Products</h2>
          <div className="adminProducts__sub">
            {user?.email} • {user?.isAdmin ? "ADMIN" : "USER"}
          </div>
        </div>

        <div className="adminProducts__actions">
          <input
            className="adminProducts__search"
            placeholder="Search products..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />

          <button className="adminProducts__addBtn" onClick={openAdd}>
            + Add
          </button>
        </div>
      </div>

      <div className="adminProducts__spacer" />

      {busy ? <div className="adminProducts__status">Loading...</div> : null}
      {err ? <div className="adminProducts__error">{err}</div> : null}

      <div className="adminProducts__grid">
        {filtered.map((p) => (
          <div key={p.id} className="adminProducts__card">
            <div className="adminProducts__cardTop">
              <img className="adminProducts__img" src={p.imageUrl} alt={p.name} />

              <div className="adminProducts__meta">
                <div className="adminProducts__name">{p.name}</div>
                <div className="adminProducts__brand">{p.brand}</div>
                <div className="adminProducts__priceRow">
                  ₹ <b>{p.price}</b> • Stock: <b>{p.stockQty}</b>
                </div>
                <div className="adminProducts__sizes">{p.sizesCsv}</div>
              </div>
            </div>

            <div className="adminProducts__cardActions">
              <button className="adminProducts__btn" onClick={() => openEdit(p)}>
                Edit
              </button>

              <button className="adminProducts__btn adminProducts__btn--danger" onClick={() => onDelete(p)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
