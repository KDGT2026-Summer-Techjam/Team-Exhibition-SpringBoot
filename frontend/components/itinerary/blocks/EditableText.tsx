"use client";

import { cn } from "@/lib/utils";
import {
  useEffect,
  useRef,
  type InputHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";

type SharedProps = {
  value: string;
  onChange: (value: string) => void;
  variant?: "title" | "body" | "muted" | "time";
};

type EditableTextProps = SharedProps &
  Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> & {
    multiline?: false;
  };

type EditableTextAreaProps = SharedProps &
  Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "onChange" | "value"> & {
    multiline: true;
  };

const variantClass = {
  title: "font-heading text-2xl font-bold tracking-wide text-ink sm:text-3xl",
  body: "text-base leading-relaxed text-ink",
  muted: "text-sm text-ink-muted",
  time: "font-medium tabular-nums text-ink-muted",
} as const;

/** Notion風: 枠なし。常にその場で入力できるテキスト */
export function EditableText(props: EditableTextProps | EditableTextAreaProps) {
  const {
    value,
    onChange,
    variant = "body",
    className,
    placeholder,
    readOnly,
    disabled,
  } = props;

  const multiline = "multiline" in props && props.multiline === true;
  const areaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!multiline || !areaRef.current) return;
    const el = areaRef.current;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value, multiline]);

  // w-full は className 側で付与する（cn は twMerge 非対応のため競合に注意）
  const shared = cn(
    "min-w-0 max-w-full bg-transparent font-heading outline-none placeholder:text-ink-muted/50",
    "rounded-sm px-1 py-0.5 transition-colors",
    // ノートに書く感を残すため、ホバー背景はごく薄く
    !readOnly && !disabled && "hover:bg-paper-deep/25 focus:bg-paper-deep/40",
    (readOnly || disabled) && "cursor-default",
    variantClass[variant === "time" ? "time" : variant],
    className,
  );

  if (multiline) {
    const {
      value: _v,
      onChange: _c,
      variant: _variant,
      multiline: _m,
      className: _className,
      ...areaRest
    } = props as EditableTextAreaProps;

    return (
      <textarea
        {...areaRest}
        ref={areaRef}
        rows={1}
        value={value}
        readOnly={readOnly}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={cn(shared, "resize-none overflow-hidden")}
      />
    );
  }

  const {
    value: _v,
    onChange: _c,
    variant: _variant,
    multiline: _m,
    className: _className,
    type,
    ...inputRest
  } = props as EditableTextProps;

  return (
    <input
      {...inputRest}
      type={type ?? "text"}
      value={value}
      readOnly={readOnly}
      disabled={disabled}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className={shared}
    />
  );
}
