import type { Invitation } from "@/types";

type InvitationCardProps = {
  invitation: Invitation;
};

/** 招待メッセージ */
export function InvitationCard({ invitation }: InvitationCardProps) {
  return (
    <div className="space-y-3 text-center">
      {invitation.inviterName ? (
        <p className="font-heading text-xl font-bold leading-snug text-ink">
          {invitation.inviterName}さんから招待されています
        </p>
      ) : (
        <p className="font-heading text-xl font-bold leading-snug text-ink">
          しおりへの招待
        </p>
      )}
      <p className="text-lg text-ink">{invitation.shioriTitle}</p>
      {invitation.message && (
        <p className="text-sm leading-relaxed text-ink-muted">
          {invitation.message}
        </p>
      )}
    </div>
  );
}
