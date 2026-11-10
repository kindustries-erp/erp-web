import { describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import type { V2HeaderFilters } from "../hooks/V2StandardTable.filter.hook";
import { useV2FilterCardsState } from "./V2StandardTable.filtercards.hook";

const columns = [
  { key: "poNumber", label: "Số đề nghị" },
  { key: "amount", label: "Tổng dự kiến" },
  { key: "hidden", label: "Ẩn" },
];

const makeFilters = (): V2HeaderFilters => ({
  onOpenChange: vi.fn(),
  onOptionsSearchChange: vi.fn(),
  optionsFor: vi.fn(),
});

const setup = (filters = makeFilters()) =>
  renderHook(() =>
    useV2FilterCardsState({
      columns,
      filters,
      canFilter: (column) => column.key !== "hidden",
      committedSearchOf: () => "đã cam kết",
    }),
  );

describe("useV2FilterCardsState", () => {
  it("bỏ cột không lọc được khỏi danh sách hiển thị", () => {
    const { result } = setup();

    expect(result.current.visibleColumns.map((c) => c.key)).toEqual([
      "poNumber",
      "amount",
    ]);
  });

  it("ô tìm cột lọc theo nhãn hoặc khóa, không phân biệt hoa thường", () => {
    const { result } = setup();

    act(() => result.current.setColSearch("  TỔNG "));
    expect(result.current.visibleColumns.map((c) => c.key)).toEqual(["amount"]);

    act(() => result.current.setColSearch("poNumber"));
    expect(result.current.visibleColumns.map((c) => c.key)).toEqual([
      "poNumber",
    ]);
  });

  it("chỉ một card mở; mở card mới thì đóng card đang mở", () => {
    const filters = makeFilters();
    const { result } = setup(filters);

    act(() => result.current.setExpanded("poNumber", true));
    expect(result.current.expandedKey).toBe("poNumber");
    expect(filters.onOpenChange).toHaveBeenLastCalledWith(
      "poNumber",
      true,
      "đã cam kết",
    );

    act(() => result.current.setExpanded("amount", true));
    expect(filters.onOpenChange).toHaveBeenCalledWith("poNumber", false, "");
    expect(result.current.expandedKey).toBe("amount");
  });

  it("đóng card đang mở thì xóa expandedKey", () => {
    const { result } = setup();

    act(() => result.current.setExpanded("amount", true));
    act(() => result.current.setExpanded("amount", false));

    expect(result.current.expandedKey).toBeNull();
  });
});
