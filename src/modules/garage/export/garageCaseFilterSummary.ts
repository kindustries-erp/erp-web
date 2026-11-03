export interface GarageCaseFilterConditionRow {
  label: string;
  value: string;
}

/** Chữ cần dịch cho tóm tắt điều kiện; truyền từ i18n để hàm này không phụ thuộc React. */
export interface GarageCaseFilterWords {
  /** Nhãn cột, fallback là chính key. */
  columnLabel: (key: string) => string;
  contains: string;
  statusName: (tab: string) => string;
  empty: string;
}

const STATUS_TAB_KEYS = ["quotation", "in_progress", "completed"];

/**
 * Đọc `filtersStr` của bảng thành từng dòng "Tên cột: giá trị" để người dùng thấy đúng
 * điều kiện sẽ được xuất. Chuỗi không hợp lệ hoặc rỗng trả về mảng rỗng.
 */
export function describeFilterConditions(
  filtersStr: string | undefined,
  words: GarageCaseFilterWords,
): GarageCaseFilterConditionRow[] {
  if (!filtersStr) return [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(filtersStr);
  } catch {
    return [];
  }
  if (!parsed || typeof parsed !== "object") return [];

  return Object.entries(parsed as Record<string, unknown>)
    .filter(([, values]) => Array.isArray(values) && values.length > 0)
    .map(([key, values]) => {
      const list = (values as unknown[]).map(String);
      return {
        label:
          key === "statusTab"
            ? words.columnLabel("statusName")
            : words.columnLabel(key),
        value: describeValues(key, list, words),
      };
    });
}

function describeValues(
  key: string,
  list: string[],
  words: GarageCaseFilterWords,
): string {
  if (key === "statusTab") {
    return list
      .map((tab) =>
        STATUS_TAB_KEYS.includes(tab) ? words.statusName(tab) : tab,
      )
      .join(", ");
  }
  if (list[0] === "__ALL_MATCHING__") {
    return `${words.contains} "${list[1] ?? ""}"`;
  }
  return list
    .map((value) => {
      if (value.includes("..")) {
        const [from, to] = value.split("..");
        return `${from || "…"} → ${to || "…"}`;
      }
      return value || words.empty;
    })
    .join(", ");
}
