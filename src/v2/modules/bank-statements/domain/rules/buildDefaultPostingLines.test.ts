import { describe, expect, it } from "vitest";
import { buildDefaultPostingLines } from "./buildDefaultPostingLines";

const makeId = (() => {
  let n = 0;
  return () => `id-${++n}`;
})();

const baseTx = {
  sourceType: "CASH" as const,
  creditAmount: 0,
  debitAmount: 0,
  bankAccount: null,
  cashBook: { accountingAccountId: "1111" },
  correspondentAccountingAccountId: null,
};

describe("buildDefaultPostingLines", () => {
  it("thu tiền: Nợ TK quỹ, Có TK để trống", () => {
    const lines = buildDefaultPostingLines(
      { ...baseTx, creditAmount: 500 },
      "Thu tiền",
      makeId,
    );
    expect(lines).toEqual([
      {
        id: expect.any(String),
        accountId: "1111",
        debit: 500,
        credit: 0,
        description: "Thu tiền",
      },
      {
        id: expect.any(String),
        accountId: "",
        debit: 0,
        credit: 500,
        description: "Thu tiền",
      },
    ]);
  });

  it("chi tiền: Có TK quỹ, Nợ TK để trống", () => {
    const lines = buildDefaultPostingLines(
      { ...baseTx, debitAmount: 300 },
      "Chi tiền",
      makeId,
    );
    expect(lines[0]).toMatchObject({
      accountId: "1111",
      debit: 0,
      credit: 300,
    });
    expect(lines[1]).toMatchObject({ accountId: "", debit: 300, credit: 0 });
  });

  it("giao dịch ngân hàng lấy TK của tài khoản ngân hàng", () => {
    const lines = buildDefaultPostingLines(
      {
        ...baseTx,
        sourceType: "BANK",
        creditAmount: 100,
        bankAccount: { accountingAccountId: "1121" },
      },
      "",
      makeId,
    );
    expect(lines[0].accountId).toBe("1121");
  });

  it("dùng TK đối ứng khi quỹ chưa có TK kế toán", () => {
    const lines = buildDefaultPostingLines(
      {
        ...baseTx,
        cashBook: null,
        creditAmount: 100,
        correspondentAccountingAccountId: "131",
      },
      "",
      makeId,
    );
    expect(lines[0].accountId).toBe("131");
  });

  it("trả rỗng khi không có số tiền hoặc không có TK", () => {
    expect(buildDefaultPostingLines({ ...baseTx }, "", makeId)).toEqual([]);
    expect(
      buildDefaultPostingLines(
        { ...baseTx, cashBook: null, creditAmount: 100 },
        "",
        makeId,
      ),
    ).toEqual([]);
  });
});
