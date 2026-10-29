import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { V2PeriodPicker } from "./V2PeriodPicker";
import type { V2PeriodPickerProps } from "./V2PeriodPicker.type";

vi.mock("@/v2/shared/hooks/useV2Translation", () => ({
  useV2Translation: () => ({
    t: (_key: string, fallback?: unknown) =>
      typeof fallback === "string" ? fallback : _key,
  }),
}));

const baseProps = (
  overrides: Partial<V2PeriodPickerProps> = {},
): V2PeriodPickerProps => ({
  unit: "month",
  onUnitChange: vi.fn(),
  period: "2026-10",
  onPeriodChange: vi.fn(),
  periodOptions: [{ value: "2026-10", label: "Tháng 10/2026" }],
  dateFrom: "2026-10-01",
  onDateFromChange: vi.fn(),
  dateTo: "2026-10-31",
  onDateToChange: vi.fn(),
  ...overrides,
});

describe("V2PeriodPicker", () => {
  it("hiển thị đủ bốn đơn vị dạng pill tab", () => {
    render(<V2PeriodPicker {...baseProps()} />);

    for (const label of ["Tuần", "Tháng", "Quý", "Tùy chỉnh"]) {
      expect(screen.getByRole("tab", { name: label })).toBeTruthy();
    }
  });

  it("gọi onUnitChange với đơn vị vừa bấm", () => {
    const onUnitChange = vi.fn();
    render(<V2PeriodPicker {...baseProps({ onUnitChange })} />);

    fireEvent.click(screen.getByRole("tab", { name: "Quý" }));

    expect(onUnitChange).toHaveBeenCalledWith("quarter");
  });

  it("ẩn combobox kỳ khi đơn vị là tùy chỉnh", () => {
    render(<V2PeriodPicker {...baseProps({ unit: "custom", period: "" })} />);

    expect(screen.queryByText("Tháng 10/2026")).toBeNull();
  });

  it("khóa hai ô ngày khi không ở chế độ tùy chỉnh", () => {
    const { container } = render(<V2PeriodPicker {...baseProps()} />);

    const dateButtons = container.querySelectorAll("button[disabled]");
    expect(dateButtons.length).toBeGreaterThanOrEqual(2);
  });
});
