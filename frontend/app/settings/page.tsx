"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import { ChangePasswordForm } from "@/components/settings/ChangePasswordForm";
import { ChangeUsernameForm } from "@/components/settings/ChangeUsernameForm";
import { LogoutButton } from "@/components/settings/LogoutButton";
import { PageContainer } from "@/components/ui/PageContainer";
import Link from "next/link";

export default function SettingsPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <PageContainer narrow>
        <p className="text-sm text-on-stage-muted">読み込み中…</p>
      </PageContainer>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <PageContainer narrow>
        <div className="mb-6 flex items-center justify-between gap-4">
          <h1 className="font-heading text-xl font-bold text-on-stage">設定</h1>
          <Link
            href="/itineraries"
            className="text-sm text-on-stage-muted transition-colors hover:text-on-stage"
          >
            ← しおり一覧
          </Link>
        </div>

        <div className="rounded-none border border-line bg-paper p-5 text-ink notebook-bg">
          <div className="mb-6 space-y-0.5 text-sm text-ink-muted">
            <p>{user.username}</p>
            <p>{user.email}</p>
          </div>

          <section className="space-y-4">
            <h2 className="font-heading text-lg font-bold text-ink">ユーザー名変更</h2>
            <ChangeUsernameForm initialUsername={user.username} />
          </section>

          <section className="mt-10 space-y-4">
            <h2 className="font-heading text-lg font-bold text-ink">パスワード変更</h2>
            <ChangePasswordForm />
          </section>

          <section className="mt-10">
            <LogoutButton />
          </section>
        </div>
      </PageContainer>
    </>
  );
}
