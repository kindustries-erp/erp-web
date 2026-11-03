import { describe, it, expect } from "vitest";
import {
  isSameBranchIds,
  resolveTransactionBranchIds,
} from "./transactionBranchIds";

describe("resolveTransactionBranchIds", () => {
  it("ưu tiên branchIds khi có", () => {
    expect(
      resolveTransactionBranchIds({ branchIds: ["a", "b"], branchId: "x" }),
    ).toEqual(["a", "b"]);
  });

  it("rơi về branchId khi không có branchIds", () => {
    expect(
      resolveTransactionBranchIds({ branchIds: [], branchId: "x" }),
    ).toEqual(["x"]);
  });

  it("rơi về branch.id khi không có cả hai (quan hệ được nạp)", () => {
    expect(resolveTransactionBranchIds({ branch: { id: "y" } })).toEqual(["y"]);
  });

  it("trả về rỗng khi không có chi nhánh hoặc không có giao dịch", () => {
    expect(
      resolveTransactionBranchIds({ branchIds: [], branchId: null }),
    ).toEqual([]);
    expect(resolveTransactionBranchIds(null)).toEqual([]);
  });
});

describe("isSameBranchIds", () => {
  it("không phụ thuộc thứ tự", () => {
    expect(isSameBranchIds(["a", "b"], ["b", "a"])).toBe(true);
  });

  it("khác khi khác phần tử hoặc khác độ dài", () => {
    expect(isSameBranchIds(["a"], ["b"])).toBe(false);
    expect(isSameBranchIds(["a"], [])).toBe(false);
  });
});
