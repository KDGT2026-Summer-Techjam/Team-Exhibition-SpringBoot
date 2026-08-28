"use client";

import { useItinerariesNav } from "@/components/itinerary/ItinerariesFadeShell";
import { formatCoverDateRange, cn } from "@/lib/utils";
import type { ItinerarySummary } from "@/types";
import Link from "next/link";
import type { ReactNode } from "react";

type NotebookCoverProps = {
  itinerary: ItinerarySummary;
  className?: string;
  /** 指定時は表紙全体がしおり詳細へのリンクになる */
  href?: string;
  /** 指定時は表紙全体がボタンになる（招待など、遷移しない開き方） */
  onActivate?: () => void;
  activateLabel?: string;
  /** 表紙の上に載せる操作（退出など）。リンクの外に置く */
  accessory?: ReactNode;
};

const PAPER_LAYER_COUNT = 4;

/** コルク表紙の面（閉じた本のおもて・中央寄せの印字） */
function CorkCoverFace({
  itinerary,
  interactive,
}: {
  itinerary: ItinerarySummary;
  interactive?: boolean;
}) {
  const coverDate = formatCoverDateRange(
    itinerary.startDate,
    itinerary.endDate,
  );

  return (
    <div
      className={cn(
        "cork-cover-book absolute inset-0 z-[5] flex flex-col items-center overflow-hidden px-5 py-6 text-center",
        "text-[var(--color-ink)]",
      )}
    >
      {/* 背（綴じ側）の濃い帯 */}
      <span
        className="pointer-events-none absolute inset-y-0 left-0 z-[1] w-[0.7rem] bg-[color-mix(in_srgb,var(--color-cork-deep)_55%,var(--color-cork))] shadow-[inset_-2px_0_4px_rgb(0_0_0/0.25)]"
        aria-hidden
      />
      {/* 綴じ溝の影 */}
      <span
        className="pointer-events-none absolute inset-y-0 left-[0.65rem] z-[1] w-3 bg-gradient-to-r from-black/25 to-transparent"
        aria-hidden
      />
      {/* 小口側: 表紙が紙束の上に乗っている落ち込み */}
      <span
        className="pointer-events-none absolute inset-y-0 right-0 z-[1] w-2 bg-gradient-to-l from-black/18 to-transparent"
        aria-hidden
      />

      <p className="relative z-[2] section-hand-label mb-4 text-[11px] tracking-[0.14em] text-ink">
        しおり
      </p>
      <h2
        className={cn(
          "relative z-[2] line-clamp-2 max-w-[12ch] pr-4 font-heading text-[1.35rem] font-bold leading-snug tracking-wide text-ink sm:text-2xl",
          interactive &&
            "transition-colors group-hover:text-[var(--color-cork-speck)]",
        )}
      >
        {itinerary.title}
      </h2>
      {itinerary.description && (
        <p className="relative z-[2] mt-3 line-clamp-3 max-w-[18ch] text-[13px] leading-relaxed text-ink [text-shadow:0_1px_0_rgb(255_255_255/0.3)] sm:text-sm">
          {itinerary.description}
        </p>
      )}
      {coverDate && (
        <p className="relative z-[2] mt-auto pt-5 text-ink [text-shadow:0_1px_0_rgb(255_255_255/0.28)]">
          <span className="block font-heading text-[11px] font-bold tracking-[0.16em]">
            {coverDate.year}
          </span>
          <span className="mt-1.5 flex items-baseline justify-center gap-1 whitespace-nowrap font-heading text-[13px] font-bold leading-none sm:text-sm">
            {coverDate.start && <span>{coverDate.start}</span>}
            {coverDate.start && coverDate.end && (
              <span className="font-semibold opacity-70">〜</span>
            )}
            {coverDate.end && <span>{coverDate.end}</span>}
          </span>
        </p>
      )}
    </div>
  );
}

/**
 * 閉じたノート（コルクハードカバーの本）。
 * おもて＝コルク表紙、右下＝中紙が何枚か覗く。
 */
export function NotebookCover({
  itinerary,
  className,
  href,
  onActivate,
  activateLabel,
  accessory,
}: NotebookCoverProps) {
  const { navigate } = useItinerariesNav();
  const interactive = Boolean(href || onActivate);
  const shellClass = cn(
    "notebook-closed group relative w-full max-w-[15rem] text-left",
    interactive &&
      "transition-transform hover:-translate-y-1",
    className,
  );
  const hitClass = cn(
    "relative block w-full",
    interactive &&
      "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
  );

  const book = (
    <span className="notebook-closed-body relative block">
      {/* 表紙の下から右下へずらした中紙。何枚も重なっている見え方にする */}
      {Array.from({ length: PAPER_LAYER_COUNT }, (_, i) => (
        <span
          key={i}
          className="notebook-paper-sheet pointer-events-none absolute inset-0"
          data-layer={i}
          aria-hidden
        />
      ))}
      <CorkCoverFace itinerary={itinerary} interactive={interactive} />
    </span>
  );

  let face: ReactNode;
  if (href) {
    face = (
      <Link
        href={href}
        aria-label={activateLabel ?? `「${itinerary.title}」を開く`}
        onClick={(e) => {
          // 新規タブ等はそのままブラウザに任せる
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
          navigate(href);
        }}
        className={hitClass}
      >
        {book}
      </Link>
    );
  } else if (onActivate) {
    face = (
      <button
        type="button"
        onClick={onActivate}
        aria-label={activateLabel ?? `「${itinerary.title}」を開く`}
        className={cn(hitClass, "border-0 bg-transparent p-0 text-inherit")}
      >
        {book}
      </button>
    );
  } else {
    face = <div className={hitClass}>{book}</div>;
  }

  return (
    <div className={shellClass}>
      {face}
      {accessory}
    </div>
  );
}
