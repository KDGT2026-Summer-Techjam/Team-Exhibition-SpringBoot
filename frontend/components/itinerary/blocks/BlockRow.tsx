"use client";

import { cn } from "@/lib/utils";

type BlockRowProps = {
  children: React.ReactNode;
  /** 左側の＋など。ホバー時のみ表示 */
  handle?: React.ReactNode;
  className?: string;
  onClick?: () => void;
};

/** Notion風の1行。枠付きカードにせず、ホバーで操作を出す */
export function BlockRow({ children, handle, className, onClick }: BlockRowProps) {
  return (
    <div
      className={cn(
        "group relative flex items-start gap-1 rounded-md py-0.5 pl-0",
        className,
      )}
      onClick={onClick}
    >
      <div
        className={cn(
          "flex w-7 shrink-0 items-center justify-center pt-1",
          "opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100",
        )}
      >
        {handle}
      </div>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

type AddBlockButtonProps = {
  label?: string;
  onClick: () => void;
  className?: string;
};

/** 末尾／行間の薄い追加導線 */
export function AddBlockButton({
  label = "ブロックを追加",
  onClick,
  className,
}: AddBlockButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "mt-1 flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm text-ink-muted/70",
        "transition-colors hover:bg-paper-deep/50 hover:text-ink-muted",
        className,
      )}
    >
      <span className="flex h-5 w-5 items-center justify-center rounded text-base leading-none">
        ＋
      </span>
      <span>{label}</span>
    </button>
  );
}
