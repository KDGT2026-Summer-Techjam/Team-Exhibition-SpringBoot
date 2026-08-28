import { parseApiError } from "@/lib/api/errors";
import { clearSession } from "@/lib/auth/session";
import { getToken } from "@/lib/auth/token";

type ApiRequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  auth?: boolean;
  formData?: FormData;
};

function buildUrl(path: string): string {
  if (path.startsWith("/api/")) return path;
  if (path.startsWith("api/")) return `/${path}`;
  return `/api/${path.replace(/^\//, "")}`;
}

function redirectToLogin(): void {
  if (typeof window === "undefined") return;
  clearSession();
  const returnUrl = encodeURIComponent(
    `${window.location.pathname}${window.location.search}`,
  );
  window.location.assign(`/login?returnUrl=${returnUrl}`);
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const { body, auth = true, formData, headers, ...rest } = options;
  const requestHeaders = new Headers(headers);

  if (auth) {
    const token = getToken();
    if (token) {
      requestHeaders.set("Authorization", `Bearer ${token}`);
    }
  }

  let requestBody: BodyInit | undefined;
  if (formData) {
    requestBody = formData;
  } else if (body !== undefined) {
    requestHeaders.set("Content-Type", "application/json");
    requestBody = JSON.stringify(body);
  }

  const response = await fetch(buildUrl(path), {
    ...rest,
    headers: requestHeaders,
    body: requestBody,
  });

  // 401 のみログアウト。403 は権限不足なので画面に留まる
  if (response.status === 401) {
    if (auth) redirectToLogin();
    throw await parseApiError(response);
  }

  if (response.status === 403) {
    throw await parseApiError(response);
  }

  if (!response.ok) {
    throw await parseApiError(response);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  if (!text) return undefined as T;
  return JSON.parse(text) as T;
}
