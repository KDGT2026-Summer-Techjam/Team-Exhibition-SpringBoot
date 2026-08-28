"use client";

import { InvitationCard } from "@/components/invitation/InvitationCard";
import { JoinItineraryForm } from "@/components/invitation/JoinItineraryForm";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useAuth } from "@/components/auth/AuthProvider";
import type { Invitation } from "@/types";
import { useRouter } from "next/navigation";

type InvitationJoinScreenProps = {
  invitation: Invitation;
  token: string;
};

export function InvitationJoinScreen({
  invitation,
  token,
}: InvitationJoinScreenProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const loginHref = `/login?returnUrl=${encodeURIComponent(`/invitations/${token}`)}`;

  return (
    <Modal
      open
      title={
        invitation.inviterName
          ? `${invitation.inviterName}さんから招待されています`
          : "しおりへの招待"
      }
      hideTitle
      onClose={() => undefined}
      hideFooter
      contentClassName="max-w-md p-6 sm:p-7"
    >
      <InvitationJoinBody
        invitation={invitation}
        token={token}
        isAuthenticated={isAuthenticated}
        onGoLogin={() => router.push(loginHref)}
      />
    </Modal>
  );
}

function InvitationJoinBody({
  invitation,
  token,
  isAuthenticated,
  onGoLogin,
}: {
  invitation: Invitation;
  token: string;
  isAuthenticated: boolean;
  onGoLogin: () => void;
}) {
  if (invitation.status === "expired") {
    return (
      <div className="space-y-5">
        <InvitationCard invitation={invitation} />
        <p className="text-center text-sm text-danger">
          この招待の有効期限が切れています
        </p>
        <Button type="button" variant="secondary" fullWidth onClick={onGoLogin}>
          ログインへ
        </Button>
      </div>
    );
  }

  if (invitation.status === "accepted") {
    return (
      <div className="space-y-5">
        <InvitationCard invitation={invitation} />
        <p className="text-center text-sm text-ink">
          この招待にはすでに参加しています
        </p>
        <Button type="button" fullWidth onClick={onGoLogin}>
          しおり一覧へ
        </Button>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="space-y-5">
        <InvitationCard invitation={invitation} />
        <p className="text-center text-sm text-ink-muted">
          参加するにはログインが必要です
        </p>
        <Button type="button" fullWidth onClick={onGoLogin}>
          ログインして参加する
        </Button>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <InvitationCard invitation={invitation} />
      <div className="mt-8">
        <JoinItineraryForm token={token} />
      </div>
    </div>
  );
}
