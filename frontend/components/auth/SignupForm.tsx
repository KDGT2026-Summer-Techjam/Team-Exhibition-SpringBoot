"use client";

import { Button } from "@/components/ui/Button";
import { PasswordField } from "@/components/ui/PasswordField";
import { TextField } from "@/components/ui/TextField";
import { signup } from "@/lib/api/users";
import { ApiError } from "@/lib/api/errors";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const ACCOUNT_PASSWORD_PATTERN = /^[a-zA-Z0-9]{10,}$/;

export function SignupForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !email || !password) {
      setError("すべての項目を入力してください");
      return;
    }
    if (!ACCOUNT_PASSWORD_PATTERN.test(password)) {
      setError("パスワードは英数字10文字以上です");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      await signup(username, email, password);
      router.push("/login");
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "登録に失敗しました",
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
        label="ユーザー名"
        value={username}
        onChange={(e) => {
          setUsername(e.target.value);
          clearError();
        }}
        autoComplete="username"
      />
      <TextField
        label="メールアドレス"
        type="email"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          clearError();
        }}
        autoComplete="email"
      />
      <div>
        <PasswordField
          label="パスワード"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            clearError();
          }}
          autoComplete="new-password"
        />
        <p className="mt-1 text-xs text-ink-muted">英数字10文字以上</p>
      </div>
      {error && (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      )}
      <Button type="submit" fullWidth disabled={submitting}>
        {submitting ? "登録中…" : "登録する"}
      </Button>
      <p className="text-center text-sm text-ink-muted">
        すでにアカウントをお持ちの方は{" "}
        <Link
          href="/login"
          className="font-medium text-accent hover:text-accent-hover hover:underline"
        >
          ログイン
        </Link>
      </p>
    </form>
  );
}
