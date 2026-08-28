"use client";

import { AddBlockButton } from "@/components/itinerary/blocks/BlockRow";
import { EditableText } from "@/components/itinerary/blocks/EditableText";
import {
  CommentTrigger,
  type CommentHandlers,
} from "@/components/itinerary/CommentTrigger";
import {
  StickyNoteSheet,
  STICKY_SLOT,
  stickyPoseForDay,
  stickyVariantForDay,
} from "@/components/itinerary/StickyNoteSheet";
import { cn, formatYen } from "@/lib/utils";
import type { Comment, RoadmapItem } from "@/types";

type RoadmapListProps = {
  items: RoadmapItem[];
  /** 予定の追加・変更・削除。親が金額合計を再計算するために使う */
  onItemsChange: (items: RoadmapItem[]) => void;
  dayId: string;
  dayNumber: number;
  comments: Comment[];
  authorId: string;
  authorName: string;
  canComment: boolean;
  canEdit: boolean;
  commentHandlers?: CommentHandlers;
  /** 見開きのどちら側に置くか。傾きの向きに使う */
  side?: "left" | "right";
};

/** 1日の予定は8件まで（追加ボタン・Enter 行追加の両方） */
const MAX_ROADMAP_ITEMS = 8;

function createEmptyItem(dayId: string): RoadmapItem {
  return {
    id: `roadmap-local-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    dayId,
    startsAt: "09:00",
    title: "",
  };
}

/**
 * 付箋シート上の縦タイムライン予定リスト。
 * Enter で行追加、空欄 Backspace で削除。編集・コメントは既存どおり。
 */
export function RoadmapList({
  items,
  onItemsChange,
  dayId,
  dayNumber,
  comments,
  authorId,
  authorName,
  canComment,
  canEdit,
  commentHandlers,
  side = "right",
}: RoadmapListProps) {
  const stickyVariant = stickyVariantForDay(dayNumber, STICKY_SLOT.roadmap);
  const pose = stickyPoseForDay(dayNumber, STICKY_SLOT.roadmap, side);
  const canAdd = canEdit && items.length < MAX_ROADMAP_ITEMS;

  const updateItem = (id: string, patch: Partial<RoadmapItem>) => {
    onItemsChange(
      items.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
  };

  const addItem = () => {
    if (items.length >= MAX_ROADMAP_ITEMS) return;
    onItemsChange([...items, createEmptyItem(dayId)]);
  };

  const removeItem = (id: string) => {
    onItemsChange(items.filter((item) => item.id !== id));
  };

  const handleTitleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number,
    item: RoadmapItem,
  ) => {
    if (!canEdit) return;

    // IME確定の Enter では新規行を作らない
    if (e.key === "Enter" && !e.nativeEvent.isComposing) {
      e.preventDefault();
      if (items.length >= MAX_ROADMAP_ITEMS) return;
      const next = createEmptyItem(dayId);
      const copy = [...items];
      copy.splice(index + 1, 0, next);
      onItemsChange(copy);
      window.setTimeout(() => {
        const el = document.querySelector<HTMLInputElement>(
          `[data-roadmap-title="${next.id}"]`,
        );
        el?.focus();
      }, 0);
      return;
    }

    if (e.key === "Backspace" && item.title === "" && items.length > 0) {
      e.preventDefault();
      const prevId = items[index - 1]?.id;
      removeItem(item.id);
      if (prevId) {
        window.setTimeout(() => {
          const el = document.querySelector<HTMLInputElement>(
            `[data-roadmap-title="${prevId}"]`,
          );
          el?.focus();
        }, 0);
      }
    }
  };

  return (
    <StickyNoteSheet pose={pose} variant={stickyVariant}>
      <p className="mb-3 font-heading text-sm font-bold tracking-wide text-ink sm:text-base">
        予定
      </p>

      {items.length === 0 && !canEdit && (
        <p className="px-1 py-2 text-sm text-ink-muted">予定がありません</p>
      )}

      <ol className="relative space-y-0">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={item.id} className="relative flex gap-2.5 pb-4 last:pb-0 sm:gap-3 sm:pb-5">
              {/* 時刻列 */}
              <div className="w-12 shrink-0 pt-0.5 text-right sm:w-14">
                {canEdit ? (
                  <EditableText
                    variant="time"
                    type="text"
                    value={item.startsAt}
                    onChange={(v) => updateItem(item.id, { startsAt: v })}
                    className="w-full text-right text-xs sm:text-sm"
                    placeholder="09:00"
                    aria-label="開始時刻"
                  />
                ) : (
                  <time
                    dateTime={item.startsAt}
                    className="block text-xs font-medium tabular-nums text-ink-muted sm:text-sm"
                  >
                    {item.startsAt}
                  </time>
                )}
              </div>

              {/* 丸＋縦点線（コメント線の目印） */}
              <div className="relative flex w-3.5 shrink-0 flex-col items-center sm:w-4">
                <span
                  data-comment-line-anchor={`roadmap_item:${item.id}:`}
                  className="mt-1.5 z-10 h-2 w-2 rounded-full border-2 border-[var(--sticky-ink)] bg-[var(--sticky-bg)] sm:h-2.5 sm:w-2.5"
                  aria-hidden
                />
                {!isLast && (
                  <span
                    className="timeline-rail absolute top-3.5 bottom-0 w-px sm:top-4"
                    aria-hidden
                  />
                )}
              </div>

              {/* 内容（箇条書き風） */}
              <div className="min-w-0 flex-1 pt-0">
                <CommentTrigger
                  comments={comments}
                  targetType="roadmap_item"
                  targetId={item.id}
                  authorId={authorId}
                  authorName={authorName}
                  canComment={canComment}
                  commentHandlers={commentHandlers}
                  align="center"
                >
                  <div className="flex min-w-0 gap-2">
                    <span className="mt-0.5 shrink-0 text-sm text-ink-muted" aria-hidden>
                      •
                    </span>
                    <div className="min-w-0 flex-1 space-y-0.5">
                      {canEdit ? (
                        <>
                          <EditableText
                            data-roadmap-title={item.id}
                            variant="body"
                            value={item.title}
                            onChange={(v) => updateItem(item.id, { title: v })}
                            onKeyDown={(e) => handleTitleKeyDown(e, index, item)}
                            placeholder="予定を入力"
                            aria-label="予定の内容"
                            className="w-full"
                          />
                          <div className="flex max-w-[10rem] items-baseline">
                            <span
                              className="shrink-0 text-sm text-ink-muted"
                              aria-hidden
                            >
                              ￥
                            </span>
                            <EditableText
                              variant="muted"
                              type="text"
                              inputMode="numeric"
                              value={
                                item.amount != null && item.amount > 0
                                  ? item.amount.toLocaleString("ja-JP")
                                  : ""
                              }
                              onChange={(v) => {
                                const digits = v.replace(/[^\d]/g, "");
                                updateItem(item.id, {
                                  amount: digits ? Number(digits) : undefined,
                                });
                              }}
                              placeholder="金額"
                              aria-label="金額"
                              className="min-w-0 flex-1"
                            />
                          </div>
                        </>
                      ) : (
                        <>
                          <p className="leading-relaxed text-ink">{item.title}</p>
                          {item.amount != null && item.amount > 0 && (
                            <p className="text-xs text-ink-muted">
                              {formatYen(item.amount)}
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </CommentTrigger>
              </div>
            </li>
          );
        })}
      </ol>

      {canAdd && (
        <div className={cn("mt-2 pl-[3.25rem] sm:pl-[3.75rem]")}>
          <AddBlockButton
            label="予定を追加"
            onClick={addItem}
            className="text-ink-muted/80 hover:bg-white/5 hover:text-ink-muted"
          />
        </div>
      )}
    </StickyNoteSheet>
  );
}
