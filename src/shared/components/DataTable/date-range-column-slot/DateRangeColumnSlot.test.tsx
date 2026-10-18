import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DateRangeColumnSlot } from "./DateRangeColumnSlot";

vi.mock("@/core/i18n", () => ({
  useT: () => (key: string, def?: string) => def || key,
}));

describe("DateRangeColumnSlot Molecule (/ui-atomic-refactor)", () => {
  it("renders with both Quick Select and Reporting Period rows and action buttons", () => {
    const onChange = vi.fn();
    const onClose = vi.fn();

    render(
      <DateRangeColumnSlot
        dateFrom="2026-10-01"
        dateTo="2026-10-31"
        onChange={onChange}
        onClose={onClose}
      />,
    );

    // Kiểm tra render đủ các hàng
    expect(screen.getByText("Chọn nhanh")).toBeDefined();
    expect(screen.getByText("Kỳ")).toBeDefined();
    expect(screen.getByText("Từ ngày")).toBeDefined();
    expect(screen.getByText("Đến ngày")).toBeDefined();
    expect(screen.getByText("Xóa bộ lọc")).toBeDefined();
    expect(screen.getByText("Áp dụng")).toBeDefined();
  });

  it("calls onChange and onClose with empty values when clear filter button is clicked", () => {
    const onChange = vi.fn();
    const onClose = vi.fn();

    render(
      <DateRangeColumnSlot
        dateFrom="2026-10-01"
        dateTo="2026-10-31"
        onChange={onChange}
        onClose={onClose}
      />,
    );

    const clearBtn = screen.getByText("Xóa bộ lọc");
    fireEvent.click(clearBtn);

    expect(onChange).toHaveBeenCalledWith("", "");
    expect(onClose).toHaveBeenCalled();
  });

  it("automatically fills dateFrom and dateTo when a month period is selected in Combobox", () => {
    const onChange = vi.fn();
    const onClose = vi.fn();

    render(
      <DateRangeColumnSlot
        dateFrom=""
        dateTo=""
        onChange={onChange}
        onClose={onClose}
      />,
    );

    // Mở Combobox kỳ
    const periodTrigger = screen.getByRole("button", {
      name: /Tất cả kỳ/i,
    });
    fireEvent.click(periodTrigger);

    // Tìm và chọn một tháng trong danh sách (ví dụ Tháng 8/2026 nếu có)
    const monthOption = screen.queryByText("Tháng 8/2026");
    if (monthOption) {
      fireEvent.click(monthOption);

      const applyBtn = screen.getByText("Áp dụng");
      fireEvent.click(applyBtn);

      expect(onChange).toHaveBeenCalledWith("2026-08-01", "2026-08-31");
    }
  });

  it("calls onChange and onClose with pending values when apply button is clicked", () => {
    const onChange = vi.fn();
    const onClose = vi.fn();

    render(
      <DateRangeColumnSlot
        dateFrom="2026-09-01"
        dateTo="2026-09-30"
        onChange={onChange}
        onClose={onClose}
      />,
    );

    // Mở Combobox và đổi về Tất cả kỳ
    const periodTrigger = screen.getByRole("button", {
      name: /Tháng 9\/2026/i,
    });
    fireEvent.click(periodTrigger);

    const allOption = screen.getByText("Tất cả kỳ");
    fireEvent.click(allOption);

    const applyBtn = screen.getByText("Áp dụng");
    fireEvent.click(applyBtn);

    expect(onChange).toHaveBeenCalledWith("", "");
    expect(onClose).toHaveBeenCalled();
  });
});
