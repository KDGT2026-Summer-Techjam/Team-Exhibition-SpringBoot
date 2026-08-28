"use client";

import { useItinerariesNav } from "@/components/itinerary/ItinerariesFadeShell";
import type { ShioriBookPage } from "@/components/itinerary/ShioriBook";
import { cn } from "@/lib/utils";
import Link from "next/link";

type SectionsMenuProps = {
  pages: ShioriBookPage[];
  activePageId: string;
  isOwner: boolean;
  /** 開いているモーダル。写真一覧・しおり管理の選択状態に使う */
  modal: "photos" | "admin" | null;
  onSelectPage: (id: string) => void;
  onOpenPhotos: () => void;
  onOpenAdmin: () => void;
};

function menuItemClass(active: boolean) {
  return cn(
    "rounded-xl px-4 py-2 text-left font-heading text-sm font-bold tracking-wide transition-colors",
    active
      ? "bg-accent/15 text-ink"
      : "text-ink hover:bg-accent/10",
  );
}

/**
 * しおり内容の右下ナビ。しおり一覧・写真・管理と、各日へのジャンプを常時表示する。
 */
export function SectionsMenu({
  pages,
  activePageId,
  isOwner,
  modal,
  onSelectPage,
  onOpenPhotos,
  onOpenAdmin,
}: SectionsMenuProps) {
  const { navigate } = useItinerariesNav();
  const photosActive = modal === "photos";
  const adminActive = modal === "admin";
  const pageActive = modal === null;

  return (
    <nav
      aria-label="しおりの移動"
      className="fixed right-4 bottom-4 z-[60] sm:right-6 sm:bottom-6"
    >
      <div className="flex max-h-[min(28rem,calc(100dvh-2rem))] flex-col items-stretch gap-1.5 overflow-y-auto rounded-2xl border border-line bg-paper/95 p-2 shadow-lg backdrop-blur">
        <Link
          href="/itineraries"
          className={menuItemClass(false)}
          onClick={(e) => {
            if (
              e.metaKey ||
              e.ctrlKey ||
              e.shiftKey ||
              e.altKey ||
              e.button !== 0
            ) {
              return;
            }
            e.preventDefault();
            navigate("/itineraries");
          }}
        >
          しおり一覧
        </Link>
        <button
          type="button"
          aria-pressed={photosActive}
          onClick={onOpenPhotos}
          className={menuItemClass(photosActive)}
        >
          写真一覧
        </button>
        {isOwner && (
          <button
            type="button"
            aria-pressed={adminActive}
            onClick={onOpenAdmin}
            className={menuItemClass(adminActive)}
          >
            しおり管理
          </button>
        )}

        <div className="my-0.5 h-px bg-line" aria-hidden />

        <div
          role="tablist"
          aria-label="日の切り替え"
          className="flex flex-col gap-1.5"
        >
          {pages.map((page) => {
            const isActive = pageActive && activePageId === page.id;
            return (
              <button
                key={page.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => onSelectPage(page.id)}
                className={menuItemClass(isActive)}
              >
                {page.label}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
