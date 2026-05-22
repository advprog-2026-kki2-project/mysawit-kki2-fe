const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "http://localhost:8080";

type ApiErrorPayload = {
  error?: string;
  message?: string;
};

type CsrfTokenPayload = {
  headerName: string;
  token: string;
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
  const fallbackMessage = "Permintaan gagal diproses.";

  try {
    const text = await response.text();

    if (!text) {
      return fallbackMessage;
    }

    try {
      const payload = JSON.parse(text) as ApiErrorPayload;
      return payload.error ?? payload.message ?? text;
    } catch {
      return text;
    }
  } catch {
    return fallbackMessage;
  }
}

function buildUrl(path: string) {
  return `${API_BASE_URL}${path}`;
}

let csrfTokenRequest: Promise<CsrfTokenPayload> | null = null;

const CSRF_EXEMPT_PATHS = new Set([
  "/api/auth/register",
  "/api/auth/login",
  "/api/auth/logout",
]);

function requestMethod(init?: RequestInit) {
  return (init?.method ?? "GET").toUpperCase();
}

function needsCsrfToken(path: string, init?: RequestInit) {
  const method = requestMethod(init);

  return (
    !["GET", "HEAD", "OPTIONS"].includes(method) &&
    !CSRF_EXEMPT_PATHS.has(path)
  );
}

async function getCsrfToken() {
  csrfTokenRequest ??= fetch(buildUrl("/api/auth/csrf"), {
    credentials: "include",
  }).then(async (response) => {
    if (!response.ok) {
      throw new ApiError(await parseError(response), response.status);
    }

    return (await response.json()) as CsrfTokenPayload;
  });

  return csrfTokenRequest;
}

async function buildRequestInit(
  path: string,
  init?: RequestInit,
  defaultJsonContentType = false,
) {
  const headers = new Headers(init?.headers);

  if (defaultJsonContentType && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (needsCsrfToken(path, init)) {
    const csrfToken = await getCsrfToken();
    headers.set(csrfToken.headerName, csrfToken.token);
  }

  return {
    ...init,
    credentials: "include" as const,
    headers,
  };
}

async function fetchApi(path: string, init?: RequestInit, defaultJsonContentType = false) {
  const response = await fetch(
    buildUrl(path),
    await buildRequestInit(path, init, defaultJsonContentType),
  );

  if (response.status !== 403 || !needsCsrfToken(path, init)) {
    return response;
  }

  csrfTokenRequest = null;

  return fetch(
    buildUrl(path),
    await buildRequestInit(path, init, defaultJsonContentType),
  );
}

export async function requestJson<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetchApi(path, init, true);

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
  const response = await fetchApi(path, {
    ...init,
    body: formData,
  });

  if (!response.ok) {
    throw new ApiError(await parseError(response), response.status);
  }

  return (await response.json()) as T;
}

export async function requestBlob(path: string, init?: RequestInit): Promise<Blob> {
  const response = await fetchApi(path, init);

  if (!response.ok) {
    throw new ApiError(await parseError(response), response.status);
  }

  return response.blob();
}

export async function requestEmpty(path: string, init?: RequestInit) {
  const response = await fetchApi(path, init, Boolean(init?.body));

  if (!response.ok) {
    throw new ApiError(await parseError(response), response.status);
  }
}
