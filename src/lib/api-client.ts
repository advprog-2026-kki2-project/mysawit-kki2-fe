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

function buildUrl(path: string) {
  return `${API_BASE_URL}${path}`;
}

export async function requestJson<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(buildUrl(path), {
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

export async function requestFormData<T>(
  path: string,
  formData: FormData,
  init?: Omit<RequestInit, "body">,
): Promise<T> {
  const response = await fetch(buildUrl(path), {
    credentials: "include",
    ...init,
    body: formData,
  });

  if (!response.ok) {
    throw new ApiError(await parseError(response), response.status);
  }

  return (await response.json()) as T;
}

export async function requestEmpty(path: string, init?: RequestInit) {
  const response = await fetch(buildUrl(path), {
    credentials: "include",
    headers: init?.body ? { "Content-Type": "application/json" } : undefined,
    ...init,
  });

  if (!response.ok) {
    throw new ApiError(await parseError(response), response.status);
  }
}
