import { describe, expect, it } from "vitest";
import { buildTransactionPatch } from "./buildTransactionPatch";
import type { CashTransactionDto } from "../../api/dtos/cashTransaction.dto";

const tx = {
  id: "t1",
  sourceType: "CASH",
  transDate: "2026-10-01",
  debitAmount: 0,
  creditAmount: 200,
  note: "ghi chú cũ",
  branchIds: ["b1"],
  cashflowClassification: null,
  cashflowPurpose: null,
  partner: null,
  postingStatus: "UNPOSTED",
} as unknown as CashTransactionDto;

const draft = {
  branchIds: ["b1"],
  partnerValue: null,
  description: "ghi chú cũ",
  classification: null,
  purpose: null,
};

describe("buildTransactionPatch", () => {
  it("trả null khi không đổi gì", () => {
    expect(buildTransactionPatch(tx, draft, null)).toBeNull();
  });

  it("chỉ gửi ghi chú khi chỉ đổi mô tả, không gửi branchIds", () => {
    const patch = buildTransactionPatch(
      tx,
      { ...draft, description: "mới" },
      null,
    );
    expect(patch).toEqual({
      note: "mới",
      cashflowClassification: null,
      cashflowPurpose: null,
    });
    expect(patch).not.toHaveProperty("branchIds");
  });

  it("gửi branchIds khi đổi chi nhánh", () => {
    const patch = buildTransactionPatch(
      tx,
      { ...draft, branchIds: ["b2"] },
      null,
    );
    expect(patch?.branchIds).toEqual(["b2"]);
  });

  it("xóa mục đích khi bỏ phân loại", () => {
    const withPurpose = {
      ...tx,
      cashflowClassification: "OPERATING",
      cashflowPurpose: "SALARY",
    } as unknown as CashTransactionDto;
    const patch = buildTransactionPatch(
      withPurpose,
      { ...draft, classification: null, purpose: "SALARY" },
      null,
    );
    expect(patch?.cashflowPurpose).toBeNull();
  });

  it("chọn đối tượng từ danh mục gửi partnerId", () => {
    const patch = buildTransactionPatch(
      tx,
      { ...draft, partnerValue: "master:p1" },
      null,
    );
    expect(patch?.partnerId).toBe("p1");
  });
});
