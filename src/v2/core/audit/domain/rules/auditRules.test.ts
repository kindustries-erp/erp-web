import { describe, expect, it } from "vitest";
import {
  formatSnapshotValue,
  isAuditFailed,
  toSnapshotEntries,
} from "./auditRules";

describe("auditRules", () => {
  it("nhận diện trạng thái lỗi", () => {
    expect(isAuditFailed("FAILED")).toBe(true);
    expect(isAuditFailed("error")).toBe(true);
    expect(isAuditFailed("SUCCESS")).toBe(false);
    expect(isAuditFailed(null)).toBe(false);
  });

  it("rút gọn giá trị snapshot", () => {
    expect(formatSnapshotValue(null)).toBe("—");
    expect(formatSnapshotValue(5)).toBe("5");
    expect(formatSnapshotValue({ a: 1 })).toBe('{"a":1}');
    expect(formatSnapshotValue("x".repeat(200))).toHaveLength(121);
  });

  it("làm phẳng snapshot một cấp", () => {
    expect(toSnapshotEntries({ name: "A", n: { b: 1 } })).toEqual([
      { key: "name", value: "A" },
      { key: "n", value: '{"b":1}' },
    ]);
    expect(toSnapshotEntries(null)).toEqual([]);
  });
});
