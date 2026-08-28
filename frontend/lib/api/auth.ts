import { apiRequest } from "@/lib/api/client";
import { clearSession, establishSession } from "@/lib/auth/session";

type LoginResponse = { token: string };

export async function login(loginId: string, password: string): Promise<void> {
  const data = await apiRequest<LoginResponse>("/api/auth/login", {
    method: "POST",
    auth: false,
    body: { loginId, password },
  });
  establishSession(data.token);
}

export async function logout(): Promise<void> {
  try {
    await apiRequest<void>("/api/auth/logout", { method: "POST", auth: false });
  } finally {
    clearSession();
  }
}
