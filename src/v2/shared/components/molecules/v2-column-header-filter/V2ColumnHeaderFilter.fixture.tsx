import { vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { V2ColumnHeaderFilter } from "./V2ColumnHeaderFilter";
import { V2_IDLE_OPTIONS_STATE } from "./V2ColumnHeaderFilter.type";
import type { V2ColumnHeaderFilterProps } from "./V2ColumnHeaderFilter.type";
import { ColumnValueType, TableSortState } from "@/v2/shared/types/v2-table";

export const READY = {
  ...V2_IDLE_OPTIONS_STATE,
  status: "ready" as const,
  options: [
    { value: "a", label: "Option A" },
    { value: "b", label: "Option B" },
  ],
};

export const renderFilter = (
  overrides: Partial<V2ColumnHeaderFilterProps> = {},
) => {
  const props: V2ColumnHeaderFilterProps = {
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
    optionsState: READY,
    onOpenChange: vi.fn(),
    onOptionsSearchChange: vi.fn(),
    ...overrides,
  };
  render(<V2ColumnHeaderFilter {...props} />);
  return props;
};

export const trigger = () =>
  screen.getByRole("button", { name: "Lọc cột Mã phiếu" });
export const open = () => fireEvent.click(trigger());
export const isOpen = () =>
  screen.queryByRole("button", { name: "Áp dụng" }) !== null;
