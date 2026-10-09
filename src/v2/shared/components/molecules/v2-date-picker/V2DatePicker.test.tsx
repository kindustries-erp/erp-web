import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import * as viewportHook from "@/v2/shared/hooks/useViewport";
import { V2DatePicker } from "./V2DatePicker";
import { V2DateRangePicker } from "./V2DateRangePicker";

const mockViewport = () =>
  vi.spyOn(viewportHook, "useViewport").mockReturnValue({
    width: 1280,
    height: 800,
    isMobile: false,
    isTablet: false,
    isDesktop: true,
  });

const day = (n: string) =>
  screen.getAllByText(n, { selector: "button" })[0] as HTMLElement;

describe("V2DatePicker", () => {
  beforeEach(() => mockViewport());
  afterEach(() => vi.restoreAllMocks());

  it("shows the placeholder, then the formatted value", () => {
    const { rerender } = render(
      <V2DatePicker
        value={null}
        onValueChange={vi.fn()}
        placeholder="Từ ngày"
      />,
    );
    expect(screen.getByRole("button", { name: "Từ ngày" })).toHaveTextContent(
      "Từ ngày",
    );
    rerender(
      <V2DatePicker
        value="2026-01-15"
        onValueChange={vi.fn()}
        placeholder="Từ ngày"
      />,
    );
    expect(screen.getByRole("button", { name: "Từ ngày" })).toHaveTextContent(
      "15/01/2026",
    );
  });

  it("picks a date as an ISO string and closes", () => {
    const onValueChange = vi.fn();
    render(
      <V2DatePicker
        value="2026-01-15"
        onValueChange={onValueChange}
        aria-label="Ngày"
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Ngày" }));
    fireEvent.click(day("20"));
    expect(onValueChange).toHaveBeenCalledWith("2026-01-20");
    expect(
      screen.queryByText("20", { selector: "button" }),
    ).not.toBeInTheDocument();
  });

  it("does not allow dates outside min and max", () => {
    const onValueChange = vi.fn();
    render(
      <V2DatePicker
        value="2026-01-15"
        onValueChange={onValueChange}
        aria-label="Ngày"
        minDate="2026-01-10"
        maxDate="2026-01-20"
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Ngày" }));
    expect(day("5")).toBeDisabled();
    expect(day("25")).toBeDisabled();
    expect(day("12")).not.toBeDisabled();
  });

  it("clears the value when clearable", () => {
    const onValueChange = vi.fn();
    render(
      <V2DatePicker
        value="2026-01-15"
        onValueChange={onValueChange}
        clearable
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Xóa ngày" }));
    expect(onValueChange).toHaveBeenCalledWith(null);
  });
});

describe("V2DateRangePicker", () => {
  beforeEach(() => mockViewport());
  afterEach(() => vi.restoreAllMocks());

  it("shows the selected range", () => {
    render(
      <V2DateRangePicker
        value={{ from: "2026-01-01", to: "2026-01-31" }}
        onValueChange={vi.fn()}
        aria-label="Kỳ"
      />,
    );
    expect(screen.getByRole("button", { name: "Kỳ" })).toHaveTextContent(
      "01/01/2026 đến 31/01/2026",
    );
  });

  it("emits a range as ISO strings", () => {
    const onValueChange = vi.fn();
    render(
      <V2DateRangePicker
        value={{ from: "2026-01-10" }}
        onValueChange={onValueChange}
        aria-label="Kỳ"
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Kỳ" }));
    fireEvent.click(day("20"));
    expect(onValueChange).toHaveBeenLastCalledWith({
      from: "2026-01-10",
      to: "2026-01-20",
    });
  });

  it("applies a preset and closes", () => {
    const onValueChange = vi.fn();
    render(
      <V2DateRangePicker
        value={{}}
        onValueChange={onValueChange}
        aria-label="Kỳ"
        presets={[
          {
            key: "p",
            label: "Tháng này",
            range: () => ({ from: "2026-05-01", to: "2026-05-31" }),
          },
        ]}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Kỳ" }));
    fireEvent.click(screen.getByRole("button", { name: "Tháng này" }));
    expect(onValueChange).toHaveBeenCalledWith({
      from: "2026-05-01",
      to: "2026-05-31",
    });
    expect(
      screen.queryByRole("button", { name: "Tháng này" }),
    ).not.toBeInTheDocument();
  });

  it("clears to an empty range", () => {
    const onValueChange = vi.fn();
    render(
      <V2DateRangePicker
        value={{ from: "2026-01-01" }}
        onValueChange={onValueChange}
        clearable
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Xóa ngày" }));
    expect(onValueChange).toHaveBeenCalledWith({});
  });
});
