"use client";

import { ItineraryDataProvider } from "@/contexts/ItineraryDataContext";
import {
  ItineraryUiProvider,
} from "@/components/itinerary/ItineraryUiProvider";
import { PageContainer } from "@/components/ui/PageContainer";
import { useOptionalItineraryData } from "@/contexts/ItineraryDataContext";
import { isValidShioriId } from "@/lib/shiori/id";
import { useParams, useRouter } from "next/navigation";
import { notFound } from "next/navigation";
import { useEffect } from "react";

function ItineraryLayoutInner({ children }: { children: React.ReactNode }) {
  const data = useOptionalItineraryData();

  if (!data) return <>{children}</>;

  if (data.loading) {
    return (
      <PageContainer notebook>
        <p className="text-sm text-on-stage-muted">読み込み中…</p>
      </PageContainer>
    );
  }

  if (data.error || !data.itinerary) {
    notFound();
  }

  const itinerary = data.itinerary;
  const dayPermissions = Object.fromEntries(
    itinerary.days.map((day) => [
      day.id,
      {
        editable: day.isEditable ?? itinerary.isEditable,
        commentOpen: day.isCommentOpen ?? itinerary.isCommentOpen,
      },
    ]),
  );

  return (
    <ItineraryUiProvider
      isOwner={itinerary.isOwner}
      dayIds={itinerary.days.map((day) => day.id)}
      initialEditable={itinerary.isEditable}
      initialCommentOpen={itinerary.isCommentOpen}
      dayPermissions={dayPermissions}
      onPermissionsPersist={data.savePagePermissions}
    >
      {children}
    </ItineraryUiProvider>
  );
}

export default function ItineraryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const shioriId = params.id;
  const validId = isValidShioriId(shioriId);

  useEffect(() => {
    if (!validId) {
      router.replace("/itineraries");
    }
  }, [router, validId]);

  if (!validId) {
    return (
      <PageContainer notebook>
        <p className="text-sm text-on-stage-muted">リダイレクト中…</p>
      </PageContainer>
    );
  }

  return (
    <ItineraryDataProvider shioriId={shioriId}>
      <ItineraryLayoutInner>{children}</ItineraryLayoutInner>
    </ItineraryDataProvider>
  );
}
