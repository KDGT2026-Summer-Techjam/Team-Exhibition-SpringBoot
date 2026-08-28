"use client";

import { AddBlockButton } from "@/components/itinerary/blocks/BlockRow";
import { EditableText } from "@/components/itinerary/blocks/EditableText";
import {
  CommentTrigger,
  type CommentHandlers,
} from "@/components/itinerary/CommentTrigger";
import { HandDrawnFrame } from "@/components/itinerary/HandDrawnFrame";
import {
  packingStripPose,
  packingStripVariant,
  StickyNoteSheet,
} from "@/components/itinerary/StickyNoteSheet";
import { useAuth } from "@/components/auth/AuthProvider";
import { useItineraryData } from "@/contexts/ItineraryDataContext";
import { cn } from "@/lib/utils";
import type { Comment, PackingContribution, PackingItem } from "@/types";
import { useEffect, useState } from "react";

type PackingChecklistProps = {
  items: PackingItem[];
  canEdit: boolean;
  shioriId: string;
  comments: Comment[];
  authorId: string;
  authorName: string;
  canComment: boolean;
  commentHandlers?: CommentHandlers;
};

/** 持ち物の上限件数 */
const MAX_PACKING_ITEMS = 10;

function createEmptyItem(): PackingItem {
  return {
    id: `pack-local-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    label: "",
    requiredCount: 1,
    contributions: [],
  };
}

function sumQuantity(contributions: PackingContribution[]): number {
  return contributions.reduce((sum, c) => sum + c.quantity, 0);
}

function findMine(
  contributions: PackingContribution[],
  userId: string,
): PackingContribution | undefined {
  return contributions.find((c) => c.userId === userId);
}

type PackingRowBodyProps = {
  item: PackingItem;
  canEdit: boolean;
  filled: number;
  mine: PackingContribution | undefined;
  canClick: boolean;
  onCycle: () => void;
  onLabelChange: (label: string) => void;
  onLabelKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onRequiredCountChange: (raw: number) => void;
};

/** チェック・名前・必要数・担当の共通行本体 */
function PackingRowBody({
  item,
  canEdit,
  filled,
  mine,
  canClick,
  onCycle,
  onLabelChange,
  onLabelKeyDown,
  onRequiredCountChange,
}: PackingRowBodyProps) {
  return (
    <div className="flex min-w-0 items-start gap-2.5">
      <button
        type="button"
        role="checkbox"
        aria-checked={!!mine}
        aria-label={
          mine
            ? `${item.label || "持ち物"}（自分×${mine.quantity}。クリックで増やす／上限で解除）`
            : item.label || "持ち物"
        }
        disabled={!canClick}
        onClick={onCycle}
        className={cn(
          // 手書きノートの空枠。塗りつぶさず、担当時だけインク色の ✓
          "mt-1.5 flex h-[1.15rem] w-[1.15rem] shrink-0 items-center justify-center border-[2.5px] border-ink bg-transparent text-[11px] leading-none text-ink transition-opacity",
          "rounded-[1px_3px_2px_1px]",
          !mine && "text-transparent",
          !canClick && "cursor-not-allowed opacity-40",
          canClick && !mine && "hover:border-accent",
        )}
      >
        ✓
      </button>

      <div className="min-w-0 flex-1">
        <div className="flex h-8 min-w-0 items-center gap-1.5">
          {canEdit ? (
            <EditableText
              data-packing-label={item.id}
              variant="body"
              value={item.label}
              onChange={onLabelChange}
              onKeyDown={onLabelKeyDown}
              placeholder="持ち物を入力"
              aria-label="持ち物名"
              className="h-8 min-w-0 flex-1 truncate leading-8"
            />
          ) : (
            <span className="min-w-0 flex-1 truncate px-1 text-base leading-8 text-ink">
              {item.label}
            </span>
          )}

          {/* 必要数はノート風の ×N */}
          <span
            className="flex shrink-0 items-baseline gap-0 font-heading text-sm text-ink-muted"
            title="必要数"
          >
            <span aria-hidden>×</span>
            {canEdit ? (
              <input
                type="number"
                min={1}
                inputMode="numeric"
                aria-label={`${item.label || "持ち物"}の必要数`}
                value={item.requiredCount}
                onChange={(e) => onRequiredCountChange(Number(e.target.value))}
                className="w-7 border-b border-transparent bg-transparent text-center tabular-nums text-ink outline-none hover:border-line focus:border-accent"
              />
            ) : (
              <span className="tabular-nums text-ink">{item.requiredCount}</span>
            )}
          </span>
        </div>

        {item.contributions.length > 0 && (
          <p className="mt-0.5 truncate px-1 text-[11px] leading-relaxed text-ink-muted">
            {item.contributions
              .map((c) => `${c.userName}×${c.quantity}`)
              .join("、")}
            <span className="text-ink-muted/70">
              {" "}
              （{filled}/{item.requiredCount}）
            </span>
          </p>
        )}
      </div>
    </div>
  );
}

/** 旅行計画用の持ち物チェックリスト（手書きチェック＋必要数・担当） */
export function PackingChecklist({
  items: initial,
  canEdit,
  shioriId,
  comments,
  authorId,
  authorName,
  canComment,
  commentHandlers,
}: PackingChecklistProps) {
  const { user } = useAuth();
  const { setPackingItems, cyclePackingContribution } = useItineraryData();
  const [items, setItems] = useState(initial);
  const me = user ?? { id: authorId, username: authorName };
  const canAdd = canEdit && items.length < MAX_PACKING_ITEMS;

  useEffect(() => {
    setItems(initial);
  }, [initial]);

  const persistItems = async (next: PackingItem[]) => {
    setItems(next);
    await setPackingItems(next);
  };

  const updateItem = (id: string, next: PackingItem) => {
    void persistItems(items.map((item) => (item.id === id ? next : item)));
  };

  const updateLabel = (id: string, label: string) => {
    void persistItems(
      items.map((item) => (item.id === id ? { ...item, label } : item)),
    );
  };

  const setRequiredCount = (id: string, raw: number) => {
    const requiredCount = Math.max(1, Math.floor(raw) || 1);
    void persistItems(
      items.map((item) =>
        item.id === id ? { ...item, requiredCount } : item,
      ),
    );
  };

  /**
   * チェッククリックで自分の担当数だけ +1。
   * これ以上増やせない（必要数の上限）ときは、自分の分だけ 0 に戻す。
   */
  const cycleMineQuantity = (item: PackingItem) => {
    if (!item.id.startsWith("pack-local-")) {
      void cyclePackingContribution(item.id);
      return;
    }
    const mine = findMine(item.contributions, me.id);
    const others = sumQuantity(
      item.contributions.filter((c) => c.userId !== me.id),
    );

    if (!mine) {
      // 他人で埋まっているときは新規参加不可
      if (others >= item.requiredCount) return;
      updateItem(item.id, {
        ...item,
        contributions: [
          ...item.contributions,
          { userId: me.id, userName: me.username, quantity: 1 },
        ],
      });
      return;
    }

    const nextQty = mine.quantity + 1;
    if (others + nextQty <= item.requiredCount) {
      updateItem(item.id, {
        ...item,
        contributions: item.contributions.map((c) =>
          c.userId === me.id ? { ...c, quantity: nextQty } : c,
        ),
      });
      return;
    }

    // 上限到達後のクリック → 自分の担当だけ消す（他人は維持）
    updateItem(item.id, {
      ...item,
      contributions: item.contributions.filter((c) => c.userId !== me.id),
    });
  };

  const removeItem = (id: string) => {
    void persistItems(items.filter((item) => item.id !== id));
  };

  const addItem = () => {
    if (items.length >= MAX_PACKING_ITEMS) return;
    void persistItems([...items, createEmptyItem()]);
  };

  // 空欄で Backspace すると行を削除
  const handleLabelKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number,
    item: PackingItem,
  ) => {
    if (!canEdit) return;

    if (e.key === "Backspace" && item.label === "" && items.length > 0) {
      e.preventDefault();
      const prevId = items[index - 1]?.id;
      removeItem(item.id);
      if (prevId) {
        window.setTimeout(() => {
          const el = document.querySelector<HTMLInputElement>(
            `[data-packing-label="${prevId}"]`,
          );
          el?.focus();
        }, 0);
      }
    }
  };

  if (items.length === 0 && !canEdit) {
    return null;
  }

  return (
    <HandDrawnFrame title="持ち物">
      <CommentTrigger
        comments={comments}
        targetType="shiori"
        targetId={shioriId}
        targetField="packing"
        authorId={authorId}
        authorName={authorName}
        canComment={canComment}
        commentHandlers={commentHandlers}
      >
        <div className="min-w-0 flex-1">
          <ul className="grid grid-cols-1 gap-y-3">
            {items.map((item, index) => {
              const filled = sumQuantity(item.contributions);
              const mine = findMine(item.contributions, me.id);
              const isComplete = filled >= item.requiredCount;
              const others = filled - (mine?.quantity ?? 0);
              // 未参加かつ他人で満杯のときだけ押せない。参加中は上限クリックで自分だけリセット可
              const canClick = !!mine || others < item.requiredCount;

              const body = (
                <PackingRowBody
                  item={item}
                  canEdit={canEdit}
                  filled={filled}
                  mine={mine}
                  canClick={canClick}
                  onCycle={() => cycleMineQuantity(item)}
                  onLabelChange={(v) => updateLabel(item.id, v)}
                  onLabelKeyDown={(e) => handleLabelKeyDown(e, index, item)}
                  onRequiredCountChange={(raw) =>
                    setRequiredCount(item.id, raw)
                  }
                />
              );

              return (
                <li key={item.id} className="min-w-0">
                  {isComplete ? (
                    // 必要数達成: 細長い付箋で表示（チェック等の操作は維持）
                    <StickyNoteSheet
                      size="strip"
                      variant={packingStripVariant(index)}
                      pose={packingStripPose(index)}
                      className="w-full"
                    >
                      {body}
                    </StickyNoteSheet>
                  ) : (
                    // 付箋と同じ余白を先に確保し、達成時にボックスが伸びないようにする
                    <div className="packing-strip-slot w-full">{body}</div>
                  )}
                </li>
              );
            })}
          </ul>

          {canAdd && (
            <div className="mt-2">
              <AddBlockButton label="持ち物を追加" onClick={addItem} />
            </div>
          )}
        </div>
      </CommentTrigger>
    </HandDrawnFrame>
  );
}
