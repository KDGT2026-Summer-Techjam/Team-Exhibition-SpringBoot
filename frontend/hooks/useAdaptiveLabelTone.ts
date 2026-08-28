"use client";

import { sampleLabelToneInRect, type LabelTone } from "@/lib/backdropTone";
import { useCallback, useLayoutEffect, useRef, useState } from "react";

/**
 * 要素の背後の明るさに合わせてラベル色トーンを返す。
 * enabled=false のときは紙面想定で onLight 固定。
 */
export function useAdaptiveLabelTone(enabled: boolean) {
  const ref = useRef<HTMLParagraphElement | null>(null);
  const [tone, setTone] = useState<LabelTone>(enabled ? "onDark" : "onLight");

  const update = useCallback(() => {
    if (!enabled) {
      setTone("onLight");
      return;
    }
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.width < 1 || rect.height < 1) return;
    setTone(sampleLabelToneInRect(rect));
  }, [enabled]);

  useLayoutEffect(() => {
    if (!enabled) {
      setTone("onLight");
      return;
    }

    update();
    // 出現アニメ・散らばり配置の直後も追従
    const t1 = window.setTimeout(update, 80);
    const t2 = window.setTimeout(update, 280);
    const t3 = window.setTimeout(update, 520);

    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [enabled, update]);

  return { ref, tone };
}
