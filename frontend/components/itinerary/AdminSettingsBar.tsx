"use client";

import {
  PLAN_PERMISSION_KEY,
  useItineraryUi,
} from "@/components/itinerary/ItineraryUiProvider";
import { Toggle } from "@/components/ui/Toggle";

function ShieldIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5 shrink-0 text-ink-muted"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden
    >
      <path d="M12 3.2 5.5 6v5.2c0 4.3 2.9 7.3 6.5 8.6 3.6-1.3 6.5-4.3 6.5-8.6V6L12 3.2Z" />
      <circle cx="12" cy="10" r="1.7" />
      <path d="M9.4 15c.6-1.2 1.5-1.8 2.6-1.8s2 .6 2.6 1.8" />
    </svg>
  );
}

/** 作成者向け: 編集許可・コメント機能の横並び設定バー */
export function AdminSettingsBar() {
  const { getPagePermission, setPageEditable, setPageCommentOpen } = useItineraryUi();
  const planPermission = getPagePermission(PLAN_PERMISSION_KEY);

  return (
    <div className="flex flex-wrap items-center gap-x-8 gap-y-3 rounded-2xl border border-line/60 bg-paper-deep/80 px-5 py-3 shadow-sm">
      <div className="flex items-center gap-2 text-ink">
        <ShieldIcon />
        <span className="text-sm font-medium">管理者用設定</span>
      </div>
      <Toggle
        layout="inline"
        tone="accent"
        label="編集を許可"
        checked={planPermission.editable}
        onChange={(checked) => setPageEditable(PLAN_PERMISSION_KEY, checked)}
      />
      <Toggle
        layout="inline"
        tone="warm"
        label="コメント機能"
        checked={planPermission.commentOpen}
        onChange={(checked) => setPageCommentOpen(PLAN_PERMISSION_KEY, checked)}
      />
    </div>
  );
}
