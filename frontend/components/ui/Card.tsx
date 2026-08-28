import { cn, hoverTransition } from "@/lib/utils";

type CardProps = {
  children: React.ReactNode;
  className?: string;
  /** ノート罫線付きの内側 */
  lined?: boolean;
  /** ホバーで少し浮かせる */
  hoverable?: boolean;
};

export function Card({
  children,
  className,
  lined = false,
  hoverable = false,
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-none border border-line bg-paper text-ink",
        lined && "notebook-lined",
        hoverable && cn(hoverTransition, "hover:border-accent"),
        className,
      )}
    >
      {children}
    </div>
  );
}
