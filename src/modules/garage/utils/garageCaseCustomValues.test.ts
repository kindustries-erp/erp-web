import { describe, expect, it } from "vitest";
import { extractCaseCustomValues } from "./garageCaseCustomValues";

describe("extractCaseCustomValues", () => {
  it("khóa theo attrDefId, bỏ def hệ thống và key ngoài custom.byCode", () => {
    const result = extractCaseCustomValues({
      custom: { byCode: { ghi_chu: "abc" } },
      attributeValues: [
        { attrDefId: "d1", attrCode: "ghi_chu", isSystem: false },
        { attrDefId: "d2", attrCode: "exclude_from_debt", isSystem: true },
      ],
    });
    expect(result).toEqual({ d1: "abc" });
  });

  it("không có custom.byCode (API cũ) → rỗng", () => {
    expect(extractCaseCustomValues({ customAttributes: { a: 1 } })).toEqual({});
    expect(extractCaseCustomValues(null)).toEqual({});
  });
});
