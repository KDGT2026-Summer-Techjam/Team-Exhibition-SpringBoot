import { cn, hoverPop, hoverTransition } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "md" | "fab";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
};

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-accent text-paper hover:bg-accent-hover border border-accent",
  secondary:
    "bg-paper-deep text-ink border border-line hover:bg-paper hover:border-accent",
  ghost:
    "bg-transparent text-ink border border-transparent hover:border-line hover:bg-paper/70",
  danger:
    "bg-paper-deep text-danger border border-danger/40 hover:bg-danger/10",
};

const sizeStyles: Record<ButtonSize, string> = {
  md: "rounded-md px-4 py-2 text-sm",
  // しおり作成・設定・写真追加など右下／右上の円形ボタン。行高でアイコンが上下にずれないようにする
  fab: "h-14 w-14 rounded-full p-0 text-2xl leading-none shadow-lg",
};

/** Link などボタン以外にも同じ見た目を付ける */
export function buttonClassName({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
} = {}) {
  return cn(
    "inline-flex items-center justify-center font-medium disabled:opacity-50",
    hoverTransition,
    hoverPop,
    variantStyles[variant],
    sizeStyles[size],
    fullWidth && "w-full",
    className,
  );
}

export function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={buttonClassName({ variant, size, fullWidth, className })}
      {...props}
    >
      {children}
    </button>
  );
}
