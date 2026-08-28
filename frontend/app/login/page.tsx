import { LoginForm } from "@/components/auth/LoginForm";
import { AuthScreen } from "@/components/auth/AuthScreen";
import { Suspense } from "react";

export default function LoginPage() {
  return (
    <AuthScreen heading="ログイン">
      <Suspense fallback={<p className="text-sm text-ink-muted">読み込み中…</p>}>
        <LoginForm />
      </Suspense>
    </AuthScreen>
  );
}
