

export function Toast({ kind, message }: { kind?: "error"; message: string }) {
  return <div className={`toast ${kind === "error" ? "error" : ""}`}>{message}</div>;
}

export function Money({ value }: { value: number }) {
  return <span>₹{value.toFixed(2)}</span>;
}

export function Spinner() {
  return <span className="muted">Loading…</span>;
}
