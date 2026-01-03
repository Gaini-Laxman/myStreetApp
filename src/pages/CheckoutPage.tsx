import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/http";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { Money, Toast } from "../components/Ui";
import "./checkout-page.css";

type Shipping = {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
};

export default function CheckoutPage() {
  const { token } = useAuth();
  const { items, subtotal, clear } = useCart();
  const nav = useNavigate();

  const [shipping, setShipping] = useState<Shipping>({
    fullName: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
  });

  const [paymentMode, setPaymentMode] = useState<"COD" | "MOCK_UPI">("COD");
  const [err, setErr] = useState<string>("");
  const [busy, setBusy] = useState(false);

  if (items.length === 0) {
    return <Toast kind="error" message="Cart is empty. Add items before checkout." />;
  }

  async function placeOrder() {
    setErr("");
    if (!shipping.fullName || !shipping.addressLine1 || !shipping.city || !shipping.state || !shipping.postalCode) {
      setErr("Please fill required shipping fields.");
      return;
    }

    setBusy(true);
    try {
      const payload = {
        items: items.map((it) => ({ productId: it.productId, size: it.size, qty: it.qty })),
        shippingAddress: shipping,
        paymentMode,
      };

      const order = await api<{ id: string } & any>("/api/orders", {
        method: "POST",
        body: JSON.stringify(payload),
        token: token || undefined,
      });

      clear();
      nav(`/orders/${order.id}`, { replace: true, state: { order } });
    } catch (e: any) {
      setErr(e?.err?.message || e.message || "Order failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <h2>Checkout</h2>
      {err && <Toast kind="error" message={err} />}

      <div className="checkoutPage">
        {/* LEFT */}
        <div className="card checkoutPage__card">
          <h3 className="checkoutPage__title">Shipping Address</h3>

          <div className="row">
            <input
              className="input"
              placeholder="Full name *"
              value={shipping.fullName}
              onChange={(e) => setShipping({ ...shipping, fullName: e.target.value })}
            />
            <input
              className="input"
              placeholder="Phone"
              value={shipping.phone}
              onChange={(e) => setShipping({ ...shipping, phone: e.target.value })}
            />
          </div>

          <div className="checkoutPage__gap" />

          <input
            className="input"
            placeholder="Address line 1 *"
            value={shipping.addressLine1}
            onChange={(e) => setShipping({ ...shipping, addressLine1: e.target.value })}
          />

          <div className="checkoutPage__gap" />

          <input
            className="input"
            placeholder="Address line 2"
            value={shipping.addressLine2}
            onChange={(e) => setShipping({ ...shipping, addressLine2: e.target.value })}
          />

          <div className="checkoutPage__gap" />

          <div className="row">
            <input
              className="input"
              placeholder="City *"
              value={shipping.city}
              onChange={(e) => setShipping({ ...shipping, city: e.target.value })}
            />
            <input
              className="input"
              placeholder="State *"
              value={shipping.state}
              onChange={(e) => setShipping({ ...shipping, state: e.target.value })}
            />
          </div>

          <div className="checkoutPage__gap" />

          <input
            className="input"
            placeholder="Postal Code *"
            value={shipping.postalCode}
            onChange={(e) => setShipping({ ...shipping, postalCode: e.target.value })}
          />
        </div>

        {/* RIGHT */}
        <div className="card checkoutPage__card">
          <h3 className="checkoutPage__title">Payment</h3>

          <div className="toast">
            <label className="checkoutPage__radio checkoutPage__radio--big">
              <input
                type="radio"
                checked={paymentMode === "COD"}
                onChange={() => setPaymentMode("COD")}
              />
              Cash on Delivery
            </label>

            <label className="checkoutPage__radio checkoutPage__radio--mt">
              <input
                type="radio"
                checked={paymentMode === "MOCK_UPI"}
                onChange={() => setPaymentMode("MOCK_UPI")}
              />
              UPI
            </label>
          </div>

          <h3 className="checkoutPage__title">Summary</h3>

          <div className="toast">
            <div className="muted">Items: {items.length}</div>
            <div className="checkoutPage__total">
              Total: <Money value={subtotal} />
            </div>
          </div>

          <button className="btn primary checkoutPage__placeBtn" disabled={busy} onClick={placeOrder}>
            {busy ? "Placing…" : "Place Order"}
          </button>
        </div>
      </div>
    </>
  );
}
