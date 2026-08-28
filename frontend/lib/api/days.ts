import { apiRequest } from "@/lib/api/client";
import { normalizeRecord } from "@/lib/api/normalize";
import type { ShioriDay } from "@/types";

function mapDay(raw: Record<string, unknown>): ShioriDay {
  const record = normalizeRecord<Record<string, unknown>>(raw, [
    ["editable", "isEditable"],
    ["commentOpen", "isCommentOpen"],
  ]);
  return {
    id: String(record.id),
    dayNumber: Number(record.dayNumber),
    tripDate: String(record.tripDate),
    title: record.title ? String(record.title) : undefined,
    notes: record.notes ? String(record.notes) : undefined,
    estimatedCost:
      record.estimatedCost != null ? Number(record.estimatedCost) : undefined,
    representativePhotoId: record.representativePhotoId
      ? String(record.representativePhotoId)
      : undefined,
    isEditable: Boolean(record.isEditable ?? record.editable ?? true),
    isCommentOpen: Boolean(record.isCommentOpen ?? record.commentOpen ?? true),
  };
}

export async function fetchShioriDays(shioriId: string): Promise<ShioriDay[]> {
  const list = await apiRequest<Record<string, unknown>[]>(
    `/api/shioris/${shioriId}/days`,
  );
  return list.map(mapDay);
}

export async function updateShioriDay(
  dayId: string,
  patch: {
    title?: string;
    notes?: string;
    representativePhotoId?: string | null;
  },
): Promise<void> {
  await apiRequest<void>(`/api/shiori-days/${dayId}`, {
    method: "PATCH",
    body: patch,
  });
}

export async function deleteShioriDay(dayId: string): Promise<void> {
  await apiRequest<void>(`/api/shiori-days/${dayId}`, { method: "DELETE" });
}

export async function insertShioriDay(
  shioriId: string,
  tripDate: string,
  afterDayNumber?: number,
): Promise<ShioriDay> {
  const raw = await apiRequest<Record<string, unknown>>(
    `/api/shioris/${shioriId}/days`,
    {
      method: "POST",
      body: { tripDate, afterDayNumber },
    },
  );
  return mapDay(raw);
}
