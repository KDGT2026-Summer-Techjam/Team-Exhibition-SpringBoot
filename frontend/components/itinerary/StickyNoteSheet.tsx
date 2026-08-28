import { cn } from "@/lib/utils";
import type { CSSProperties } from "react";

/** 日ページで回す付箋カラー（5種） */
export const STICKY_VARIANTS = [
  "yellow",
  "pink",
  "orange",
  "sky",
  "kraft",
] as const;

export type StickyNoteVariant = (typeof STICKY_VARIANTS)[number];

/** 日数目とスロットから付箋色を決める（同じ日でも要素ごとに色を分ける） */
export function stickyVariantForDay(
  dayNumber: number,
  slot = 0,
): StickyNoteVariant {
  const index =
    (Math.max(0, dayNumber - 1) + Math.max(0, slot)) % STICKY_VARIANTS.length;
  return STICKY_VARIANTS[index]!;
}

/** 日ページ内の付箋役割 */
export const STICKY_SLOT = {
  photo: 0,
  roadmap: 2,
  notes: 4,
} as const;

export type PageSide = "left" | "right";
export type ScrapFacing = "inward" | "outward";

/** 手で貼ったような付箋の傾き・テープ位置（rotate はページ位置で符号を付ける） */
export type ScrapPose = {
  rotateDeg: number;
  tapeLeftPct: number;
  tapeRotateDeg: number;
  shiftX: number;
  shiftY: number;
  tapeWidthRem: number;
  /** 未指定時はテープ付近（上端）を軸にする */
  origin?: string;
};

type ScrapPoseSeed = {
  tiltDeg: number;
  tapeOffPct: number;
  tapeTiltDeg: number;
  shift: number;
  shiftY: number;
  tapeWidthRem: number;
};

/** 写真付箋の大きさ・ズレ（符号は綴じ側向きで後から決める） */
const PHOTO_POSES: ScrapPoseSeed[] = [
  { tiltDeg: 2.4, tapeOffPct: 8, tapeTiltDeg: 3.1, shift: 8, shiftY: 2, tapeWidthRem: 4.25 },
  { tiltDeg: 2.7, tapeOffPct: 14, tapeTiltDeg: 2.7, shift: 10, shiftY: 0, tapeWidthRem: 3.9 },
  { tiltDeg: 1.5, tapeOffPct: 18, tapeTiltDeg: 1.6, shift: 14, shiftY: 6, tapeWidthRem: 4.6 },
  { tiltDeg: 2.0, tapeOffPct: 20, tapeTiltDeg: 3.8, shift: 6, shiftY: -2, tapeWidthRem: 4.1 },
  { tiltDeg: 2.8, tapeOffPct: 6, tapeTiltDeg: 4.0, shift: 4, shiftY: 4, tapeWidthRem: 3.7 },
  { tiltDeg: 1.6, tapeOffPct: 22, tapeTiltDeg: 1.8, shift: 8, shiftY: -4, tapeWidthRem: 4.5 },
];

/** 予定付箋。縦に長いので傾きはごく小さく、回転軸も中央にして下端が跳ねないようにする */
const ROADMAP_POSES: ScrapPoseSeed[] = [
  { tiltDeg: 0.28, tapeOffPct: 8, tapeTiltDeg: 0.8, shift: 2, shiftY: 0, tapeWidthRem: 4.25 },
  { tiltDeg: 0.32, tapeOffPct: 14, tapeTiltDeg: 0.85, shift: 2, shiftY: 1, tapeWidthRem: 3.85 },
  { tiltDeg: 0.24, tapeOffPct: 16, tapeTiltDeg: 0.7, shift: 2, shiftY: 0, tapeWidthRem: 4.5 },
  { tiltDeg: 0.3, tapeOffPct: 10, tapeTiltDeg: 0.8, shift: 2, shiftY: -1, tapeWidthRem: 4.0 },
  { tiltDeg: 0.26, tapeOffPct: 8, tapeTiltDeg: 0.9, shift: 2, shiftY: 1, tapeWidthRem: 4.35 },
  { tiltDeg: 0.3, tapeOffPct: 18, tapeTiltDeg: 0.75, shift: 2, shiftY: 0, tapeWidthRem: 3.7 },
];

export type NotesFramePose = {
  rotateDeg: number;
  titleAlign: "center" | "left";
};

const NOTES_POSES: { tiltDeg: number; titleAlign: "center" | "left" }[] = [
  { tiltDeg: 0.7, titleAlign: "center" },
  { tiltDeg: 0.85, titleAlign: "left" },
  { tiltDeg: 0.5, titleAlign: "center" },
  { tiltDeg: 0.9, titleAlign: "left" },
  { tiltDeg: 0.6, titleAlign: "center" },
  { tiltDeg: 0.75, titleAlign: "left" },
];

