"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/Button";
import { PasswordField } from "@/components/ui/PasswordField";
import { TextField } from "@/components/ui/TextField";
import { ApiError } from "@/lib/api/errors";
import { sanitizeReturnUrl } from "@/lib/shiori/id";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

const ACCOUNT_PASSWORD_PATTERN = /^[a-zA-Z0-9]{10,}$/;

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginId || !password) {
      setError("入力内容を確認してください");
      return;
    }
    if (!ACCOUNT_PASSWORD_PATTERN.test(password)) {
      setError("パスワードは英数字10文字以上です");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      await login(loginId, password);
      router.push(sanitizeReturnUrl(searchParams.get("returnUrl")));
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "ログインに失敗しました",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const clearError = () => {
    if (error) setError("");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <TextField
        label="メールアドレスまたはユーザー名"
        value={loginId}
        onChange={(e) => {
          setLoginId(e.target.value);
          clearError();
        }}
        autoComplete="username"
      />
      <PasswordField
        label="パスワード"
        value={password}
        onChange={(e) => {
          setPassword(e.target.value);
          clearError();
        }}
        autoComplete="current-password"
      />
      {error && (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      )}
      <Button type="submit" fullWidth disabled={submitting}>
        {submitting ? "ログイン中…" : "ログイン"}
      </Button>
      <p className="text-center text-sm text-ink-muted">
        アカウントをお持ちでない方は{" "}
        <Link
          href="/signup"
          className="font-medium text-accent hover:text-accent-hover hover:underline"
        >
          新規登録
        </Link>
      </p>
    </form>
  );
}
