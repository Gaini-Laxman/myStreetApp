import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { Money } from "../components/Ui";
import { useAuth } from "../context/AuthContext";
import "./cart-page.css";

export default function CartPage() {
  const { items, remove, setQty, subtotal } = useCart();
  const { token } = useAuth();
  const nav = useNavigate();

  return (
    <>
      <h2>Your Cart</h2>

      {items.length === 0 ? (
        <div className="toast">Cart is empty. Add some sneakers 👟</div>
      ) : (
        <div className="card cartPage">
          <table className="table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Size</th>
                <th className="cartPage__qtyCol">Qty</th>
                <th>Price</th>
                <th className="cartPage__removeCol"></th>
              </tr>
            </thead>

            <tbody>
              {items.map((it) => (
                <tr key={`${it.productId}_${it.size}`}>
                  <td>
                    <div className="cartPage__item">
                      <img className="cartPage__img" src={it.imageUrl} alt={it.name} />
                      <div>
                        <div className="cartPage__name">{it.name}</div>
                        <div className="muted">{it.brand}</div>
                      </div>
                    </div>
                  </td>

                  <td>{it.size}</td>

                  <td>
                    <input
                      className="input cartPage__qtyInput"
                      type="number"
                      min={1}
                      value={it.qty}
                      onChange={(e) => setQty(it.productId, it.size, Number(e.target.value))}
                    />
                  </td>

                  <td>
                    <Money value={it.unitPrice * it.qty} />
                  </td>

                  <td>
                    <button className="btn danger" onClick={() => remove(it.productId, it.size)}>
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="cartPage__footer">
            <div className="cartPage__total">
              Total: <Money value={subtotal} />
            </div>

            <div className="cartPage__footerActions">
              <Link className="btn" to="/">
                Continue Shopping
              </Link>

              <button
                className="btn primary"
                onClick={() => {
                  if (!token) nav("/login", { state: { from: "/checkout" } });
                  else nav("/checkout");
                }}
              >
                Checkout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
