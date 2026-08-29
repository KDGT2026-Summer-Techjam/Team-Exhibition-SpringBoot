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

/** 招待はURLの共有のみ。受領側はログイン＋しおりのパスワード確認で参加するため、メール入力は不要 */
export async function createInvitation(shioriId: string): Promise<string> {
  const raw = await apiRequest<{ url: string }>(
    `/api/shioris/${shioriId}/invitations`,
    { method: "POST", body: {} },
  );
  return raw.url;
}
