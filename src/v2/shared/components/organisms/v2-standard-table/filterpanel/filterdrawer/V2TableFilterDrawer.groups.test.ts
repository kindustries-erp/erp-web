import { describe, expect, it } from "vitest";
import { ColumnValueType } from "@/v2/shared/types/v2-table";
import type { V2FilterColumn } from "../V2StandardTable.filtercards";
import { groupFilterColumns } from "./V2TableFilterDrawer.groups";

const col = (key: string, valueType: ColumnValueType): V2FilterColumn => ({
  key,
  label: key,
  align: undefined,
  filter: { valueType },
});

describe("groupFilterColumns", () => {
  it("gom cột theo loại giá trị, giữ thứ tự cột trong nhóm, bỏ nhóm rỗng", () => {
    const groups = groupFilterColumns([
      col("code", ColumnValueType.TEXT),
      col("status", ColumnValueType.STATUS),
      col("date", ColumnValueType.DATE),
      col("name", ColumnValueType.TEXT),
      col("supplier", ColumnValueType.SELECT),
    ]);
    expect(groups.map((g) => g.key)).toEqual(["text", "select", "date"]);
    expect(groups[0].columns.map((c) => c.key)).toEqual(["code", "name"]);
    expect(groups[1].columns.map((c) => c.key)).toEqual(["status", "supplier"]);
    expect(groups[2].columns.map((c) => c.key)).toEqual(["date"]);
  });

  it("không có cột thì trả về mảng rỗng", () => {
    expect(groupFilterColumns([])).toEqual([]);
  });
});
