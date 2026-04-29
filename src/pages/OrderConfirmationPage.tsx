import { useEffect, useState } from "react";
import { useLocation, useParams, Link } from "react-router-dom";
import { api } from "../api/http";
import { useAuth } from "../context/AuthContext";
import { Money, Spinner, Toast } from "../components/Ui";
import "./order-confirmation-page.css";

export default function OrderConfirmationPage() {
  const { id } = useParams();
  const { token } = useAuth();
  const loc = useLocation();

  const [order, setOrder] = useState<any>(loc.state?.order ?? null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(!order);

  useEffect(() => {
    if (order || !id) return;

    let alive = true;
    setLoading(true);

    api(`/api/orders/${id}`, { token: token || undefined })
      .then((data) => alive && setOrder(data))
      .catch((e) => alive && setErr(e?.err?.message || e.message || "Failed to load order"))
      .finally(() => alive && setLoading(false));

    return () => {
      alive = false;
    };
  }, [id, order, token]);

  if (loading) return <Spinner />;
  if (!order) return <Toast kind="error" message={err || "Order not found"} />;

  return (
    <div className="card orderConfirm">
      <h2 className="orderConfirm__title">Order Confirmed ✅</h2>

      <div className="toast">
        <div>
          <b>Order ID:</b> {order.id}
        </div>
        <div>
          <b>Status:</b> {order.status}
        </div>
        <div>
          <b>Total:</b> <Money value={order.total} />
        </div>
{order.shippingAddress ? (
  <>
    <h3>Shipping Address</h3>
    <div className="toast orderConfirm__address">
      <div><b>Name:</b> {order.shippingAddress.fullName}</div>
      {order.shippingAddress.phone ? (
        <div><b>Phone:</b> {order.shippingAddress.phone}</div>
      ) : null}
      <div>
        <b>Address:</b> {order.shippingAddress.addressLine1}
        {order.shippingAddress.addressLine2 ? `, ${order.shippingAddress.addressLine2}` : ""}
      </div>
      <div>
        <b>City/State:</b> {order.shippingAddress.city}, {order.shippingAddress.state}
      </div>
      <div><b>Postal Code:</b> {order.shippingAddress.postalCode}</div>
    </div>
  </>
) : null}

      </div>

      <h3>Items</h3>

      <table className="table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Size</th>
            <th>Qty</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {(order.items || []).map((it: any) => (
            <tr key={it.id}>
              <td>{it.productName}</td>
              <td>{it.size}</td>
              <td>{it.qty}</td>
              <td>
                <Money value={it.lineTotal} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="orderConfirm__actions">
        <Link className="btn primary" to="/">
          Back to Home
        </Link>
        <Link className="btn" to="/cart">
          Cart
        </Link>
      </div>
    </div>
  );
}
