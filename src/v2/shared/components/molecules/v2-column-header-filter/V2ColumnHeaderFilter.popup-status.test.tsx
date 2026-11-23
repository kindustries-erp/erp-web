import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { useV2LocaleStore } from "@/v2/shared/stores/useV2LocaleStore";
import { ColumnValueType, TableSortState } from "@/v2/shared/types/v2-table";
import { V2ColumnHeaderFilter } from "./V2ColumnHeaderFilter";
import { open, READY, trigger } from "./V2ColumnHeaderFilter.fixture";
import type { V2ColumnHeaderFilterProps } from "./V2ColumnHeaderFilter.type";

const baseProps = (
  optionsState: V2ColumnHeaderFilterProps["optionsState"],
): V2ColumnHeaderFilterProps => ({
  columnKey: "code",
  label: "Mã phiếu",
  valueType: ColumnValueType.TEXT,
  sort: TableSortState.NONE,
  onSortChange: vi.fn(),
  selected: [],
  onSelectedChange: vi.fn(),
  search: "",
  onSearchChange: vi.fn(),
  onOperatorChange: vi.fn(),
  onDateRangeChange: vi.fn(),
  onClear: vi.fn(),
  optionsState,
  onOpenChange: vi.fn(),
  onOptionsSearchChange: vi.fn(),
});

/** Popup vẫn mở khi các props lưới đổi sang trạng thái lỗi (không đổi key, không remount) */
const isPopupOpen = () =>
  screen.queryByRole("button", { name: "Áp dụng" }) !== null;

describe("V2ColumnHeaderFilter: popup khi trạng thái options đổi", () => {
  beforeEach(() => useV2LocaleStore.setState({ locale: "vi" }));

  it("giữ popup mở khi options chuyển từ loading sang error", () => {
    const loading = { ...READY, status: "loading" as const, options: [] };
    const { rerender } = render(
      <V2ColumnHeaderFilter {...baseProps(loading)} />,
    );
    open();
    expect(isPopupOpen()).toBe(true);

    rerender(
      <V2ColumnHeaderFilter
        {...baseProps({ ...loading, status: "error" as const })}
      />,
    );

    expect(isPopupOpen()).toBe(true);
    expect(trigger()).toHaveAttribute("aria-label", "Lọc cột Mã phiếu");
  });
});
