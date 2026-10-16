import React from "react";
import { describe, expect, it, vi } from "vitest";
import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
} from "@testing-library/react";

import { ExportPeriodPicker } from "../ExportPeriodPicker";
import { useExportPeriod } from "../useExportPeriod";

vi.mock("@/shared/components/Combobox", () => ({
  Combobox: ({ value, onChange, options, placeholder }: any) => (
    <select
      data-testid="period-select"
      aria-label={placeholder}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
    >
      {options.map((o: any) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  ),
}));

vi.mock("@/shared/components/DatePicker", () => ({
  DatePicker: ({ value, onChange, disabled }: any) => (
    <input
      data-testid="date-input"
      value={value || ""}
      disabled={disabled}
      onChange={(e) => onChange?.(e.target.value)}
    />
  ),
}));

const TODAY = new Date(2026, 9, 16); // 16/10/2026 (thứ Sáu, tuần 42, quý 4)

const labels = {
  week: "Tuần",
  month: "Tháng",
  quarter: "Quý",
  custom: "Tùy chỉnh",
  selectPlaceholder: "Chọn kỳ...",
  dateFrom: "Từ ngày",
  dateTo: "Đến ngày",
};

describe("useExportPeriod", () => {
  it("mặc định theo tháng hiện tại", () => {
    const { result } = renderHook(() => useExportPeriod({ today: TODAY }));
    expect(result.current.unit).toBe("month");
    expect(result.current.value).toBe("2026-10");
    expect(result.current.dateFrom).toBe("2026-10-01");
    expect(result.current.dateTo).toBe("2026-10-31");
  });

  it("đổi đơn vị chọn kỳ hiện tại của đơn vị đó", () => {
    const { result } = renderHook(() => useExportPeriod({ today: TODAY }));

    act(() => result.current.setUnit("week"));
    expect(result.current).toMatchObject({
      unit: "week",
      value: "2026-W42",
      dateFrom: "2026-10-12",
      dateTo: "2026-10-18",
    });

    act(() => result.current.setUnit("quarter"));
    expect(result.current).toMatchObject({
      value: "2026-Q4",
      dateFrom: "2026-10-01",
      dateTo: "2026-12-31",
    });
  });

  it("chọn kỳ khác cập nhật khoảng ngày", () => {
    const { result } = renderHook(() => useExportPeriod({ today: TODAY }));
    act(() => result.current.setValue("2026-02"));
    expect(result.current.dateFrom).toBe("2026-02-01");
    expect(result.current.dateTo).toBe("2026-02-28");
  });

  it("sang Tùy chỉnh giữ khoảng ngày của kỳ đang chọn, rồi cho sửa tay", () => {
    const { result } = renderHook(() => useExportPeriod({ today: TODAY }));
    act(() => result.current.setUnit("custom"));
    expect(result.current).toMatchObject({
      unit: "custom",
      dateFrom: "2026-10-01",
      dateTo: "2026-10-31",
    });

    act(() => result.current.setDateFrom("2026-10-05"));
    act(() => result.current.setDateTo("2026-10-20"));
    expect(result.current.dateFrom).toBe("2026-10-05");
    expect(result.current.dateTo).toBe("2026-10-20");
  });

  it("khởi tạo ở Tùy chỉnh với khoảng ngày cho trước", () => {
    const { result } = renderHook(() =>
      useExportPeriod({
        initialUnit: "custom",
        initialFrom: "2026-07-01",
        initialTo: "2026-09-30",
        today: TODAY,
      }),
    );
    expect(result.current.dateFrom).toBe("2026-07-01");
    expect(result.current.dateTo).toBe("2026-09-30");
    expect(result.current.options).toEqual([]);
  });
});

describe("ExportPeriodPicker", () => {
  function Harness() {
    const period = useExportPeriod({ today: TODAY });
    return <ExportPeriodPicker period={period} labels={labels} />;
  }

  it("hiển thị 4 tab và ô ngày bị khóa khi chưa chọn Tùy chỉnh", () => {
    render(<Harness />);
    for (const name of ["Tuần", "Tháng", "Quý", "Tùy chỉnh"]) {
      expect(screen.getByRole("tab", { name })).toBeDefined();
    }
    const inputs = screen.getAllByTestId("date-input") as HTMLInputElement[];
    expect(inputs.map((i) => i.disabled)).toEqual([true, true]);
    expect(inputs[0].value).toBe("2026-10-01");
  });

  it("chọn tab Tuần thì danh sách chuyển sang tuần và khoảng ngày đổi theo", async () => {
    render(<Harness />);
    await act(async () => {
      fireEvent.mouseDown(screen.getByRole("tab", { name: "Tuần" }));
      fireEvent.click(screen.getByRole("tab", { name: "Tuần" }));
    });

    const select = screen.getByTestId("period-select") as HTMLSelectElement;
    expect(select.value).toBe("2026-W42");
    expect(select.options[0].textContent).toBe("Tuần 42/2026 (12/10 - 18/10)");
    const inputs = screen.getAllByTestId("date-input") as HTMLInputElement[];
    expect(inputs[0].value).toBe("2026-10-12");
    expect(inputs[1].value).toBe("2026-10-18");
  });

  it("tab Tùy chỉnh ẩn danh sách kỳ và mở khóa ô ngày", async () => {
    render(<Harness />);
    await act(async () => {
      fireEvent.mouseDown(screen.getByRole("tab", { name: "Tùy chỉnh" }));
      fireEvent.click(screen.getByRole("tab", { name: "Tùy chỉnh" }));
    });

    expect(screen.queryByTestId("period-select")).toBeNull();
    const inputs = screen.getAllByTestId("date-input") as HTMLInputElement[];
    expect(inputs.map((i) => i.disabled)).toEqual([false, false]);
  });
});
