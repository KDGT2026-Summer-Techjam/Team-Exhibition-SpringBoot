import { EmptyState } from "@/components/ui/EmptyState";
import { ItineraryCard } from "@/components/itinerary/ItineraryCard";
import type { ItinerarySummary } from "@/types";

type ItineraryListProps = {
  itineraries: ItinerarySummary[];
  onLeave?: (id: string) => void;
};

/** 机の上に閉じたノート表紙を並べる棚 */
export function ItineraryList({ itineraries, onLeave }: ItineraryListProps) {
  if (itineraries.length === 0) {
    return (
      <EmptyState
        title="参加中のしおりがありません"
        description="右下の＋ボタンから新しいしおりを作りましょう"
      />
    );
  }

  return (
    <div className="grid grid-cols-2 gap-x-10 gap-y-12 sm:grid-cols-3 md:grid-cols-4 md:gap-x-12 md:gap-y-14">
      {itineraries.map((itinerary) => (
        <ItineraryCard
          key={itinerary.id}
          itinerary={itinerary}
          onLeave={onLeave}
        />
      ))}
    </div>
  );
}
