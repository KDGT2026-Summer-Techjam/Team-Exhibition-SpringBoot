const SHIORI_ID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** しおり ID（UUID）かどうか */
export function isValidShioriId(id: string): boolean {
  return SHIORI_ID_RE.test(id);
}

/** ログイン後の returnUrl。モック ID 等は一覧へフォールバック */
export function sanitizeReturnUrl(returnUrl: string | null): string {
  if (!returnUrl || !returnUrl.startsWith("/")) {
    return "/itineraries";
  }

  const match = returnUrl.match(/^\/itineraries\/([^/]+)/);
  if (match && !isValidShioriId(match[1])) {
    return "/itineraries";
  }

  return returnUrl;
}
