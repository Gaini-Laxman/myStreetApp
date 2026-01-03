import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { Product } from "./admin.types";
import { createProductApi, updateProductApi, listProductsApi } from "../api/products.api";
import "./admin-product-form.css";

type FormState = Omit<Product, "id" | "createdAt">;

const emptyForm: FormState = {
  name: "",
  brand: "",
  description: "",
  price: 0,
  imageUrl: "",
  sizesCsv: "7,8,9,10",
  stockQty: 0,
};

export default function AdminProductFormPage() {
  const { id } = useParams();
  const isEdit = useMemo(() => Boolean(id), [id]);

  const nav = useNavigate();
  const { token } = useAuth();

  const [form, setForm] = useState<FormState>(emptyForm);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!isEdit) return;

    (async () => {
      setErr("");
      setBusy(true);
      try {
        const data = await listProductsApi();
        const arr = Array.isArray(data) ? data : [];
        const found = arr.find((p: Product) => p.id === id);
        if (!found) throw new Error("Product not found");

        setForm({
          name: found.name || "",
          brand: found.brand || "",
          description: found.description || "",
          price: Number(found.price || 0),
          imageUrl: found.imageUrl || "",
          sizesCsv: found.sizesCsv || "7,8,9,10",
          stockQty: Number(found.stockQty || 0),
        });
      } catch (e: any) {
        setErr(e?.err?.message || e?.message || "Failed to load product");
      } finally {
        setBusy(false);
      }
    })();
  }, [id, isEdit]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((s) => ({ ...s, [key]: value }));
  }

  const canSave = useMemo(() => {
    return (
      form.name.trim().length > 1 &&
      form.brand.trim().length > 0 &&
      String(form.sizesCsv).trim().length > 0 &&
      Number(form.price) >= 0
    );
  }, [form]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");

    if (!token) {
      setErr("Missing token. Please login again.");
      return;
    }
    if (!canSave) {
      setErr("Fill Name, Brand, Sizes. Price must be >= 0.");
      return;
    }

    setBusy(true);
    try {
      const payload: FormState = {
        ...form,
        name: form.name.trim(),
        brand: form.brand.trim(),
        description: form.description.trim(),
        imageUrl: form.imageUrl.trim() || "https://picsum.photos/seed/new/800/600",
        sizesCsv: String(form.sizesCsv).trim(),
        price: Number(form.price),
        stockQty: Number(form.stockQty || 0),
      };

      if (isEdit && id) {
        await updateProductApi(token, id, { id, ...payload } as any);
      } else {
        await createProductApi(token, payload);
      }

      nav("/admin/products", { replace: true });
    } catch (e: any) {
      setErr(e?.err?.message || e?.message || "Save failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="adminForm">
      <div className="adminForm__header">
        <h2 className="adminForm__title">{isEdit ? "Edit Product" : "Add Product"}</h2>

        <button type="button" className="adminForm__btn adminForm__btn--ghost" onClick={() => nav("/admin/products")}>
          Back
        </button>
      </div>

      <div className="adminForm__spacer" />

      {err ? <div className="adminForm__error">{err}</div> : null}
      {busy ? <div className="adminForm__status">Loading...</div> : null}

      <form className="adminForm__card" onSubmit={onSubmit}>
        <input
          className="adminForm__input"
          placeholder="Name *"
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
        />

        <input
          className="adminForm__input"
          placeholder="Brand *"
          value={form.brand}
          onChange={(e) => set("brand", e.target.value)}
        />

        <input
          className="adminForm__input"
          placeholder="Image URL"
          value={form.imageUrl}
          onChange={(e) => set("imageUrl", e.target.value)}
        />

        <textarea
          className="adminForm__textarea"
          placeholder="Description"
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          rows={4}
        />

        <div className="adminForm__row2">
          <input
            className="adminForm__input"
            placeholder="Price"
            type="number"
            value={String(form.price)}
            onChange={(e) => set("price", Number(e.target.value))}
          />
          <input
            className="adminForm__input"
            placeholder="Stock Qty"
            type="number"
            value={String(form.stockQty)}
            onChange={(e) => set("stockQty", Number(e.target.value))}
          />
        </div>

        <input
          className="adminForm__input"
          placeholder="Sizes CSV * (ex: 7,8,9,10)"
          value={form.sizesCsv}
          onChange={(e) => set("sizesCsv", e.target.value)}
        />

        <div className="adminForm__actions">
          <button
            type="button"
            className="adminForm__btn adminForm__btn--ghost"
            disabled={busy}
            onClick={() => nav("/admin/products")}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="adminForm__btn adminForm__btn--primary"
            disabled={busy || !canSave}
          >
            {busy ? "Saving..." : isEdit ? "Update" : "Create"}
          </button>
        </div>
      </form>
    </div>
  );
}
