import { apiRequest } from "@/lib/api/client";
import type { RoadmapItem } from "@/types";

function mapItem(raw: Record<string, unknown>, dayId: string): RoadmapItem {
  return {
    id: String(raw.id),
    dayId,
    startsAt: String(raw.startsAt).slice(0, 5),
    endsAt: raw.endsAt ? String(raw.endsAt).slice(0, 5) : undefined,
    title: String(raw.title ?? ""),
    amount: raw.amount != null ? Number(raw.amount) : undefined,
  };
}

export async function fetchRoadmapItems(dayId: string): Promise<RoadmapItem[]> {
  const list = await apiRequest<Record<string, unknown>[]>(
    `/api/shiori-days/${dayId}/roadmap-items`,
  );
  return list.map((raw) => mapItem(raw, dayId));
}

export async function createRoadmapItem(
  dayId: string,
  item: Pick<RoadmapItem, "startsAt" | "endsAt" | "title" | "amount"> & {
    sortOrder?: number;
  },
): Promise<RoadmapItem> {
  const raw = await apiRequest<Record<string, unknown>>(
    `/api/shiori-days/${dayId}/roadmap-items`,
    {
      method: "POST",
      body: {
        startsAt: item.startsAt,
        endsAt: item.endsAt,
        title: item.title,
        amount: item.amount,
        sortOrder: item.sortOrder,
      },
    },
  );
  return mapItem(raw, dayId);
}

export async function updateRoadmapItem(
  itemId: string,
  patch: Partial<
    Pick<RoadmapItem, "startsAt" | "endsAt" | "title" | "amount">
  > & { sortOrder?: number },
): Promise<void> {
  await apiRequest<void>(`/api/roadmap-items/${itemId}`, {
    method: "PATCH",
    body: patch,
  });
}

export async function deleteRoadmapItem(itemId: string): Promise<void> {
  await apiRequest<void>(`/api/roadmap-items/${itemId}`, { method: "DELETE" });
}
