"use client";

import { AdminPanel } from "@/components/itinerary/AdminPanel";
import { PageContainer } from "@/components/ui/PageContainer";
import { useItineraryData } from "@/contexts/ItineraryDataContext";

export default function AdminPage() {
  const { itinerary, loading } = useItineraryData();

  if (loading || !itinerary) {
    return (
      <PageContainer notebook className="pt-6 md:pt-8">
        <p className="text-sm text-on-stage-muted">読み込み中…</p>
      </PageContainer>
    );
  }

  return (
    <PageContainer notebook className="pt-6 md:pt-8">
      <AdminPanel itinerary={itinerary} />
    </PageContainer>
  );
}