function poseAt<T>(table: readonly T[], dayNumber: number): T {
  const index = (Math.max(1, dayNumber) - 1) % table.length;
  return table[index]!;
}

/**
 * 見開き全体の向き。奇数日は綴じ側へ向かい合い、偶数日は小口側へ開く。
 * 3・6日目だけ予定を逆向きにして、同じ見開きでも差を出す。
 */
function facingFor(dayNumber: number, slot: number): ScrapFacing {
  const spread: ScrapFacing = dayNumber % 2 === 1 ? "inward" : "outward";
  const index = (Math.max(1, dayNumber) - 1) % 6;
  if ((index === 2 || index === 5) && slot === STICKY_SLOT.roadmap) {
    return spread === "inward" ? "outward" : "inward";
  }
  return spread;
}

/**
 * 左ページ: 内側＝右へ傾く(+) / 外側＝左へ傾く(-)
 * 右ページ: 内側＝左へ傾く(-) / 外側＝右へ傾く(+)
 */
function facingSign(side: PageSide, facing: ScrapFacing): 1 | -1 {
  if (side === "left") {
    return facing === "inward" ? 1 : -1;
  }
  return facing === "inward" ? -1 : 1;
}

function orientPose(
  seed: ScrapPoseSeed,
  side: PageSide,
  facing: ScrapFacing,
): ScrapPose {
  const sign = facingSign(side, facing);
  return {
    rotateDeg: seed.tiltDeg * sign,
    tapeLeftPct: Math.min(76, Math.max(24, 50 + seed.tapeOffPct * sign)),
    tapeRotateDeg: seed.tapeTiltDeg * sign,
    shiftX: seed.shift * sign,
    shiftY: seed.shiftY,
    tapeWidthRem: seed.tapeWidthRem,
  };
}

/** 日数目＋ページ位置から付箋の貼り方を決める（同じ日は毎回同じ） */
export function stickyPoseForDay(
  dayNumber: number,
  slot: number,
  side: PageSide,
): ScrapPose {
  const seed =
    slot === STICKY_SLOT.roadmap
      ? poseAt(ROADMAP_POSES, dayNumber)
      : poseAt(PHOTO_POSES, dayNumber);
  const pose = orientPose(seed, side, facingFor(dayNumber, slot));
  // 予定は高さがあるので、テープ付近ではなく中央を軸にして傾きを抑える
  if (slot === STICKY_SLOT.roadmap) {
    pose.origin = "50% 50%";
  }
  return pose;
}

/** 備考枠のわずかな傾きとタイトル位置（写真と同じページ向き） */
export function notesFrameForDay(
  dayNumber: number,
  side: PageSide,
): NotesFramePose {
  const seed = poseAt(NOTES_POSES, dayNumber);
  const sign = facingSign(side, facingFor(dayNumber, STICKY_SLOT.notes));
  return {
    rotateDeg: seed.tiltDeg * sign,
    titleAlign: seed.titleAlign,
  };
}

/** 写真付箋の幅（日ごとに少し変える） */
export function photoSheetWidthClass(dayNumber: number): string {
  const widths = [
    "w-[90%]",
    "w-[86%]",
    "w-[94%]",
    "w-[88%]",
    "w-[92%]",
    "w-[84%]",
  ];
  return poseAt(widths, dayNumber);
}

/** 持ち物の細長い付箋: 傾きは小さく、リストが崩れないよう縦ズレはほぼ 0 */
const PACKING_STRIP_POSES: ScrapPose[] = [
  { rotateDeg: -0.7, tapeLeftPct: 50, tapeRotateDeg: 0, shiftX: 2, shiftY: 0, tapeWidthRem: 3 },
  { rotateDeg: 0.85, tapeLeftPct: 50, tapeRotateDeg: 0, shiftX: -3, shiftY: 1, tapeWidthRem: 3 },
  { rotateDeg: -1.0, tapeLeftPct: 50, tapeRotateDeg: 0, shiftX: 4, shiftY: 0, tapeWidthRem: 3 },
  { rotateDeg: 0.55, tapeLeftPct: 50, tapeRotateDeg: 0, shiftX: -2, shiftY: 0, tapeWidthRem: 3 },
  { rotateDeg: -0.45, tapeLeftPct: 50, tapeRotateDeg: 0, shiftX: 1, shiftY: 1, tapeWidthRem: 3 },
  { rotateDeg: 0.95, tapeLeftPct: 50, tapeRotateDeg: 0, shiftX: -4, shiftY: 0, tapeWidthRem: 3 },
];

