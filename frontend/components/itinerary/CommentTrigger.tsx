"use client";

import { CommentBubble } from "@/components/itinerary/CommentBubble";
import { CommentForm } from "@/components/itinerary/CommentForm";
import { useOptionalItineraryUi } from "@/components/itinerary/ItineraryUiProvider";
import { cn } from "@/lib/utils";
import type { Comment } from "@/types";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

export type CommentHandlers = {
  addComment: (
    input: Omit<Comment, "id" | "createdAt">,
  ) => Promise<Comment>;
  patchComment: (id: string, body: string) => Promise<void>;
  removeComment: (id: string) => Promise<void>;
};

type CommentTriggerProps = {
  comments: Comment[];
  targetType: Comment["targetType"];
  targetId: string;
  targetField?: string;
  authorId: string;
  authorName: string;
  canComment: boolean;
  commentHandlers?: CommentHandlers;
  /** 左側に並べる本文（右に丸ボタンを置く） */
  children?: React.ReactNode;
  /** 行の縦位置（タイトル行など中央寄せ時） */
  align?: "start" | "center";
  className?: string;
};

type BubblePlacement = {
  id: string;
  top: number;
  left: number;
  rotate: number;
  /** 線の向きと反対側。線が左ならアイコン左（箱は右） */
  avatarSide: "left" | "right";
};

type AnchorBox = {
  top: number;
  left: number;
  width: number;
  height: number;
};

type ScatterLayout = {
  bubbles: BubblePlacement[];
  anchor: AnchorBox | null;
  /** アイコン左右の判定に使う X（小さい対象は中心、広い対象はコメントボタン） */
  faceX: number;
};

/** コメントIDから決定的な疑似乱数を生成 */
function hashSeed(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

const BUBBLE_W = 300;
/** コンパクト吹き出しの実幅に近い値。配置時のアイコン左右判定に使う */
const TYPICAL_BUBBLE_W = 220;
/** 衝突・スロット計算用。300だと横並びできず縦一列になる */
const PLACE_W = 248;
const PLACE_H = 82;
/** この差未満なら同じ縦列とみなして横へずらす */
const COLUMN_X = 108;

/**
 * 引き出し線が向かう方向と反対側に箱を置く。
 * 線が左（下）ならアイコン左・箱は右。右なら逆。
 */
function avatarSideFromLeader(
  bubbleLeft: number,
  bubbleRight: number,
  fromX: number,
  fromY: number,
  anchor: AnchorBox,
): "left" | "right" {
  const edge = rectEdgeTowardPoint(anchor, fromX, fromY);
  const dx = edge.x - fromX;
  if (Math.abs(dx) < 10) {
    const distLeft = Math.abs(bubbleLeft - edge.x);
    const distRight = Math.abs(bubbleRight - edge.x);
    return distRight < distLeft ? "right" : "left";
  }
  return dx < 0 ? "left" : "right";
}

/** タイムライン円など狭い対象はその中心。備考など広い対象はコメントボタン側 */
function facingCenterX(
  placementAnchor: DOMRect,
  triggerRoot: HTMLElement,
): number {
  if (placementAnchor.width <= 40) {
    return placementAnchor.left + placementAnchor.width / 2;
  }
  const btn = triggerRoot.querySelector(
    'button[aria-label^="コメント"]',
  ) as HTMLElement | null;
  if (btn && btn.getClientRects().length > 0) {
    const r = btn.getBoundingClientRect();
    return r.left + r.width / 2;
  }
  return placementAnchor.left + placementAnchor.width / 2;
}
const VIEWPORT_PAD = 8;
/** コメント対象との最低すき間（近くに寄せる） */
const TARGET_CLEARANCE = 8;
/** 吹き出し同士の最低すき間 */
const BUBBLE_GAP = 14;
/** 吹き出し出現アニメ（motion と揃える） */
const BUBBLE_ENTER_DURATION_S = 0.28;
const BUBBLE_ENTER_STAGGER_S = 0.055;
/** 出現完了後に線を出すまでの余裕（ms） */
const LEADER_REVEAL_BUFFER_MS = 48;

type Point = { top: number; left: number };

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(value, max));
}

type Rect = { top: number; left: number; width: number; height: number };

function toRect(top: number, left: number): Rect {
  return { top, left, width: PLACE_W, height: PLACE_H };
}

