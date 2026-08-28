"use client";

import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { useState } from "react";

type LikeButtonProps = {
  likeCount: number;
  disabled?: boolean;
  onLike: () => void;
};

export function LikeButton({ likeCount, disabled = false, onLike }: LikeButtonProps) {
  const [pressed, setPressed] = useState(false);

  return (
    <div className="mt-2 flex items-center gap-2">
      <Button
        variant="secondary"
        disabled={disabled}
        onClick={() => {
          if (disabled) return;
          setPressed(true);
          onLike();
        }}
        className={cn(
          "px-3 py-1 text-sm",
          pressed && "border-accent bg-accent/10 text-accent",
        )}
      >
        ♥ いいね
      </Button>
      <span className="text-sm text-ink-muted">{likeCount} / 999</span>
    </div>
  );
}
