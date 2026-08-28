"use client";

import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { PasswordField } from "@/components/ui/PasswordField";
import { useItineraryData } from "@/contexts/ItineraryDataContext";
import { ApiError } from "@/lib/api/errors";
import { useRouter } from "next/navigation";
import { useState } from "react";

type DeleteItineraryFormProps = {
  itineraryTitle: string;
};

export function DeleteItineraryForm({ itineraryTitle }: DeleteItineraryFormProps) {
  const router = useRouter();
  const { deleteItinerary } = useItineraryData();
  const [password, setPassword] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleDelete = async () => {
    if (password.length < 10) {
      setError("パスワードを入力してください");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await deleteItinerary(password);
      setShowModal(false);
      router.push("/itineraries");
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "削除に失敗しました",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-ink-muted">
        削除するにはしおりのパスワードが必要です
      </p>
      <PasswordField
        label="パスワード"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={error}
      />
      <Button variant="danger" onClick={() => setShowModal(true)}>
        しおりを削除
      </Button>

      <Modal
        open={showModal}
        title="しおりを削除"
        confirmLabel={submitting ? "削除中…" : "削除する"}
        danger
        onClose={() => setShowModal(false)}
        onConfirm={handleDelete}
      >
        「{itineraryTitle}」を削除します。この操作は取り消せません。
      </Modal>
    </div>
  );
}
