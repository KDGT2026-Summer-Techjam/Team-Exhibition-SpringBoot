"use client";

import { fetchShioriComments, createComment, updateComment, deleteComment } from "@/lib/api/comments";
import { fetchShioriDays, updateShioriDay } from "@/lib/api/days";
import { createInvitation } from "@/lib/api/invitations";
import { fetchMembers, banMember } from "@/lib/api/members";
import {
  contributePackingItem,
  createPackingItem,
  deletePackingItem,
  fetchPackingItems,
  updatePackingItem,
} from "@/lib/api/packing";
import {
  deletePhoto,
  fetchPhotos,
  likePhoto,
  uploadPhoto,
} from "@/lib/api/photos";
import {
  createRoadmapItem,
  deleteRoadmapItem,
  fetchRoadmapItems,
  updateRoadmapItem,
} from "@/lib/api/roadmap";
import {
  deleteShiori,
  fetchShioriDetail,
  updatePagePermissions,
  updateShiori,
  updateShioriPeriod,
} from "@/lib/api/shioris";
import type {
  Comment,
  ItineraryDetail,
  Member,
  PackingItem,
  Photo,
  RoadmapItem,
  ShioriDay,
} from "@/types";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type ItineraryDataValue = {
  shioriId: string;
  itinerary: ItineraryDetail | null;
  photos: Photo[];
  members: Member[];
  loading: boolean;
  error: string;
  reload: () => Promise<void>;
  updateTitle: (title: string) => Promise<void>;
  updateDescription: (description: string) => Promise<void>;
  updatePromises: (promises: string) => Promise<void>;
  updateDayTitle: (dayId: string, title: string) => Promise<void>;
  updateDayNotes: (dayId: string, notes: string) => Promise<void>;
  setRepresentativePhoto: (dayId: string, photoId: string | null) => Promise<void>;
  setRoadmapItems: (items: RoadmapItem[]) => Promise<void>;
  setPackingItems: (items: PackingItem[]) => Promise<void>;
  cyclePackingContribution: (itemId: string) => Promise<void>;
  addComment: (input: Omit<Comment, "id" | "createdAt" | "authorId" | "authorName"> & {
    authorId: string;
    authorName: string;
  }) => Promise<Comment>;
  patchComment: (id: string, body: string) => Promise<void>;
  removeComment: (id: string) => Promise<void>;
  uploadPhotoForDay: (dayId: string, file: File) => Promise<void>;
  removePhoto: (photoId: string) => Promise<void>;
  toggleLike: (photoId: string) => Promise<void>;
  saveAdminSettings: (input: {
    title: string;
    password?: string;
    description: string;
    startDate?: string;
    endDate?: string;
  }) => Promise<void>;
  savePagePermissions: (input: {
    editable?: boolean;
    commentOpen?: boolean;
    days?: Array<{ dayId: string; editable?: boolean; commentOpen?: boolean }>;
  }) => Promise<void>;
  banMemberById: (userId: string) => Promise<void>;
  deleteItinerary: (password: string) => Promise<void>;
  createInvitationLink: () => Promise<string>;
};

const ItineraryDataContext = createContext<ItineraryDataValue | null>(null);

const LOCAL_ROADMAP_PREFIX = "roadmap-local-";
const LOCAL_PACKING_PREFIX = "pack-local-";

async function loadRoadmapForDays(days: ShioriDay[]): Promise<RoadmapItem[]> {
  const chunks = await Promise.all(
    days.map((day) => fetchRoadmapItems(day.id)),
  );
  return chunks.flat();
}

