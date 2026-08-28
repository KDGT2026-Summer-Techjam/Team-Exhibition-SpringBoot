"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import { AdminPanel } from "@/components/itinerary/AdminPanel";
import {
  DayHeading,
  DayNotes,
  DayPage,
  isDayContentMirrored,
} from "@/components/itinerary/DayPage";
import { TRAVEL_PLAN_TAB_ID } from "@/components/itinerary/DayTabs";
import {
  PLAN_PERMISSION_KEY,
  useItineraryUi,
} from "@/components/itinerary/ItineraryUiProvider";
import { PhotosPanel } from "@/components/itinerary/PhotosPanel";
import { RepresentativePhoto } from "@/components/itinerary/RepresentativePhoto";
import { SectionsMenu } from "@/components/itinerary/SectionsMenu";
import {
  ShioriBook,
  type ShioriBookPage,
} from "@/components/itinerary/ShioriBook";
import {
  TravelPlanCover,
  TravelPlanExtras,
} from "@/components/itinerary/TravelPlanPanel";
import { Modal } from "@/components/ui/Modal";
import { PageContainer } from "@/components/ui/PageContainer";
import { useItineraryData } from "@/contexts/ItineraryDataContext";
import { cn, formatDayTabDate } from "@/lib/utils";
import type { ItineraryDetail, RoadmapItem, ShioriDay } from "@/types";
import { useMemo, useState } from "react";

function ItineraryDetailContent() {
  const { user } = useAuth();
  const {
    itinerary,
    photos,
    loading,
    error,
    setRoadmapItems,
    updateTitle,
    updateDescription,
    updateDayTitle,
    updateDayNotes,
    setRepresentativePhoto,
    addComment,
    patchComment,
    removeComment,
  } = useItineraryData();

  const { getPagePermission, isOwner } = useItineraryUi();

  const [roadmap, setRoadmap] = useState<{ id: string; items: RoadmapItem[] }>({
    id: "",
    items: [],
  });

  const id = itinerary?.id ?? "";
  if (itinerary && roadmap.id !== id) {
    setRoadmap({ id, items: itinerary.roadmapItems });
  }
  const roadmapItems = itinerary ? roadmap.items : [];
  const handleRoadmapChange = async (items: RoadmapItem[]) => {
    setRoadmap({ id, items });
    await setRoadmapItems(items);
  };

  const [pickerDayId, setPickerDayId] = useState<string | null>(null);
  const [modal, setModal] = useState<"photos" | "admin" | null>(null);

  const pages = useMemo<ShioriBookPage[]>(
    () =>
      itinerary
        ? [
            { id: TRAVEL_PLAN_TAB_ID, label: "旅行計画" },
            ...itinerary.days.map((day) => ({
              id: day.id,
              label: `${day.dayNumber}日目`,
              sublabel: formatDayTabDate(day.tripDate),
            })),
          ]
        : [],
    [itinerary],
  );

  const firstPageId = pages[0]?.id ?? TRAVEL_PLAN_TAB_ID;
  const [activePage, setActivePage] = useState({
    itineraryId: id,
    pageId: firstPageId,
  });
  if (itinerary && activePage.itineraryId !== id) {
    setActivePage({ itineraryId: id, pageId: firstPageId });
  }
  const pageId = activePage.pageId;
  const setPageId = (nextId: string) =>
    setActivePage({ itineraryId: id, pageId: nextId });

  if (loading || !itinerary || !user) {
    return (
      <PageContainer notebook>
        <p className="text-sm text-on-stage-muted">読み込み中…</p>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer notebook>
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      </PageContainer>
    );
  }

  const shared = {
    itinerary,
    roadmapItems,
    onRoadmapItemsChange: handleRoadmapChange,
    getPagePermission,
    isOwner,
    pickerDayId,
    onPickerDayChange: setPickerDayId,
    user,
    photos,
    updateTitle,
    updateDescription,
    updateDayTitle,
    updateDayNotes,
    setRepresentativePhoto,
    addComment,
    patchComment,
    removeComment,
  };

  return (
    <PageContainer notebook>
      <div className="flex w-full flex-1 flex-col justify-center">
        <ShioriBook
          className="mx-auto w-full max-w-[var(--notebook-max-width)]"
          pages={pages}
          activeId={pageId}
          onActiveIdChange={setPageId}
          renderLeft={(tabId) => (
            <SpreadHalf side="left" tabId={tabId} {...shared} />
          )}
          renderRight={(tabId) => (
            <SpreadHalf side="right" tabId={tabId} {...shared} />
          )}
        />
      </div>

      <SectionsMenu
        pages={pages}
        activePageId={pageId}
        isOwner={isOwner}
        modal={modal}
        onSelectPage={(nextPageId) => {
          setModal(null);
          setPageId(nextPageId);
        }}
        onOpenPhotos={() => setModal("photos")}
        onOpenAdmin={() => setModal("admin")}
      />

      <Modal
        open={modal === "photos"}
        title="写真一覧"
        onClose={() => setModal(null)}
        hideFooter
        contentClassName="flex h-[min(88dvh,58rem)] w-full max-w-7xl flex-col overflow-hidden p-4 sm:p-5"
      >
        <PhotosPanel itinerary={itinerary} variant="modal" />
      </Modal>

      <Modal
        open={modal === "admin"}
        title="しおり管理"
        onClose={() => setModal(null)}
        hideFooter
        contentClassName="max-w-lg p-6"
      >
        <AdminPanel itinerary={itinerary} variant="modal" />
      </Modal>
    </PageContainer>
  );
}

