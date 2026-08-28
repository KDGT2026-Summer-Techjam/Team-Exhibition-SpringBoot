"use client";

import { CorkBackCover } from "@/components/itinerary/CorkBackCover";
import { cn } from "@/lib/utils";
import {
  animate,
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from "framer-motion";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

/** lg 以上だけ見開きをマウントし、モバイル複製との二重 portal を防ぐ */
function useIsDesktopSpread() {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia("(min-width: 1024px)");
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => window.matchMedia("(min-width: 1024px)").matches,
    () => true,
  );
}

/** めくりアニメの時間と緩急（本文の紙とCSSの厚み影で共有） */
const FLIP_DURATION = 0.7;
const FLIP_EASE = [0.32, 0.72, 0, 1] as const;

/** 本の見開き1項目分のメタ情報 */
export type ShioriBookPage = {
  id: string;
  label: string;
  sublabel?: string;
};

type ShioriBookProps = {
  pages: ShioriBookPage[];
  /** 初期表示ページ（省略時は先頭） */
  initialId?: string;
  /** 現在の見開き。指定すると外部から任意ページへジャンプできる */
  activeId?: string;
  onActiveIdChange?: (id: string) => void;
  /** 見開きの左ページを描画 */
  renderLeft: (id: string) => React.ReactNode;
  /** 見開きの右ページを描画 */
  renderRight: (id: string) => React.ReactNode;
  className?: string;
};

/** めくり中の一時状態（from=現在の見開き / to=移動先） */
type FlipState = {
  dir: 1 | -1;
  from: string;
  to: string;
  key: number;
};

const MAX_STACK_LAYERS = 8;
/** 罫線1マスおきに置くリングの個数。余った分はカラム側で隠す */
const RING_COUNT = 16;
/** 最初のリングを置く罫線マス（1始まり。先頭マスは余白） */
const RING_START_ROW = 2;
/** リングを何マスごとに置くか（4 = 3行空けて次のリング） */
const RING_EVERY_ROWS = 4;

function ringRow(index: number): number {
  return RING_START_ROW + index * RING_EVERY_ROWS;
}

/** 中央の綴じ目に並ぶ黒いワイヤーリング（ノートを上から見た2本線）。
 *  3D perspective の外に置き、パースによる上下のずれを出さない */
function SpineRings() {
  return (
    <div
      className="ring-binder-column pointer-events-none absolute inset-y-0 left-1/2 z-[70] w-5 -translate-x-1/2"
      aria-hidden
    >
      {Array.from({ length: RING_COUNT }).map((_, i) => (
        <span key={i} className="ring-binder" style={{ gridRow: ringRow(i) }}>
          {/* 上から見たリングの左右ワイヤー */}
          <span className="ring-binder-wire" />
          <span className="ring-binder-wire" />
        </span>
      ))}
    </div>
  );
}

/** リングが通る四角いパンチ穴。紙の綴じ目側に置き、リングと縦位置を揃える */
function SpineHoles({ side }: { side: "left" | "right" }) {
  return (
    <div
      className={cn(
        "ring-hole-column pointer-events-none absolute inset-y-0 z-[15]",
        side === "left" ? "right-[2px]" : "left-[2px]",
      )}
      aria-hidden
    >
      {Array.from({ length: RING_COUNT }).map((_, i) => (
        <span
          key={i}
          className="ring-hole-slot"
          style={{ gridRow: ringRow(i) }}
        >
          <span className="ring-hole" />
        </span>
      ))}
    </div>
  );
}

/**
 * 読んだ／残りのページを背表紙の外側に積み重ねて見せる影。
 * 常に一定枚数のレイヤーを出し（不足分は透明）、枚数が変わっても
 * CSS transition で box-shadow を滑らかに補間できるようにする。
 */
function edgeStackShadow(count: number, dir: -1 | 1): string {
  const n = Math.min(Math.max(count, 0), MAX_STACK_LAYERS);
  const layers: string[] = [];
  for (let i = 1; i <= MAX_STACK_LAYERS; i += 1) {
    const active = i <= n;
    const x = dir * i * 3;
    const y = i * 1.5;
    // 紙の面と影を交互に置いて用紙1枚1枚の段差を出す（不足分は透明）
    const paper = active ? (i % 2 === 1 ? "#efe7d8" : "#f7f1e6") : "transparent";
    const edge = active ? "#d8cdb8" : "transparent";
    layers.push(`${x - dir}px ${y}px 0 0 ${edge}`);
    layers.push(`${x}px ${y}px 0 0 ${paper}`);
  }
  // 一番外側にやわらかい落ち影（枚数に応じて距離・濃さが動く）
  layers.push(
    `${dir * (n * 3 + 6)}px ${n * 1.5 + 6}px 16px -4px rgba(0,0,0,${
      n === 0 ? 0 : 0.28
    })`,
  );
  return layers.join(", ");
}

