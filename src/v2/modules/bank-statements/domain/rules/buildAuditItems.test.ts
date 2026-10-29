import { describe, expect, it } from "vitest";
import { buildAuditItems } from "./buildAuditItems";

describe("buildAuditItems", () => {
  it("trả rỗng khi chưa có mốc nào", () => {
    expect(
      buildAuditItems({ id: "t1", createdAt: null, postingDate: null }),
    ).toEqual([]);
  });

  it("có mốc tạo và mốc ghi sổ, dùng số tham chiếu và số bút toán", () => {
    const items = buildAuditItems({
      id: "t1",
      createdAt: "2026-10-01T00:00:00Z",
      referenceNumber: "REF1",
      postingDate: "2026-10-02",
      journalEntryId: "J9",
    });
    expect(items).toEqual([
      {
        id: "created",
        kind: "CREATED",
        timestamp: "2026-10-01T00:00:00Z",
        reference: "REF1",
      },
      {
        id: "posted",
        kind: "POSTED",
        timestamp: "2026-10-02",
        reference: "J9",
      },
    ]);
  });

  it("dùng id giao dịch khi thiếu số tham chiếu", () => {
    const [created] = buildAuditItems({
      id: "t7",
      createdAt: "2026-10-01",
      postingDate: null,
    });
    expect(created.reference).toBe("t7");
  });
});