type SpreadHalfProps = {
  side: "left" | "right";
  tabId: string;
  itinerary: ItineraryDetail;
  roadmapItems: RoadmapItem[];
  onRoadmapItemsChange: (items: RoadmapItem[]) => Promise<void>;
  getPagePermission: ReturnType<typeof useItineraryUi>["getPagePermission"];
  isOwner: boolean;
  pickerDayId: string | null;
  onPickerDayChange: (dayId: string | null) => void;
  user: { id: string; username: string };
  photos: import("@/types").Photo[];
  updateTitle: (title: string) => Promise<void>;
  updateDescription: (description: string) => Promise<void>;
  updateDayTitle: (dayId: string, title: string) => Promise<void>;
  updateDayNotes: (dayId: string, notes: string) => Promise<void>;
  setRepresentativePhoto: (dayId: string, photoId: string | null) => Promise<void>;
  addComment: ReturnType<typeof useItineraryData>["addComment"];
  patchComment: ReturnType<typeof useItineraryData>["patchComment"];
  removeComment: ReturnType<typeof useItineraryData>["removeComment"];
};

function SpreadHalf({
  side,
  tabId,
  itinerary,
  roadmapItems,
  onRoadmapItemsChange,
  getPagePermission,
  isOwner,
  pickerDayId,
  onPickerDayChange,
  user,
  photos,
  updateTitle,
  updateDescription,
  updateDayTitle,
  updateDayNotes,
  setRepresentativePhoto,
  addComment,
  patchComment,
  removeComment,
}: SpreadHalfProps) {
  const isPlanTab = tabId === TRAVEL_PLAN_TAB_ID;
  const activeDay: ShioriDay | undefined = isPlanTab
    ? undefined
    : itinerary.days.find((d) => d.id === tabId);

  const permissionKey = isPlanTab ? PLAN_PERMISSION_KEY : activeDay?.id;
  const pagePermission = permissionKey
    ? getPagePermission(permissionKey)
    : getPagePermission(PLAN_PERMISSION_KEY);
  const canEdit = isOwner || pagePermission.editable;
  const canComment = pagePermission.commentOpen;

  const centerInPage = side === "right" && Boolean(activeDay);
  const commentHandlers = { addComment, patchComment, removeComment };

  return (
    <div className="shiori-surface relative flex h-full min-h-0 flex-col overflow-hidden border border-line">
      <div className="shiori-content min-h-0 flex-1 overflow-y-auto">
        <div
          className={cn(
            "flex w-full flex-col",
            centerInPage && "shiori-center-body",
          )}
        >
          {isPlanTab ? (
            side === "left" ? (
              <TravelPlanCover
                itinerary={itinerary}
                roadmapItems={roadmapItems}
                comments={itinerary.comments}
                authorId={user.id}
                authorName={user.username}
                canComment={canComment}
                canEdit={canEdit}
                onTitleBlur={updateTitle}
                onDescriptionBlur={updateDescription}
                commentHandlers={commentHandlers}
              />
            ) : (
              <TravelPlanExtras
                itinerary={itinerary}
                comments={itinerary.comments}
                authorId={user.id}
                authorName={user.username}
                canComment={canComment}
                canEdit={canEdit}
                commentHandlers={commentHandlers}
              />
            )
          ) : (
            activeDay && (
              <DaySpreadHalf
                key={`${activeDay.id}-${side}`}
                side={side}
                day={activeDay}
                itinerary={itinerary}
                roadmapItems={roadmapItems}
                onRoadmapItemsChange={onRoadmapItemsChange}
                canComment={canComment}
                canEdit={canEdit}
                isOwner={isOwner}
                pickerDayId={pickerDayId}
                onPickerDayChange={onPickerDayChange}
                user={user}
                photos={photos}
                onDayTitleBlur={(title) => updateDayTitle(activeDay.id, title)}
                onDayNotesBlur={(notes) => updateDayNotes(activeDay.id, notes)}
                onRepresentativePhotoSelect={(photoId) =>
                  setRepresentativePhoto(activeDay.id, photoId)
                }
                commentHandlers={commentHandlers}
              />
            )
          )}
        </div>
      </div>
    </div>
  );
}

