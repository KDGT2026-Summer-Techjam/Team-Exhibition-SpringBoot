import type { RoadmapItem } from "@/types";

/** クラス名を結合する */
export function cn(...classes: (string | false | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

/** ロードマップ予定の金額合計 */
export function sumRoadmapAmounts(items: RoadmapItem[]): number {
  return items.reduce((sum, item) => sum + (item.amount ?? 0), 0);
}

/** 円を表示用にフォーマットする */
export function formatYen(amount: number): string {
  return `￥${amount.toLocaleString("ja-JP")}`;
}

const WEEKDAYS_JA = ["日", "月", "火", "水", "木", "金", "土"] as const;

/** YYYY-MM-DD をローカル日付として解釈する（タイムゾーンずれ防止） */
function parseLocalDate(date: string): Date {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** 日付を表示用にフォーマットする */
export function formatDate(date: string): string {
  const d = parseLocalDate(date);
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}`;
}

/** タブ用: 11/15 (水) 形式 */
export function formatDayTabDate(date: string): string {
  const d = parseLocalDate(date);
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const weekday = WEEKDAYS_JA[d.getDay()];
  return `${month}/${day} (${weekday})`;
}

/** 期間を表示用にフォーマットする */
export function formatDateRange(start?: string, end?: string): string {
  if (!start && !end) return "";
  if (start && end) return `${formatDate(start)} 〜 ${formatDate(end)}`;
  if (start) return `${formatDate(start)} 〜`;
  return `〜 ${formatDate(end!)}`;
}

export type CoverDateRange = {
  year: string;
  start: string;
  end: string;
};

function dateParts(date: string) {
  const d = parseLocalDate(date);
  return {
    year: d.getFullYear(),
    month: d.getMonth() + 1,
    day: d.getDate(),
    weekday: WEEKDAYS_JA[d.getDay()],
  };
}

/** 表紙ラベル用の短い日付（例: 8/1（土）） */
function formatCoverDay(date: string): string {
  const { month, day, weekday } = dateParts(date);
  return `${month}/${day}（${weekday}）`;
}

/** 閉じた表紙用: 年と開始・終了を分けて返す */
export function formatCoverDateRange(
  start?: string,
  end?: string,
): CoverDateRange | null {
  if (!start && !end) return null;

  if (start && end) {
    const s = dateParts(start);
    const e = dateParts(end);
    const year =
      s.year === e.year ? `${s.year}年` : `${s.year}年 〜 ${e.year}年`;
    return {
      year,
      start: formatCoverDay(start),
      end: formatCoverDay(end),
    };
  }

  const only = start ?? end!;
  const { year } = dateParts(only);
  if (start) {
    return { year: `${year}年`, start: formatCoverDay(start), end: "" };
  }
  return { year: `${year}年`, start: "", end: formatCoverDay(end!) };
}

/** コメント用の短い日時 */
export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${month}/${day} ${hours}:${minutes}`;
}

/** ホバー操作の共通トランジション */
export const hoverTransition =
  "transition-[transform,color,background-color,border-color,opacity,box-shadow] duration-[180ms] ease-[cubic-bezier(0.22,1,0.36,1)]";

/** ボタンホバー: 浮かせず、中央から拡大するポップ */
export const hoverPop =
  "origin-center hover:z-10 hover:scale-110 disabled:hover:scale-100";
