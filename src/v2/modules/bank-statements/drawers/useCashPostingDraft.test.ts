import { describe, expect, it } from "vitest";
import {
  buildPostingRequest,
  postingViewOf,
  toPostingForm,
} from "./useCashPostingDraft";
import type { CashTransactionDto } from "../api/dtos/cashTransaction.dto";

const UNPOSTED = {
  id: "t1",
  sourceType: "CASH",
  transDate: "2026-10-01T07:00:00Z",
  debitAmount: 0,
  creditAmount: 500,
  note: "Thu tiền",
  cashBook: { accountingAccountId: "1111" },
  correspondentAccountingAccountId: null,
  postingStatus: "UNPOSTED",
} as unknown as CashTransactionDto;

const POSTED = {
  ...UNPOSTED,
  postingStatus: "POSTED",
  postingDate: "2026-10-02T00:00:00Z",
  postingDescription: "Bút toán",
  journalEntryId: "J1",
  lines: [
    { accountId: "1111", debit: 500, credit: 0, description: "a" },
    { accountId: "131", debit: 0, credit: 500, description: "b" },
  ],
} as unknown as CashTransactionDto;

describe("toPostingForm", () => {
  it("chưa hạch toán: tắt, dựng bút toán mặc định từ TK quỹ", () => {
    const form = toPostingForm(UNPOSTED);
    expect(form.accountingEnabled).toBe(false);
    expect(form.postingDate).toBe("2026-10-01");
    expect(form.lines[0]).toMatchObject({
      accountId: "1111",
      debit: 500,
      credit: 0,
    });
  });

  it("đã hạch toán: bật, dùng bút toán đã ghi sổ", () => {
    const form = toPostingForm(POSTED);
    expect(form.accountingEnabled).toBe(true);
    expect(form.postingDate).toBe("2026-10-02");
    expect(form.lines).toHaveLength(2);
    expect(form.description).toBe("Bút toán");
  });
});

describe("buildPostingRequest", () => {
  const enabled = { ...toPostingForm(UNPOSTED), accountingEnabled: true };
  const balanced = {
    ...enabled,
    lines: [
      { id: "a", accountId: "1111", debit: 500, credit: 0, description: "" },
      { id: "b", accountId: "131", debit: 0, credit: 500, description: "" },
    ],
  };

  it("tắt hạch toán chưa ghi sổ thì bỏ qua", () => {
    expect(buildPostingRequest(toPostingForm(UNPOSTED), false).request).toEqual(
      { mode: "SKIP" },
    );
  });

  it("tắt hạch toán đang ghi sổ thì gỡ bút toán", () => {
    expect(buildPostingRequest(toPostingForm(UNPOSTED), true).request).toEqual({
      mode: "UNPOST",
    });
  });

  it("bật và cân bằng thì POST với dòng đã làm sạch", () => {
    const { request, error } = buildPostingRequest(balanced, false);
    expect(error).toBeUndefined();
    expect(request?.mode).toBe("POST");
    if (request?.mode === "POST") {
      expect(request.payload.lines).toHaveLength(2);
      expect(request.payload.postingDate).toBe("2026-10-01");
    }
  });

  it("bật nhưng lệch Nợ/Có thì báo lỗi, không gửi", () => {
    const off = {
      ...balanced,
      lines: [{ ...balanced.lines[0], debit: 400 }, balanced.lines[1]],
    };
    expect(buildPostingRequest(off, false)).toEqual({ error: "UNBALANCED" });
  });

  it("bật mà thiếu ngày thì báo lỗi ngày", () => {
    expect(
      buildPostingRequest({ ...balanced, postingDate: "" }, false),
    ).toEqual({
      error: "MISSING_POSTING_DATE",
    });
  });
});

describe("postingViewOf", () => {
  it("chưa ghi sổ thì không có tóm tắt", () => {
    const view = postingViewOf(UNPOSTED, toPostingForm(UNPOSTED));
    expect(view.isPosted).toBe(false);
    expect(view.summary).toBeNull();
  });

  it("đã ghi sổ thì tóm tắt cân bằng và có số bút toán", () => {
    const view = postingViewOf(POSTED, toPostingForm(POSTED));
    expect(view.summary?.balanced).toBe(true);
    expect(view.journalNo).toBe("J1");
  });
});
