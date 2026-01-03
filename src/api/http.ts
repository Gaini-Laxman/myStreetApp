export type ApiError = {
  timestamp?: string;
  path?: string;
  error?: string;
  message?: string;
};

async function parseError(res: Response): Promise<ApiError> {
  try {
    return await res.json();
  } catch {
    return { error: "UNKNOWN_ERROR", message: `HTTP ${res.status}` };
  }
}

export async function api<T>(
  path: string,
  options: RequestInit & { token?: string } = {}
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as any),
  };
  if (options.token) headers.Authorization = `Bearer ${options.token}`;

  const res = await fetch(path, { ...options, headers });
  if (!res.ok) {
    const err = await parseError(res);
    throw Object.assign(new Error(err.message || "Request failed"), { status: res.status, err });
  }
  if (res.status === 204) return undefined as unknown as T;
  return (await res.json()) as T;
}
