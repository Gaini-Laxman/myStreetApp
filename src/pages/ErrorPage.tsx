
import { useRouteError, isRouteErrorResponse, Link } from "react-router-dom";

export default function ErrorPage() {
  const err = useRouteError();

  let title = "Something crashed";
  let message = "Unknown error";

  if (isRouteErrorResponse(err)) {
    title = `${err.status} ${err.statusText}`;
    message = typeof err.data === "string" ? err.data : JSON.stringify(err.data);
  } else if (err instanceof Error) {
    message = err.message;
  } else if (typeof err === "string") {
    message = err;
  } else {
    message = JSON.stringify(err);
  }

  return (
    <div style={{ padding: 16 }}>
      <h2>{title}</h2>
      <pre style={{ whiteSpace: "pre-wrap" }}>{message}</pre>
      <Link to="/" style={{ textDecoration: "underline" }}>Go Home</Link>
    </div>
  );
}
