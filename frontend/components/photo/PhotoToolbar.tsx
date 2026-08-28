"use client";

import { Button } from "@/components/ui/Button";
import { cn, formatDayTabDate, hoverPop, hoverTransition } from "@/lib/utils";
import type { Photo } from "@/types";
import { useRef } from "react";

export type PhotoSort = "date" | "likes";

export type PhotoFilterOptions = {
  sort: PhotoSort;
  dayId: string;
  onlyMine: boolean;
  onlyLiked: boolean;
  includeDeleted: boolean;
  currentUserId: string;
};

type PhotoDayOption = {
  id: string;
  dayNumber: number;
  tripDate?: string;
};

type PhotoToolbarProps = {
  sort: PhotoSort;
  dayId: string;
  onlyMine: boolean;
  onlyLiked: boolean;
  includeDeleted: boolean;
  days: PhotoDayOption[];
  onSortChange: (sort: PhotoSort) => void;
  onDayChange: (dayId: string) => void;
  onOnlyMineChange: (value: boolean) => void;
  onOnlyLikedChange: (value: boolean) => void;
  onIncludeDeletedChange: (value: boolean) => void;
  uploadError?: string;
};

function FilterTag({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full border px-3 py-1 text-sm",
        hoverTransition,
        hoverPop,
        active
          ? "border-accent bg-paper font-medium text-ink shadow-sm"
          : "border-line/40 bg-paper/90 text-ink-muted hover:border-accent/50 hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}

function FilterGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <span className="shrink-0 text-xs font-medium tracking-wide text-ink-muted">
        {label}
      </span>
      <div className="flex flex-wrap items-center gap-2">{children}</div>
    </div>
  );
}

export function PhotoToolbar({
  sort,
  dayId,
  onlyMine,
  onlyLiked,
  includeDeleted,
  days,
  onSortChange,
  onDayChange,
  onOnlyMineChange,
  onOnlyLikedChange,
  onIncludeDeletedChange,
  uploadError,
}: PhotoToolbarProps) {
  return (
    <div className="space-y-3">
      {/* 1段目: 並び替え＋追加フィルタ */}
      <div className="-mx-1 overflow-x-auto overscroll-x-contain [scrollbar-width:thin]">
        <div className="flex min-w-max items-center gap-4 px-1 py-1">
          <FilterGroup label="並び替え">
            <FilterTag
              active={sort === "date"}
              onClick={() => onSortChange("date")}
            >
              日付順
            </FilterTag>
            <FilterTag
              active={sort === "likes"}
              onClick={() => onSortChange("likes")}
            >
              いいね順
            </FilterTag>
          </FilterGroup>

          <span className="h-4 w-px shrink-0 bg-line" aria-hidden />

          <FilterGroup label="絞り込み">
            <FilterTag
              active={onlyMine}
              onClick={() => onOnlyMineChange(!onlyMine)}
            >
              自分のみ
            </FilterTag>
            <FilterTag
              active={onlyLiked}
              onClick={() => onOnlyLikedChange(!onlyLiked)}
            >
              いいね付き
            </FilterTag>
            <FilterTag
              active={includeDeleted}
              onClick={() => onIncludeDeletedChange(!includeDeleted)}
            >
              削除済みも見る
            </FilterTag>
          </FilterGroup>
        </div>
      </div>

      {/* 2段目: 日ごと */}
      <div className="-mx-1 overflow-x-auto overscroll-x-contain [scrollbar-width:thin]">
        <div className="flex min-w-max items-center gap-2 px-1 py-1">
          <span className="shrink-0 text-xs font-medium tracking-wide text-ink-muted">
            日ごと
          </span>
          <FilterTag active={dayId === ""} onClick={() => onDayChange("")}>
            すべて
          </FilterTag>
          {days.map((d) => (
            <FilterTag
              key={d.id}
              active={dayId === d.id}
              onClick={() => onDayChange(d.id)}
            >
              <span className="font-heading font-bold">{d.dayNumber}日目</span>
              {d.tripDate && (
                <span className="ml-1.5 text-xs font-normal opacity-80">
                  {formatDayTabDate(d.tripDate)}
                </span>
              )}
            </FilterTag>
          ))}
        </div>
      </div>

      {uploadError && <p className="text-sm text-danger">{uploadError}</p>}
    </div>
  );
}

type PhotoUploadFabProps = {
  days: { id: string; dayNumber: number }[];
  dayId: string;
  onUpload: (file: File, dayId: string) => void;
};

/** 写真一覧パネル右下の登録ボタン（しおり作成 FAB と同じ見た目） */
export function PhotoUploadFab({
  days,
  dayId,
  onUpload,
}: PhotoUploadFabProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const uploadDayId = dayId || days[0]?.id || "";

  return (
    <div className="absolute right-6 bottom-6 z-10">
      <Button
        type="button"
        size="fab"
        aria-label="写真を追加"
        disabled={!uploadDayId}
        onClick={() => inputRef.current?.click()}
      >
        ＋
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        disabled={!uploadDayId}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file && uploadDayId) onUpload(file, uploadDayId);
          e.target.value = "";
        }}
      />
    </div>
  );
}

export function filterAndSortPhotos(
  photos: Photo[],
  options: PhotoFilterOptions,
): Photo[] {
  const {
    sort,
    dayId,
    onlyMine,
    onlyLiked,
    includeDeleted,
    currentUserId,
  } = options;

  let result = [...photos];

  if (!includeDeleted) {
    result = result.filter((p) => !p.isDeleted);
  }
  if (onlyMine) {
    result = result.filter((p) => p.userId === currentUserId);
  }
  if (onlyLiked) {
    result = result.filter((p) => p.likeCount > 0);
  }
  if (dayId) {
    result = result.filter((p) => p.dayId === dayId);
  }

  if (sort === "likes") {
    result.sort((a, b) => b.likeCount - a.likeCount);
  } else {
    result.sort(
      (a, b) =>
        a.dayNumber - b.dayNumber || a.createdAt.localeCompare(b.createdAt),
    );
  }

  return result;
}