function rectsOverlap(a: Rect, b: Rect, gap: number): boolean {
  return !(
    a.left + a.width + gap <= b.left ||
    b.left + b.width + gap <= a.left ||
    a.top + a.height + gap <= b.top ||
    b.top + b.height + gap <= a.top
  );
}

/** 吹き出し矩形が対象（＋余白）と重なるか */
function overlapsTarget(
  top: number,
  left: number,
  target: DOMRect,
  pad: number,
): boolean {
  return rectsOverlap(
    toRect(top, left),
    {
      top: target.top,
      left: target.left,
      width: target.width,
      height: target.height,
    },
    pad,
  );
}

/**
 * 対象に被らないよう、最短方向へ押し出す。
 * 上下左右のうち移動量が最小のものを選ぶ。
 */
function pushClearOfTarget(
  top: number,
  left: number,
  target: DOMRect,
  pad: number,
): Point {
  if (!overlapsTarget(top, left, target, pad)) {
    return { top, left };
  }

  const candidates: Point[] = [
    { top: target.top - pad - PLACE_H, left },
    { top: target.bottom + pad, left },
    { top, left: target.left - pad - PLACE_W },
    { top, left: target.right + pad },
  ];

  let best = candidates[0]!;
  let bestDist = Number.POSITIVE_INFINITY;
  for (const c of candidates) {
    const dist = Math.abs(c.top - top) + Math.abs(c.left - left);
    if (dist < bestDist) {
      bestDist = dist;
      best = c;
    }
  }
  return best;
}

/** 吹き出し中心から対象矩形までの最短距離（近いほど良い） */
function distanceToAnchor(top: number, left: number, anchor: DOMRect): number {
  const bx = left + PLACE_W / 2;
  const by = top + PLACE_H / 2;
  const cx = clamp(bx, anchor.left, anchor.right);
  const cy = clamp(by, anchor.top, anchor.bottom);
  return Math.hypot(bx - cx, by - cy);
}

/**
 * 縦一列を避ける。既存と横位置が近いほど大きく減点する。
 */
function columnPenalty(left: number, placed: Rect[]): number {
  const cx = left + PLACE_W / 2;
  let penalty = 0;
  for (const r of placed) {
    const dx = Math.abs(cx - (r.left + r.width / 2));
    if (dx < COLUMN_X) {
      penalty += (COLUMN_X - dx) * 5;
    }
  }
  return penalty;
}

/** 左右の偏りを抑え、2件目以降は反対側を優先する */
function sideBalancePenalty(
  left: number,
  faceX: number,
  placed: Rect[],
): number {
  if (placed.length === 0) return 0;
  const thisRight = left + PLACE_W / 2 > faceX;
  let leftCount = 0;
  let rightCount = 0;
  for (const r of placed) {
    if (r.left + r.width / 2 > faceX) rightCount += 1;
    else leftCount += 1;
  }
  if (thisRight && rightCount >= leftCount) return 70;
  if (!thisRight && leftCount >= rightCount) return 70;
  return 0;
}

function placementScore(
  top: number,
  left: number,
  anchor: DOMRect,
  faceX: number,
  placed: Rect[],
): number {
  return (
    distanceToAnchor(top, left, anchor) +
    columnPenalty(left, placed) +
    sideBalancePenalty(left, faceX, placed)
  );
}

/** 対象の周囲を横方向に扇状に並べたスロット */
function outsideSlots(a: DOMRect, jx: number, jy: number): Point[] {
  const gap = TARGET_CLEARANCE;
  const ax = a.left + a.width / 2;
  const ay = a.top + a.height / 2;
  const leftNear = a.left - PLACE_W - gap;
  const rightNear = a.right + gap;
  const xs = [
    leftNear,
    rightNear,
    leftNear - 120,
    rightNear + 96,
    ax - PLACE_W * 0.72,
    ax - PLACE_W * 0.28,
  ];
  const ys = [
    ay - PLACE_H / 2,
    a.top - PLACE_H - gap,
    a.bottom + gap,
    ay - PLACE_H / 2 - 48,
    ay - PLACE_H / 2 + 48,
    a.top - PLACE_H - gap - 52,
    a.bottom + gap + 52,
  ];

  const slots: Point[] = [];
  for (const left of xs) {
    for (const top of ys) {
      slots.push({ top: top + jy, left: left + jx });
    }
  }
  return slots;
}

