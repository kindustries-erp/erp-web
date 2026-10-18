import { describe, expect, it } from "vitest";
import { makeGroups } from "./V2TableRowActions.fixture";
import {
  clampMenuPosition,
  getQuickActions,
  hasRowActions,
} from "./V2TableRowActions.helper";

describe("row action helpers", () => {
  it("takes the first action of the first two groups as quick actions", () => {
    const { groups } = makeGroups();
    expect(getQuickActions(groups).map((a) => a.label)).toEqual([
      "Xem chi tiết",
      "Chỉnh sửa",
    ]);
  });

  it("falls back to the first items of a single group and skips empty groups", () => {
    const { groups } = makeGroups();
    expect(getQuickActions([groups[0]]).map((a) => a.label)).toEqual([
      "Xem chi tiết",
      "In",
    ]);
    expect(
      getQuickActions([{ items: [] }, groups[1]]).map((a) => a.label),
    ).toEqual(["Chỉnh sửa", "Xóa"]);
    expect(getQuickActions([])).toEqual([]);
  });

  it("detects empty action lists", () => {
    expect(hasRowActions([])).toBe(false);
    expect(hasRowActions([{ items: [] }])).toBe(false);
    expect(hasRowActions(makeGroups().groups)).toBe(true);
  });

  it("keeps the menu inside the viewport with a gap", () => {
    const base = {
      width: 200,
      height: 100,
      viewportWidth: 1024,
      viewportHeight: 768,
    };
    expect(clampMenuPosition({ ...base, x: 1000, y: 750 })).toEqual({
      left: 816,
      top: 660,
    });
    expect(clampMenuPosition({ ...base, x: 2, y: 3 })).toEqual({
      left: 8,
      top: 8,
    });
    expect(clampMenuPosition({ ...base, x: 300, y: 200 })).toEqual({
      left: 300,
      top: 200,
    });
  });
});
