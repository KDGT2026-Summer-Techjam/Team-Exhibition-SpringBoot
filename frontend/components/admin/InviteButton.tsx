"use client";

import { Button } from "@/components/ui/Button";
import { useItineraryData } from "@/contexts/ItineraryDataContext";
import { ApiError } from "@/lib/api/errors";
import { useState } from "react";

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
    <div className="flex items-center gap-3">
      <Button
        type="button"
        variant="secondary"
        className="shrink-0 px-3 py-1.5 text-xs"
        onClick={handleClick}
        disabled={loading}
      >
        {loading ? "発行中…" : "招待する"}
      </Button>
      {status === "copied" && (
        <p className="text-xs text-accent">招待リンクをコピーしました</p>
      )}
      {status === "error" && (
        <p className="text-xs text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
