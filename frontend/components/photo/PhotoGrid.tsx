"use client";

import { PhotoDetail } from "@/components/photo/PhotoDetail";
import { PhotoTile } from "@/components/photo/PhotoTile";
import type { Comment, Photo } from "@/types";
import { AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

type PhotoGridProps = {
  photos: Photo[];
  comments: Comment[];
  currentUserId: string;
  currentUserName: string;
  canComment: boolean;
  isOwner: boolean;
  onUpdatePhoto: (photo: Photo) => void;
};

export function PhotoGrid({
  photos,
  comments,
  currentUserId,
  currentUserName,
  canComment,
  isOwner,
  onUpdatePhoto,
}: PhotoGridProps) {
  const [selected, setSelected] = useState<Photo | null>(null);

  // いいね後に詳細モーダルの表示を同期
  useEffect(() => {
    if (!selected) return;
    const updated = photos.find((p) => p.id === selected.id);
    if (!updated) {
      setSelected(null);
      return;
    }
    if (
      updated.imageUrl !== selected.imageUrl ||
      updated.likeCount !== selected.likeCount ||
      updated.isDeleted !== selected.isDeleted
    ) {
      setSelected(updated);
    }
  }, [photos, selected]);

  return (
    <>
      <div className="grid grid-cols-3 gap-2 overflow-visible sm:gap-3">
        {photos.map((photo) => (
          <PhotoTile
            key={photo.id}
            photo={photo}
            onClick={() => setSelected(photo)}
            onLike={() =>
              onUpdatePhoto({
                ...photo,
                likeCount: Math.min(photo.likeCount + 1, 999),
              })
            }
          />
        ))}
      </div>
      <AnimatePresence>
        {selected && (
          <PhotoDetail
            key={selected.id}
            photo={selected}
            comments={comments.filter((c) => c.targetId === selected.id)}
            currentUserId={currentUserId}
            currentUserName={currentUserName}
            canComment={canComment}
            canManage={isOwner || selected.userId === currentUserId}
            onClose={() => setSelected(null)}
            onUpdate={(photo) => {
              onUpdatePhoto(photo);
              setSelected(photo.isDeleted ? null : photo);
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}
