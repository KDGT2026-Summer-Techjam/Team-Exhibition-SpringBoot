"use client";

import { cn, hoverPop, hoverTransition } from "@/lib/utils";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

type HeartLikeButtonProps = {
  likeCount: number;
  disabled?: boolean;
  onLike: () => void;
};

type Spark = {
  id: string;
  dx: number;
  dy: number;
  rotate: number;
  delay: number;
  sizeEm: number;
};

const HEART_PINK = "#ff5a8a";
const SPARK_MS = 820;
const FLASH_MS = 420;
const SPARK_COUNT = 14;

/** ハート周辺に飛び出す小さなハートの初期位置を決める */
function spawnSparks(): Spark[] {
  return Array.from({ length: SPARK_COUNT }, (_, i) => {
    const angle = (Math.PI * 2 * i) / SPARK_COUNT + (Math.random() - 0.5) * 0.32;
    const dist = 26 + Math.random() * 30;
    return {
      id: `${Date.now()}-${i}-${Math.random().toString(36).slice(2, 6)}`,
      dx: Math.cos(angle) * dist,
      dy: Math.sin(angle) * dist - 10,
      rotate: (Math.random() - 0.5) * 70,
      delay: i * 0.01,
      sizeEm: 0.42 + Math.random() * 0.38,
    };
  });
}

/**
 * 一覧タイル右下のいいね。押すとハートがピンクになり、周囲に小さなハートが散る。
 */
export function HeartLikeButton({
  likeCount,
  disabled = false,
  onLike,
}: HeartLikeButtonProps) {
  const reduceMotion = useReducedMotion();
  const [flashed, setFlashed] = useState(false);
  const [sparks, setSparks] = useState<Spark[]>([]);
  const flashTimer = useRef<number>(0);
  const sparkTimer = useRef<number>(0);

  useEffect(() => {
    return () => {
      window.clearTimeout(flashTimer.current);
      window.clearTimeout(sparkTimer.current);
    };
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (disabled) return;

    setFlashed(true);
    window.clearTimeout(flashTimer.current);
    flashTimer.current = window.setTimeout(() => setFlashed(false), FLASH_MS);

    if (!reduceMotion) {
      setSparks(spawnSparks());
      window.clearTimeout(sparkTimer.current);
      sparkTimer.current = window.setTimeout(() => setSparks([]), SPARK_MS);
    }

    onLike();
  };

  return (
    <button
      type="button"
      disabled={disabled}
      aria-label={`いいね（現在${likeCount}）`}
      onClick={handleClick}
      className={cn(
        "absolute bottom-2 right-2 z-10 flex items-center gap-1.5 overflow-visible",
        "rounded-full bg-ink/55 px-2.5 py-1.5 text-paper",
        hoverTransition,
        hoverPop,
        "hover:bg-ink/75",
        disabled && "cursor-not-allowed opacity-60",
      )}
    >
      <span className="relative grid h-7 w-7 place-items-center">
        <motion.span
          aria-hidden
          className="relative z-10 leading-none"
          animate={
            flashed
              ? { color: HEART_PINK, scale: [1, 1.38, 1.12] }
              : { color: "#ffffff", scale: 1 }
          }
          transition={
            reduceMotion
              ? { duration: 0 }
              : { duration: 0.32, ease: [0.22, 1, 0.36, 1] }
          }
          style={{ fontSize: "1.35rem" }}
        >
          ♥
        </motion.span>

        <AnimatePresence>
          {sparks.map((spark) => (
            <motion.span
              key={spark.id}
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-1/2 z-20 leading-none"
              style={{
                color: HEART_PINK,
                fontSize: `${spark.sizeEm}rem`,
                marginLeft: "-0.25em",
                marginTop: "-0.45em",
              }}
              initial={{ x: 0, y: 0, opacity: 1, scale: 0.35, rotate: 0 }}
              animate={{
                x: spark.dx,
                y: spark.dy,
                opacity: [1, 1, 0],
                scale: 1,
                rotate: spark.rotate,
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 0.72,
                delay: spark.delay,
                ease: [0.15, 0.75, 0.25, 1],
                opacity: { duration: 0.72, times: [0, 0.4, 1] },
              }}
            >
              ♥
            </motion.span>
          ))}
        </AnimatePresence>
      </span>
      <span className="pr-0.5 text-sm tabular-nums leading-none">{likeCount}</span>
    </button>
  );
}
