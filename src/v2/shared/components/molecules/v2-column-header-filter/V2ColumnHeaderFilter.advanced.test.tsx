import { beforeEach, describe, expect, it } from "vitest";
import { fireEvent, screen } from "@testing-library/react";
import { useAppStore } from "@/core/config/appStore";
import {
  ColumnValueType,
  NumberFilterOperator,
  TextFilterOperator,
} from "@/v2/shared/types/v2-table";
import { isOpen, open, renderFilter } from "./V2ColumnHeaderFilter.fixture";

describe("V2ColumnHeaderFilter advanced and date filters", () => {
  beforeEach(() => useAppStore.setState({ locale: "vi" }));

  it("commits an operator filter together with Apply", () => {
    const props = renderFilter({ valueType: ColumnValueType.NUMBER });
    open();
    fireEvent.change(screen.getByLabelText("Giá trị"), {
      target: { value: "5" },
    });
    expect(props.onOperatorChange).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Áp dụng" }));
    expect(props.onOperatorChange).toHaveBeenCalledWith({
      operator: NumberFilterOperator.EQUALS,
      value: "5",
    });
  });

  it("uses text operators for text columns and Enter applies them", () => {
    const props = renderFilter();
    open();
    const input = screen.getByLabelText("Giá trị");
    fireEvent.change(input, { target: { value: "abc" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(props.onOperatorChange).toHaveBeenCalledWith({
      operator: TextFilterOperator.CONTAINS,
      value: "abc",
    });
  });

  it("applies date presets at once and has no footer for date columns", () => {
    const props = renderFilter({ valueType: ColumnValueType.DATE });
    open();
    expect(
      screen.queryByPlaceholderText("Tìm kiếm..."),
    ).not.toBeInTheDocument();
    expect(isOpen()).toBe(false);
    fireEvent.click(screen.getByRole("button", { name: "Hôm nay" }));
    expect(props.onDateRangeChange).toHaveBeenCalledWith(
      expect.objectContaining({ from: expect.any(String) }),
    );
  });

  it("clears an applied date range from the slot", () => {
    const props = renderFilter({
      valueType: ColumnValueType.DATE,
      dateRange: { from: "2026-01-01", to: "2026-01-31" },
    });
    open();
    fireEvent.click(screen.getByRole("button", { name: "Xóa bộ lọc" }));
    expect(props.onDateRangeChange).toHaveBeenLastCalledWith(null);
  });
});
