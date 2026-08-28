import { AUTH_COOKIE_NAME } from "@/lib/auth/constants";
import { clearToken, setToken } from "@/lib/auth/token";

/** ログイン成功時: JWT と middleware 用 cookie を同期 */
export function establishSession(token: string): void {
  setToken(token);
  document.cookie = `${AUTH_COOKIE_NAME}=1; path=/; max-age=86400; SameSite=Lax`;
}

/** ログアウト時: トークンと cookie を削除 */
export function clearSession(): void {
  clearToken();
  document.cookie = `${AUTH_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
}
