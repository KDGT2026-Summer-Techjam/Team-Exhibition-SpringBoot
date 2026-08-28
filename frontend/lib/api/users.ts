import { apiRequest } from "@/lib/api/client";
import type { User } from "@/types";

export async function signup(
  username: string,
  email: string,
  password: string,
): Promise<void> {
  await apiRequest<void>("/api/users", {
    method: "POST",
    auth: false,
    body: { username, email, password },
  });
}

export async function fetchCurrentUser(): Promise<User> {
  const raw = await apiRequest<Record<string, unknown>>("/api/users/me");
  return {
    id: String(raw.id),
    username: String(raw.username),
    email: String(raw.email),
  };
}

export async function updateUsername(username: string): Promise<void> {
  await apiRequest<void>("/api/users/me", {
    method: "PATCH",
    body: { username },
  });
}

export async function updatePassword(
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  await apiRequest<void>("/api/users/me/password", {
    method: "PATCH",
    body: { currentPassword, newPassword },
  });
}
