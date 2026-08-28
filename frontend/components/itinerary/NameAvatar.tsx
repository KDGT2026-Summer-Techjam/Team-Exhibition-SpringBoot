import { cn } from "@/lib/utils";

/** 名前から安定した色インデックスを取る */
function hashName(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return hash;
}

/** プレイヤー識別用の彩度高めアバター色（茶系は避ける） */
const AVATAR_TONES = [
  "bg-[#e85d5d] text-white",
  "bg-[#2fbfa3] text-white",
  "bg-[#4f8cff] text-white",
  "bg-[#c97be8] text-white",
  "bg-[#f0a13a] text-white",
  "bg-[#3dbe6a] text-white",
  "bg-[#ff6b9d] text-white",
  "bg-[#3db8d9] text-white",
] as const;

type NameAvatarProps = {
  name: string;
  size?: "sm" | "md";
  className?: string;
};

/** 表示名の先頭文字を丸アイコンにする（アイコン設定なし） */
export function NameAvatar({ name, size = "sm", className }: NameAvatarProps) {
  const initial = Array.from(name.trim() || "?")[0] ?? "?";
  const tone = AVATAR_TONES[hashName(name) % AVATAR_TONES.length];

  return (
    <span
      aria-hidden
      data-comment-avatar
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-heading font-bold",
        size === "sm" ? "h-7 w-7 text-xs" : "h-9 w-9 text-sm",
        tone,
        className,
      )}
      title={name}
    >
      {initial}
    </span>
  );
}
