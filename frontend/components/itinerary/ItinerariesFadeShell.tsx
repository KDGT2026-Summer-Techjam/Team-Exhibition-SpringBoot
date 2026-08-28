"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type ItinerariesFadeShellProps = {
  children: React.ReactNode;
};

type NavContextValue = {
  /** 暗転（退出）完了後に遷移する。一覧⇔詳細で使う */
  navigate: (href: string) => void;
};

const ItinerariesNavContext = createContext<NavContextValue | null>(null);

/** しおり一覧⇔詳細のフェード付き遷移。Provider 外では通常の push */
export function useItinerariesNav(): NavContextValue {
  const ctx = useContext(ItinerariesNavContext);
  const router = useRouter();
  return useMemo(
    () => ctx ?? { navigate: (href: string) => router.push(href) },
    [ctx, router],
  );
}

/**
 * 一覧⇔詳細: クリック直後にページを差し替えず、
 * 1) 現ページをフェードアウト（机の暗色が見える）
 * 2) その後 router.push
 * 3) 新ページをフェードイン
 */
export function ItinerariesFadeShell({ children }: ItinerariesFadeShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const exitMs = reduceMotion ? 0 : 0.35;
  const enterMs = reduceMotion ? 0 : 0.3;

  const [visible, setVisible] = useState(true);
  const pendingHrefRef = useRef<string | null>(null);
  const pathnameRef = useRef(pathname);
  // 退出アニメ中に Next が children を差し替えても、表示は退出開始時の木のまま
  const frozenChildrenRef = useRef(children);
  if (visible) {
    frozenChildrenRef.current = children;
  }

  const navigate = useCallback(
    (href: string) => {
      if (href === pathnameRef.current) return;
      if (reduceMotion) {
        router.push(href);
        return;
      }
      // すでに退出中なら行き先だけ更新
      pendingHrefRef.current = href;
      setVisible(false);
    },
    [reduceMotion, router],
  );

  // push 完了やブラウザ戻るで pathname が変わったらフェードイン
  useEffect(() => {
    if (pathnameRef.current === pathname) return;
    pathnameRef.current = pathname;
    pendingHrefRef.current = null;
    setVisible(true);
  }, [pathname]);

  const ctx = useMemo(() => ({ navigate }), [navigate]);

  return (
    <ItinerariesNavContext.Provider value={ctx}>
      <AnimatePresence
        mode="wait"
        initial={false}
        onExitComplete={() => {
          const href = pendingHrefRef.current;
          if (!href) return;
          pendingHrefRef.current = null;
          router.push(href);
        }}
      >
        {visible && (
          <motion.div
            key={pathname}
            className="flex min-h-dvh flex-1 flex-col"
            initial={{ opacity: 0 }}
            animate={{
              opacity: 1,
              transition: { duration: enterMs, ease: "easeOut" },
            }}
            exit={{
              opacity: 0,
              transition: { duration: exitMs, ease: "easeIn" },
            }}
          >
            {frozenChildrenRef.current}
          </motion.div>
        )}
      </AnimatePresence>
    </ItinerariesNavContext.Provider>
  );
}
