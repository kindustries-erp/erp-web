import { describe, expect, it, vi } from "vitest";
import {
  buildProcurementFilterGroup,
  PROCUREMENT_ALL_KEY,
  PROCUREMENT_DELETED_KEY,
  toProcurementListFilter,
} from "./useProcurementListFilter";

describe("toProcurementListFilter", () => {
  it("'Tất cả' không lọc trạng thái và không lấy phiếu đã xóa", () => {
    expect(toProcurementListFilter(PROCUREMENT_ALL_KEY)).toEqual({});
  });

  it("khóa trạng thái đổi thành bộ lọc status", () => {
    expect(toProcurementListFilter("PENDING_APPROVAL")).toEqual({
      status: "PENDING_APPROVAL",
    });
  });

  it("'Đã xóa mềm' đổi thành deleted=only", () => {
    expect(toProcurementListFilter(PROCUREMENT_DELETED_KEY)).toEqual({
      deleted: "only",
    });
  });
});

describe("buildProcurementFilterGroup", () => {
  it("dựng nhóm: Tất cả, các trạng thái, rồi Đã xóa mềm", () => {
    const onChange = vi.fn();
    const group = buildProcurementFilterGroup({
      title: "Bộ lọc có sẵn",
      allLabel: "Tất cả",
      deletedLabel: "Đã xóa mềm",
      statusItems: [
        { value: "DRAFT", label: "Nháp" },
        { value: "APPROVED", label: "Đã duyệt" },
      ],
      activeKey: PROCUREMENT_ALL_KEY,
      onChange,
    });

    expect(group.items.map((item) => item.key)).toEqual([
      "all",
      "DRAFT",
      "APPROVED",
      "deleted",
    ]);
    expect(group.allKey).toBe("all");
    expect(group.activeKey).toBe("all");
    expect(group.onChange).toBe(onChange);
  });
});
