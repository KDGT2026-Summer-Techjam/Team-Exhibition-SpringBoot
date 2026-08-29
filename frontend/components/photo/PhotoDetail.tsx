"use client";

import { CommentBubble } from "@/components/itinerary/CommentBubble";
import { CommentForm } from "@/components/itinerary/CommentForm";
import { LikeButton } from "@/components/photo/LikeButton";
import type { Comment, Photo } from "@/types";
import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";

type PhotoDetailProps = {
  photo: Photo;
  comments: Comment[];
  currentUserId: string;
  currentUserName: string;
  canComment: boolean;
  canManage: boolean;
  onClose: () => void;
  onUpdate: (photo: Photo) => void;
};

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

export function PhotoDetail({
  photo,
  comments: initialComments,
  currentUserId,
  currentUserName,
  canComment,
  canManage,
  onClose,
  onUpdate,
}: PhotoDetailProps) {
  const [comments, setComments] = useState(initialComments);
  const titleId = useId();
  const previousOverflow = useRef("");
  const reduceMotion = useReducedMotion();
  const duration = reduceMotion ? 0 : 0.22;

  useEffect(() => {
    previousOverflow.current = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow.current;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    // Modal と同様、しおりのリング(z-70)より上。親の AnimatePresence で退出する
    <motion.div
      className="fixed inset-0 z-[80] flex items-center justify-center p-4"
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration, ease: EASE_OUT }}
    >
      <div className="absolute inset-0 bg-ink/40" onClick={onClose} aria-hidden />
      <motion.div
        role="dialog"
        aria-modal
        aria-labelledby={titleId}
        className="relative z-10 flex w-full max-w-6xl max-h-[min(90dvh,52rem)] flex-col gap-5 overflow-hidden rounded-lg border border-line bg-paper-deep p-5 shadow-lg sm:flex-row sm:items-stretch sm:gap-6 sm:p-6"
        initial={reduceMotion ? false : { opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={
          reduceMotion ? undefined : { opacity: 0, scale: 0.96, y: 8 }
        }
        transition={{ duration, ease: EASE_OUT }}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-20 text-lg leading-none text-ink-muted hover:text-ink"
          aria-label="閉じる"
        >
          ×
        </button>
        <div className="relative mx-auto aspect-square w-full max-w-[min(100%,18rem)] shrink-0 overflow-hidden rounded-md bg-black sm:mx-0 sm:max-w-none sm:w-[min(48%,32rem)]">
          {photo.isDeleted ? (
            <div className="flex h-full items-center justify-center text-ink-muted">
              削除済み
            </div>
          ) : (
            <Image
              src={photo.imageUrl}
              alt="写真詳細"
              fill
              className="object-cover"
              unoptimized
            />
          )}
        </div>
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <p id={titleId} className="pr-8 text-sm text-ink-muted">
            {photo.dayNumber}日目 · {photo.userName}
          </p>
          <LikeButton
            likeCount={photo.likeCount}
            disabled={photo.likeCount >= 999}
            onLike={() =>
              onUpdate({
                ...photo,
                likeCount: Math.min(photo.likeCount + 1, 999),
              })
            }
          />
          <div className="mt-4 flex min-h-0 flex-1 flex-col items-stretch gap-3 overflow-y-auto pb-3 pr-1">
            {canComment &&
              [...comments]
                .sort(
                  (a, b) =>
                    new Date(a.createdAt).getTime() -
                    new Date(b.createdAt).getTime(),
                )
                .map((c, index) => (
                  <CommentBubble
                    key={c.id}
                    comment={c}
                    staggerMs={index * 40}
                    editable={c.authorId === currentUserId}
                    onBodyChange={(next) =>
                      setComments((prev) =>
                        prev.map((item) =>
                          item.id === c.id ? { ...item, body: next } : item,
                        ),
                      )
                    }
                    onBodyClear={() =>
                      setComments((prev) =>
                        prev.filter((item) => item.id !== c.id),
                      )
                    }
                  />
                ))}
          </div>
          {canComment && (
            <div className="mt-3 shrink-0 border-t border-line/50 pt-3">
              <CommentForm
                onSubmit={(body) =>
                  setComments((prev) => [
                    ...prev,
                    {
                      id: `local-${Date.now()}`,
                      authorId: currentUserId,
                      authorName: currentUserName,
                      body,
                      targetType: "photo",
                      targetId: photo.id,
                      createdAt: new Date().toISOString(),
                    },
                  ])
                }
              />
            </div>
          )}
          {canManage && !photo.isDeleted && (
            <div className="mt-3 flex shrink-0 gap-3 text-xs">
              <button
                type="button"
                className="text-danger hover:underline"
                onClick={() =>
                  onUpdate({ ...photo, isDeleted: true, imageUrl: "" })
                }
              >
                削除
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
