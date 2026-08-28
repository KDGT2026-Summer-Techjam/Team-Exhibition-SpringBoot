"use client";

import { CommentTrigger, type CommentHandlers } from "@/components/itinerary/CommentTrigger";
import { HandDrawnFrame } from "@/components/itinerary/HandDrawnFrame";
import { formatYen, sumRoadmapAmounts } from "@/lib/utils";
import type { Comment, RoadmapItem, ShioriDay } from "@/types";

type CostSummaryProps = {
  days: ShioriDay[];
  roadmapItems: RoadmapItem[];
  shioriId: string;
  comments: Comment[];
  authorId: string;
  authorName: string;
  canComment: boolean;
  commentHandlers?: CommentHandlers;
};

/**
 * 旅行計画ページの合算。
 * 全日のロードマップ金額を日ごとに足し、編集はさせない。
 */
export function CostSummary({
  days,
  roadmapItems,
  shioriId,
  comments,
  authorId,
  authorName,
  canComment,
  commentHandlers,
}: CostSummaryProps) {
  const rows = days.map((day) => ({
    day,
    total: sumRoadmapAmounts(
      roadmapItems.filter((item) => item.dayId === day.id),
    ),
  }));
  const grandTotal = rows.reduce((sum, row) => sum + row.total, 0);

  return (
    <HandDrawnFrame title="合算">
      <CommentTrigger
        comments={comments}
        targetType="shiori"
        targetId={shioriId}
        targetField="cost_summary"
        authorId={authorId}
        authorName={authorName}
        canComment={canComment}
        commentHandlers={commentHandlers}
      >
        <div className="min-w-0 flex-1">
          <ul className="space-y-2.5">
            {rows.map(({ day, total }) => (
              <li
                key={day.id}
                className="flex items-baseline justify-between gap-4 px-1"
              >
                <span className="min-w-0 truncate text-ink">
                  {day.dayNumber}日目
                  {day.title ? (
                    <span className="ml-2 text-ink-muted">{day.title}</span>
                  ) : null}
                </span>
                <span className="shrink-0 tabular-nums text-ink">
                  {formatYen(total)}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex items-baseline justify-between gap-4 border-t border-line px-1 pt-3">
            <span className="font-heading font-bold tracking-wide text-ink">
              合計
            </span>
            <span className="font-heading text-lg font-bold tabular-nums text-ink">
              {formatYen(grandTotal)}
            </span>
          </div>
        </div>
      </CommentTrigger>
    </HandDrawnFrame>
  );
}
