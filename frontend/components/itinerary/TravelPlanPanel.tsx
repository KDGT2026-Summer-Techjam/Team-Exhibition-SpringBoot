"use client";

import { EditableText } from "@/components/itinerary/blocks/EditableText";
import {
  CommentTrigger,
  type CommentHandlers,
} from "@/components/itinerary/CommentTrigger";
import { CostSummary } from "@/components/itinerary/CostSummary";
import { PackingChecklist } from "@/components/itinerary/PackingChecklist";
import { PromisesSection } from "@/components/itinerary/PromisesSection";
import { formatDateRange } from "@/lib/utils";
import type { Comment, ItineraryDetail, RoadmapItem } from "@/types";
import { useState } from "react";

type TravelPlanSharedProps = {
  itinerary: ItineraryDetail;
  roadmapItems: RoadmapItem[];
  comments: Comment[];
  authorId: string;
  authorName: string;
  canComment: boolean;
  canEdit: boolean;
  onTitleBlur?: (title: string) => void;
  onDescriptionBlur?: (description: string) => void;
  commentHandlers?: CommentHandlers;
};

/** 旅行計画の左ページ: 表紙＋お約束＋合算 */
export function TravelPlanCover({
  itinerary,
  roadmapItems,
  comments,
  authorId,
  authorName,
  canComment,
  canEdit,
  onTitleBlur,
  onDescriptionBlur,
  commentHandlers,
}: TravelPlanSharedProps) {
  const [title, setTitle] = useState(itinerary.title);
  const [description, setDescription] = useState(itinerary.description ?? "");
  const showPromises = Boolean(itinerary.promises?.trim() || canEdit);

  return (
    <div className="relative flex flex-col px-1 py-4 sm:px-2 sm:py-6">
      <div className="mx-auto flex w-full max-w-xl flex-col items-center text-center">
        <CommentTrigger
          comments={comments}
          targetType="shiori"
          targetId={itinerary.id}
          targetField="period"
          authorId={authorId}
          authorName={authorName}
          canComment={canComment}
          commentHandlers={commentHandlers}
          align="center"
          className="mb-5 w-full"
        >
          <p className="section-hand-label whitespace-nowrap text-center text-ink-muted">
            旅行計画
            {"  "}
            {formatDateRange(itinerary.startDate, itinerary.endDate)}
          </p>
        </CommentTrigger>

        <CommentTrigger
          comments={comments}
          targetType="shiori"
          targetId={itinerary.id}
          targetField="title"
          authorId={authorId}
          authorName={authorName}
          canComment={canComment}
          commentHandlers={commentHandlers}
          align="center"
          className="w-full"
        >
          {canEdit ? (
            <EditableText
              variant="title"
              value={title}
              onChange={setTitle}
              onBlur={() => onTitleBlur?.(title)}
              placeholder="しおりのタイトル"
              aria-label="タイトル"
              className="w-full text-center text-3xl sm:text-4xl"
            />
          ) : (
            <h2 className="text-center font-heading text-3xl font-bold leading-tight tracking-wide text-ink sm:text-4xl">
              {title}
            </h2>
          )}
        </CommentTrigger>

        <div className="mt-5 w-full">
          <CommentTrigger
            comments={comments}
            targetType="shiori"
            targetId={itinerary.id}
            targetField="description"
            authorId={authorId}
            authorName={authorName}
            canComment={canComment}
            commentHandlers={commentHandlers}
            align="center"
            className="w-full"
          >
            {canEdit ? (
              <EditableText
                multiline
                variant="muted"
                value={description}
                onChange={setDescription}
                onBlur={() => onDescriptionBlur?.(description)}
                placeholder="旅のテーマや一言メモ…"
                aria-label="説明"
                className="w-full text-center text-base sm:text-lg"
              />
            ) : (
              description.trim() && (
                <p className="text-center text-base leading-relaxed text-ink-muted sm:text-lg">
                  {description}
                </p>
              )
            )}
          </CommentTrigger>
        </div>
      </div>

      <div className="mt-10 flex w-full flex-col gap-8 self-stretch sm:mt-12">
        {showPromises && (
          <PromisesSection
            promises={itinerary.promises}
            shioriId={itinerary.id}
            comments={comments}
            authorId={authorId}
            authorName={authorName}
            canComment={canComment}
            canEdit={canEdit}
            commentHandlers={commentHandlers}
            className="relative z-10 w-full"
          />
        )}
        <CostSummary
          days={itinerary.days}
          roadmapItems={roadmapItems}
          shioriId={itinerary.id}
          comments={comments}
          authorId={authorId}
          authorName={authorName}
          canComment={canComment}
          commentHandlers={commentHandlers}
        />
      </div>
    </div>
  );
}

/** 旅行計画の右ページ: 持ち物 */
export function TravelPlanExtras({
  itinerary,
  comments,
  authorId,
  authorName,
  canComment,
  canEdit,
  commentHandlers,
}: Omit<TravelPlanSharedProps, "roadmapItems">) {
  return (
    <div className="flex w-full flex-col gap-8 px-1 py-4 sm:px-2 sm:py-6">
      <PackingChecklist
        items={itinerary.packingItems}
        canEdit={canEdit}
        shioriId={itinerary.id}
        comments={comments}
        authorId={authorId}
        authorName={authorName}
        canComment={canComment}
        commentHandlers={commentHandlers}
      />
    </div>
  );
}

type TravelPlanPanelProps = TravelPlanSharedProps & {
  section?: "left" | "right" | "both";
};

export function TravelPlanPanel({
  section = "both",
  ...props
}: TravelPlanPanelProps) {
  if (section === "left") {
    return <TravelPlanCover {...props} />;
  }
  if (section === "right") {
    return <TravelPlanExtras {...props} />;
  }
  return (
    <div className="relative flex flex-col px-1 py-4 sm:px-2 sm:py-6">
      <TravelPlanCover {...props} />
      <div className="mt-12 sm:mt-14">
        <TravelPlanExtras {...props} />
      </div>
    </div>
  );
}
