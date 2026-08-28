"use client";

import { NotebookCover } from "@/components/itinerary/NotebookCover";
import { Modal } from "@/components/ui/Modal";
import { cn, hoverPop, hoverTransition } from "@/lib/utils";
import type { ItinerarySummary } from "@/types";
import { useState } from "react";

type ItineraryCardProps = {
  itinerary: ItinerarySummary;
  onLeave?: (id: string) => void;
};

/** 本から出る印。表紙に載せる退出操作 */
function LeaveIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-[1.15rem] w-[1.15rem]"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.1"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M9 5H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h3" />
      <path d="M10 12h11" />
      <path d="M17 8l4 4-4 4" />
    </svg>
  );
}

/** 机の上の閉じたノート1冊。表紙クリックでしおり詳細へ */
export function ItineraryCard({ itinerary, onLeave }: ItineraryCardProps) {
  const [showLeaveModal, setShowLeaveModal] = useState(false);

  return (
    <div className="relative flex flex-col items-center">
      <NotebookCover
        itinerary={itinerary}
        href={`/itineraries/${itinerary.id}`}
        accessory={
          onLeave ? (
            // コルク上では --color-danger が茶色に寄るため、退出ははっきりした赤にする
            <button
              type="button"
              aria-label={`「${itinerary.title}」から退出`}
              title="退出"
              onClick={() => setShowLeaveModal(true)}
              className={cn(
                "absolute top-2.5 z-[8] flex h-8 w-8 items-center justify-center rounded-full text-[#c0392b]",
                hoverTransition,
                hoverPop,
                "hover:bg-[#c0392b]/15 hover:text-[#a93226]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c0392b]",
              )}
              style={{ right: "calc(var(--sheet-0-x) + 0.4rem)" }}
            >
              <LeaveIcon />
            </button>
          ) : undefined
        }
      />

      <Modal
        open={showLeaveModal}
        title="しおりから退出"
        confirmLabel="退出する"
        danger
        onClose={() => setShowLeaveModal(false)}
        onConfirm={() => {
          onLeave?.(itinerary.id);
          setShowLeaveModal(false);
        }}
      >
        「{itinerary.title}」から退出しますか？
      </Modal>
    </div>
  );
}