/** めくり中に見える紙の面。実ページの内容を貼り付け、回転角に応じて陰影を出す */
function LeafFace({
  children,
  side,
  spine,
  shade,
}: {
  children: React.ReactNode;
  side: "front" | "back";
  spine: "left" | "right";
  /** 回転角に連動した面全体の暗さ（0=平ら・明るい / 1=立ち上がり・暗い） */
  shade: MotionValue<number>;
}) {
  return (
    <div
      className={cn(
        "absolute inset-0 overflow-hidden [backface-visibility:hidden]",
        side === "back" && "[transform:rotateY(180deg)]",
      )}
    >
      {/* 実ページの内容（操作は無効化して見た目だけ運ぶ） */}
      <div className="pointer-events-none h-full select-none">{children}</div>
      {/* 折り目側のやわらかい陰影（控えめに固定） */}
      <span
        className={cn(
          "pointer-events-none absolute inset-y-0 z-10 w-16",
          spine === "left"
            ? "left-0 bg-gradient-to-r from-black/[0.06] to-transparent"
            : "right-0 bg-gradient-to-l from-black/[0.06] to-transparent",
        )}
        aria-hidden
      />
      {/* 回転角に連動した面全体の陰影。平らなときは 0 なので影は付かない */}
      <motion.span
        className="pointer-events-none absolute inset-0 z-20 bg-black"
        style={{ opacity: shade }}
        aria-hidden
      />
    </div>
  );
}

/**
 * めくる1枚の紙。live な回転角（progress 0→1）から rotateY と面の陰影を
 * 同時に導出し、リアルタイムに 3D で倒す。平ら→立ち上がり→平らに合わせて
 * 陰影が滑らかに増減する。
 */
function FlipLeaf({
  dir,
  front,
  back,
  spineFront,
  spineBack,
  onComplete,
}: {
  dir: 1 | -1;
  front: React.ReactNode;
  back: React.ReactNode;
  spineFront: "left" | "right";
  spineBack: "left" | "right";
  onComplete: () => void;
}) {
  const progress = useMotionValue(0);
  const rotateY = useTransform(progress, [0, 1], dir === 1 ? [0, -180] : [0, 180]);
  // 表: 平ら(0)→立ち上がり(90°)で暗く。裏: 立ち上がり(90°)→平ら(0)で明るく
  const frontShade = useTransform(progress, [0, 0.5, 1], [0, 0.5, 0.5]);
  const backShade = useTransform(progress, [0, 0.5, 1], [0.5, 0.5, 0]);

  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    const controls = animate(progress, 1, {
      duration: FLIP_DURATION,
      ease: FLIP_EASE,
      onComplete: () => onCompleteRef.current(),
    });
    return () => controls.stop();
  }, [progress]);

  return (
    <motion.div
      className="absolute inset-0 [transform-style:preserve-3d] [will-change:transform]"
      style={{
        rotateY,
        transformOrigin: dir === 1 ? "left center" : "right center",
      }}
    >
      <LeafFace side="front" spine={spineFront} shade={frontShade}>
        {front}
      </LeafFace>
      <LeafFace side="back" spine={spineBack} shade={backShade}>
        {back}
      </LeafFace>
    </motion.div>
  );
}

/**
 * しおりを見開き2ページの本として表示する。
 * 1見開き＝1項目（旅行計画 or 1日分）。左右に内容を分割し、
 * 紙を背表紙（中央の折り目）を軸に 3D でめくって切り替える。
 * ページ切替は右下ナビ・スワイプ・端クリック・キーボードで行い、URL は変えない。
 */
