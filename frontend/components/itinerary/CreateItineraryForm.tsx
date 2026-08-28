"use client";

import { Button } from "@/components/ui/Button";
import { DateRangeField } from "@/components/ui/DateRangeField";
import { PasswordField } from "@/components/ui/PasswordField";
import { TextArea } from "@/components/ui/TextArea";
import { TextField } from "@/components/ui/TextField";
import type { ItinerarySummary } from "@/types";
import { useRouter } from "next/navigation";
import { useState } from "react";

export type CreateItineraryInput = {
  title: string;
  password: string;
  description: string;
  startDate?: string;
  endDate?: string;
};

type CreateItineraryFormProps = {
  onCreate?: (input: CreateItineraryInput) => void;
};

export function toItinerarySummary(
  input: CreateItineraryInput,
  id: string,
): ItinerarySummary {
  return {
    id,
    title: input.title,
    description: input.description || undefined,
    startDate: input.startDate || undefined,
    endDate: input.endDate || undefined,
    createdAt: new Date().toISOString(),
    isOwner: true,
  };
}

export function CreateItineraryForm({ onCreate }: CreateItineraryFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [password, setPassword] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [titleError, setTitleError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [rangeError, setRangeError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTitleError("");
    setPasswordError("");
    setRangeError("");

    let invalid = false;
    if (!title.trim()) {
      setTitleError("タイトルを入力してください");
      invalid = true;
    }
    if (!password) {
      setPasswordError("パスワードを入力してください");
      invalid = true;
    } else if (!/^[a-zA-Z0-9]{10,}$/.test(password)) {
      setPasswordError("パスワードは英数字10文字以上です");
      invalid = true;
    }
    if (startDate && endDate && endDate < startDate) {
      setRangeError("終了日は開始日以降にしてください");
      invalid = true;
    }
    if (invalid) return;

    const payload: CreateItineraryInput = {
      title: title.trim(),
      password,
      description: description.trim(),
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    };

    if (onCreate) {
      onCreate(payload);
      return;
    }

    router.push("/itineraries");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <TextField
        label="タイトル"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        error={titleError}
        required
      />
      <PasswordField
        label="パスワード"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={passwordError}
        required
      />
      <TextArea
        label="説明"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={3}
      />
      <DateRangeField
        startValue={startDate}
        endValue={endDate}
        onStartChange={setStartDate}
        onEndChange={setEndDate}
        error={rangeError}
      />
      <Button type="submit" fullWidth>
        作成する
      </Button>
    </form>
  );
}
