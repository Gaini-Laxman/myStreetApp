import { api } from "./http";


export type UserSafe = {
  id: string;
  email: string;
  isAdmin: boolean;
};

export async function loginApi(email: string, password: string) {
  return api<{ token: string; user: UserSafe }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: email.trim(), password }),
  });
}

export async function registerApi(email: string, password: string) {
  return api<{ user: UserSafe }>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ email: email.trim(), password }),
  });
}
