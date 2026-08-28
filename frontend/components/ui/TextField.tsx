"use client";

import { cn } from "@/lib/utils";
import { useId, type InputHTMLAttributes } from "react";

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export function TextField({ label, error, className, id, ...props }: TextFieldProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;

  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={fieldId} className="block text-sm text-ink-muted">
          {label}
        </label>
      )}
      <input
        id={fieldId}
        className={cn(
          "w-full border-b border-line bg-transparent px-1 py-2 text-ink outline-none",
          "focus:border-accent",
          className,
        )}
        {...props}
      />
      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  );
}
