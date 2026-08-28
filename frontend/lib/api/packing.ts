import { apiRequest } from "@/lib/api/client";
import type { PackingItem } from "@/types";

function mapPackingItem(raw: Record<string, unknown>): PackingItem {
  const contributions = Array.isArray(raw.contributions)
    ? (raw.contributions as Record<string, unknown>[]).map((c) => ({
        userId: String(c.userId),
        userName: String(c.userName),
        quantity: Number(c.quantity),
      }))
    : [];
  return {
    id: String(raw.id),
    label: String(raw.label ?? raw.name ?? ""),
    requiredCount: Number(raw.requiredCount ?? 1),
    contributions,
  };
}

export async function fetchPackingItems(shioriId: string): Promise<PackingItem[]> {
  const list = await apiRequest<Record<string, unknown>[]>(
    `/api/shioris/${shioriId}/packing-items`,
  );
  return list.map(mapPackingItem);
}

export async function createPackingItem(
  shioriId: string,
  name: string,
  requiredCount = 1,
): Promise<PackingItem> {
  const raw = await apiRequest<Record<string, unknown>>(
    `/api/shioris/${shioriId}/packing-items`,
    {
      method: "POST",
      body: { name, requiredCount },
    },
  );
  return mapPackingItem(raw);
}

export async function updatePackingItem(
  itemId: string,
  patch: { name?: string; requiredCount?: number; sortOrder?: number },
): Promise<PackingItem> {
  const raw = await apiRequest<Record<string, unknown>>(
    `/api/packing-items/${itemId}`,
    {
      method: "PATCH",
      body: patch,
    },
  );
  return mapPackingItem(raw);
}

export async function deletePackingItem(itemId: string): Promise<void> {
  await apiRequest<void>(`/api/packing-items/${itemId}`, { method: "DELETE" });
}

export async function contributePackingItem(itemId: string): Promise<PackingItem> {
  const raw = await apiRequest<Record<string, unknown>>(
    `/api/packing-items/${itemId}/contribute`,
    { method: "POST" },
  );
  return mapPackingItem(raw);
}
