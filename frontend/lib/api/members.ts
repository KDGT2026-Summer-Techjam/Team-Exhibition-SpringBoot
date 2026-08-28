import { apiRequest } from "@/lib/api/client";
import type { Member } from "@/types";

function mapMember(raw: Record<string, unknown>): Member {
  return {
    userId: String(raw.userId),
    username: String(raw.username),
    role: raw.role as Member["role"],
    status: "active",
    joinedAt: String(raw.joinedAt ?? new Date().toISOString()),
  };
}

export async function fetchMembers(shioriId: string): Promise<Member[]> {
  const list = await apiRequest<Record<string, unknown>[]>(
    `/api/shioris/${shioriId}/members`,
  );
  return list.map(mapMember);
}

export async function banMember(shioriId: string, userId: string): Promise<void> {
  await apiRequest<void>(`/api/shioris/${shioriId}/members/${userId}`, {
    method: "DELETE",
  });
}
