"use client";

import {
  ADMIN_TAB_ID,
  DayTabs,
  PHOTOS_TAB_ID,
  type ContentTabId,
} from "@/components/itinerary/DayTabs";
import type { ShioriDay } from "@/types";
import { usePathname, useRouter } from "next/navigation";

type ItineraryContentTabBarProps = {
  itineraryId: string;
  days: ShioriDay[];
  activeTabId: ContentTabId;
  showAdmin?: boolean;
};

/**
 * しおり内容・写真一覧・しおり管理で共有する上部切り替えバー。
 * 紙面シェルの内側に置く想定で、独自のカード背景は持たない。
 */
export function ItineraryContentTabBar({
  itineraryId,
  days,
  activeTabId,
  showAdmin = false,
}: ItineraryContentTabBarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleChange = (tabId: ContentTabId) => {
    if (tabId === PHOTOS_TAB_ID) {
      router.push(`/itineraries/${itineraryId}/photos`);
      return;
    }

    if (tabId === ADMIN_TAB_ID) {
      router.push(`/itineraries/${itineraryId}/admin`);
      return;
    }

    const detailPath = `/itineraries/${itineraryId}`;
    const href = `${detailPath}?tab=${encodeURIComponent(tabId)}`;

    const isSubPage =
      pathname.endsWith("/photos") || pathname.endsWith("/admin");

    if (isSubPage || pathname !== detailPath) {
      router.push(href);
      return;
    }

    router.replace(href, { scroll: false });
  };

  return (
    <DayTabs
      days={days}
      activeTabId={activeTabId}
      onChange={handleChange}
      showAdmin={showAdmin}
    />
  );
}
