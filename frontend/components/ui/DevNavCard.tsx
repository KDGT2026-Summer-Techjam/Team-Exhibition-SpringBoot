"use client";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useState } from "react";

const DEMO_SHIORI_ID = "22222222-2222-2222-2222-000000000001";

/** 開発用: 全ページへ遷移できるナビカード */
const NAV_LINKS = [
  { href: "/login", label: "ログイン" },
  { href: "/signup", label: "新規登録" },
  { href: "/itineraries", label: "しおり一覧" },
  { href: `/itineraries/${DEMO_SHIORI_ID}`, label: "しおり内容" },
  { href: `/itineraries/${DEMO_SHIORI_ID}/photos`, label: "写真一覧" },
  { href: `/itineraries/${DEMO_SHIORI_ID}/admin`, label: "しおり管理" },
  { href: "/invitations/invite-demo", label: "招待受領" },
  { href: "/settings", label: "設定" },
] as const;

const EASE_OUT = [0.22, 1, 0.36, 1] as const;

export function DevNavCard() {
  const [open, setOpen] = useState(false);
  const reduceMotion = useReducedMotion();
  const duration = reduceMotion ? 0 : 0.2;

  return (
    <div className="fixed bottom-4 left-4 z-[100] max-w-xs">
      <div className="rounded-lg border border-line bg-paper-deep/95 shadow-lg backdrop-blur-sm">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center justify-between px-4 py-2 text-left text-sm font-medium text-ink hover:bg-paper/50"
        >
          <span>ページ一覧（開発用）</span>
          <span className="text-ink-muted">{open ? "▼" : "▶"}</span>
        </button>
        <AnimatePresence initial={false}>
          {open && (
            <motion.nav
              className="overflow-hidden border-t border-line/60"
              initial={reduceMotion ? false : { height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={reduceMotion ? undefined : { height: 0, opacity: 0 }}
              transition={{ duration, ease: EASE_OUT }}
            >
              <ul className="max-h-64 overflow-y-auto py-2">
                {NAV_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="block px-4 py-1.5 text-sm text-ink hover:bg-paper/60"
                      onClick={() => setOpen(false)}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
