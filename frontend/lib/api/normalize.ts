/** Jackson の is* boolean が owner / deleted になるケースを吸収 */
export function normalizeBoolean(
  record: Record<string, unknown>,
  jsonKey: string,
  targetKey: string,
): void {
  if (targetKey in record && typeof record[targetKey] === "boolean") return;
  if (jsonKey in record && typeof record[jsonKey] === "boolean") {
    record[targetKey] = record[jsonKey];
  }
}

export function normalizeRecord<T extends Record<string, unknown>>(
  raw: Record<string, unknown>,
  booleanKeys: Array<[string, string]> = [],
): T {
  const record = { ...raw } as Record<string, unknown>;
  for (const [jsonKey, targetKey] of booleanKeys) {
    normalizeBoolean(record, jsonKey, targetKey);
  }
  return record as T;
}
