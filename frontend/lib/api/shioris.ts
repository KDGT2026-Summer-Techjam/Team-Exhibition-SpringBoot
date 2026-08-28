import { apiRequest } from "@/lib/api/client";
import { normalizeRecord } from "@/lib/api/normalize";
import type { ItineraryDetail, ItinerarySummary } from "@/types";

function mapSummary(raw: Record<string, unknown>): ItinerarySummary {
  const record = normalizeRecord<Record<string, unknown>>(raw, [
    ["owner", "isOwner"],
  ]);
  return {
    id: String(record.id),
    title: String(record.title),
    description: record.description ? String(record.description) : undefined,
    startDate: record.startDate ? String(record.startDate) : undefined,
    endDate: record.endDate ? String(record.endDate) : undefined,
    createdAt: String(record.createdAt),
    isOwner: Boolean(record.isOwner),
  };
}

function mapDetail(raw: Record<string, unknown>): ItineraryDetail {
  const record = normalizeRecord<Record<string, unknown>>(raw, [
    ["owner", "isOwner"],
  ]);
  return {
    id: String(record.id),
    ownerId: String(record.ownerId),
    title: String(record.title),
    description: record.description ? String(record.description) : undefined,
    startDate: record.startDate ? String(record.startDate) : undefined,
    endDate: record.endDate ? String(record.endDate) : undefined,
    isEditable: Boolean(record.editable ?? record.isEditable),
    isCommentOpen: Boolean(record.commentOpen ?? record.isCommentOpen),
    promises: record.promises ? String(record.promises) : undefined,
    isOwner: Boolean(record.isOwner),
    days: [],
    roadmapItems: [],
    packingItems: [],
    comments: [],
  };
}

export async function fetchShioriList(): Promise<ItinerarySummary[]> {
  const list = await apiRequest<Record<string, unknown>[]>("/api/shioris");
  return list.map(mapSummary);
}

export async function fetchShioriDetail(id: string): Promise<ItineraryDetail> {
  const raw = await apiRequest<Record<string, unknown>>(`/api/shioris/${id}`);
  return mapDetail(raw);
}

export type CreateShioriInput = {
  title: string;
  password: string;
  description?: string;
  startDate?: string;
  endDate?: string;
};

export async function createShiori(input: CreateShioriInput): Promise<string> {
  await apiRequest<void>("/api/shioris", {
    method: "POST",
    body: {
      title: input.title,
      password: input.password,
      description: input.description || undefined,
      startDate: input.startDate || undefined,
      endDate: input.endDate || undefined,
    },
  });
  const list = await fetchShioriList();
  const match = list.find(
    (item) => item.title === input.title && item.isOwner,
  );
  return match?.id ?? list[list.length - 1]?.id ?? "";
}

export async function updateShiori(
  id: string,
  patch: {
    title?: string;
    description?: string;
    promises?: string;
    password?: string;
  },
): Promise<void> {
  await apiRequest<void>(`/api/shioris/${id}`, {
    method: "PATCH",
    body: patch,
  });
}

export async function updateShioriPeriod(
  id: string,
  startDate: string | undefined,
  endDate: string,
): Promise<void> {
  await apiRequest<void>(`/api/shioris/${id}/period`, {
    method: "PATCH",
    body: { startDate, endDate },
  });
}

export type PagePermissionPatch = {
  editable?: boolean;
  commentOpen?: boolean;
  days?: Array<{
    dayId: string;
    editable?: boolean;
    commentOpen?: boolean;
  }>;
};

export async function updatePagePermissions(
  id: string,
  patch: PagePermissionPatch,
): Promise<void> {
  await apiRequest<void>(`/api/shioris/${id}/page-permissions`, {
    method: "PATCH",
    body: patch,
  });
}

export async function deleteShiori(id: string, password: string): Promise<void> {
  await apiRequest<void>(`/api/shioris/${id}`, {
    method: "DELETE",
    body: { password },
  });
}

export async function leaveShiori(id: string): Promise<void> {
  await apiRequest<void>(`/api/shioris/${id}/members/me`, {
    method: "DELETE",
  });
}
