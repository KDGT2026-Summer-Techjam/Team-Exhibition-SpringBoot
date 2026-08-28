"use client";

import { createContext, useContext, useMemo, useState } from "react";

export const PLAN_PERMISSION_KEY = "plan";

type PagePermission = {
  editable: boolean;
  commentOpen: boolean;
};

type ItineraryUiValue = {
  isOwner: boolean;
  canEdit: boolean;
  canComment: boolean;
  getPagePermission: (pageKey: string) => PagePermission;
  setPageEditable: (pageKey: string, value: boolean) => void;
  setPageCommentOpen: (pageKey: string, value: boolean) => void;
  setEditable: (value: boolean) => void;
  setCommentOpen: (value: boolean) => void;
  openCommentKey: string | null;
  setOpenCommentKey: (key: string | null) => void;
};

const ItineraryUiContext = createContext<ItineraryUiValue | null>(null);

type ItineraryUiProviderProps = {
  children: React.ReactNode;
  isOwner: boolean;
  dayIds: string[];
  initialEditable: boolean;
  initialCommentOpen: boolean;
  dayPermissions?: Record<string, PagePermission>;
  onPermissionsPersist?: (input: {
    editable?: boolean;
    commentOpen?: boolean;
    days?: Array<{ dayId: string; editable?: boolean; commentOpen?: boolean }>;
  }) => Promise<void>;
};

/** しおり内の編集許可・コメント解放・開いているスレッドを共有する */
export function ItineraryUiProvider({
  children,
  isOwner,
  dayIds,
  initialEditable,
  initialCommentOpen,
  dayPermissions,
  onPermissionsPersist,
}: ItineraryUiProviderProps) {
  const [permissions, setPermissions] = useState<Record<string, PagePermission>>(() => {
    const entries: Array<[string, PagePermission]> = [
      [
        PLAN_PERMISSION_KEY,
        { editable: initialEditable, commentOpen: initialCommentOpen },
      ],
      ...dayIds.map(
        (dayId) =>
          [
            dayId,
            dayPermissions?.[dayId] ?? {
              editable: initialEditable,
              commentOpen: initialCommentOpen,
            },
          ] as [string, PagePermission],
      ),
    ];
    return Object.fromEntries(entries);
  });
  const [openCommentKey, setOpenCommentKey] = useState<string | null>(null);

  const persistPermissions = async (
    pageKey: string,
    patch: Partial<PagePermission>,
  ) => {
    if (!onPermissionsPersist || !isOwner) return;
    if (pageKey === PLAN_PERMISSION_KEY) {
      await onPermissionsPersist(patch);
      return;
    }
    await onPermissionsPersist({
      days: [{ dayId: pageKey, ...patch }],
    });
  };

  const getPagePermission = (pageKey: string): PagePermission =>
    permissions[pageKey] ??
    permissions[PLAN_PERMISSION_KEY] ?? { editable: false, commentOpen: false };

  const setPageEditable = (pageKey: string, value: boolean) => {
    setPermissions((prev) => {
      const current =
        prev[pageKey] ??
        prev[PLAN_PERMISSION_KEY] ?? { editable: false, commentOpen: false };
      return { ...prev, [pageKey]: { ...current, editable: value } };
    });
    void persistPermissions(pageKey, { editable: value });
  };

  const setPageCommentOpen = (pageKey: string, value: boolean) => {
    setPermissions((prev) => {
      const current =
        prev[pageKey] ??
        prev[PLAN_PERMISSION_KEY] ?? { editable: false, commentOpen: false };
      return { ...prev, [pageKey]: { ...current, commentOpen: value } };
    });
    void persistPermissions(pageKey, { commentOpen: value });
  };

  const value = useMemo(
    () => ({
      isOwner,
      canEdit: isOwner || getPagePermission(PLAN_PERMISSION_KEY).editable,
      canComment: getPagePermission(PLAN_PERMISSION_KEY).commentOpen,
      getPagePermission,
      setPageEditable,
      setPageCommentOpen,
      setEditable: (next: boolean) => setPageEditable(PLAN_PERMISSION_KEY, next),
      setCommentOpen: (next: boolean) =>
        setPageCommentOpen(PLAN_PERMISSION_KEY, next),
      openCommentKey,
      setOpenCommentKey,
    }),
    [isOwner, permissions, openCommentKey],
  );

  return (
    <ItineraryUiContext.Provider value={value}>
      {children}
    </ItineraryUiContext.Provider>
  );
}

export function useItineraryUi(): ItineraryUiValue {
  const ctx = useContext(ItineraryUiContext);
  if (!ctx) {
    throw new Error("useItineraryUi は ItineraryUiProvider 内で使ってください");
  }
  return ctx;
}

export function useOptionalItineraryUi(): ItineraryUiValue | null {
  return useContext(ItineraryUiContext);
}
