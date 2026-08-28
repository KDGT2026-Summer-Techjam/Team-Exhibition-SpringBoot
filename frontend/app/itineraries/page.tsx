"use client";

import {
  CreateItineraryForm,
  type CreateItineraryInput,
} from "@/components/itinerary/CreateItineraryForm";
import { ItineraryList } from "@/components/itinerary/ItineraryList";
import { Button, buttonClassName } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { PageContainer } from "@/components/ui/PageContainer";
import { createShiori, fetchShioriList, leaveShiori } from "@/lib/api/shioris";
import { ApiError } from "@/lib/api/errors";
import type { ItinerarySummary } from "@/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

/** 設定FAB用の歯車（作成ボタンの＋と同じ円形に載せる） */
function SettingsIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-7 w-7"
      fill="currentColor"
      aria-hidden
    >
      <path d="M19.14 12.94c.04-.31.06-.63.06-.94s-.02-.63-.06-.94l2.03-1.58a.5.5 0 0 0 .12-.64l-1.92-3.32a.5.5 0 0 0-.61-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54A.5.5 0 0 0 13.9 2h-3.8a.5.5 0 0 0-.49.42l-.36 2.54c-.59.24-1.13.56-1.62.94l-2.39-.96a.5.5 0 0 0-.61.22L2.71 8.84a.5.5 0 0 0 .12.64l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58a.5.5 0 0 0-.12.64l1.92 3.32c.14.24.44.34.61.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.26.42.49.42h3.8c.24 0 .44-.18.49-.42l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.17.12.47.02.61-.22l1.92-3.32a.5.5 0 0 0-.12-.64l-2.03-1.58ZM12 15.6A3.6 3.6 0 1 1 12 8.4a3.6 3.6 0 0 1 0 7.2Z" />
    </svg>
  );
}

export default function ItinerariesPage() {
  const router = useRouter();
  const [itineraries, setItineraries] = useState<ItinerarySummary[]>([]);
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadItineraries = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const list = await fetchShioriList();
      setItineraries(list);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "しおり一覧の取得に失敗しました",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadItineraries();
  }, [loadItineraries]);

  const handleCreate = async (input: CreateItineraryInput) => {
    try {
      const id = await createShiori(input);
      setOpenCreateModal(false);
      await loadItineraries();
      if (id) {
        router.push(`/itineraries/${id}`);
      }
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "しおりの作成に失敗しました",
      );
    }
  };

  const handleLeave = async (id: string) => {
    try {
      await leaveShiori(id);
      setItineraries((prev) => prev.filter((i) => i.id !== id));
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "退出に失敗しました",
      );
    }
  };

  return (
    <>
      <PageContainer wide>
        <div className="mb-8 pr-[4.5rem]">
          <h1 className="font-heading text-xl font-bold text-on-stage">
            しおり一覧
          </h1>
          <p className="mt-2 text-sm text-on-stage-muted">
            参加中のしおりを選んで開きます
          </p>
        </div>

        {loading && (
          <p className="text-sm text-on-stage-muted">読み込み中…</p>
        )}
        {error && (
          <p className="mb-4 text-sm text-danger" role="alert">
            {error}
          </p>
        )}
        {!loading && (
          <ItineraryList itineraries={itineraries} onLeave={handleLeave} />
        )}

        <Link
          href="/settings"
          className={buttonClassName({
            variant: "secondary",
            className:
              "fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full p-0 shadow-lg",
          })}
          aria-label="設定"
        >
          <SettingsIcon />
        </Link>

        <Button
          variant="primary"
          className="fixed bottom-6 left-1/2 z-40 h-14 w-14 -translate-x-1/2 rounded-full p-0 text-2xl shadow-lg"
          aria-label="しおりを作成"
          onClick={() => setOpenCreateModal(true)}
        >
          +
        </Button>
      </PageContainer>

      <Modal
        open={openCreateModal}
        title="しおりを作成"
        onClose={() => setOpenCreateModal(false)}
        hideFooter
        contentClassName="max-w-md p-6"
      >
        <CreateItineraryForm onCreate={handleCreate} />
      </Modal>
    </>
  );
}
