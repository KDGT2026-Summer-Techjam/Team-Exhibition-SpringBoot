"use client";

import { cn } from "@/lib/utils";

type ToggleTone = "accent" | "warm";

type ToggleProps = {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  /** stacked: 既存フォーム用 / inline: 設定バー用 */
  layout?: "stacked" | "inline";
  tone?: ToggleTone;
  /** ラベル非表示時のアクセシビリティ用 */
  ariaLabel?: string;
};

const onToneClass: Record<ToggleTone, string> = {
  accent: "bg-accent",
  warm: "bg-accent-hover",
};

export function Toggle({
  label,
  checked,
  onChange,
  disabled,
  layout = "stacked",
  tone = "accent",
  ariaLabel,
}: ToggleProps) {
  const switchEl = (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel ?? (label || undefined)}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-6 w-11 shrink-0 rounded-full transition-colors",
        checked ? onToneClass[tone] : "bg-line",
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 h-5 w-5 rounded-full bg-paper shadow-sm transition-transform",
          checked ? "left-[22px]" : "left-0.5",
        )}
      />
    </button>
  );

  if (layout === "inline") {
    return (
      <label
        className={cn(
          "flex cursor-pointer items-center gap-2",
          disabled && "cursor-not-allowed opacity-50",
        )}
      >
        {switchEl}
        {label ? <span className="text-sm text-ink">{label}</span> : null}
      </label>
    );
  }

  return (
    <label
      className={cn(
        "flex cursor-pointer items-center justify-between gap-3 rounded-md border border-line/60 bg-paper-deep/50 px-3 py-2",
        disabled && "cursor-not-allowed opacity-50",
      )}
    >
      {label ? <span className="text-sm text-ink">{label}</span> : null}
      {switchEl}
    </label>
  );
}
