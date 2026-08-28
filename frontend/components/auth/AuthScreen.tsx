import { APP_NAME } from "@/lib/brand";

type AuthScreenProps = {
  /** ログイン / 新規登録 など、この画面の役割 */
  heading: string;
  children: React.ReactNode;
};

/** 机の上に置いた紙カード。未ログイン画面で共通 */
export function AuthScreen({ heading, children }: AuthScreenProps) {
  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-lg border border-line bg-paper p-6 text-ink shadow-[0_12px_40px_rgb(0_0_0/0.55)] sm:p-8">
        <header className="mb-8 text-center">
          <p className="font-heading text-2xl font-bold tracking-wide text-ink">
            {APP_NAME}
          </p>
          <h1 className="mt-2 text-sm text-ink-muted">{heading}</h1>
        </header>
        {children}
      </div>
    </main>
  );
}
