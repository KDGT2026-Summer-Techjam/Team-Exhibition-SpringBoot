"use client";

import { EditableText } from "@/components/itinerary/blocks/EditableText";
import {
  CommentTrigger,
  type CommentHandlers,
} from "@/components/itinerary/CommentTrigger";
import { HandDrawnFrame } from "@/components/itinerary/HandDrawnFrame";
import { RoadmapList } from "@/components/itinerary/RoadmapList";
import { notesFrameForDay } from "@/components/itinerary/StickyNoteSheet";
import type { Comment, RoadmapItem, ShioriDay } from "@/types";
import { useState } from "react";

type DayHeadingProps = {
  day: ShioriDay;
  canEdit: boolean;
  onTitleBlur?: (title: string) => void;
};

/** 左ページ先頭に置く日数目＋タイトル（左右入れ替えの対象外） */
export function DayHeading({ day, canEdit, onTitleBlur }: DayHeadingProps) {
  const [title, setTitle] = useState(day.title ?? "");

  return (
    <section>
      <p className="section-hand-label mb-2 text-sm text-ink-muted">
        {day.dayNumber}日目
      </p>
      {canEdit ? (
        <EditableText
          variant="title"
          value={title}
          onChange={setTitle}
          onBlur={() => onTitleBlur?.(title)}
          placeholder="この日のタイトル"
          aria-label="日タイトル"
          className="w-full"
        />
      ) : (
        <h2 className="font-heading text-2xl font-bold tracking-wide text-ink sm:text-3xl">
          {title}
        </h2>
      )}
    </section>
  );
}

/** 偶数日は写真・備考と予定の左右を入れ替える（日数目とタイトルは常に左） */
export function isDayContentMirrored(dayNumber: number): boolean {
  return dayNumber % 2 === 0;
}

type DayPageProps = {
  day: ShioriDay;
  roadmapItems: RoadmapItem[];
  onRoadmapItemsChange: (items: RoadmapItem[]) => void | Promise<void>;
  comments: Comment[];
  authorId: string;
  authorName: string;
  canComment: boolean;
  canEdit: boolean;
  side?: "left" | "right";
  commentHandlers?: CommentHandlers;
};

export function DayPage({
  day,
  roadmapItems,
  onRoadmapItemsChange,
  comments,
  authorId,
  authorName,
  canComment,
  canEdit,
  side = "right",
  commentHandlers,
}: DayPageProps) {
  const dayRoadmap = roadmapItems.filter((item) => item.dayId === day.id);

  const handleItemsChange = (dayItems: RoadmapItem[]) => {
    void onRoadmapItemsChange([
      ...roadmapItems.filter((item) => item.dayId !== day.id),
      ...dayItems,
    ]);
  };

  return (
    <div className={side === "right" ? "pr-1 sm:pr-2" : "pl-1 sm:pl-2"}>
      <RoadmapList
        items={dayRoadmap}
        onItemsChange={handleItemsChange}
        dayId={day.id}
        dayNumber={day.dayNumber}
        comments={comments}
        authorId={authorId}
        authorName={authorName}
        canComment={canComment}
        canEdit={canEdit}
        side={side}
        commentHandlers={commentHandlers}
      />
    </div>
  );
}

type DayNotesProps = {
  day: ShioriDay;
  comments: Comment[];
  authorId: string;
  authorName: string;
  canComment: boolean;
  canEdit: boolean;
  onNotesBlur?: (notes: string) => void;
  side?: "left" | "right";
  commentHandlers?: CommentHandlers;
};

/** 代表写真の下に置く備考 */
export function DayNotes({
  day,
  comments,
  authorId,
  authorName,
  canComment,
  canEdit,
  onNotesBlur,
  side = "left",
  commentHandlers,
}: DayNotesProps) {
  const [notes, setNotes] = useState(day.notes ?? "");
  const frame = notesFrameForDay(day.dayNumber, side);

  return (
    <HandDrawnFrame
      title="備考"
      titleAlign={frame.titleAlign}
      className="origin-center"
      style={{ transform: `rotate(${frame.rotateDeg}deg)` }}
    >
      <CommentTrigger
        comments={comments}
        targetType="shiori_day"
        targetId={day.id}
        targetField="notes"
        authorId={authorId}
        authorName={authorName}
        canComment={canComment}
        commentHandlers={commentHandlers}
      >
        {canEdit ? (
          <EditableText
            multiline
            variant="body"
            value={notes}
            onChange={setNotes}
            onBlur={() => onNotesBlur?.(notes)}
            placeholder="メモを入力…"
            aria-label="備考"
            className="w-full leading-relaxed"
          />
        ) : (
          <p className="whitespace-pre-wrap px-1 text-base leading-relaxed text-ink">
            {notes}
          </p>
        )}
      </CommentTrigger>
    </HandDrawnFrame>
  );
}
