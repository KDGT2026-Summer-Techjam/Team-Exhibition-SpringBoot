import { apiRequest } from "@/lib/api/client";
import type { Invitation } from "@/types";

export async function fetchPublicInvitation(token: string): Promise<Invitation> {
  const raw = await apiRequest<Record<string, unknown>>(
    `/api/invitations/${token}`,
    { auth: false },
  );
  return {
    code: token,
    shioriTitle: String(raw.shioriTitle),
    message: raw.message ? String(raw.message) : undefined,
    status: raw.status as Invitation["status"],
  };
}

export async function acceptInvitation(
  token: string,
  password: string,
): Promise<void> {
  await apiRequest<void>(`/api/invitations/${token}/accept`, {
    method: "POST",
    body: { password },
  });
}

export async function createInvitation(
  shioriId: string,
  inviteeEmail: string,
  message?: string,
): Promise<string> {
  const raw = await apiRequest<{ url: string }>(
    `/api/shioris/${shioriId}/invitations`,
    {
      method: "POST",
      body: { inviteeEmail, message },
    },
  );
  return raw.url;
}
