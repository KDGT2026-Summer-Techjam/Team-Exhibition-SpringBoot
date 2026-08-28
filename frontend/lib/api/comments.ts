import { apiRequest } from "@/lib/api/client";
import type { Comment } from "@/types";

function mapComment(raw: Record<string, unknown>): Comment {
  return {
    id: String(raw.id),
    authorId: String(raw.authorId),
    authorName: String(raw.authorName),
    body: String(raw.body),
    targetType: raw.targetType as Comment["targetType"],
    targetId: String(raw.targetId),
    targetField: raw.targetField ? String(raw.targetField) : undefined,
    createdAt: String(raw.createdAt),
  };
}

export async function fetchShioriComments(shioriId: string): Promise<Comment[]> {
  const list = await apiRequest<Record<string, unknown>[]>(
    `/api/shioris/${shioriId}/comments`,
  );
  return list.map(mapComment);
}

export async function createComment(input: {
  shioriId: string;
  targetType: Comment["targetType"];
  targetId: string;
  targetField?: string;
  body: string;
}): Promise<Comment> {
  const raw = await apiRequest<Record<string, unknown>>("/api/comments", {
    method: "POST",
    body: input,
  });
  return mapComment(raw);
}

export async function updateComment(id: string, body: string): Promise<Comment> {
  const raw = await apiRequest<Record<string, unknown>>(`/api/comments/${id}`, {
    method: "PATCH",
    body: { body },
  });
  return mapComment(raw);
}

export async function deleteComment(id: string): Promise<void> {
  await apiRequest<void>(`/api/comments/${id}`, { method: "DELETE" });
}
