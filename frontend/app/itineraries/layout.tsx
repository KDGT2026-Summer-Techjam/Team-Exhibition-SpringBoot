import { ItinerariesFadeShell } from "@/components/itinerary/ItinerariesFadeShell";

/** しおり一覧・詳細で共通のフェード出入を載せる */
export default function ItinerariesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ItinerariesFadeShell>{children}</ItinerariesFadeShell>;
}
