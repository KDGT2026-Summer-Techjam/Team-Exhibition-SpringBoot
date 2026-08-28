"use client";

import { cn } from "@/lib/utils";
import { useId, useState, type InputHTMLAttributes } from "react";

type PasswordFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label: string;
  error?: string;
};

export function PasswordField({ label, error, className, id, ...props }: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  const generatedId = useId();
  const fieldId = id ?? generatedId;

  return (
    <div className="space-y-1">
      <label htmlFor={fieldId} className="block text-sm text-ink-muted">
        {label}
      </label>
      <div className="relative">
        <input
          id={fieldId}
          type={visible ? "text" : "password"}
          className={cn(
            "w-full border-b border-line bg-transparent px-1 py-2 pr-16 text-ink outline-none",
            "focus:border-accent",
            className,
          )}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-0 top-1/2 -translate-y-1/2 text-xs text-ink-muted hover:text-ink"
        >
          {visible ? "隠す" : "表示"}
        </button>
      </div>
      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  );
}