type DaySpreadHalfProps = {
  side: "left" | "right";
  day: ShioriDay;
  itinerary: ItineraryDetail;
  roadmapItems: RoadmapItem[];
  onRoadmapItemsChange: (items: RoadmapItem[]) => Promise<void>;
  canComment: boolean;
  canEdit: boolean;
  isOwner: boolean;
  pickerDayId: string | null;
  onPickerDayChange: (dayId: string | null) => void;
  user: { id: string; username: string };
  photos: import("@/types").Photo[];
  onDayTitleBlur: (title: string) => void;
  onDayNotesBlur: (notes: string) => void;
  onRepresentativePhotoSelect: (photoId: string) => void;
  commentHandlers: {
    addComment: SpreadHalfProps["addComment"];
    patchComment: SpreadHalfProps["patchComment"];
    removeComment: SpreadHalfProps["removeComment"];
  };
};

function DaySpreadHalf({
  side,
  day,
  itinerary,
  roadmapItems,
  onRoadmapItemsChange,
  canComment,
  canEdit,
  isOwner,
  pickerDayId,
  onPickerDayChange,
  user,
  photos,
  onDayTitleBlur,
  onDayNotesBlur,
  onRepresentativePhotoSelect,
  commentHandlers,
}: DaySpreadHalfProps) {
  const mirrored = isDayContentMirrored(day.dayNumber);
  const showMedia = side === "left" ? !mirrored : mirrored;

  const mediaSide = mirrored ? "right" : "left";
  const scheduleSide = mirrored ? "left" : "right";

  const media = (
    <div className="flex flex-col gap-12">
      <RepresentativePhoto
        day={day}
        photos={photos}
        comments={itinerary.comments}
        authorId={user.id}
        authorName={user.username}
        canComment={canComment}
        isOwner={isOwner}
        pickerOpen={pickerDayId === day.id}
        onPickerOpenChange={(open) => onPickerDayChange(open ? day.id : null)}
        onSelectPhoto={onRepresentativePhotoSelect}
        side={mediaSide}
        commentHandlers={commentHandlers}
      />
      <DayNotes
        day={day}
        comments={itinerary.comments}
        authorId={user.id}
        authorName={user.username}
        canComment={canComment}
        canEdit={canEdit}
        onNotesBlur={onDayNotesBlur}
        side={mediaSide}
        commentHandlers={commentHandlers}
      />
    </div>
  );

  const schedule = (
    <DayPage
      day={day}
      roadmapItems={roadmapItems}
      onRoadmapItemsChange={onRoadmapItemsChange}
      comments={itinerary.comments}
      authorId={user.id}
      authorName={user.username}
      canComment={canComment}
      canEdit={canEdit}
      side={scheduleSide}
      commentHandlers={commentHandlers}
    />
  );

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-8">
      {side === "left" && (
        <DayHeading day={day} canEdit={canEdit} onTitleBlur={onDayTitleBlur} />
      )}
      {showMedia ? media : schedule}
    </div>
  );
}

export default function ItineraryDetailPage() {
  return <ItineraryDetailContent />;
}
