"use client";

import {
  PLAN_PERMISSION_KEY,
  useItineraryUi,
} from "@/components/itinerary/ItineraryUiProvider";
import { Card } from "@/components/ui/Card";
import { Toggle } from "@/components/ui/Toggle";
import { formatDayTabDate } from "@/lib/utils";
import type { ShioriDay } from "@/types";

type PagePermissionSettingsProps = {
  days: ShioriDay[];
};

type PermissionRow = {
  key: string;
  label: string;
  subLabel?: string;
};

/** 旅行計画・各日ごとの編集／コメント権限を一覧で操作する */
export function PagePermissionSettings({ days }: PagePermissionSettingsProps) {
  const { getPagePermission, setPageEditable, setPageCommentOpen } =
    useItineraryUi();

  const rows: PermissionRow[] = [
    { key: PLAN_PERMISSION_KEY, label: "旅行計画" },
    ...days.map((day) => ({
      key: day.id,
      label: `${day.dayNumber}日目`,
      subLabel: formatDayTabDate(day.tripDate),
    })),
  ];

  return (
    <Card className="overflow-hidden bg-paper p-0 shadow-md">
      <div className="border-b border-line/80 bg-paper-deep px-5 py-4">
        <h2 className="font-heading text-lg font-bold text-ink">
          ページ別の権限設定
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-ink-muted">
          各ページごとに、メンバーの編集とコメントの可否を切り替えられます
        </p>
      </div>

      {/* デスクトップ向け: 表形式 */}
      <div className="hidden sm:block">
        <div className="flex items-center justify-between gap-6 border-b border-line/70 bg-paper-deep/80 px-5 py-2.5 text-xs font-medium tracking-wide text-ink-muted">
          <span>ページ</span>
          <div className="flex shrink-0 items-center gap-8 pr-1">
            <span className="w-24 text-center">編集を許可</span>
            <span className="w-24 text-center">コメント機能</span>
          </div>
        </div>

        <ul>
          {rows.map((row, index) => {
            const permission = getPagePermission(row.key);
            return (
              <li
                key={row.key}
                className={
                  index % 2 === 0 ? "bg-paper" : "bg-paper-deep/55"
                }
              >
                <div className="flex items-center justify-between gap-6 px-5 py-3.5">
                  <div className="min-w-0">
                    <p className="font-heading font-bold text-ink">{row.label}</p>
                    {row.subLabel && (
                      <p className="mt-0.5 text-xs text-ink-muted">
                        {row.subLabel}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-8">
                    <div className="flex w-24 justify-center">
                      <Toggle
                        layout="inline"
                        tone="accent"
                        label=""
                        ariaLabel="編集を許可"
                        checked={permission.editable}
                        onChange={(checked) => setPageEditable(row.key, checked)}
                      />
                    </div>
                    <div className="flex w-24 justify-center">
                      <Toggle
                        layout="inline"
                        tone="warm"
                        label=""
                        ariaLabel="コメント機能"
                        checked={permission.commentOpen}
                        onChange={(checked) =>
                          setPageCommentOpen(row.key, checked)
                        }
                      />
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* モバイル向け: カード積み上げ */}
      <ul className="divide-y divide-line/70 sm:hidden">
        {rows.map((row) => {
          const permission = getPagePermission(row.key);
          return (
            <li key={row.key} className="space-y-3 bg-paper px-5 py-4">
              <div>
                <p className="font-heading font-bold text-ink">{row.label}</p>
                {row.subLabel && (
                  <p className="mt-0.5 text-xs text-ink-muted">{row.subLabel}</p>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <Toggle
                  layout="stacked"
                  tone="accent"
                  label="編集を許可"
                  checked={permission.editable}
                  onChange={(checked) => setPageEditable(row.key, checked)}
                />
                <Toggle
                  layout="stacked"
                  tone="warm"
                  label="コメント機能"
                  checked={permission.commentOpen}
                  onChange={(checked) => setPageCommentOpen(row.key, checked)}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
