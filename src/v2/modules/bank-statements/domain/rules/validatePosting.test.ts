import { describe, expect, it } from "vitest";
import { validatePosting } from "./validatePosting";
import type { PostingDraftLine } from "../entities/cashTransaction";

const line = (over: Partial<PostingDraftLine>): PostingDraftLine => ({
  id: "x",
  accountId: "1111",
  debit: 0,
  credit: 0,
  description: "",
  ...over,
});

describe("validatePosting", () => {
  it("hợp lệ khi cân Nợ/Có và đủ TK", () => {
    const result = validatePosting(
      "2026-10-27",
      [line({ debit: 100 }), line({ accountId: "131", credit: 100 })],
      "",
    );
    expect(result).toEqual({ ok: true });
  });

  it("báo thiếu ngày hạch toán", () => {
    expect(validatePosting("", [line({ debit: 1 })], "")).toEqual({
      ok: false,
      error: "MISSING_POSTING_DATE",
    });
  });

  it("báo không có dòng hợp lệ khi các dòng đều trống", () => {
    expect(
      validatePosting("2026-10-27", [line({ accountId: "" })], ""),
    ).toEqual({
      ok: false,
      error: "NO_LINES",
    });
  });

  it("báo dòng thiếu tài khoản", () => {
    const result = validatePosting(
      "2026-10-27",
      [line({ debit: 100 }), line({ accountId: "", credit: 100 })],
      "",
    );
    expect(result.error).toBe("MISSING_ACCOUNT");
  });

  it("báo lệch Nợ/Có", () => {
    const result = validatePosting(
      "2026-10-27",
      [line({ debit: 100 }), line({ accountId: "131", credit: 90 })],
      "",
    );
    expect(result.error).toBe("UNBALANCED");
  });
});
