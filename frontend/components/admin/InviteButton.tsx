"use client";

import { Button } from "@/components/ui/Button";
import { useItineraryData } from "@/contexts/ItineraryDataContext";
import { ApiError } from "@/lib/api/errors";
import { useState } from "react";

function CopyIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="8.5" y="8.5" width="11" height="11" rx="1.5" />
      <path d="M5.5 15.5h-1a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v1" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M5 12.5 9.5 17 19 7.5" />
    </svg>
  );
}

/** オーナーが招待URLを発行してクリップボードにコピーするだけのボタン */
export function InviteButton() {
  const { createInvitationLink } = useItineraryData();
  const [status, setStatus] = useState<"idle" | "copied" | "error">("idle");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    setStatus("idle");
    setError("");
    try {
      const url = await createInvitationLink();
      await navigator.clipboard.writeText(url);
      setStatus("copied");
      setTimeout(() => setStatus("idle"), 2000);
    } catch (err) {
      setStatus("error");
      setError(err instanceof ApiError ? err.message : "招待リンクの作成に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex max-w-full flex-col items-end gap-1.5">
      <Button
        type="button"
        variant="secondary"
        className="w-36 max-w-full shrink-0 gap-1.5 whitespace-nowrap px-3 py-1.5 text-xs"
        onClick={handleClick}
        disabled={loading}
      >
        {status === "copied" ? <CheckIcon /> : <CopyIcon />}
        {loading ? "発行中…" : "招待URLをコピー"}
      </Button>
      {status === "error" && (
        <p className="text-xs text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
