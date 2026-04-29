import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Toast } from "../components/Ui";
import "./register-page.css";

export default function RegisterPage() {
  const { register } = useAuth();
  const nav = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setOk("");
    setBusy(true);
    try {
      await register(email, password);
      setOk("Account created ✅ You are logged in now.");
      setTimeout(() => nav("/", { replace: true }), 600);
    } catch (e: any) {
      setErr(e?.err?.message || e.message || "Registration failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card registerPage">
      <h2 className="registerPage__title">Register</h2>

      {err && <Toast kind="error" message={err} />}
      {ok && <Toast message={ok} />}

      <form className="registerPage__form" onSubmit={onSubmit}>
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
          {busy ? "Creating…" : "Create Account"}
        </button>
      </form>

      <div className="footer-note">
        Already have account? <Link to="/login">Login</Link>
      </div>

      <div className="footer-note muted">
        Note: New accounts are regular users. Admin access is only for admin@mystreet.com.
      </div>
    </div>
  );
}

export default function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { email } = req.body;

  return res.status(200).json({
    user: {
      id: Date.now().toString(),
      email,
      isAdmin: false,
    },
  });
}
