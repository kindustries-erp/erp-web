import { describe, expect, it } from "vitest";
import { isSameBranchIds, resolveBranchIds } from "./branchIds";

describe("resolveBranchIds", () => {
  it("ưu tiên branchIds", () => {
    expect(
      resolveBranchIds({ branchIds: ["b1", "b2"], branchId: "b9" }),
    ).toEqual(["b1", "b2"]);
  });

  it("dùng branchId cũ khi không có branchIds", () => {
    expect(resolveBranchIds({ branchIds: [], branchId: "b1" })).toEqual(["b1"]);
  });

  it("dùng branch.id khi chỉ có quan hệ branch", () => {
    expect(resolveBranchIds({ branch: { id: "b3" } })).toEqual(["b3"]);
  });

  it("trả mảng rỗng khi không có chi nhánh", () => {
    expect(resolveBranchIds(null)).toEqual([]);
    expect(resolveBranchIds({})).toEqual([]);
  });
});

describe("isSameBranchIds", () => {
  it("không phụ thuộc thứ tự", () => {
    expect(isSameBranchIds(["a", "b"], ["b", "a"])).toBe(true);
  });

  it("khác khi số lượng hoặc phần tử khác nhau", () => {
    expect(isSameBranchIds(["a"], ["a", "b"])).toBe(false);
    expect(isSameBranchIds(["a"], ["c"])).toBe(false);
  });
});