/** 候補を画面内に収め、可能な限り対象の外に置く */
function settlePlacement(raw: Point, anchor: DOMRect): Point {
  const maxTop = window.innerHeight - PLACE_H - VIEWPORT_PAD;
  const maxLeft = window.innerWidth - BUBBLE_W - VIEWPORT_PAD;

  let top = clamp(raw.top, VIEWPORT_PAD, maxTop);
  let left = clamp(raw.left, VIEWPORT_PAD, maxLeft);
  ({ top, left } = pushClearOfTarget(top, left, anchor, TARGET_CLEARANCE));
  top = clamp(top, VIEWPORT_PAD, maxTop);
  left = clamp(left, VIEWPORT_PAD, maxLeft);
  return { top, left };
}

function overlapsAnyBubble(top: number, left: number, occupied: Rect[]): boolean {
  const next = toRect(top, left);
  return occupied.some((r) => rectsOverlap(next, r, BUBBLE_GAP));
}

/** 螺旋状に空きを探す（近いリングから。横方向を広めに取る） */
function findFreeSpiral(
  anchor: DOMRect,
  occupied: Rect[],
  placed: Rect[],
  faceX: number,
  seed: number,
): Point | null {
  const cx = anchor.left + anchor.width / 2 - PLACE_W / 2;
  const cy = anchor.top + anchor.height / 2 - PLACE_H / 2;
  const stepX = Math.max(58, PLACE_W * 0.3);
  const stepY = Math.max(40, PLACE_H * 0.48);
  const maxR = 12;

  for (let ring = 1; ring <= maxR; ring += 1) {
    const count = ring * 8;
    const phase = ((seed % 360) / 360) * Math.PI * 2;
    let best: Point | null = null;
    let bestScore = Number.POSITIVE_INFINITY;
    for (let i = 0; i < count; i += 1) {
      const angle = phase + (i / count) * Math.PI * 2;
      const raw = {
        top: cy + Math.sin(angle) * ring * stepY,
        left: cx + Math.cos(angle) * ring * stepX,
      };
      const settled = settlePlacement(raw, anchor);
      if (overlapsTarget(settled.top, settled.left, anchor, TARGET_CLEARANCE)) {
        continue;
      }
      if (overlapsAnyBubble(settled.top, settled.left, occupied)) {
        continue;
      }
      const score = placementScore(
        settled.top,
        settled.left,
        anchor,
        faceX,
        placed,
      );
      if (score < bestScore) {
        bestScore = score;
        best = settled;
      }
    }
    if (best) return best;
  }
  return null;
}

/** 要素の周囲にコメント吹き出しを散らす（対象に近く・他と被らない） */
function scatterAroundElement(
  anchor: DOMRect,
  commentIds: string[],
  faceX: number,
): ScatterLayout {
  const formW = Math.min(22 * 16, window.innerWidth - 24);
  const formH = 64;
  const formLeft = (window.innerWidth - formW) / 2;
  const formTop = window.innerHeight - 80 - formH;
  const occupied: Rect[] = [
    {
      top: formTop - BUBBLE_GAP,
      left: formLeft - BUBBLE_GAP,
      width: formW + BUBBLE_GAP * 2,
      height: formH + BUBBLE_GAP * 2,
    },
  ];
  const placed: Rect[] = [];
  const bubbles: BubblePlacement[] = [];

  commentIds.forEach((id, index) => {
    const seed = hashSeed(`${id}:${index}`);
    const jitterX = ((seed % 97) / 97 - 0.5) * 28;
    const jitterY = (((seed >> 4) % 89) / 89 - 0.5) * 16;
    const rotate = ((seed % 11) - 5) * 0.4;
    const slots = outsideSlots(anchor, jitterX, jitterY);

    let best: Point | null = null;
    let bestScore = Number.POSITIVE_INFINITY;
    let fallback: Point | null = null;

    for (const slot of slots) {
      const settled = settlePlacement(slot, anchor);
      if (!fallback) fallback = settled;
      if (overlapsTarget(settled.top, settled.left, anchor, TARGET_CLEARANCE)) {
        continue;
      }
      if (overlapsAnyBubble(settled.top, settled.left, occupied)) {
        continue;
      }
      const score = placementScore(
        settled.top,
        settled.left,
        anchor,
        faceX,
        placed,
      );
      if (score < bestScore) {
        bestScore = score;
        best = settled;
      }
    }

    const chosen =
      best ??
      findFreeSpiral(anchor, occupied, placed, faceX, seed) ??
      fallback!;

    const box = toRect(chosen.top, chosen.left);
    occupied.push(box);
    placed.push(box);
    bubbles.push({
      id,
      top: chosen.top,
      left: chosen.left,
      rotate,
      avatarSide: avatarSideFromLeader(
        chosen.left,
        chosen.left + TYPICAL_BUBBLE_W,
        chosen.left + TYPICAL_BUBBLE_W / 2,
        chosen.top + PLACE_H * 0.65,
        {
          top: anchor.top,
          left: anchor.left,
          width: anchor.width,
          height: anchor.height,
        },
      ),
    });
  });

  return {
    bubbles,
    faceX,
    anchor: {
      top: anchor.top,
      left: anchor.left,
      width: anchor.width,
      height: anchor.height,
    },
  };
}

