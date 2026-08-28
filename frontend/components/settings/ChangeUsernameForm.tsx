"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { updateUsername } from "@/lib/api/users";
import { ApiError } from "@/lib/api/errors";
import { useState } from "react";

type ChangeUsernameFormProps = {
  initialUsername: string;
};

export function ChangeUsernameForm({ initialUsername }: ChangeUsernameFormProps) {
  const { refreshUser } = useAuth();
  const [username, setUsername] = useState(initialUsername);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await updateUsername(username.trim());
      await refreshUser();
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
      <TextField
        label="ユーザー名"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <Button type="submit" disabled={submitting}>
        {submitting ? "変更中…" : "変更する"}
      </Button>
      {error && (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      )}
      {saved && <p className="text-sm text-accent">変更しました</p>}
    </form>
  );
}
