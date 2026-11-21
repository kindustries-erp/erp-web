/** Trạng thái lỗi của một dòng nhật ký (backend ghi FAILED/ERROR/FAILURE). */
export const isAuditFailed = (status: string | null | undefined): boolean =>
  /^(fail|error)/i.test(status ?? "");

const MAX_VALUE_LENGTH = 120;

/** Rút gọn giá trị snapshot thành chuỗi ngắn để hiển thị nhãn - giá trị. */
export const formatSnapshotValue = (value: unknown): string => {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "string") return clip(value);
  if (typeof value === "number" || typeof value === "boolean")
    return String(value);
  return clip(JSON.stringify(value));
};

const clip = (text: string): string =>
  text.length > MAX_VALUE_LENGTH ? `${text.slice(0, MAX_VALUE_LENGTH)}…` : text;

export interface SnapshotEntry {
  key: string;
  value: string;
}

/** Làm phẳng một cấp khóa của snapshot; snapshot rỗng trả mảng rỗng. */
export const toSnapshotEntries = (
  snapshot: Record<string, unknown> | null | undefined,
): SnapshotEntry[] =>
  Object.entries(snapshot ?? {}).map(([key, value]) => ({
    key,
    value: formatSnapshotValue(value),
  }));