/** 対象矩形の縁上で、外側の点から中心へ向かう線との交点 */
function rectEdgeTowardPoint(
  rect: AnchorBox,
  px: number,
  py: number,
): { x: number; y: number } {
  const right = rect.left + rect.width;
  const bottom = rect.top + rect.height;
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;

  const inside =
    px >= rect.left && px <= right && py >= rect.top && py <= bottom;
  if (inside) {
    const toL = px - rect.left;
    const toR = right - px;
    const toT = py - rect.top;
    const toB = bottom - py;
    const m = Math.min(toL, toR, toT, toB);
    if (m === toL) return { x: rect.left, y: py };
    if (m === toR) return { x: right, y: py };
    if (m === toT) return { x: px, y: rect.top };
    return { x: px, y: bottom };
  }

  const dx = cx - px;
  const dy = cy - py;
  const ts: number[] = [];

  if (dx !== 0) {
    for (const x of [rect.left, right]) {
      const t = (x - px) / dx;
      if (t > 1e-4 && t <= 1) {
        const y = py + t * dy;
        if (y >= rect.top - 0.5 && y <= bottom + 0.5) ts.push(t);
      }
    }
  }
  if (dy !== 0) {
    for (const y of [rect.top, bottom]) {
      const t = (y - py) / dy;
      if (t > 1e-4 && t <= 1) {
        const x = px + t * dx;
        if (x >= rect.left - 0.5 && x <= right + 0.5) ts.push(t);
      }
    }
  }

  const t = ts.length > 0 ? Math.min(...ts) : 1;
  return { x: px + t * dx, y: py + t * dy };
}

/** アバター外周から対象へ線を出す終端 */
function avatarRimToward(
  ax: number,
  ay: number,
  radius: number,
  towardX: number,
  towardY: number,
): { x: number; y: number } {
  const dx = towardX - ax;
  const dy = towardY - ay;
  const len = Math.hypot(dx, dy) || 1;
  const r = radius + 1;
  return { x: ax + (dx / len) * r, y: ay + (dy / len) * r };
}

type LeaderSeg = {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

function CommentIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M7.5 18.5 4 21V7.5A3.5 3.5 0 0 1 7.5 4h9A3.5 3.5 0 0 1 20 7.5v7a3.5 3.5 0 0 1-3.5 3.5H7.5Z" />
    </svg>
  );
}

/**
 * コメントは対象の近くに配置し、引き出し線で対応関係を示す。
 * しおり紙面の高さはコメント件数に依存しない。
 */
