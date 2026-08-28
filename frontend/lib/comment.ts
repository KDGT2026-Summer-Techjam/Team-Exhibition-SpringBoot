/** フロント側のコメント最大文字数 */
export const COMMENT_MAX_LENGTH = 20;

/** コメント本文を上限内に収める */
export function clampCommentBody(value: string): string {
  return Array.from(value).slice(0, COMMENT_MAX_LENGTH).join("");
}
