"use client";

import { NameAvatar } from "@/components/itinerary/NameAvatar";
import { clampCommentBody, COMMENT_MAX_LENGTH } from "@/lib/comment";
import { cn } from "@/lib/utils";
import type { Comment } from "@/types";

type CommentBubbleProps = {
  comment: Comment;
  /** 自分のコメントをインライン編集できるか */
  editable?: boolean;
  onBodyChange?: (nextBody: string) => void;
  onBodyClear?: () => void;
  /** 順に出すアニメーション用の遅延（ms） */
  staggerMs?: number;
  /** しおり内容上に載せるときのコンパクト表示 */
  compact?: boolean;
  /**
   * 散らばりオーバーレイ上など、背後が場所によって明暗変わるとき。
   * true のとき名前を白プレートにして可読性を確保する。
   */
  onDark?: boolean;
  /** ポンッと弾む出現アニメ */
  pop?: boolean;
  /** false のとき出現CSSを付けない（親の motion で出入を制御するとき） */
  animateEnter?: boolean;
  /**
   * アイコンの位置。引き出し線が向かう側へ置く。
   * left ならしっぽ左（箱は右）、right ならしっぽ右（箱は左）。
   */
  avatarSide?: "left" | "right";
  className?: string;
};

/** 日本語（全角）向けに入力幅を em で決める。HTML size は半角基準で足りない */
function bodyWidthEm(body: string): string {
  const len = Array.from(body).length;
  // +2 で太字の余白とカーニング分を確保
  return `${Math.min(Math.max(len + 2, 4), COMMENT_MAX_LENGTH + 2)}em`;
}

/**
 * 名前先頭アバター＋吹き出しコメント。
 * 文字量に合わせて幅が伸び、最大幅だけ上限を持つ。
 */
export function CommentBubble({
  comment,
  editable = false,
  onBodyChange,
  onBodyClear,
  staggerMs = 0,
  compact = false,
  onDark = false,
  pop = false,
  animateEnter = true,
  avatarSide = "left",
  className,
}: CommentBubbleProps) {
  const iconOnRight = avatarSide === "right";

  return (
    <div
      data-comment-ui
      data-avatar-side={avatarSide}
      className={cn(
        // アバター分を足しても20文字程度が収まる幅。親が狭いときは親幅まで縮める
        "font-noto flex w-fit max-w-[min(20rem,100%)] items-end gap-2.5 sm:max-w-[min(22rem,100%)]",
        iconOnRight && "flex-row-reverse",
        animateEnter && (pop ? "comment-bubble-pop" : "comment-bubble-enter"),
        className,
      )}
      style={animateEnter ? { animationDelay: `${staggerMs}ms` } : undefined}
    >
      <NameAvatar name={comment.authorName} className="relative z-10" />
      <div className="relative z-10 min-w-0 max-w-full">
        <p
          className={cn(
            // 吹き出しハロ（影）より手前に置き、影の裏に沈まないようにする
            "relative z-20 mb-0.5 max-w-full truncate text-xs font-bold text-ink",
            onDark
              ? // 机・付箋・黒帯など何の上でも読めるネームプレート
                "w-fit rounded-md border border-black/20 bg-white px-1.5 py-0.5 shadow-none"
              : "px-1",
            iconOnRight && "ml-auto",
          )}
        >
          {comment.authorName}
        </p>

        {/* ぼかしは背面レイヤー。本体は常に不透明な白 */}
        <div className={cn("relative z-0 w-fit max-w-full", iconOnRight && "ml-auto")}>
          <span
            className="comment-box-halo pointer-events-none absolute -inset-x-2 -bottom-2 top-1 rounded-2xl"
            aria-hidden
          />
          <div
            className={cn(
              "comment-box-face relative z-[1] w-fit max-w-full overflow-visible rounded-2xl border border-black px-3 py-2",
              iconOnRight ? "rounded-br-md" : "rounded-bl-md",
              compact && "py-1.5",
            )}
          >
            {/* アイコン側へ向くしっぽ。右は上＋右辺、左は下＋左辺 */}
            <span
              className={cn(
                "comment-box-tail",
                iconOnRight ? "comment-box-tail-right" : "comment-box-tail-left",
              )}
              aria-hidden
            />
            <span
              className={cn(
                "comment-box-tail-seam",
                iconOnRight
                  ? "comment-box-tail-seam-right"
                  : "comment-box-tail-seam-left",
              )}
              aria-hidden
            />
            {editable ? (
              <input
                defaultValue={comment.body}
                maxLength={COMMENT_MAX_LENGTH}
                className={cn(
                  "comment-edit-input relative z-[1] font-bold text-ink outline-none placeholder:text-ink-muted",
                  compact ? "text-xs" : "text-sm",
                )}
                style={{
                  width: bodyWidthEm(comment.body),
                  maxWidth: "100%",
                }}
                aria-label="コメントを編集"
                onChange={(e) => {
                  e.currentTarget.value = clampCommentBody(
                    e.currentTarget.value,
                  );
                  e.currentTarget.style.width = bodyWidthEm(
                    e.currentTarget.value,
                  );
                  e.currentTarget.style.maxWidth = "100%";
                }}
                onBlur={(e) => {
                  const next = clampCommentBody(e.target.value).trim();
                  if (!next) {
                    onBodyClear?.();
                    return;
                  }
                  if (next !== comment.body) {
                    onBodyChange?.(next);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.nativeEvent.isComposing) {
                    e.preventDefault();
                    e.currentTarget.blur();
                  }
                }}
              />
            ) : (
              <p
                className={cn(
                  "relative break-words font-bold leading-relaxed text-ink",
                  compact ? "text-xs" : "text-sm",
                )}
              >
                {comment.body}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
