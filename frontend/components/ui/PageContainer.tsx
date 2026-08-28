import { cn } from "@/lib/utils";

type PageContainerProps = {
  children: React.ReactNode;
  className?: string;
  narrow?: boolean;
  /** しおり内容など、横幅を広く取る */
  wide?: boolean;
  /** しおり紙面の幅（約1280px。机の余白は外側 padding） */
  notebook?: boolean;
};

export function PageContainer({
  children,
  className,
  narrow = false,
  wide = false,
  notebook = false,
}: PageContainerProps) {
  return (
    <main
      className={cn(
        "mx-auto w-full",
        // しおりは固定サイズのまま画面中央へ（幅は w-full で確保し、items-center は使わない）
        notebook
          ? "flex min-h-dvh flex-col justify-center py-4 md:py-5"
          : "py-8",
        narrow && "max-w-md px-6 md:px-8",
        // 紙面幅は --notebook-max-width。外側は机の余白だけ
        notebook &&
          "w-full max-w-[calc(var(--notebook-max-width)+2rem)] px-3 sm:px-4",
        !narrow && !notebook && "px-6 md:px-8",
        wide && !notebook && "max-w-7xl",
        !narrow && !wide && !notebook && "max-w-3xl",
        className,
      )}
    >
      {children}
    </main>
  );
}
