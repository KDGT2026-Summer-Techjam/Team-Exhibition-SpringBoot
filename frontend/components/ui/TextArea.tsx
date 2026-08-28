import { cn } from "@/lib/utils";
import type { TextareaHTMLAttributes } from "react";

type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  error?: string;
  lined?: boolean;
};

export function TextArea({
  label,
  error,
  lined = false,
  className,
  id,
  rows = 4,
  ...props
}: TextAreaProps) {
  const fieldId = id ?? label;

  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={fieldId} className="block text-sm text-ink-muted">
          {label}
        </label>
      )}
      <textarea
        id={fieldId}
        rows={rows}
        className={cn(
          "w-full resize-y border border-line/60 bg-transparent px-2 py-1 text-ink outline-none",
          "focus:border-accent",
          lined && "notebook-lined",
          className,
        )}
        style={lined ? { lineHeight: "var(--line-height)" } : undefined}
        {...props}
      />
      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  );
}
