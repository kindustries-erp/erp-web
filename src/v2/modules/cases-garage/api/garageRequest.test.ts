import { describe, expect, it } from "vitest";
import {
  branchHeaders,
  compactParams,
  ERP_BRANCH_HEADER,
} from "./garageRequest";

describe("garageRequest", () => {
  it("branchHeaders chỉ gửi header khi có chi nhánh", () => {
    expect(branchHeaders("b1")).toEqual({
      headers: { [ERP_BRANCH_HEADER]: "b1" },
    });
    expect(branchHeaders()).toEqual({});
    expect(branchHeaders("")).toEqual({});
  });

  it("compactParams bỏ undefined, null và chuỗi rỗng, giữ 0 và false", () => {
    expect(
      compactParams({ a: undefined, b: null, c: "", d: 0, e: false, f: "x" }),
    ).toEqual({ d: 0, e: false, f: "x" });
  });
});
