"use client";

import { Button } from "@/components/ui/Button";
import { DateRangeField } from "@/components/ui/DateRangeField";
import { PasswordField } from "@/components/ui/PasswordField";
import { TextArea } from "@/components/ui/TextArea";
import { TextField } from "@/components/ui/TextField";
import { useItineraryData } from "@/contexts/ItineraryDataContext";
import { ApiError } from "@/lib/api/errors";
import type { ItineraryDetail } from "@/types";
import { useState } from "react";

type ItinerarySettingsFormProps = {
  itinerary: ItineraryDetail;
};

export function ItinerarySettingsForm({ itinerary }: ItinerarySettingsFormProps) {
  const { saveAdminSettings } = useItineraryData();
  const [title, setTitle] = useState(itinerary.title);
  const [password, setPassword] = useState("");
  const [description, setDescription] = useState(itinerary.description ?? "");
  const [startDate, setStartDate] = useState(itinerary.startDate ?? "");
  const [endDate, setEndDate] = useState(itinerary.endDate ?? "");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await saveAdminSettings({
        title: title.trim(),
        password: password || undefined,
        description: description.trim(),
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      setPassword("");
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "保存に失敗しました",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <TextField label="タイトル" value={title} onChange={(e) => setTitle(e.target.value)} />
      <PasswordField
        label="パスワード"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <TextArea
        label="説明"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={2}
      />
      <DateRangeField
        startValue={startDate}
        endValue={endDate}
        onStartChange={setStartDate}
        onEndChange={setEndDate}
      />
      <Button type="submit" disabled={submitting}>
        {submitting ? "保存中…" : "保存"}
      </Button>
      {error && (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      )}
      {saved && <p className="text-sm text-accent">保存しました</p>}
    </form>
  );
}
