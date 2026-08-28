"use client";

import { cn } from "@/lib/utils";
import { useLayoutEffect, useRef, useState, type CSSProperties } from "react";

type HandDrawnFrameProps = {
  title: string;
  children: React.ReactNode;
  className?: string;
  style?: CSSProperties;
  /** 上辺タイトルの位置（既定は中央） */
  titleAlign?: "center" | "left";
};

type BoxSize = { w: number; h: number };

/**
 * 実寸（px）に合わせて手描き風の四辺パスを作る。
 * 固定 viewBox を縦に引き伸ばさないので、高さ増減で下辺がずれない。
 */
function buildHandDrawnPaths(
  w: number,
  h: number,
  titleAlign: "center" | "left",
): string[] {
  const inset = 6;
  const left = inset;
  const right = Math.max(inset + 8, w - inset);
  const top = inset + 1;
  const bottom = Math.max(top + 8, h - inset);
  const midY = (top + bottom) / 2;

  const rightSide = [
    `M ${right},${top}`,
    `C ${right + 1.4},${top + (bottom - top) * 0.28} ${right - 1.1},${midY} ${right + 0.6},${top + (bottom - top) * 0.72}`,
    `C ${right + 0.3},${top + (bottom - top) * 0.88} ${right - 0.8},${bottom - 4} ${right},${bottom}`,
  ].join(" ");

  const bottomSide = [
    `M ${right},${bottom}`,
    `C ${w * 0.72},${bottom - 1.3} ${w * 0.45},${bottom + 1.2} ${w * 0.22},${bottom - 0.4}`,
    `C ${w * 0.12},${bottom - 1} ${w * 0.06},${bottom + 0.8} ${left},${bottom}`,
  ].join(" ");

  const leftSide = [
    `M ${left},${bottom}`,
    `C ${left - 1.3},${top + (bottom - top) * 0.72} ${left + 1.1},${midY} ${left - 0.5},${top + (bottom - top) * 0.28}`,
    `C ${left - 0.2},${top + 8} ${left + 0.7},${top + 2} ${left},${top}`,
  ].join(" ");

  if (titleAlign === "left") {
    const stubEnd = Math.min(left + 36, w * 0.14);
    const afterTitle = Math.min(Math.max(stubEnd + 56, w * 0.32), right - 24);
    return [
      `M ${left},${top} C ${left + 10},${top - 1.1} ${stubEnd - 8},${top + 1} ${stubEnd},${top}`,
      `M ${afterTitle},${top} C ${w * 0.5},${top - 1} ${w * 0.78},${top + 1.1} ${right},${top}`,
      rightSide,
      bottomSide,
      leftSide,
    ];
  }

  const gapLeft = w * 0.37;
  const gapRight = w * 0.63;
  return [
    `M ${left},${top} C ${w * 0.14},${top - 1.2} ${w * 0.26},${top + 1} ${gapLeft},${top}`,
    `M ${gapRight},${top} C ${w * 0.74},${top - 1} ${w * 0.88},${top + 1.1} ${right},${top}`,
    rightSide,
    bottomSide,
    leftSide,
  ];
}

/**
 * 手書きの太ペンで囲った枠。
 * 上辺にタイトルを載せ、線がその下で途切れて見える。
 */
export function HandDrawnFrame({
  title,
  children,
  className,
  style,
  titleAlign = "center",
}: HandDrawnFrameProps) {
  const rootRef = useRef<HTMLElement>(null);
  const [box, setBox] = useState<BoxSize>({ w: 0, h: 0 });

  useLayoutEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const sync = (width: number, height: number) => {
      const w = Math.max(1, Math.round(width));
      const h = Math.max(1, Math.round(height));
      setBox((prev) => (prev.w === w && prev.h === h ? prev : { w, h }));
    };

    // border box（中身の高さ）だけ見る。SVG の描画は含めない
    sync(el.clientWidth, el.clientHeight);

    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const size = entry.borderBoxSize?.[0];
      if (size) {
        sync(size.inlineSize, size.blockSize);
        return;
      }
      const cr = entry.contentRect;
      sync(cr.width, cr.height);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const paths =
    box.w > 0 && box.h > 0
      ? buildHandDrawnPaths(box.w, box.h, titleAlign)
      : [];

  return (
    <section
      ref={rootRef}
      className={cn("relative bg-paper text-ink", className)}
      style={style}
    >
      {paths.length > 0 && (
        <div
          className="pointer-events-none absolute inset-0 overflow-hidden"
          aria-hidden
        >
          <svg
            className="block h-full w-full text-ink"
            viewBox={`0 0 ${box.w} ${box.h}`}
            width="100%"
            height="100%"
            preserveAspectRatio="none"
          >
            {paths.map((d) => (
              <path
                key={d}
                d={d}
                fill="none"
                stroke="currentColor"
                strokeWidth="2.85"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}
          </svg>
        </div>
      )}

      <h3
        className={cn(
          "absolute top-0 z-10 -translate-y-1/2 bg-paper px-3 font-heading text-base font-bold tracking-wide text-ink sm:text-lg",
          titleAlign === "left"
            ? "left-5 sm:left-6"
            : "left-1/2 -translate-x-1/2",
        )}
      >
        {title}
      </h3>

      {/* タイトル下に十分な余白を取り、中身が枠線に食い込まないようにする */}
      <div className="relative px-5 pt-8 pb-5 sm:px-7 sm:pt-9 sm:pb-6">
        {children}
      </div>
    </section>
  );
}
