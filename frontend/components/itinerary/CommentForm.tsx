"use client";

import { Button } from "@/components/ui/Button";
import { clampCommentBody, COMMENT_MAX_LENGTH } from "@/lib/comment";
import { useState } from "react";

type CommentFormProps = {
  onSubmit: (body: string) => void;
  autoFocus?: boolean;
  /** 下部バー向けのコンパクト横並び */
  compact?: boolean;
};

export function CommentForm({
  onSubmit,
  autoFocus = false,
  compact = false,
}: CommentFormProps) {
  const [body, setBody] = useState("");
  const length = Array.from(body).length;

  const handleChange = (value: string) => {
    setBody(clampCommentBody(value));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const next = clampCommentBody(body).trim();
    if (!next) return;
    onSubmit(next);
    setBody("");
  };

  if (compact) {
    return (
      <form
        onSubmit={handleSubmit}
        className="font-noto flex w-full items-center gap-3"
      >
        <input
          type="text"
          value={body}
          maxLength={COMMENT_MAX_LENGTH}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="コメントを入力"
          autoFocus={autoFocus}
          className="min-w-0 flex-1 bg-transparent py-1.5 text-sm font-bold text-ink outline-none placeholder:font-bold placeholder:text-ink-muted"
        />
        <span className="shrink-0 text-[10px] font-bold tabular-nums text-ink-muted">
          {length}/{COMMENT_MAX_LENGTH}
        </span>
        <Button
          type="submit"
          className="shrink-0 rounded-lg px-4 py-1.5 font-noto text-xs !font-bold"
        >
          投稿
        </Button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="font-noto space-y-1">
      <div className="flex gap-2">
        <input
          type="text"
          value={body}
          maxLength={COMMENT_MAX_LENGTH}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="コメントを入力"
          autoFocus={autoFocus}
          className="flex-1 border-b border-line bg-transparent px-1 py-1 text-sm font-bold outline-none focus:border-accent"
        />
        <Button
          type="submit"
          variant="secondary"
          className="px-3 py-1 font-noto text-xs !font-bold"
        >
          投稿
        </Button>
      </div>
      <p className="text-right text-[10px] font-bold tabular-nums text-ink-muted">
        {length}/{COMMENT_MAX_LENGTH}
      </p>
    </form>
  );
}
