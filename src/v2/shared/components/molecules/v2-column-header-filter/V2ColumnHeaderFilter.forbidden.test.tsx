import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { useV2LocaleStore } from "@/v2/shared/stores/useV2LocaleStore";
import { ColumnValueType, TableSortState } from "@/v2/shared/types/v2-table";
import { V2ColumnHeaderFilter } from "./V2ColumnHeaderFilter";
import { open } from "./V2ColumnHeaderFilter.fixture";
import { V2_IDLE_OPTIONS_STATE } from "./V2ColumnHeaderFilter.type";
import type { V2ColumnHeaderFilterProps } from "./V2ColumnHeaderFilter.type";

const renderWithStatus = (status: "forbidden" | "error", onRetry = vi.fn()) => {
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
    optionsState: {
      ...V2_IDLE_OPTIONS_STATE,
      status,
      onRetry,
    },
    onOpenChange: vi.fn(),
    onOptionsSearchChange: vi.fn(),
  };
  render(<V2ColumnHeaderFilter {...props} />);
  open();
  return { onRetry };
};

describe("V2ColumnHeaderFilter: lỗi tải gợi ý giá trị", () => {
  beforeEach(() => useV2LocaleStore.setState({ locale: "vi" }));

  it("403: báo không có quyền, popup vẫn dùng được và không có nút thử lại", () => {
    renderWithStatus("forbidden");
    expect(
      screen.getByText("Bạn không có quyền xem gợi ý giá trị của cột này"),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Thử lại" })).toBeNull();
    expect(screen.getByRole("button", { name: "Áp dụng" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Sắp xếp tăng dần" }),
    ).toBeInTheDocument();
  });

  it("lỗi thường: báo lỗi và nút thử lại gọi onRetry", () => {
    const { onRetry } = renderWithStatus("error");
    expect(screen.getByText("Đã xảy ra lỗi")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Thử lại" }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
