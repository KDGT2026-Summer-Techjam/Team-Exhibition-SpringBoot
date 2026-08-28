"use client";

import { Button } from "@/components/ui/Button";
import { PasswordField } from "@/components/ui/PasswordField";
import { acceptInvitation } from "@/lib/api/invitations";
import { ApiError } from "@/lib/api/errors";
import { useRouter } from "next/navigation";
import { useState } from "react";

type JoinItineraryFormProps = {
  token: string;
};

const SHIORI_PASSWORD_PATTERN = /^[a-zA-Z0-9]{10,}$/;

export function JoinItineraryForm({ token }: JoinItineraryFormProps) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError("パスワードを入力してください");
      return;
    }
    if (!SHIORI_PASSWORD_PATTERN.test(password)) {
      setError("パスワードは英数字10文字以上です");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await acceptInvitation(token, password);
      router.push("/itineraries");
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "参加に失敗しました",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <PasswordField
        label="しおりパスワード"
        value={password}
        onChange={(e) => {
          setPassword(e.target.value);
          if (error) setError("");
        }}
        error={error}
        autoComplete="off"
      />
      <Button type="submit" fullWidth disabled={submitting}>
        {submitting ? "参加中…" : "加入する"}
      </Button>
    </form>
  );
}
