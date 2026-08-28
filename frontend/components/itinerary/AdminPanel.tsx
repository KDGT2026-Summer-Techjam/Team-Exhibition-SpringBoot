"use client";

import { DeleteItineraryForm } from "@/components/admin/DeleteItineraryForm";
import { ItinerarySettingsForm } from "@/components/admin/ItinerarySettingsForm";
import { MemberList } from "@/components/admin/MemberList";
import { PagePermissionSettings } from "@/components/admin/PagePermissionSettings";
import { useItineraryUi } from "@/components/itinerary/ItineraryUiProvider";
import { Card } from "@/components/ui/Card";
import { useItineraryData } from "@/contexts/ItineraryDataContext";
import type { ItineraryDetail } from "@/types";

type AdminPanelProps = {
  itinerary: ItineraryDetail;
  variant?: "page" | "modal";
};

export function AdminPanel({
  itinerary,
  variant = "page",
}: AdminPanelProps) {
  const { isOwner } = useItineraryUi();
  const { members, banMemberById } = useItineraryData();

  const body = (
    <>
      {variant === "page" && (
        <header className="mb-8">
          <h2 className="section-hand-label mb-2 text-ink-muted">しおり管理</h2>
          <p className="text-sm text-ink-muted">
            「{itinerary.title}」の権限・メンバー・基本情報を管理します
          </p>
        </header>
      )}

      <div className="space-y-8">
        {isOwner && <PagePermissionSettings days={itinerary.days} />}

        <Card className="overflow-hidden bg-paper p-0">
          <div className="border-b border-line/80 bg-paper-deep px-5 py-4">
            <h3 className="font-heading text-lg font-bold text-ink">
              メンバー一覧
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-ink-muted">
              参加中のメンバーを確認し、必要に応じて退出させられます
            </p>
          </div>
          <div className="p-5">
            <MemberList members={members} onBan={banMemberById} />
          </div>
        </Card>

        <Card className="overflow-hidden bg-paper p-0 shadow-md">
          <div className="border-b border-line/80 bg-paper-deep px-5 py-4">
            <h3 className="font-heading text-lg font-bold text-ink">
              しおり設定
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-ink-muted">
              タイトルや期間など、しおりの基本情報を編集します
            </p>
          </div>
          <div className="p-5">
            <ItinerarySettingsForm itinerary={itinerary} />
          </div>
        </Card>

        <Card className="overflow-hidden border-danger/30 bg-paper p-0 shadow-md">
          <div className="border-b border-danger/20 bg-[#f8ecec] px-5 py-4">
            <h3 className="font-heading text-lg font-bold text-danger">
              危険な操作
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-ink-muted">
              削除すると元に戻せません。十分に確認してから実行してください
            </p>
          </div>
          <div className="p-5">
            <DeleteItineraryForm itineraryTitle={itinerary.title} />
          </div>
        </Card>
      </div>
    </>
  );

  if (variant === "modal") {
    return <div className="max-h-[min(80dvh,40rem)] overflow-y-auto">{body}</div>;
  }

  return (
    <div className="relative shiori-surface min-h-[75vh] border border-line">
      <div className="shiori-content px-4 py-6 sm:px-8 sm:py-8">{body}</div>
    </div>
  );
}
