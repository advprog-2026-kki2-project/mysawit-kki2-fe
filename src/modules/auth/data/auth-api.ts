import type {
  AuthResponse,
  LoginPayload,
  RegisterPayload,
} from "@/modules/auth/data/types";
import { ApiError, requestJson } from "@/lib/api-client";

export { ApiError };

export function register(payload: RegisterPayload) {
  return requestJson<AuthResponse>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function login(payload: LoginPayload) {
  return requestJson<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getSession() {
  return requestJson<AuthResponse>("/api/auth/session", {
    method: "GET",
  });
}

export function logout() {
  return requestJson<{ message: string }>("/api/auth/logout", {
    method: "POST",
    body: JSON.stringify({}),
  });
}
