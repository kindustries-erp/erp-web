import { describe, expect, it } from "vitest";
import { TableSortState } from "@/v2/shared/types/v2-table";
import { createInitialQuery } from "./v2TableQuery";
import {
  findMatchingPreset,
  fromPresetQuery,
  hasConditions,
  isSameConditions,
  toPresetQuery,
} from "./v2FilterPresets";
import type { V2FilterPreset } from "../toolbar/V2StandardTable.toolbar.type";

describe("v2FilterPresets", () => {
  it("chụp điều kiện bảng thành query, bỏ page và size", () => {
    const query = createInitialQuery({
      page: 3,
      pageSize: 50,
      search: "PO",
      sorts: [{ columnKey: "poNumber", direction: TableSortState.DESC }],
      columnFilters: { status: ["pending"] },
    });

    const preset = toPresetQuery(query);

    expect(preset.q).toBe("PO");
    expect(preset.sort).toBe("-poNumber");
    expect(preset.cf).toBe(JSON.stringify({ status: ["pending"] }));
    expect(preset).not.toHaveProperty("page");
    expect(preset).not.toHaveProperty("size");
  });

  it("dựng lại query từ snapshot đã lưu", () => {
    const restored = fromPresetQuery({
      sort: "poNumber",
      q: "PO",
      cf: JSON.stringify({ status: ["pending"] }),
    });

    expect(restored.search).toBe("PO");
    expect(restored.sorts).toEqual([
      { columnKey: "poNumber", direction: TableSortState.ASC },
    ]);
    expect(restored.columnFilters).toEqual({ status: ["pending"] });
  });

  it("snapshot rỗng không sinh điều kiện nào", () => {
    const restored = fromPresetQuery({});
    expect(restored.search).toBeUndefined();
    expect(restored.columnFilters ?? {}).toEqual({});
  });

  it("hasConditions bỏ qua sắp xếp", () => {
    expect(hasConditions({ sort: "poNumber" })).toBe(false);
    expect(hasConditions({ sort: "poNumber", q: "PO" })).toBe(true);
    expect(hasConditions({})).toBe(false);
  });

  it("isSameConditions so sánh cả điều kiện và sắp xếp", () => {
    expect(isSameConditions({ q: "PO" }, { q: "PO" })).toBe(true);
    expect(isSameConditions({ q: "PO" }, { q: "PO", sort: "a" })).toBe(false);
    expect(isSameConditions({}, { q: "" })).toBe(true);
  });

  it("findMatchingPreset khớp cả nhóm bộ lọc gốc", () => {
    const presets: V2FilterPreset[] = [
      { key: "p1", label: "A", groupKey: "pending", query: { q: "PO" } },
      { key: "p2", label: "B", groupKey: "approved", query: { q: "PO" } },
    ];

    expect(findMatchingPreset(presets, { q: "PO" }, "approved")?.key).toBe(
      "p2",
    );
    expect(findMatchingPreset(presets, { q: "PO" }, "all")).toBeUndefined();
  });
});