export function ShioriBook({
  pages,
  initialId,
  activeId,
  onActiveIdChange,
  renderLeft,
  renderRight,
  className,
}: ShioriBookProps) {
  const reduceMotion = useReducedMotion();
  const isDesktop = useIsDesktopSpread();
  const onActiveIdChangeRef = useRef(onActiveIdChange);
  onActiveIdChangeRef.current = onActiveIdChange;

  const startId = activeId ?? initialId;
  const initialIndex = Math.max(
    0,
    startId ? pages.findIndex((p) => p.id === startId) : 0,
  );

  const [index, setIndex] = useState(initialIndex);
  const [flip, setFlip] = useState<FlipState | null>(null);
  const flipKeyRef = useRef(0);
  const pendingIndexRef = useRef<number | null>(null);
  const pointerStart = useRef<{ x: number; y: number } | null>(null);

  const currentId = pages[index]?.id;

  /** 任意の見開きへ移動。隣接以外も1回のめくりでジャンプする */
  const goToIndex = useCallback(
    (targetIndex: number) => {
      if (flip) return;
      if (targetIndex === index) return;
      if (targetIndex < 0 || targetIndex >= pages.length) return;

      const dir: 1 | -1 = targetIndex > index ? 1 : -1;
      const fromId = pages[index]!.id;
      const toId = pages[targetIndex]!.id;

      onActiveIdChangeRef.current?.(toId);

      // モバイル・reduceMotion は即時切替（3D leaf が無いため）
      if (reduceMotion || !isDesktop) {
        setIndex(targetIndex);
        return;
      }

      flipKeyRef.current += 1;
      pendingIndexRef.current = targetIndex;
      // index はアニメ完了まで据え置き、土台は from/to で出し分ける
      setFlip({ dir, from: fromId, to: toId, key: flipKeyRef.current });
    },
    [flip, index, isDesktop, pages, reduceMotion],
  );

  const goPrev = useCallback(() => goToIndex(index - 1), [goToIndex, index]);
  const goNext = useCallback(() => goToIndex(index + 1), [goToIndex, index]);

  // 外部から activeId が変わったら、その見開きへジャンプする
  useEffect(() => {
    if (activeId == null) return;
    if (flip) return;
    const target = pages.findIndex((p) => p.id === activeId);
    if (target < 0 || target === index) return;
    goToIndex(target);
  }, [activeId, flip, goToIndex, index, pages]);

  const finishFlip = useCallback(() => {
    const pending = pendingIndexRef.current;
    pendingIndexRef.current = null;
    setFlip(null);
    if (pending !== null) setIndex(pending);
  }, []);

  // 完了コールバックの取りこぼし対策（フォーカス喪失時など）。
  // アニメ時間＋余裕でフォールバック確定し、操作不能を防ぐ
  useEffect(() => {
    if (!flip) return;
    const timer = window.setTimeout(finishFlip, 900);
    return () => window.clearTimeout(timer);
  }, [flip, finishFlip]);

  // キーボード左右でめくる（入力中は無視）
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goPrev, goNext]);

  // スワイプ（横移動が縦より大きいときだけめくる）
  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse") return;
    pointerStart.current = { x: e.clientX, y: e.clientY };
  };
  const handlePointerUp = (e: React.PointerEvent) => {
    const start = pointerStart.current;
    pointerStart.current = null;
    if (!start) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    if (Math.abs(dx) < 56 || Math.abs(dx) < Math.abs(dy)) return;
    if (dx < 0) goNext();
    else goPrev();
  };

  const isFirst = index <= 0;
  const isLast = index >= pages.length - 1;

  // めくり中の土台出し分け
  // 進む: 左=from左 / 右=to右 ／ 戻る: 左=to左 / 右=from右
  // 静止: 左=現左 / 右=現右
  const baseLeftId = flip
    ? flip.dir === 1
      ? flip.from
      : flip.to
    : currentId;
  const baseRightId = flip
    ? flip.dir === 1
      ? flip.to
      : flip.from
    : currentId;

  // 厚みは移動先を基準にし、めくり開始と同時に目標値へ。box-shadow に
  // CSS transition をかけているので、紙の回転と同じ時間で厚みが実時間で増減する。
  const shadowIndex = flip
    ? Math.max(
        pages.findIndex((p) => p.id === flip.to),
        0,
      )
    : index;
  const leftShadow = edgeStackShadow(shadowIndex, -1);
  const rightShadow = edgeStackShadow(pages.length - 1 - shadowIndex, 1);
  const shadowTransition = `box-shadow ${FLIP_DURATION}s cubic-bezier(0.32,0.72,0,1)`;

  return (
    // flex-1 だと縦に伸びて上寄せに見えるので、固定サイズの箱として中央に置く
    <div className={cn("relative mx-auto w-full shrink-0", className)}>
      {isDesktop ? (
      /* デスクトップ: 見開き2ページ。perspective は紙だけにかけ、
          リングは同じ枠の 2D 最前面に置く */
      <div
        className="relative mx-auto w-full"
        style={{
          // 絶対配置の子だけのとき高さ0にならないよう、明示サイズを style で渡す
          width: "100%",
          maxWidth: "var(--notebook-max-width)",
          height: "min(var(--notebook-height), calc(100dvh - 3rem))",
        }}
      >
        {/* 紙面の裏にコルク背表紙をのぞかせる */}
        <CorkBackCover className="-inset-y-2 left-1 right-1 sm:-inset-y-2.5 sm:left-2 sm:right-2" />
        <div
          className="absolute inset-0 z-[1] flex items-stretch justify-center px-3 sm:px-5 [perspective:2600px]"
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
        >
        {/* 左ページ（土台） */}
        <div className="relative flex h-full min-h-0 w-1/2 shrink-0 flex-col">
          <div
            className="relative h-full flex-1"
            style={{ boxShadow: leftShadow, transition: shadowTransition }}
          >
            {baseLeftId && renderLeft(baseLeftId)}
            {/* リングが通るパンチ穴（左ページの綴じ目側） */}
            <SpineHoles side="left" />
            {/* 折り目（右端）側の谷折り陰影。めくり紙と同じ陰影を常時出し、
                紙が着地して土台に戻った瞬間の陰影の断絶をなくす */}
            <span
              className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-black/[0.06] to-transparent"
              aria-hidden
            />
          </div>

          {/* 外側フォアエッジのクリック帯（前へ） */}
          {!isFirst && !flip && (
            <button
              type="button"
              aria-label="前のページ"
              onClick={goPrev}
              className="absolute inset-y-0 left-0 z-20 w-12 cursor-w-resize bg-transparent"
            />
          )}
        </div>

        {/* 右ページ（土台） */}
        <div className="relative flex h-full min-h-0 w-1/2 shrink-0 flex-col">
          <div
            className="relative h-full flex-1"
            style={{ boxShadow: rightShadow, transition: shadowTransition }}
          >
            {baseRightId && renderRight(baseRightId)}
            {/* リングが通るパンチ穴（右ページの綴じ目側） */}
            <SpineHoles side="right" />
            {/* 折り目（左端）側の谷折り陰影。めくり紙と同じ陰影を常時出し、
                紙が着地して土台に戻った瞬間の陰影の断絶をなくす */}
            <span
              className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-black/[0.06] to-transparent"
              aria-hidden
            />
          </div>

          {/* 外側フォアエッジのクリック帯（次へ） */}
          {!isLast && !flip && (
            <button
              type="button"
              aria-label="次のページ"
              onClick={goNext}
              className="absolute inset-y-0 right-0 z-20 w-12 cursor-e-resize bg-transparent"
            />
          )}
        </div>

        {/* めくり中の紙: 両ページより上に重ねる共通オーバーレイ層。
            ここに置くことで戻る向きでも右ページに隠されない */}
        {flip && (
          <div className="pointer-events-none absolute inset-0 z-40 flex justify-center px-3 sm:px-5">
            {/* 左セル: 戻るめくり（右へ倒れる） */}
            <div className="relative w-1/2 shrink-0 [transform-style:preserve-3d]">
              {flip.dir === -1 && (
                <FlipLeaf
                  key={flip.key}
                  dir={-1}
                  spineFront="right"
                  spineBack="left"
                  front={
                    <>
                      {renderLeft(flip.from)}
                      <SpineHoles side="left" />
                    </>
                  }
                  back={
                    <>
                      {renderRight(flip.to)}
                      <SpineHoles side="right" />
                    </>
                  }
                  onComplete={finishFlip}
                />
              )}
            </div>

            {/* 右セル: 進むめくり（左へ倒れる） */}
            <div className="relative w-1/2 shrink-0 [transform-style:preserve-3d]">
              {flip.dir === 1 && (
                <FlipLeaf
                  key={flip.key}
                  dir={1}
                  spineFront="left"
                  spineBack="right"
                  front={
                    <>
                      {renderRight(flip.from)}
                      <SpineHoles side="right" />
                    </>
                  }
                  back={
                    <>
                      {renderLeft(flip.to)}
                      <SpineHoles side="left" />
                    </>
                  }
                  onComplete={finishFlip}
                />
              )}
            </div>
          </div>
        )}

      </div>
        {/* リングは 3D 空間の外。めくり紙より手前に置く */}
        <SpineRings />
      </div>
      ) : (
      /* モバイル: 左右を縦積みし、簡易スライドで切替 */
      <div
        className="relative mx-auto w-full max-w-[var(--notebook-max-width)] px-3 sm:px-5"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
      >
        <CorkBackCover className="-inset-y-2 left-2 right-2 sm:-inset-y-2.5 sm:left-3 sm:right-3" />
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={currentId}
            initial={
              reduceMotion ? false : { opacity: 0, x: 24 }
            }
            animate={{ opacity: 1, x: 0 }}
            exit={
              reduceMotion
                ? undefined
                : { opacity: 0, x: -24 }
            }
            transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
            className="relative z-[1] flex flex-col gap-0"
          >
            {currentId && renderLeft(currentId)}
            {currentId && renderRight(currentId)}
          </motion.div>
        </AnimatePresence>
      </div>
      )}
    </div>
  );
}
