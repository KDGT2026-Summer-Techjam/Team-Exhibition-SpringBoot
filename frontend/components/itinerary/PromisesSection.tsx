"use client";

import { EditableText } from "@/components/itinerary/blocks/EditableText";
import {
  CommentTrigger,
  type CommentHandlers,
} from "@/components/itinerary/CommentTrigger";
import { StickyNoteSheet } from "@/components/itinerary/StickyNoteSheet";
import { useOptionalItineraryData } from "@/contexts/ItineraryDataContext";
import type { Comment } from "@/types";
import { useState } from "react";

type PromisesSectionProps = {
  promises?: string;
  shioriId: string;
  comments: Comment[];
  authorId: string;
  authorName: string;
  canComment: boolean;
  canEdit: boolean;
  commentHandlers?: CommentHandlers;
  className?: string;
};

/** 旅行計画のお約束（全幅付箋） */
export function PromisesSection({
  promises: initial,
  shioriId,
  comments,
  authorId,
  authorName,
  canComment,
  canEdit,
  commentHandlers,
  className,
}: PromisesSectionProps) {
  const data = useOptionalItineraryData();
  const [promises, setPromises] = useState(initial ?? "");

  if (!promises.trim() && !canEdit) {
    return null;
  }

  return (
    <StickyNoteSheet tilt variant="kraft" className={className}>
      <p className="mb-2.5 text-left font-heading text-base font-bold tracking-wide text-ink sm:text-lg">
        お約束
      </p>
      <CommentTrigger
        comments={comments}
        targetType="shiori"
        targetId={shioriId}
        targetField="promises"
        authorId={authorId}
        authorName={authorName}
        canComment={canComment}
        commentHandlers={commentHandlers}
      >
        {canEdit ? (
          <EditableText
            multiline
            variant="body"
            value={promises}
            onChange={setPromises}
            onBlur={() => void data?.updatePromises(promises)}
            placeholder="みんなで守ること…"
            aria-label="お約束"
            className="w-full text-left text-sm leading-relaxed sm:text-base"
          />
        ) : (
          <p className="whitespace-pre-wrap text-left text-sm leading-relaxed text-ink sm:text-base">
            {promises}
          </p>
        )}
      </CommentTrigger>
    </StickyNoteSheet>
  );
}
