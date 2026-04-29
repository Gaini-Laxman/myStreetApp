
import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function AppLayout() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const nav = useNavigate();

  return (
    <>
      <div className="nav">
        <div className="container nav-inner">
          <Link to="/" className="brand">
            <span>👟 MyStreeT</span>
            <span className="badge">Foundation</span>
          </Link>

          <div className="actions">
            <Link className="btn ghost" to="/cart">Cart ({count})</Link>

            {user?.isAdmin && (
              <Link className="btn ghost" to="/admin/products">Admin</Link>
            )}

            {!user ? (
              <>
                <Link className="btn" to="/login">Login</Link>
                <Link className="btn primary" to="/register">Register</Link>
              </>
            ) : (
              <>
                <span className="badge">{user.email}</span>
                <button
                  className="btn"
                  onClick={() => {
                    logout();
                    nav("/");
                  }}
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="container">
        <Outlet />
        <div className="footer-note">
          Mock checkout + JSON DB. Admin: admin@mystreet.com / Admin@123
        </div>
      </div>
    </>
  );
}
