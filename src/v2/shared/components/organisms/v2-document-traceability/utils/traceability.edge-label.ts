export type EdgeLabelTone = "in" | "out" | "neutral";

/** Nhãn cạnh đã tách thành dạng hiển thị; `null` khi không có nhãn */
export type EdgeLabelParts =
  | { kind: "amount"; title: string; value: string; tone: EdgeLabelTone }
  | { kind: "note"; title: string; note: string }
  | { kind: "plain"; text: string }
  | null;

/**
 * Tách nhãn cạnh theo quy ước dữ liệu:
 * "Thu trực tiếp: 2.160.000 đ" → tiêu đề + số tiền (màu theo thu/chi);
 * "Doanh thu (HĐ bán)" → tiêu đề + ghi chú; còn lại hiển thị nguyên văn.
 */
export function parseEdgeLabel(raw: unknown): EdgeLabelParts {
  if (!raw) return null;
  const text = String(raw).trim();
  if (!text) return null;

  if (text.includes(":")) {
    const [titlePart, ...rest] = text.split(":");
    const title = titlePart.trim();
    const value = rest.join(":").trim();
    const lower = title.toLowerCase();
    const tone: EdgeLabelTone = lower.includes("thu")
      ? "in"
      : lower.includes("chi")
        ? "out"
        : "neutral";
    return { kind: "amount", title, value, tone };
  }

  const match = text.match(/^(.*?)\s*(\(.*?\))$/);
  if (match) {
    return { kind: "note", title: match[1].trim(), note: match[2].trim() };
  }

  return { kind: "plain", text };
}
