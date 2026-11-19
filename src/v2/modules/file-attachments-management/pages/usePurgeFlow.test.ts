import { describe, expect, it } from "vitest";
import { summarizePurge } from "./usePurgeFlow";

const t = (key: string, o?: string | { defaultValue?: string }) =>
  typeof o === "string" ? o : (o?.defaultValue ?? key);

describe("summarizePurge", () => {
  it("không bỏ qua: không cảnh báo", () => {
    const r = summarizePurge(t, {
      purged: [
        {
          id: "a",
          objectDeleted: true,
          objectKept: false,
          remainingReferences: 0,
        },
      ],
      skipped: [],
    });
    expect(r.hasSkipped).toBe(false);
    expect(r.description).toBeUndefined();
  });
  it("có object được giữ và có skipped: mô tả cả hai", () => {
    const r = summarizePurge(t, {
      purged: [
        {
          id: "a",
          objectDeleted: false,
          objectKept: true,
          remainingReferences: 2,
        },
      ],
      skipped: [{ id: "b", reason: "NOT_SOFT_DELETED" }],
    });
    expect(r.hasSkipped).toBe(true);
    expect(r.description).toContain("giữ lại");
    expect(r.description).toContain("NOT_SOFT_DELETED");
  });
});