export function ItineraryDataProvider({
  shioriId,
  children,
}: {
  shioriId: string;
  children: React.ReactNode;
}) {
  const [itinerary, setItinerary] = useState<ItineraryDetail | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /** ローカルIDの行はキー入力のたびに setRoadmapItems/setPackingItems が呼ばれるため、
   * 作成APIが完了する前に次のキー入力が来ても二重に POST しないよう進行中の作成を記録する */
  const pendingRoadmapCreates = useRef<Set<string>>(new Set());
  const pendingPackingCreates = useRef<Set<string>>(new Set());

  const reload = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [detail, days, comments, packing, photoList, memberList] =
        await Promise.all([
          fetchShioriDetail(shioriId),
          fetchShioriDays(shioriId),
          fetchShioriComments(shioriId),
          fetchPackingItems(shioriId),
          fetchPhotos(shioriId, true),
          fetchMembers(shioriId),
        ]);
      const roadmapItems = await loadRoadmapForDays(days);
      setItinerary({
        ...detail,
        days,
        comments,
        packingItems: packing,
        roadmapItems,
      });
      setPhotos(photoList);
      setMembers(memberList);
    } catch (err) {
      setError(err instanceof Error ? err.message : "読み込みに失敗しました");
      setItinerary(null);
    } finally {
      setLoading(false);
    }
  }, [shioriId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const patchItinerary = useCallback(
    (patch: Partial<ItineraryDetail>) => {
      setItinerary((prev) => (prev ? { ...prev, ...patch } : prev));
    },
    [],
  );

  const updateTitle = useCallback(
    async (title: string) => {
      await updateShiori(shioriId, { title });
      patchItinerary({ title });
    },
    [patchItinerary, shioriId],
  );

  const updateDescription = useCallback(
    async (description: string) => {
      await updateShiori(shioriId, { description });
      patchItinerary({ description });
    },
    [patchItinerary, shioriId],
  );

  const updatePromises = useCallback(
    async (promises: string) => {
      await updateShiori(shioriId, { promises });
      patchItinerary({ promises });
    },
    [patchItinerary, shioriId],
  );

  const updateDayTitle = useCallback(
    async (dayId: string, title: string) => {
      await updateShioriDay(dayId, { title });
      setItinerary((prev) =>
        prev
          ? {
              ...prev,
              days: prev.days.map((day) =>
                day.id === dayId ? { ...day, title } : day,
              ),
            }
          : prev,
      );
    },
    [],
  );

  const updateDayNotes = useCallback(
    async (dayId: string, notes: string) => {
      await updateShioriDay(dayId, { notes });
      setItinerary((prev) =>
        prev
          ? {
              ...prev,
              days: prev.days.map((day) =>
                day.id === dayId ? { ...day, notes } : day,
              ),
            }
          : prev,
      );
    },
    [],
  );

  const setRepresentativePhoto = useCallback(
    async (dayId: string, photoId: string | null) => {
      await updateShioriDay(dayId, { representativePhotoId: photoId });
      setItinerary((prev) =>
        prev
          ? {
              ...prev,
              days: prev.days.map((day) =>
                day.id === dayId
                  ? { ...day, representativePhotoId: photoId ?? undefined }
                  : day,
              ),
            }
          : prev,
      );
    },
    [],
  );

  const setRoadmapItems = useCallback(
    async (nextItems: RoadmapItem[]) => {
      if (!itinerary) return;
      const prevItems = itinerary.roadmapItems;
      patchItinerary({ roadmapItems: nextItems });

      const prevById = new Map(prevItems.map((item) => [item.id, item]));
      const nextById = new Map(nextItems.map((item) => [item.id, item]));

      for (const item of nextItems) {
        if (item.id.startsWith(LOCAL_ROADMAP_PREFIX)) {
          if (!item.title.trim()) continue;
          // 作成APIが完了する前の次キー入力での二重POSTを防ぐ
          if (pendingRoadmapCreates.current.has(item.id)) continue;
          const localId = item.id;
          pendingRoadmapCreates.current.add(localId);
          try {
            const created = await createRoadmapItem(item.dayId, {
              startsAt: item.startsAt,
              endsAt: item.endsAt,
              title: item.title,
              amount: item.amount,
            });
            // 作成中に入力が進んでいる場合があるため、最新state上のidだけ差し替える
            setItinerary((prev) =>
              prev
                ? {
                    ...prev,
                    roadmapItems: prev.roadmapItems.map((row) =>
                      row.id === localId ? { ...row, id: created.id } : row,
                    ),
                  }
                : prev,
            );
          } finally {
            pendingRoadmapCreates.current.delete(localId);
          }
          continue;
        }
        const prev = prevById.get(item.id);
        if (!prev) continue;
        if (
          prev.startsAt !== item.startsAt ||
          prev.endsAt !== item.endsAt ||
          prev.title !== item.title ||
          prev.amount !== item.amount
        ) {
          await updateRoadmapItem(item.id, {
            startsAt: item.startsAt,
            endsAt: item.endsAt,
            title: item.title,
            amount: item.amount,
          });
        }
      }

      for (const prev of prevItems) {
        if (!nextById.has(prev.id)) {
          await deleteRoadmapItem(prev.id);
        }
      }
    },
    [itinerary, patchItinerary],
  );

  const setPackingItems = useCallback(
    async (nextItems: PackingItem[]) => {
      if (!itinerary) return;
      const prevItems = itinerary.packingItems;
      patchItinerary({ packingItems: nextItems });

      const prevById = new Map(prevItems.map((item) => [item.id, item]));
      const nextById = new Map(nextItems.map((item) => [item.id, item]));

      for (const item of nextItems) {
        if (item.id.startsWith(LOCAL_PACKING_PREFIX)) {
          if (!item.label.trim()) continue;
          // 作成APIが完了する前の次キー入力での二重POSTを防ぐ
          if (pendingPackingCreates.current.has(item.id)) continue;
          const localId = item.id;
          pendingPackingCreates.current.add(localId);
          try {
            const created = await createPackingItem(
              shioriId,
              item.label,
              item.requiredCount,
            );
            // 作成中に入力が進んでいる場合があるため、最新state上のidだけ差し替える
            setItinerary((prev) =>
              prev
                ? {
                    ...prev,
                    packingItems: prev.packingItems.map((row) =>
                      row.id === localId ? { ...row, id: created.id } : row,
                    ),
                  }
                : prev,
            );
          } finally {
            pendingPackingCreates.current.delete(localId);
          }
          continue;
        }
        const prev = prevById.get(item.id);
        if (!prev) continue;
        if (prev.label !== item.label || prev.requiredCount !== item.requiredCount) {
          const updated = await updatePackingItem(item.id, {
            name: item.label,
            requiredCount: item.requiredCount,
          });
          patchItinerary({
            packingItems: nextItems.map((row) =>
              row.id === item.id ? updated : row,
            ),
          });
        }
      }

      for (const prev of prevItems) {
        if (!nextById.has(prev.id)) {
          await deletePackingItem(prev.id);
        }
      }
    },
    [itinerary, patchItinerary, shioriId],
  );

  const cyclePackingContribution = useCallback(async (itemId: string) => {
    const updated = await contributePackingItem(itemId);
    setItinerary((prev) =>
      prev
        ? {
            ...prev,
            packingItems: prev.packingItems.map((item) =>
              item.id === itemId ? updated : item,
            ),
          }
        : prev,
    );
  }, []);

  const addComment = useCallback(
    async (
      input: Omit<Comment, "id" | "createdAt">,
    ): Promise<Comment> => {
      const created = await createComment({
        shioriId,
        targetType: input.targetType,
        targetId: input.targetId,
        targetField: input.targetField,
        body: input.body,
      });
      setItinerary((prev) =>
        prev ? { ...prev, comments: [...prev.comments, created] } : prev,
      );
      return created;
    },
    [shioriId],
  );

  const patchComment = useCallback(async (id: string, body: string) => {
    const updated = await updateComment(id, body);
    setItinerary((prev) =>
      prev
        ? {
            ...prev,
            comments: prev.comments.map((c) => (c.id === id ? updated : c)),
          }
        : prev,
    );
  }, []);

  const removeComment = useCallback(async (id: string) => {
    await deleteComment(id);
    setItinerary((prev) =>
      prev
        ? { ...prev, comments: prev.comments.filter((c) => c.id !== id) }
        : prev,
    );
  }, []);

  const uploadPhotoForDay = useCallback(async (dayId: string, file: File) => {
    const photo = await uploadPhoto(dayId, file);
    setPhotos((prev) => [...prev, photo]);
  }, []);

  const removePhoto = useCallback(async (photoId: string) => {
    await deletePhoto(photoId);
    setPhotos((prev) =>
      prev.map((p) => (p.id === photoId ? { ...p, isDeleted: true } : p)),
    );
  }, []);

  const toggleLike = useCallback(async (photoId: string) => {
    const photo = await likePhoto(photoId);
    setPhotos((prev) => prev.map((p) => (p.id === photoId ? photo : p)));
  }, []);

  const saveAdminSettings = useCallback(
    async (input: {
      title: string;
      password?: string;
      description: string;
      startDate?: string;
      endDate?: string;
    }) => {
      await updateShiori(shioriId, {
        title: input.title,
        description: input.description,
        password: input.password || undefined,
      });
      if (input.startDate && input.endDate) {
        await updateShioriPeriod(shioriId, input.startDate, input.endDate);
      }
      await reload();
    },
    [reload, shioriId],
  );

  const savePagePermissions = useCallback(
    async (input: {
      editable?: boolean;
      commentOpen?: boolean;
      days?: Array<{ dayId: string; editable?: boolean; commentOpen?: boolean }>;
    }) => {
      await updatePagePermissions(shioriId, input);
    },
    [shioriId],
  );

  const banMemberById = useCallback(
    async (userId: string) => {
      await banMember(shioriId, userId);
      setMembers((prev) => prev.filter((m) => m.userId !== userId));
    },
    [shioriId],
  );

  const deleteItinerary = useCallback(
    async (password: string) => {
      await deleteShiori(shioriId, password);
    },
    [shioriId],
  );

  const createInvitationLink = useCallback(async () => {
    return createInvitation(shioriId);
  }, [shioriId]);

  const value = useMemo(
    () => ({
      shioriId,
      itinerary,
      photos,
      members,
      loading,
      error,
      reload,
      updateTitle,
      updateDescription,
      updatePromises,
      updateDayTitle,
      updateDayNotes,
      setRepresentativePhoto,
      setRoadmapItems,
      setPackingItems,
      cyclePackingContribution,
      addComment,
      patchComment,
      removeComment,
      uploadPhotoForDay,
      removePhoto,
      toggleLike,
      saveAdminSettings,
      savePagePermissions,
      banMemberById,
      deleteItinerary,
      createInvitationLink,
    }),
    [
      shioriId,
      itinerary,
      photos,
      members,
      loading,
      error,
      reload,
      updateTitle,
      updateDescription,
      updatePromises,
      updateDayTitle,
      updateDayNotes,
      setRepresentativePhoto,
      setRoadmapItems,
      setPackingItems,
      cyclePackingContribution,
      addComment,
      patchComment,
      removeComment,
      uploadPhotoForDay,
      removePhoto,
      toggleLike,
      saveAdminSettings,
      savePagePermissions,
      banMemberById,
      deleteItinerary,
      createInvitationLink,
    ],
  );

  return (
    <ItineraryDataContext.Provider value={value}>
      {children}
    </ItineraryDataContext.Provider>
  );
}

export function useItineraryData(): ItineraryDataValue {
  const ctx = useContext(ItineraryDataContext);
  if (!ctx) {
    throw new Error("useItineraryData must be used within ItineraryDataProvider");
  }
  return ctx;
}

export function useOptionalItineraryData(): ItineraryDataValue | null {
  return useContext(ItineraryDataContext);
}
