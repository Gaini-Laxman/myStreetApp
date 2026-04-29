import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Toast } from "../components/Ui";
import "./login-page.css";

export default function LoginPage() {
  const { login } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const from = (loc.state as any)?.from || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      await login(email.trim().toLowerCase(), password);
      nav(from, { replace: true });
    } catch (e: any) {
      setErr(e?.err?.message || e.message || "Login failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card loginPage">
      <h2 className="loginPage__title">Login</h2>

      {err && <Toast kind="error" message={err} />}

      <form className="loginPage__form" onSubmit={onSubmit}>
        <input
          className="input"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="input"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="btn primary" disabled={busy}>
          {busy ? "Signing in…" : "Login"}
        </button>
      </form>

      <div className="footer-note">
        No account? <Link to="/register">Register</Link>
      </div>

      <div className="footer-note">
        Admin: admin@mystreet.com / Admin@123
      </div>
    </div>
  );
}

export default function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { email, password } = req.body;

  if (email === "admin@mystreet.com" && password === "Admin@123") {
    return res.status(200).json({
      token: "mock-admin-token",
      user: {
        id: "1",
        email,
        isAdmin: true,
      },
    });
  }

  return res.status(401).json({ message: "Invalid email or password" });
}
