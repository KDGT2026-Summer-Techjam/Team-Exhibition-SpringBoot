"use client";

import { InvitationJoinScreen } from "@/components/invitation/InvitationJoinScreen";
import { fetchPublicInvitation } from "@/lib/api/invitations";
import { ApiError } from "@/lib/api/errors";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { Invitation } from "@/types";

export default function InvitationPage() {
  const params = useParams<{ code: string }>();
  const token = params.code;
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetchPublicInvitation(token)
      .then(setInvitation)
      .catch((err) => {
        setError(
          err instanceof ApiError ? err.message : "招待の取得に失敗しました",
        );
      })
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-on-stage-muted">
        読み込み中…
      </div>
    );
  }

  if (error || !invitation) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-danger">
        {error || "招待が見つかりません"}
      </div>
    );
  }

  return <InvitationJoinScreen invitation={invitation} token={token} />;
}
