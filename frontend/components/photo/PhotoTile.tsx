"use client";

import { HeartLikeButton } from "@/components/photo/HeartLikeButton";
import { cn } from "@/lib/utils";
import type { Photo } from "@/types";
import Image from "next/image";

type PhotoTileProps = {
  photo: Photo;
  onClick: () => void;
  onLike: () => void;
};

/** 一覧用タイル。左下に投稿者名、右下にハート */
export function PhotoTile({ photo, onClick, onLike }: PhotoTileProps) {
  const atLikeCap = photo.likeCount >= 999;

  return (
    <div
      className={cn(
        "group relative z-0 origin-center",
        // ホバーで表示エリアだけ少し大きくする（画像の中身はズームしない）
        "transition-transform duration-200 ease-out hover:z-20 hover:scale-[1.04]",
      )}
    >
      {/* 画像だけ角丸クリップ。ハートの散りはタイル外にはみ出してよい */}
      <div className="relative aspect-square overflow-hidden rounded-md border border-line bg-black">
        <button
          type="button"
          onClick={onClick}
          className="absolute inset-0 z-0"
          aria-label={`${photo.userName}の写真を開く`}
        >
          {photo.isDeleted ? (
            <span className="flex h-full w-full items-center justify-center bg-black text-sm text-ink-muted">
              削除済み
            </span>
          ) : (
            <Image
              src={photo.imageUrl}
              alt={`${photo.userName}の写真`}
              fill
              className="object-cover"
              unoptimized
            />
          )}
        </button>

        {/* 左下: 投稿者名（常時表示） */}
        <span className="pointer-events-none absolute bottom-2.5 left-2.5 z-10 max-w-[58%] truncate rounded bg-ink/55 px-2 py-1 font-heading text-sm text-paper">
          {photo.userName}
        </span>
      </div>

      {!photo.isDeleted && (
        <HeartLikeButton
          likeCount={photo.likeCount}
          disabled={atLikeCap}
          onLike={onLike}
        />
      )}
    </div>
  );
}
