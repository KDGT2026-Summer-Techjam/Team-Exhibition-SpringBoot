"use client";

import {
  CommentTrigger,
  type CommentHandlers,
} from "@/components/itinerary/CommentTrigger";
import {
  photoSheetWidthClass,
  StickyNoteSheet,
  STICKY_SLOT,
  stickyPoseForDay,
  stickyVariantForDay,
} from "@/components/itinerary/StickyNoteSheet";
import { Modal } from "@/components/ui/Modal";
import { cn, hoverPop, hoverTransition } from "@/lib/utils";
import type { Comment, Photo, ShioriDay } from "@/types";
import Image from "next/image";
import { useMemo, useState } from "react";

type RepresentativePhotoProps = {
  day: ShioriDay;
  photos: Photo[];
  comments: Comment[];
  authorId: string;
  authorName: string;
  canComment: boolean;
  isOwner: boolean;
  pickerOpen: boolean;
  onPickerOpenChange: (open: boolean) => void;
  onSelectPhoto?: (photoId: string) => void;
  commentHandlers?: CommentHandlers;
  /** 見開きのどちら側に置くか。傾きの向きと寄せに使う */
  side?: "left" | "right";
};

/** 日ごとの色付箋に載せた代表写真。作成者は＋からモーダルで選ぶ */
export function RepresentativePhoto({
  day,
  photos,
  comments,
  authorId,
  authorName,
  canComment,
  isOwner,
  pickerOpen,
  onPickerOpenChange,
  onSelectPhoto,
  commentHandlers,
  side = "left",
}: RepresentativePhotoProps) {
  const candidates = useMemo(
    () => photos.filter((p) => p.dayId === day.id && !p.isDeleted),
    [photos, day.id],
  );
  const [selectedId, setSelectedId] = useState(day.representativePhotoId);
  const repPhoto = photos.find((p) => p.id === selectedId);
  const hasPhoto = Boolean(repPhoto && !repPhoto.isDeleted);
  const stickyVariant = stickyVariantForDay(day.dayNumber, STICKY_SLOT.photo);
  const pose = stickyPoseForDay(day.dayNumber, STICKY_SLOT.photo, side);
  const onRight = side === "right";

  const handleSelect = (photoId: string) => {
    setSelectedId(photoId);
    onSelectPhoto?.(photoId);
    onPickerOpenChange(false);
  };

  const pickButton = isOwner ? (
    <button
      type="button"
      onClick={() => onPickerOpenChange(true)}
      className={cn(
        "absolute top-1.5 right-1.5 z-30 flex h-7 w-7 items-center justify-center rounded-full border border-[color-mix(in_srgb,var(--sticky-ink)_35%,transparent)] bg-[var(--sticky-bg)] text-base leading-none text-[var(--sticky-ink)] shadow-sm",
        hoverTransition,
        hoverPop,
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent",
      )}
      aria-label="代表写真を選ぶ"
    >
      ＋
    </button>
  ) : null;

  return (
    <>
      <section
        className={cn(
          "mx-auto w-full max-w-sm lg:max-w-none",
          onRight ? "lg:ml-auto lg:mr-0" : "lg:mx-0",
        )}
      >
        <CommentTrigger
          comments={comments}
          targetType="shiori_day"
          targetId={day.id}
          targetField="representative_photo"
          authorId={authorId}
          authorName={authorName}
          canComment={canComment}
          commentHandlers={commentHandlers}
        >
          <StickyNoteSheet
            variant={stickyVariant}
            pose={pose}
            className={cn(
              "relative mx-auto max-w-sm",
              photoSheetWidthClass(day.dayNumber),
              onRight && "lg:ml-auto",
            )}
          >
            {/* 写真あり／なしでカードサイズが変わらないよう、同じ骨格に揃える */}
            <div className="relative">
              <div
                className={cn(
                  "relative aspect-square w-full overflow-hidden",
                  hasPhoto
                    ? "border border-[color-mix(in_srgb,var(--sticky-ink)_20%,transparent)] bg-[color-mix(in_srgb,var(--sticky-ink)_8%,var(--sticky-bg))]"
                    : "border border-dashed border-[color-mix(in_srgb,var(--sticky-ink)_30%,transparent)]",
                )}
              >
                {hasPhoto ? (
                  <Image
                    src={repPhoto!.imageUrl}
                    alt={`${day.dayNumber}日目の代表写真`}
                    fill
                    className="object-cover"
                    unoptimized
                    priority
                    sizes="(min-width: 1024px) 35vw, 80vw"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-3 text-center">
                    {isOwner && (
                      <button
                        type="button"
                        onClick={() => onPickerOpenChange(true)}
                        className={cn(
                          "relative z-30 flex h-7 w-7 items-center justify-center rounded-full border border-[color-mix(in_srgb,var(--sticky-ink)_35%,transparent)] bg-[var(--sticky-bg)] text-base leading-none text-[var(--sticky-ink)] shadow-sm",
                          hoverTransition,
                          hoverPop,
                          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent",
                        )}
                        aria-label="代表写真を選ぶ"
                      >
                        ＋
                      </button>
                    )}
                    <p className="text-sm text-ink-muted">写真なし</p>
                  </div>
                )}
                {hasPhoto && pickButton}
              </div>
              <p className="mt-2.5 text-center font-heading text-xs tracking-wide text-ink-muted sm:text-sm">
                Day {day.dayNumber}
              </p>
            </div>
          </StickyNoteSheet>
        </CommentTrigger>
      </section>

      <Modal
        open={pickerOpen}
        title={`${day.dayNumber}日目の代表写真`}
        onClose={() => onPickerOpenChange(false)}
        hideFooter
        contentClassName="max-w-2xl p-6"
      >
        {candidates.length === 0 ? (
          <p className="text-sm text-ink-muted">この日の写真がありません</p>
        ) : (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {candidates.map((photo) => (
              <button
                key={photo.id}
                type="button"
                onClick={() => handleSelect(photo.id)}
                className={cn(
                  "relative aspect-square overflow-hidden border-2 bg-paper transition-colors",
                  "hover:border-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent",
                  selectedId === photo.id ? "border-accent" : "border-line",
                )}
              >
                <Image
                  src={photo.imageUrl}
                  alt={`${photo.userName}の写真`}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </button>
            ))}
          </div>
        )}
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={() => onPickerOpenChange(false)}
            className="text-sm text-ink-muted hover:text-accent"
          >
            閉じる
          </button>
        </div>
      </Modal>
    </>
  );
}
