import { apiRequest } from "@/lib/api/client";
import { normalizeRecord } from "@/lib/api/normalize";
import type { Photo } from "@/types";

function mapPhoto(raw: Record<string, unknown>): Photo {
  const record = normalizeRecord<Record<string, unknown>>(raw, [
    ["deleted", "isDeleted"],
  ]);
  return {
    id: String(record.id),
    dayId: String(record.dayId),
    dayNumber: Number(record.dayNumber),
    userId: String(record.userId),
    userName: String(record.userName),
    imageUrl: String(record.imageUrl),
    isDeleted: Boolean(record.isDeleted),
    likeCount: Number(record.likeCount ?? 0),
    createdAt: String(record.createdAt),
  };
}

export async function fetchPhotos(
  shioriId: string,
  includeDeleted = true,
): Promise<Photo[]> {
  const list = await apiRequest<Record<string, unknown>[]>(
    `/api/shioris/${shioriId}/photos?includeDeleted=${includeDeleted}`,
  );
  return list.map(mapPhoto);
}

export async function uploadPhoto(dayId: string, file: File): Promise<Photo> {
  const formData = new FormData();
  formData.append("file", file);
  const raw = await apiRequest<Record<string, unknown>>(
    `/api/shiori-days/${dayId}/photos`,
    { method: "POST", formData },
  );
  return mapPhoto(raw);
}

export async function deletePhoto(photoId: string): Promise<void> {
  await apiRequest<void>(`/api/photos/${photoId}`, { method: "DELETE" });
}

export async function fetchPhoto(photoId: string): Promise<Photo> {
  const raw = await apiRequest<Record<string, unknown>>(
    `/api/photos/${photoId}`,
  );
  return mapPhoto(raw);
}

export async function likePhoto(photoId: string): Promise<Photo> {
  const raw = await apiRequest<Record<string, unknown>>(
    `/api/photos/${photoId}/likes`,
    { method: "POST" },
  );
  return mapPhoto(raw);
}
