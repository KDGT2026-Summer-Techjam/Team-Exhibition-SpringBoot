"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function LogoutButton() {
  const router = useRouter();
  const { logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleLogout = async () => {
    setSubmitting(true);
    try {
      await logout();
      setOpen(false);
      router.push("/login");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Button variant="danger" onClick={() => setOpen(true)}>
        ログアウト
      </Button>
      <Modal
        open={open}
        title="ログアウト"
        confirmLabel={submitting ? "ログアウト中…" : "ログアウト"}
        onClose={() => setOpen(false)}
        onConfirm={handleLogout}
      >
        ログアウトしますか？
      </Modal>
    </>
  );
}
