"use client";

import { cn, formatDayTabDate } from "@/lib/utils";
import type { ShioriDay } from "@/types";
import Link from "next/link";
import { Fragment } from "react";

/** 旅行計画タブの識別子 */
export const TRAVEL_PLAN_TAB_ID = "plan" as const;
/** 写真一覧タブの識別子 */
export const PHOTOS_TAB_ID = "photos" as const;
/** しおり管理タブの識別子 */
export const ADMIN_TAB_ID = "admin" as const;

export type ContentTabId =
  | typeof TRAVEL_PLAN_TAB_ID
  | typeof PHOTOS_TAB_ID
  | typeof ADMIN_TAB_ID
  | string;

type DayTabsProps = {
  days: ShioriDay[];
  activeTabId: ContentTabId;
  onChange: (tabId: ContentTabId) => void;
  /** 作成者のみしおり管理タブを出す */
  showAdmin?: boolean;
};

function TabDivider() {
  return (
    <span
      className="mx-0.5 h-5 w-px shrink-0 self-center bg-line"
      aria-hidden
    />
  );
}

function TabUnderline({
  active,
  children,
  onClick,
  controls,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
  controls?: string;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      aria-controls={controls}
      tabIndex={active ? 0 : -1}
      onClick={onClick}
      className={cn(
        "relative -mb-px flex min-h-11 shrink-0 items-baseline gap-1.5 border-b-[3px] px-3 pb-2.5 pt-2 transition-colors sm:gap-2",
        active
          ? "border-accent text-ink"
          : "border-transparent text-ink-muted hover:border-accent/40 hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}

export function DayTabs({
  days,
  activeTabId,
  onChange,
  showAdmin = false,
}: DayTabsProps) {
  return (
    <div className="-mx-1 overflow-x-auto overscroll-x-contain [scrollbar-width:thin]">
      <div
        role="tablist"
        aria-label="しおり内容の切り替え"
        className="flex min-w-max flex-nowrap items-end justify-start border-b border-line/80 px-1"
      >
        <Link
          href="/itineraries"
          className="relative -mb-px flex min-h-11 shrink-0 items-center border-b-[3px] border-transparent px-3 pb-2.5 pt-2 font-heading text-base font-bold tracking-wide text-ink-muted transition-colors hover:border-accent/40 hover:text-ink sm:text-lg"
        >
          しおり一覧
        </Link>
        <TabDivider />
        <TabUnderline
          active={activeTabId === TRAVEL_PLAN_TAB_ID}
          onClick={() => onChange(TRAVEL_PLAN_TAB_ID)}
          controls="panel-plan"
        >
          <span
            className={cn(
              "font-heading text-base font-bold tracking-wide sm:text-lg",
              activeTabId === TRAVEL_PLAN_TAB_ID ? "text-ink" : "text-ink-muted",
            )}
          >
            旅行計画
          </span>
        </TabUnderline>

        {days.map((day) => {
          const isActive = activeTabId === day.id;
          return (
            <Fragment key={day.id}>
              <TabDivider />
              <TabUnderline
                active={isActive}
                onClick={() => onChange(day.id)}
                controls={`panel-day-${day.id}`}
              >
                <span
                  className={cn(
                    "font-heading text-base font-bold tracking-wide sm:text-lg",
                    isActive ? "text-ink" : "text-ink-muted",
                  )}
                >
                  {day.dayNumber}日目
                </span>
                <span
                  className={cn(
                    "text-xs sm:text-sm",
                    isActive ? "text-ink-muted" : "text-ink-muted/80",
                  )}
                >
                  {formatDayTabDate(day.tripDate)}
                </span>
              </TabUnderline>
            </Fragment>
          );
        })}

        <TabDivider />
        <TabUnderline
          active={activeTabId === PHOTOS_TAB_ID}
          onClick={() => onChange(PHOTOS_TAB_ID)}
        >
          <span
            className={cn(
              "font-heading text-base font-bold tracking-wide sm:text-lg",
              activeTabId === PHOTOS_TAB_ID ? "text-ink" : "text-ink-muted",
            )}
          >
            写真一覧
          </span>
        </TabUnderline>

        {showAdmin && (
          <>
            <TabDivider />
            <TabUnderline
              active={activeTabId === ADMIN_TAB_ID}
              onClick={() => onChange(ADMIN_TAB_ID)}
            >
              <span
                className={cn(
                  "font-heading text-base font-bold tracking-wide sm:text-lg",
                  activeTabId === ADMIN_TAB_ID ? "text-ink" : "text-ink-muted",
                )}
              >
                しおり管理
              </span>
            </TabUnderline>
          </>
        )}
      </div>
    </div>
  );
}
