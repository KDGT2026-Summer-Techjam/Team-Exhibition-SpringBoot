"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import { useItineraryUi } from "@/components/itinerary/ItineraryUiProvider";
import { PhotoGrid } from "@/components/photo/PhotoGrid";
import {
  PhotoToolbar,
  PhotoUploadFab,
  filterAndSortPhotos,
  type PhotoSort,
} from "@/components/photo/PhotoToolbar";
import { useItineraryData } from "@/contexts/ItineraryDataContext";
import { ApiError } from "@/lib/api/errors";
import type { ItineraryDetail } from "@/types";
import { useState } from "react";

type PhotosPanelProps = {
  itinerary: ItineraryDetail;
  variant?: "page" | "modal";
};

export function PhotosPanel({
  itinerary,
  variant = "page",
}: PhotosPanelProps) {
  const { user } = useAuth();
  const { canComment, isOwner } = useItineraryUi();
  const {
    photos,
    uploadPhotoForDay,
    removePhoto,
    toggleLike,
    itinerary: loaded,
  } = useItineraryData();

  const [sort, setSort] = useState<PhotoSort>("date");
  const [dayId, setDayId] = useState("");
  const [onlyMine, setOnlyMine] = useState(false);
  const [onlyLiked, setOnlyLiked] = useState(false);
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [photoError, setPhotoError] = useState("");

  const currentUserId = user?.id ?? "";
  const currentUserName = user?.username ?? "";

  const days = itinerary.days.map((d) => ({
    id: d.id,
    dayNumber: d.dayNumber,
    tripDate: d.tripDate,
  }));

  const visible = filterAndSortPhotos(photos, {
    sort,
    dayId,
    onlyMine,
    onlyLiked,
    includeDeleted,
    currentUserId,
  });

  const handleUpload = async (file: File, targetDayId: string) => {
    setUploadError("");
    try {
      await uploadPhotoForDay(targetDayId, file);
    } catch (err) {
      setUploadError(
        err instanceof ApiError ? err.message : "アップロードに失敗しました",
      );
    }
  };

  const handleUpdatePhoto = async (updated: import("@/types").Photo) => {
    const original = photos.find((p) => p.id === updated.id);
    if (!original) return;

    setPhotoError("");

    if (updated.isDeleted && !original.isDeleted) {
      try {
        await removePhoto(updated.id);
      } catch (err) {
        setPhotoError(
          err instanceof ApiError ? err.message : "削除に失敗しました",
        );
      }
      return;
    }

    if (updated.likeCount !== original.likeCount) {
      if (original.likeCount >= 999) {
        setPhotoError("いいねの上限（999）に達しています");
        return;
      }
      try {
        await toggleLike(updated.id);
      } catch (err) {
        setPhotoError(
          err instanceof ApiError ? err.message : "いいねに失敗しました",
        );
      }
    }
  };

  const body = (
    <div className="flex min-h-0 flex-1 flex-col">
      {variant === "page" && (
        <h2 className="section-hand-label mb-6 shrink-0 text-ink-muted">
          写真一覧
        </h2>
      )}
      <div className="shrink-0">
        <PhotoToolbar
          sort={sort}
          dayId={dayId}
          onlyMine={onlyMine}
          onlyLiked={onlyLiked}
          includeDeleted={includeDeleted}
          days={days}
          onSortChange={setSort}
          onDayChange={setDayId}
          onOnlyMineChange={setOnlyMine}
          onOnlyLikedChange={setOnlyLiked}
          onIncludeDeletedChange={setIncludeDeleted}
          uploadError={uploadError}
        />
      </div>
      {photoError && (
        <p className="mt-2 text-sm text-danger" role="alert">
          {photoError}
        </p>
      )}
      <div className="mt-4 min-h-0 flex-1 overflow-y-auto pr-1 pb-16">
        {visible.length === 0 ? (
          <p className="py-8 text-sm text-ink-muted">写真がありません</p>
        ) : (
          <PhotoGrid
            photos={visible}
            comments={loaded?.comments ?? []}
            currentUserId={currentUserId}
            currentUserName={currentUserName}
            canComment={canComment}
            isOwner={isOwner}
            onUpdatePhoto={(photo) => {
              void handleUpdatePhoto(photo);
            }}
          />
        )}
      </div>
      <PhotoUploadFab days={days} dayId={dayId} onUpload={handleUpload} />
    </div>
  );

  if (variant === "modal") {
    return (
      <div className="relative flex h-full min-h-0 flex-1 flex-col">
        {body}
      </div>
    );
  }

  return (
    <div className="relative shiori-surface h-full min-h-[75vh] border border-line">
      <div className="shiori-content flex h-full min-h-0 flex-col">{body}</div>
    </div>
  );
}
