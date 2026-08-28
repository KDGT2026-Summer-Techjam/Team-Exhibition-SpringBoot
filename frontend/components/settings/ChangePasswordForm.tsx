"use client";

import { Button } from "@/components/ui/Button";
import { PasswordField } from "@/components/ui/PasswordField";
import { updatePassword } from "@/lib/api/users";
import { ApiError } from "@/lib/api/errors";
import { useState } from "react";

export function ChangePasswordForm() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (next.length < 10) {
      setError("新しいパスワードは英数字10文字以上です");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await updatePassword(current, next);
      setCurrent("");
      setNext("");
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "変更に失敗しました",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PasswordField
        label="現在のパスワード"
        value={current}
        onChange={(e) => setCurrent(e.target.value)}
      />
      <PasswordField
        label="新しいパスワード"
        value={next}
        onChange={(e) => setNext(e.target.value)}
        error={error}
      />
      <Button type="submit" disabled={submitting}>
        {submitting ? "変更中…" : "変更する"}
      </Button>
      {saved && <p className="text-sm text-accent">変更しました</p>}
    </form>
  );
}
