import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { V2RowAction } from "@/v2/shared/types/v2-table";
import { useProcurementListTabState } from "./useProcurementListTabState";

const purge: V2RowAction = {
  label: "Xóa vĩnh viễn",
  onClick: vi.fn(),
  variant: "danger",
};
const edit: V2RowAction = { label: "Chỉnh sửa", onClick: vi.fn() };

const setup = () =>
  renderHook(() =>
    useProcurementListTabState<{ id: string }>({
      t: (_key, fallback) => fallback,
      tableId: "test-procurement-tab-state",
      // Menu thường không chứa xóa vĩnh viễn; purgeActions chỉ dùng ở bộ lọc Đã xóa mềm
      state: {
        openView: vi.fn(),
        rowActions: () => [{ items: [edit] }],
        purgeActions: () => [purge],
      } as never,
      api: {} as never,
      viewVisibility: { overview: {}, all: {} } as never,
      buildColumns: () => [],
      statusItems: [],
    }),
  );

const labels = (groups: { items: V2RowAction[] }[]) =>
  groups.flatMap((g) => g.items.map((i) => i.label));

describe("useProcurementListTabState: menu theo bộ lọc có sẵn", () => {
  it("bộ lọc thường: chỉ menu thao tác, không có Xóa vĩnh viễn", () => {
    const { result } = setup();
    expect(labels(result.current.rowActions({ id: "1" }))).toEqual([
      "Chỉnh sửa",
    ]);
  });

  it("chọn Đã xóa mềm: menu chỉ còn Xóa vĩnh viễn", () => {
    const { result } = setup();
    act(() => result.current.filterGroup.onChange("deleted"));
    expect(labels(result.current.rowActions({ id: "1" }))).toEqual([
      "Xóa vĩnh viễn",
    ]);
  });

  it("chọn lại Tất cả: Xóa vĩnh viễn biến mất khỏi menu", () => {
    const { result } = setup();
    act(() => result.current.filterGroup.onChange("deleted"));
    act(() => result.current.filterGroup.onChange("all"));
    expect(labels(result.current.rowActions({ id: "1" }))).toEqual([
      "Chỉnh sửa",
    ]);
  });
});
