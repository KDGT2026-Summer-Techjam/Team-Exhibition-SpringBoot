"use client";

import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import type { Member } from "@/types";
import { useState } from "react";

type MemberListProps = {
  members: Member[];
  onBan?: (userId: string) => void;
};

export function MemberList({ members: initial, onBan }: MemberListProps) {
  const [members, setMembers] = useState(initial);
  const [banTarget, setBanTarget] = useState<Member | null>(null);

  const handleBan = () => {
    if (!banTarget) return;
    setMembers((prev) => prev.filter((m) => m.userId !== banTarget.userId));
    onBan?.(banTarget.userId);
    setBanTarget(null);
  };

  return (
    <>
      <ul className="divide-y divide-line/60 overflow-hidden rounded-xl border border-line/70 bg-paper/50">
        {members.map((member) => (
          <li
            key={member.userId}
            className="group flex items-center justify-between gap-3 px-4 py-3.5 hover:bg-paper-deep/50"
          >
            <div className="min-w-0">
              <p className="truncate font-medium text-ink">{member.username}</p>
              <p className="mt-0.5 text-xs text-ink-muted">
                {member.role === "owner" ? "作成者" : "メンバー"}
              </p>
            </div>
            {member.role !== "owner" && (
              <Button
                variant="danger"
                className="hover-reveal shrink-0 px-3 py-1 text-xs"
                onClick={() => setBanTarget(member)}
              >
                BAN
              </Button>
            )}
          </li>
        ))}
      </ul>

      <Modal
        open={!!banTarget}
        title="メンバーをBAN"
        confirmLabel="BANする"
        danger
        onClose={() => setBanTarget(null)}
        onConfirm={handleBan}
      >
        {banTarget && (
          <p>「{banTarget.username}」をしおりから強制退出させますか？</p>
        )}
      </Modal>
    </>
  );
}
