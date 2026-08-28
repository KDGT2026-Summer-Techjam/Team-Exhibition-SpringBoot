"use client";

import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useId, useRef } from "react";

type ModalProps = {
  open: boolean;
  title: string;
  children: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  onClose: () => void;
  danger?: boolean;
  /** ダイアログ幅などの上書き */
  contentClassName?: string;
  /** フッターボタンを非表示（選択モーダル向け） */
  hideFooter?: boolean;
  /** 見出しをスクリーンリーダー用だけにする */
  hideTitle?: boolean;
};

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

export function Modal({
  open,
  title,
  children,
  confirmLabel = "OK",
  cancelLabel = "キャンセル",
  onConfirm,
  onClose,
  danger = false,
  contentClassName,
  hideFooter = false,
  hideTitle = false,
}: ModalProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const previousOverflow = useRef<string>("");
  const reduceMotion = useReducedMotion();
  const duration = reduceMotion ? 0 : 0.22;

  useEffect(() => {
    if (!open) return;
    previousFocus.current = document.activeElement as HTMLElement | null;
    previousOverflow.current = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusables = () =>
      Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      ).filter((el) => !el.hasAttribute("disabled"));

    const focusTimer = window.setTimeout(() => focusables()[0]?.focus(), 0);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      const items = focusables();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  const restoreAfterExit = () => {
    document.body.style.overflow = previousOverflow.current;
    previousFocus.current?.focus();
  };

  return (
    <AnimatePresence onExitComplete={restoreAfterExit}>
      {open && (
        // しおりのリング(z-70)より上に出し、ワイヤーがモーダルに被らないようにする
        <motion.div
          className="fixed inset-0 z-[80] flex items-center justify-center p-4"
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration, ease: EASE_OUT }}
        >
          <div
            className="absolute inset-0 bg-ink/30"
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal
            aria-labelledby={titleId}
            className={cn(
              // しおりのリング(z-70)より上。幅・余白のデフォルトは contentClassName 未指定時のみ
              "relative z-10 w-full rounded-lg border border-line bg-paper text-ink shadow-[0_12px_40px_rgb(0_0_0/0.55)]",
              contentClassName ?? "max-w-md p-6",
            )}
            initial={
              reduceMotion ? false : { opacity: 0, scale: 0.96, y: 10 }
            }
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={
              reduceMotion
                ? undefined
                : { opacity: 0, scale: 0.96, y: 8 }
            }
            transition={{ duration, ease: EASE_OUT }}
          >
            <h2
              id={titleId}
              className={
                hideTitle
                  ? "sr-only"
                  : "font-heading text-lg font-bold text-ink"
              }
            >
              {title}
            </h2>
            <div
              className={cn(
                "flex min-h-0 flex-1 flex-col text-sm text-ink-muted",
                !hideTitle && "mt-3",
              )}
            >
              {children}
            </div>
            {!hideFooter && (
              <div className="mt-6 flex justify-end gap-2">
                <Button variant="ghost" onClick={onClose}>
                  {cancelLabel}
                </Button>
                {onConfirm && (
                  <Button
                    variant={danger ? "danger" : "primary"}
                    onClick={onConfirm}
                  >
                    {confirmLabel}
                  </Button>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