export function CommentTrigger({
  comments,
  targetType,
  targetId,
  targetField,
  authorId,
  authorName,
  canComment,
  commentHandlers,
  children,
  align = "start",
  className,
}: CommentTriggerProps) {
  const ui = useOptionalItineraryUi();
  const reduceMotion = useReducedMotion();
  const threadKey = `${targetType}:${targetId}:${targetField ?? ""}`;
  const [localOpen, setLocalOpen] = useState(false);
  const [localComments, setLocalComments] = useState(comments);

  useEffect(() => {
    setLocalComments(comments);
  }, [comments]);
  const [layout, setLayout] = useState<ScatterLayout>({
    bubbles: [],
    anchor: null,
    faceX: 0,
  });
  const [leaders, setLeaders] = useState<LeaderSeg[]>([]);
  /** 吹き出し出現アニメ完了後に線を出す */
  const [leadersVisible, setLeadersVisible] = useState(false);
  const [portalReady, setPortalReady] = useState(false);
  /** 退出アニメ中も portal を残す */
  const [overlayActive, setOverlayActive] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  const open = ui ? ui.openCommentKey === threadKey : localOpen;

  const setOpen = (next: boolean) => {
    if (ui) {
      ui.setOpenCommentKey(next ? threadKey : null);
    } else {
      setLocalOpen(next);
    }
  };

  const filtered = useMemo(
    () =>
      localComments
        .filter(
          (c) =>
            c.targetType === targetType &&
            c.targetId === targetId &&
            (targetField === undefined
              ? c.targetField == null
              : c.targetField === targetField),
        )
        .sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        ),
    [localComments, targetType, targetId, targetField],
  );
  const count = filtered.length;
  const label = count > 0 ? `コメント ${count} 件` : "コメントを付ける";

  const commentIdsRef = useRef<string[]>([]);
  commentIdsRef.current = filtered.map((c) => c.id);

  const updateLayout = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    // display:none（別ブレークポイントの複製など）なら座標を取らない
    if (el.getClientRects().length === 0) return;

    // 予定の時刻横円など、専用アンカーがあれば線・配置の基準にする
    const lineAnchor = document.querySelector(
      `[data-comment-line-anchor="${CSS.escape(threadKey)}"]`,
    ) as HTMLElement | null;
    const anchorEl =
      lineAnchor && lineAnchor.getClientRects().length > 0 ? lineAnchor : el;

    const placementAnchor = anchorEl.getBoundingClientRect();
    setLayout(
      scatterAroundElement(
        placementAnchor,
        commentIdsRef.current,
        facingCenterX(placementAnchor, el),
      ),
    );
  }, [threadKey]);

  /** 実アバター位置から引き出し線を計算（固定推定だとズレる） */
  const measureLeaders = useCallback(() => {
    const root = overlayRef.current;
    const anchor = layout.anchor;
    if (!root || !anchor || layout.bubbles.length === 0) {
      setLeaders([]);
      return;
    }

    const next: LeaderSeg[] = [];
    for (const b of layout.bubbles) {
      const avatar = root.querySelector(
        `[data-comment-bubble-id="${CSS.escape(b.id)}"] [data-comment-avatar]`,
      ) as HTMLElement | null;

      let ax: number;
      let ay: number;
      let ar: number;
      if (avatar) {
        const r = avatar.getBoundingClientRect();
        ax = r.left + r.width / 2;
        ay = r.top + r.height / 2;
        ar = Math.max(r.width, r.height) / 2;
      } else {
        // 未マウント時のフォールバック（コンパクト吹き出し想定）
        const iconOnRight = b.avatarSide === "right";
        ax = iconOnRight ? b.left + BUBBLE_W - 14 : b.left + 14;
        ay = b.top + 40;
        ar = 14;
      }

      const edge = rectEdgeTowardPoint(anchor, ax, ay);
      const rim = avatarRimToward(ax, ay, ar, edge.x, edge.y);
      next.push({
        id: b.id,
        x1: edge.x,
        y1: edge.y,
        x2: rim.x,
        y2: rim.y,
      });
    }
    setLeaders(next);
  }, [layout]);

  const measureLeadersRef = useRef(measureLeaders);
  measureLeadersRef.current = measureLeaders;

  /** 画面上に見えているトリガーだけ portal を出す（lg:hidden 側の複製を除外） */
  const [anchorVisible, setAnchorVisible] = useState(false);

  useEffect(() => {
    setPortalReady(true);
  }, []);

  useLayoutEffect(() => {
    if (!open) return;
    const el = containerRef.current;
    const visible = !!el && el.getClientRects().length > 0;
    setAnchorVisible(visible);
    if (visible) {
      updateLayout();
      setOverlayActive(true);
    }
  }, [open, count, updateLayout]);

  // 実幅でアイコン左右を確定（配置時は幅を概算している）
  useLayoutEffect(() => {
    if (!open || !anchorVisible || !layout.anchor || layout.bubbles.length === 0) {
      return;
    }
    const root = overlayRef.current;
    if (!root) return;

    const anchorBox = layout.anchor;
    let changed = false;
    const next = layout.bubbles.map((b) => {
      const node = root.querySelector(
        `[data-comment-bubble-id="${CSS.escape(b.id)}"]`,
      ) as HTMLElement | null;
      if (!node) return b;
      const r = node.getBoundingClientRect();
      const side = avatarSideFromLeader(
        r.left,
        r.right,
        (r.left + r.right) / 2,
        (r.top + r.bottom) / 2,
        anchorBox,
      );
      if (side === b.avatarSide) return b;
      changed = true;
      return { ...b, avatarSide: side };
    });
    if (changed) {
      setLayout((prev) => ({ ...prev, bubbles: next }));
    }
  }, [open, anchorVisible, layout]);

  // 吹き出し出現アニメが終わってから線を表示（途中計測で線が跳ねないように）
  useEffect(() => {
    if (!open || !anchorVisible) {
      setLeadersVisible(false);
      setLeaders([]);
      return;
    }

    setLeadersVisible(false);
    setLeaders([]);

    const bubbleCount = Math.max(filtered.length, 1);
    const waitMs = reduceMotion
      ? 0
      : ((bubbleCount - 1) * BUBBLE_ENTER_STAGGER_S +
          BUBBLE_ENTER_DURATION_S) *
          1000 +
        LEADER_REVEAL_BUFFER_MS;

    const timer = window.setTimeout(() => {
      measureLeadersRef.current();
      setLeadersVisible(true);
    }, waitMs);

    return () => window.clearTimeout(timer);
  }, [open, anchorVisible, threadKey, filtered.length, reduceMotion]);

  // 線表示中のスクロール・再配置では非表示にせず座標だけ更新
  useLayoutEffect(() => {
    if (!open || !leadersVisible || !layout.anchor) return;
    measureLeaders();
  }, [open, leadersVisible, layout, measureLeaders]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onScroll = () => updateLayout();
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", onScroll);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("scroll", onScroll, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- setOpen はスレッドキーに紐づく
  }, [open, threadKey, updateLayout]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (containerRef.current?.contains(target)) return;
      if (overlayRef.current?.contains(target)) return;
      setOpen(false);
    };
    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, threadKey]);

  useEffect(() => {
    if (!canComment && open) setOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- canComment 変化時のみ
  }, [canComment]);

  if (!canComment) {
    return children != null ? <>{children}</> : null;
  }

  return (
    <div ref={containerRef} className={cn("group w-full", className)}>
      <div
        className={cn(
          "flex gap-2",
          align === "center" ? "items-center" : "items-start",
        )}
      >
        {children != null && <div className="min-w-0 flex-1">{children}</div>}
        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-label={label}
          aria-expanded={open}
          aria-controls={open ? titleId : undefined}
          title={label}
          className={cn(
            "relative flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
            "border border-line/80 bg-paper text-ink-muted",
            "hover-lift hover:border-accent hover:text-accent",
            open && "hover-reveal-open border-accent bg-accent/10 text-accent",
            !open && count === 0 && "hover-reveal",
            children == null && "ml-auto",
          )}
        >
          <CommentIcon className="h-3.5 w-3.5" />
          {count > 0 && (
            <span className="absolute -right-1 -top-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-accent px-0.5 text-[9px] font-medium leading-none text-paper">
              {count > 9 ? "9+" : count}
            </span>
          )}
        </button>
      </div>

      {portalReady &&
        overlayActive &&
        createPortal(
          <div
            ref={overlayRef}
            data-comment-ui
            className="pointer-events-none fixed inset-0 z-[75] flex items-end justify-center pb-20"
            aria-hidden={!open}
          >
            <AnimatePresence
              onExitComplete={() => {
                if (!open) {
                  setAnchorVisible(false);
                  setOverlayActive(false);
                }
              }}
            >
              {open &&
                anchorVisible &&
                leadersVisible &&
                layout.anchor && (
                <motion.svg
                  key={`${threadKey}-leaders`}
                  className="pointer-events-none absolute inset-0 h-full w-full"
                  initial={reduceMotion ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={reduceMotion ? undefined : { opacity: 0 }}
                  transition={{ duration: reduceMotion ? 0 : 0.16 }}
                  aria-hidden
                >
                  {leaders.map((seg) => (
                      <g key={`leader-${seg.id}`}>
                        <line
                          x1={seg.x1}
                          y1={seg.y1}
                          x2={seg.x2}
                          y2={seg.y2}
                          stroke="rgb(61 56 50 / 0.55)"
                          strokeWidth={1.5}
                          strokeLinecap="round"
                          strokeDasharray="3.5 4.5"
                        />
                        <circle
                          cx={seg.x1}
                          cy={seg.y1}
                          r={2.5}
                          fill="rgb(61 56 50 / 0.7)"
                        />
                      </g>
                    ))}
                </motion.svg>
              )}

              {open &&
                anchorVisible &&
                filtered.map((c, index) => {
                  const placement = layout.bubbles.find((b) => b.id === c.id);
                  if (!placement) return null;
                  const enterDelay = reduceMotion
                    ? 0
                    : index * BUBBLE_ENTER_STAGGER_S;
                  const exitDelay = reduceMotion
                    ? 0
                    : Math.max(0, filtered.length - 1 - index) * 0.04;

                  return (
                    <motion.div
                      key={`${threadKey}-bubble-${c.id}`}
                      data-comment-bubble-id={c.id}
                      className="pointer-events-auto absolute z-10 origin-center"
                      style={{
                        top: placement.top,
                        left: placement.left,
                      }}
                      initial={
                        reduceMotion
                          ? false
                          : {
                              opacity: 0,
                              scale: 0.55,
                              rotate: placement.rotate,
                            }
                      }
                      animate={{
                        opacity: 1,
                        scale: 1,
                        rotate: placement.rotate,
                        transition: {
                          delay: enterDelay,
                          duration: reduceMotion ? 0 : BUBBLE_ENTER_DURATION_S,
                          ease: [0.34, 1.2, 0.64, 1],
                        },
                      }}
                      exit={
                        reduceMotion
                          ? undefined
                          : {
                              opacity: 0,
                              scale: 0.72,
                              rotate: placement.rotate,
                              transition: {
                                delay: exitDelay,
                                duration: 0.18,
                                ease: "easeIn",
                              },
                            }
                      }
                    >
                      <CommentBubble
                        comment={c}
                        compact
                        animateEnter={false}
                        avatarSide={placement.avatarSide}
                        className="max-w-[20rem] sm:max-w-[22rem]"
                        onDark
                        editable={c.authorId === authorId}
                        onBodyChange={(next) => {
                          setLocalComments((prev) =>
                            prev.map((item) =>
                              item.id === c.id
                                ? { ...item, body: next }
                                : item,
                            ),
                          );
                          void commentHandlers?.patchComment(c.id, next);
                        }}
                        onBodyClear={() => {
                          setLocalComments((prev) =>
                            prev.filter((item) => item.id !== c.id),
                          );
                          void commentHandlers?.removeComment(c.id);
                        }}
                      />
                    </motion.div>
                  );
                })}

              {open && anchorVisible && (
                <motion.div
                  key={`${threadKey}-form`}
                  id={titleId}
                  role="dialog"
                  aria-label="コメントを入力"
                  className="pointer-events-auto z-[76] w-[min(22rem,calc(100vw-1.5rem))]"
                  initial={
                    reduceMotion
                      ? false
                      : { opacity: 0, scale: 0.55, y: 10 }
                  }
                  animate={{
                    opacity: 1,
                    scale: 1,
                    y: 0,
                    transition: {
                      duration: reduceMotion ? 0 : 0.22,
                      ease: [0.34, 1.2, 0.64, 1],
                    },
                  }}
                  exit={
                    reduceMotion
                      ? undefined
                      : {
                          opacity: 0,
                          scale: 0.9,
                          y: 8,
                          transition: { duration: 0.18, ease: "easeIn" },
                        }
                  }
                >
                  {/* ぼかし用 relative は内側に限定。外側の画面配置と同居させると画面外へ飛ぶ */}
                  <div className="comment-box-blur rounded-xl border border-black bg-white px-3 py-2.5 font-noto">
                    {filtered.length === 0 && (
                      <p className="mb-1.5 text-[10px] font-bold tracking-wide text-ink-muted">
                        まだコメントはありません
                      </p>
                    )}
                    <CommentForm
                      compact
                      autoFocus
                      onSubmit={(body) => {
                        void (async () => {
                          if (commentHandlers) {
                            const created = await commentHandlers.addComment({
                              authorId,
                              authorName,
                              body,
                              targetType,
                              targetId,
                              targetField,
                            });
                            setLocalComments((prev) => [...prev, created]);
                            return;
                          }
                          setLocalComments((prev) => [
                            ...prev,
                            {
                              id: `local-${Date.now()}`,
                              authorId,
                              authorName,
                              body,
                              targetType,
                              targetId,
                              targetField,
                              createdAt: new Date().toISOString(),
                            },
                          ]);
                        })();
                      }}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>,
          document.body,
        )}
    </div>
  );
}
