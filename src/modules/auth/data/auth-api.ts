import type {
  AuthResponse,
  LoginPayload,
  RegisterPayload,
} from "@/modules/auth/data/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "http://localhost:8080";

type ApiErrorPayload = {
  error?: string;
  message?: string;
};

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function parseError(response: Response) {
  try {
    const payload = (await response.json()) as ApiErrorPayload;
    return payload.error ?? payload.message ?? "Permintaan gagal diproses.";
  } catch {
    return "Permintaan gagal diproses.";
  }
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (!response.ok) {
    throw new ApiError(await parseError(response), response.status);
  }

  return (await response.json()) as T;
}

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
