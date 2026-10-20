import { describe, it, expect } from "vitest";
import { resolveCompletionDisplayDate } from "./GarageCasesTable.date-columns";

describe("resolveCompletionDisplayDate", () => {
  it("trả về ngày hoàn thành đã đồng bộ", () => {
    expect(
      resolveCompletionDisplayDate({
        ngayHoanThanhCongViec: "2026-10-09T15:55:00",
      }),
    ).toBe("2026-10-09T15:55:00");
  });

  it("không lấy ngày từ rawData khi trường ERP rỗng (phiếu đã về Báo giá)", () => {
    expect(
      resolveCompletionDisplayDate({
        ngayHoanThanhCongViec: null,
        rawData: { NgayHoanThanhCongViec: "2026-10-09T15:55:00" },
      } as any),
    ).toBeNull();
  });
});
