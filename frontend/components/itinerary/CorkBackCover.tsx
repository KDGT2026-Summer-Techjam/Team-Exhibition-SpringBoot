import { cn } from "@/lib/utils";

type CorkBackCoverProps = {
  className?: string;
};

/**
 * コルク調ハードカバー。
 * 配置（inset / ずらし）は呼び出し側で指定する。
 */
export function CorkBackCover({ className }: CorkBackCoverProps) {
  return (
    <div
      className={cn("cork-cover pointer-events-none absolute z-0", className)}
      aria-hidden
    />
  );
}
