import jsonServer from "json-server";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, "db.json"));
const middlewares = jsonServer.defaults();

server.use(cors());
server.use(middlewares);
server.use(jsonServer.bodyParser);

const JWT_SECRET = "mystreet_secret_key_change_me";

// -------------------- Helpers --------------------
function pickUserSafe(u) {
  return { id: u.id, email: u.email, isAdmin: !!u.isAdmin };
}

function authRequired(req, res, next) {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ message: "Missing token" });

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    return next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
}

function adminRequired(req, res, next) {
  authRequired(req, res, () => {
    if (!req.user?.isAdmin)
      return res.status(403).json({ message: "Admin only" });
    next();
  });
}

// -------------------- Auth --------------------
server.post("/api/auth/login", (req, res) => {
  const rawEmail = req.body?.email ?? "";
  const email = String(req.body?.email ?? "")
    .trim()
    .toLowerCase();
  const password = String(req.body?.password ?? "");

  const db = router.db;
  const user = (db.get("users").value() || []).find(
    (u) =>
      String(u.email || "")
        .trim()
        .toLowerCase() === email
  );

  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  const ok = bcrypt.compareSync(password, user.passwordHash);
  if (!ok) return res.status(401).json({ message: "Invalid credentials" });

  const payload = pickUserSafe({ ...user, email: String(user.email).trim() });
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });

  return res.json({ token, user: payload });
});

server.post("/api/auth/register", (req, res) => {
  const rawEmail = req.body?.email ?? "";
  const email = String(rawEmail).trim().toLowerCase();
  const password = String(req.body?.password ?? "");

  if (!email || !password) {
    return res.status(400).json({ message: "Email/password required" });
  }

  const db = router.db;

  const exists = (db.get("users").value() || []).some(
    (u) =>
      String(u.email || "")
        .trim()
        .toLowerCase() === email
  );
  if (exists) return res.status(409).json({ message: "Email already exists" });

  const user = {
    id: `u_${Date.now()}`,
    email, // store normalized
    passwordHash: bcrypt.hashSync(password, 10),
    isAdmin: false,
    createdAt: new Date().toISOString(),
  };

  db.get("users").push(user).write();
  return res.status(201).json({ user: pickUserSafe(user) });
});

// -------------------- Products (public GET, admin write) --------------------
server.get("/api/products", (req, res) => {
  const db = router.db;
  let products = db.get("products").value() || [];

  const { brand, size } = req.query;

  if (brand) products = products.filter((p) => p.brand === brand);
  if (size) {
    products = products.filter((p) =>
      String(p.sizesCsv || "")
        .split(",")
        .map((x) => x.trim())
        .includes(String(size))
    );
  }

  res.json(products);
});

server.get("/api/products/:id", (req, res) => {
  const db = router.db;
  const p = db.get("products").find({ id: req.params.id }).value();
  if (!p) return res.status(404).json({ message: "Not found" });
  res.json(p);
});

server.post("/api/products", adminRequired, (req, res) => {
  const db = router.db;
  const p = {
    id: `p_${Date.now()}`,
    createdAt: new Date().toISOString(),
    ...req.body,
  };
  db.get("products").push(p).write();
  res.status(201).json(p);
});

server.put("/api/products/:id", adminRequired, (req, res) => {
  const db = router.db;
  const updated = db
    .get("products")
    .find({ id: req.params.id })
    .assign(req.body)
    .write();
  if (!updated) return res.status(404).json({ message: "Not found" });
  res.json(updated);
});

server.delete("/api/products/:id", adminRequired, (req, res) => {
  const db = router.db;
  const exists = db.get("products").find({ id: req.params.id }).value();
  if (!exists) return res.status(404).json({ message: "Not found" });

  db.get("products").remove({ id: req.params.id }).write();
  res.status(204).end();
});

// -------------------- Orders (protected) --------------------
server.post("/api/orders", authRequired, (req, res) => {
  const db = router.db;
  const { items = [], shippingAddress, paymentMode } = req.body || {};

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "Items required" });
  }

  const products = db.get("products").value() || [];
  const orderItems = items.map((it) => {
    const p = products.find((x) => x.id === it.productId);
    if (!p) throw new Error("Invalid product");
    const lineTotal = Number(p.price) * Number(it.qty || 1);
    return {
      id: `oi_${Date.now()}_${Math.random().toString(16).slice(2)}`,
      productId: p.id,
      productName: p.name,
      size: it.size,
      qty: Number(it.qty || 1),
      unitPrice: Number(p.price),
      lineTotal,
    };
  });

  const total = orderItems.reduce((s, x) => s + x.lineTotal, 0);

  const order = {
    id: `o_${Date.now()}`,
    userId: req.user.id,
    status: "PLACED",
    paymentMode,
    shippingAddress,
    total,
    createdAt: new Date().toISOString(),
    items: orderItems,
  };

  db.get("orders").push(order).write();
  res.status(201).json(order);
});

server.get("/api/orders/:id", authRequired, (req, res) => {
  const db = router.db;
  const order = db.get("orders").find({ id: req.params.id }).value();
  if (!order) return res.status(404).json({ message: "Not found" });

  // allow admin or same user
  if (!req.user.isAdmin && order.userId !== req.user.id) {
    return res.status(403).json({ message: "Forbidden" });
  }

  res.json(order);
});

// ---- fallback json-server routes (optional) ----
server.use("/api", router);

const PORT = 4000;
server.listen(PORT, () => {
  console.log(`MyStreeT API running on http://localhost:${PORT}`);
});