/** 持ち物行 index から細長い付箋の傾きを決める */
export function packingStripPose(index: number): ScrapPose {
  const i = Math.abs(index) % PACKING_STRIP_POSES.length;
  return PACKING_STRIP_POSES[i]!;
}

/** 持ち物行 index から付箋色を循環させる */
export function packingStripVariant(index: number): StickyNoteVariant {
  const i = Math.abs(index) % STICKY_VARIANTS.length;
  return STICKY_VARIANTS[i]!;
}

type StickyNoteSize = "sheet" | "strip";

type StickyNoteSheetProps = {
  children: React.ReactNode;
  className?: string;
  /** 紙の上に少し傾けて貼った感じ（pose 未指定時の既定傾き） */
  tilt?: boolean;
  /** 日ごとの貼り方。指定時は tilt より優先する */
  pose?: ScrapPose;
  /** 色バリエーション（未指定時は kraft） */
  variant?: StickyNoteVariant;
  /** マスキングテープでしおりに貼った見た目（既定: sheet はあり / strip はなし） */
  taped?: boolean;
  /** sheet=通常の付箋 / strip=持ち物用の細長い短冊 */
  size?: StickyNoteSize;
};

function poseStyle(pose: ScrapPose): CSSProperties {
  return {
    transform: `translate(${pose.shiftX}px, ${pose.shiftY}px) rotate(${pose.rotateDeg}deg)`,
    transformOrigin: pose.origin ?? "50% 8%",
  };
}

function tapeStyle(pose: ScrapPose): CSSProperties {
  return {
    left: `${pose.tapeLeftPct}%`,
    width: `${pose.tapeWidthRem}rem`,
    transform: `translateX(-50%) rotate(${pose.tapeRotateDeg}deg)`,
  };
}

/**
 * メモ帳からちぎった付箋シート。
 * 上辺はギザギザ（ミシン目風）。マスキングテープで紙面に貼った見た目。
 */
export function StickyNoteSheet({
  children,
  className,
  tilt = false,
  pose,
  variant = "kraft",
  taped,
  size = "sheet",
}: StickyNoteSheetProps) {
  const isStrip = size === "strip";
  // 短冊は並べると騒がしいのでテープなし。通常シートは既定でテープあり
  const showTape = taped ?? !isStrip;
  const fallbackTilt: ScrapPose | undefined = tilt
    ? {
        rotateDeg: -0.8,
        tapeLeftPct: 50,
        tapeRotateDeg: -2.5,
        shiftX: 0,
        shiftY: 0,
        tapeWidthRem: 4.25,
      }
    : undefined;
  const applied = pose ?? fallbackTilt;

  return (
    <div
      data-sticky-note
      data-variant={variant}
      data-size={size}
      className={cn(
        "sticky-note-sheet relative",
        isStrip
          ? "packing-strip-slot"
          : "pt-4 pb-5 pl-4 pr-3 sm:pt-5 sm:pb-6 sm:pl-5 sm:pr-4",
        className,
      )}
      style={applied ? poseStyle(applied) : undefined}
    >
      {/* しおりに貼るマスキングテープ */}
      {showTape && (
        <span
          className={cn(
            "washi-tape pointer-events-none absolute top-[-0.35rem] z-20 h-5",
            !applied && "left-1/2 w-[4.25rem] -translate-x-1/2 rotate-[-2.5deg]",
          )}
          style={applied ? tapeStyle(applied) : undefined}
          aria-hidden
        />
      )}

      {/* 上辺ミシン目（短冊は左接着帯との重なりで横筋になるので出さない） */}
      {!isStrip && (
        <svg
          className="pointer-events-none absolute top-0 left-0 h-3 w-full text-[var(--sticky-bg)]"
          viewBox="0 0 200 12"
          preserveAspectRatio="none"
          aria-hidden
        >
          <path
            fill="currentColor"
            d="M0,12 L0,5 Q5,0 10,5 Q15,10 20,5 Q25,0 30,5 Q35,10 40,5 Q45,0 50,5 Q55,10 60,5 Q65,0 70,5 Q75,10 80,5 Q85,0 90,5 Q95,10 100,5 Q105,0 110,5 Q115,10 120,5 Q125,0 130,5 Q135,10 140,5 Q145,0 150,5 Q155,10 160,5 Q165,0 170,5 Q175,10 180,5 Q185,0 190,5 Q195,10 200,5 L200,12 Z"
          />
        </svg>
      )}

      <div className="relative">{children}</div>
    </div>
  );
}
