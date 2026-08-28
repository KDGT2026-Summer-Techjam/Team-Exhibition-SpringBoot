/** 背景の明るさに応じたラベル文字のトーン */
export type LabelTone = "onLight" | "onDark";

function parseRgba(
  value: string,
): { r: number; g: number; b: number; a: number } | null {
  const m = value.match(
    /rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)/i,
  );
  if (!m) return null;
  return {
    r: Number(m[1]),
    g: Number(m[2]),
    b: Number(m[3]),
    a: m[4] === undefined ? 1 : Number(m[4]),
  };
}

/** 相対輝度（0〜1）。明るいほど大きい */
function relativeLuminance(r: number, g: number, b: number): number {
  const toLin = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * toLin(r) + 0.7152 * toLin(g) + 0.0722 * toLin(b);
}

/**
 * 画面上の座標の背後が明るいか暗いかを推定する。
 * コメントUI自身は除外し、しおり紙面クラスや不透明な背景色を見る。
 */
export function sampleLabelToneAt(x: number, y: number): LabelTone {
  if (typeof document === "undefined") return "onDark";

  const stack = document.elementsFromPoint(x, y);
  for (const node of stack) {
    if (!(node instanceof Element)) continue;
    // コメント重ね自体は無視して奥を見る
    if (node.closest("[data-comment-ui]")) continue;

    if (node.closest(".shiori-surface, .notebook-bg")) {
      return "onLight";
    }

    let el: HTMLElement | null =
      node instanceof HTMLElement ? node : node.parentElement;
    while (el && el !== document.documentElement) {
      const { backgroundColor } = getComputedStyle(el);
      const rgba = parseRgba(backgroundColor);
      if (rgba && rgba.a >= 0.55) {
        return relativeLuminance(rgba.r, rgba.g, rgba.b) >= 0.48
          ? "onLight"
          : "onDark";
      }
      el = el.parentElement;
    }
  }

  // 机（stage）など、明確な紙面がなければ暗い側とみなす
  return "onDark";
}

/** 矩形内を数点サンプルして多数決 */
export function sampleLabelToneInRect(rect: DOMRect): LabelTone {
  if (rect.width < 1 || rect.height < 1) return "onDark";
  const ys = rect.top + rect.height * 0.5;
  const xs = [0.2, 0.5, 0.8].map((t) => rect.left + rect.width * t);
  let light = 0;
  for (const x of xs) {
    if (sampleLabelToneAt(x, ys) === "onLight") light += 1;
  }
  return light >= 2 ? "onLight" : "onDark";
}
