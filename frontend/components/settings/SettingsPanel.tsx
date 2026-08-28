"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import { ChangePasswordForm } from "@/components/settings/ChangePasswordForm";
import { ChangeUsernameForm } from "@/components/settings/ChangeUsernameForm";
import { LogoutButton } from "@/components/settings/LogoutButton";
import { Card } from "@/components/ui/Card";

type SettingsPanelProps = {
  variant?: "page" | "modal";
};

export function SettingsPanel({ variant = "page" }: SettingsPanelProps) {
  const { user, isLoading } = useAuth();

  if (isLoading || !user) {
    return (
      <p className="text-sm text-ink-muted">{isLoading ? "読み込み中…" : ""}</p>
    );
  }

  const body = (
    <>
      {variant === "page" && (
        <header className="mb-8">
          <h2 className="font-heading text-xl font-bold text-ink">設定</h2>
        </header>
      )}

      <div className="space-y-8">
        <div className="space-y-0.5 text-sm text-ink-muted">
          <p>{user.username}</p>
          <p>{user.email}</p>
        </div>

        <Card className="overflow-hidden bg-paper p-0">
          <div className="border-b border-line/80 bg-paper-deep px-5 py-4">
            <h3 className="font-heading text-lg font-bold text-ink">
              ユーザー名変更
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-ink-muted">
              アプリ内で表示される名前を変更します
            </p>
          </div>
          <div className="p-5">
            <ChangeUsernameForm initialUsername={user.username} />
          </div>
        </Card>

        <Card className="overflow-hidden bg-paper p-0 shadow-md">
          <div className="border-b border-line/80 bg-paper-deep px-5 py-4">
            <h3 className="font-heading text-lg font-bold text-ink">
              パスワード変更
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-ink-muted">
              ログイン用のパスワードを変更します
            </p>
          </div>
          <div className="p-5">
            <ChangePasswordForm />
          </div>
        </Card>

        <Card className="overflow-hidden bg-paper p-0 shadow-md">
          <div className="border-b border-line/80 bg-paper-deep px-5 py-4">
            <h3 className="font-heading text-lg font-bold text-ink">
              ログアウト
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-ink-muted">
              この端末からログアウトします
            </p>
          </div>
          <div className="p-5">
            <LogoutButton />
          </div>
        </Card>
      </div>
    </>
  );

  if (variant === "modal") {
    return <div className="max-h-[70vh] overflow-y-auto pr-1">{body}</div>;
  }

  return (
    <div className="border border-line bg-paper p-5 text-ink">{body}</div>
  );
}
